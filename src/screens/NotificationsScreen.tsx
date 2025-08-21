import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle, Alert } from 'react-native';
import { Button, ListItem, Badge } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext'; // Contexto de autenticação
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native'; // Executa função sempre que a tela ganhar foco
import { RootStackParamList } from '../types/navigation';
import theme from '../styles/theme';
import Header from '../components/Header'; // Componente de cabeçalho
import { notificationService, Notification } from '../services/notifications'; // Serviço de notificações

// Tipagem das props da tela de Notificações
type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

const NotificationsScreen: React.FC = () => {
  const { user } = useAuth(); // Pega o usuário logado
  const navigation = useNavigation<NotificationsScreenProps['navigation']>(); // Hook de navegação
  const [notifications, setNotifications] = useState<Notification[]>([]); // Lista de notificações
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Carregar notificações do usuário
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const userNotifications = await notificationService.getNotifications(user.id);
      setNotifications(userNotifications); // Armazena no estado
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega notificações sempre que a tela é focada
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [user?.id])
  );

  // Marca uma notificação como lida
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications(); // Atualiza lista
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marca todas as notificações como lidas
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Excluir notificação (com confirmação via Alert)
  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Excluir Notificação',
      'Tem certeza que deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              loadNotifications();
            } catch (error) {
              console.error('Erro ao excluir notificação:', error);
            }
          },
        },
      ]
    );
  };

  // Define o ícone de acordo com o tipo da notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return '✅';
      case 'appointment_cancelled':
        return '❌';
      case 'appointment_reminder':
        return '⏰';
      default:
        return '📩';
    }
  };

  // Formata data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Conta quantas notificações ainda não foram lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container>
      {/* Cabeçalho fixo */}
      <Header />

      {/* Scroll de conteúdo */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Título + Badge de notificações não lidas */}
        <TitleContainer>
          <Title>Notificações</Title>
          {unreadCount > 0 && (
            <Badge
              value={unreadCount}
              status="error"
              containerStyle={styles.badge}
            />
          )}
        </TitleContainer>

        {/* Botão para marcar todas como lidas */}
        {unreadCount > 0 && (
          <Button
            title="Marcar todas como lidas"
            onPress={handleMarkAllAsRead}
            containerStyle={styles.markAllButton as ViewStyle}
            buttonStyle={styles.markAllButtonStyle}
          />
        )}

        {/* Botão voltar */}
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Renderização condicional: carregando / vazio / lista */}
        {loading ? (
          <LoadingText>Carregando notificações...</LoadingText>
        ) : notifications.length === 0 ? (
          <EmptyContainer>
            <EmptyText>Nenhuma notificação encontrada</EmptyText>
          </EmptyContainer>
        ) : (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} isRead={notification.read}>
              <ListItem
                onPress={() => !notification.read && handleMarkAsRead(notification.id)}
                onLongPress={() => handleDeleteNotification(notification.id)}
              >
                {/* Ícone da notificação */}
                <NotificationIcon>{getNotificationIcon(notification.type)}</NotificationIcon>
                <ListItem.Content>
                  {/* Cabeçalho da notificação (título + bolinha se não lida) */}
                  <NotificationHeader>
                    <ListItem.Title style={styles.title}>
                      {notification.title}
                    </ListItem.Title>
                    {!notification.read && <UnreadDot />}
                  </NotificationHeader>

                  {/* Mensagem da notificação */}
                  <ListItem.Subtitle style={styles.message}>
                    {notification.message}
                  </ListItem.Subtitle>

                  {/* Data formatada */}
                  <DateText>{formatDate(notification.createdAt)}</DateText>
                </ListItem.Content>
              </ListItem>
            </NotificationCard>
          ))
        )}
      </ScrollView>
    </Container>
  );
};

// ------------------- ESTILOS -------------------
const styles = {
  scrollContent: {
    padding: 20,
  },
  badge: {
    marginLeft: 8,
  },
  markAllButton: {
    marginBottom: 15,
    width: '100%',
  },
  markAllButtonStyle: {
    backgroundColor: theme.colors.success,
    paddingVertical: 10,
  },
  button: {
    marginBottom: 20,
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
};

// ------------------- COMPONENTES ESTILIZADOS -------------------
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const TitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  text-align: center;
`;

const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const EmptyContainer = styled.View`
  align-items: center;
  margin-top: 40px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  opacity: 0.7;
`;

const NotificationCard = styled.View<{ isRead: boolean }>`
  background-color: ${(props) => props.isRead ? theme.colors.white : theme.colors.primary + '10'};
  border-radius: 8px;
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${(props) => props.isRead ? theme.colors.border : theme.colors.primary + '30'};
`;

const NotificationIcon = styled.Text`
  font-size: 20px;
  margin-right: 8px;
`;

const NotificationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const UnreadDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${theme.colors.error};
  margin-left: 8px;
`;

const DateText = styled.Text`
  font-size: 12px;
  color: ${theme.colors.text};
  opacity: 0.6;
  margin-top: 4px;
`;

export default NotificationsScreen;
