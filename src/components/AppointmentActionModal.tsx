import React, { useState } from 'react'; // Importa React e hook useState
import styled from 'styled-components/native'; // Importa styled-components para estilização
import { ScrollView, ViewStyle, TextStyle } from 'react-native'; // Importa componentes e tipos do React Native
import { Button, ListItem, Text } from 'react-native-elements'; // Importa componentes da biblioteca react-native-elements
import { useAuth } from '../contexts/AuthContext'; // Importa hook de autenticação customizado
import { useNavigation } from '@react-navigation/native'; // Hook para navegação
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Tipo para stack navigation
import { useFocusEffect } from '@react-navigation/native'; // Hook que dispara efeito quando a tela ganha foco
import { RootStackParamList } from '../types/navigation'; // Tipos de navegação do app
import theme from '../styles/theme'; // Importa tema com cores e espaçamentos
import Header from '../components/Header'; // Importa componente Header customizado
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para persistência local

// Define tipos para a prop de navegação da tela
type PatientDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PatientDashboard'>;
};

// Interface que define a estrutura de uma consulta
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Interface para props de estilização do status
interface StyledProps {
  status: string;
}

// Função para obter a cor do status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return theme.colors.success; // Verde para confirmadas
    case 'cancelled':
      return theme.colors.error; // Vermelho para canceladas
    default:
      return theme.colors.warning; // Amarelo para pendentes
  }
};

// Função para obter o texto do status
const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Pendente';
  }
};

const PatientDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth(); // Pega usuário logado e função de logout
  const navigation = useNavigation<PatientDashboardScreenProps['navigation']>(); // Hook de navegação
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Estado das consultas
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função para carregar consultas do AsyncStorage
  const loadAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments'); // Busca dados salvos
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments); // Converte de JSON
        const userAppointments = allAppointments.filter(
          (appointment) => appointment.patientId === user?.id // Filtra consultas do usuário logado
        );
        setAppointments(userAppointments); // Atualiza estado
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error); // Log em caso de erro
    } finally {
      setLoading(false); // Finaliza carregamento
    }
  };

  // Hook que dispara quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments(); // Carrega consultas
    }, [])
  );

  return (
    <Container>
      <Header /> {/* Componente de cabeçalho */}
      <ScrollView contentContainerStyle={styles.scrollContent}> {/* ScrollView para rolagem */}
        <Title>Minhas Consultas</Title> {/* Título da tela */}

        {/* Botão para criar nova consulta */}
        <Button
          title="Agendar Nova Consulta"
          onPress={() => navigation.navigate('CreateAppointment')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para acessar perfil */}
        <Button
          title="Meu Perfil"
          onPress={() => navigation.navigate('Profile')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para acessar configurações */}
        <Button
          title="Configurações"
          onPress={() => navigation.navigate('Settings')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.settingsButton}
        />

        {/* Condicional de carregamento ou lista de consultas */}
        {loading ? (
          <LoadingText>Carregando consultas...</LoadingText> // Mostra loading
        ) : appointments.length === 0 ? (
          <EmptyText>Nenhuma consulta agendada</EmptyText> // Mostra mensagem se não há consultas
        ) : (
          appointments.map((appointment) => ( // Mapeia e exibe cada consulta
            <AppointmentCard key={appointment.id}>
              <ListItem.Content>
                <ListItem.Title style={styles.patientName as TextStyle}>
                  Paciente: {appointment.patientName}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.dateTime as TextStyle}>
                  {appointment.date} às {appointment.time}
                </ListItem.Subtitle>
                <Text style={styles.doctorName as TextStyle}>
                  {appointment.doctorName}
                </Text>
                <Text style={styles.specialty as TextStyle}>
                  {appointment.specialty}
                </Text>
                <StatusBadge status={appointment.status}>
                  <StatusText status={appointment.status}>
                    {getStatusText(appointment.status)}
                  </StatusText>
                </StatusBadge>
              </ListItem.Content>
            </AppointmentCard>
          ))
        )}

        {/* Botão de logout */}
        <Button
          title="Sair"
          onPress={signOut}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.logoutButton}
        />
      </ScrollView>
    </Container>
  );
};

// Estilos de ScrollView e botões
const styles = {
  scrollContent: {
    padding: 20,
  },
  button: {
    marginBottom: 20,
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: 12,
  },
  settingsButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  dateTime: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
};

// Container principal
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Título da tela
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

// Card de cada consulta
const AppointmentCard = styled(ListItem)`
  background-color: ${theme.colors.background};
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 15px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

// Texto de carregamento
const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Texto quando não há consultas
const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

// Badge de status da consulta
const StatusBadge = styled.View<StyledProps>`
  background-color: ${(props: StyledProps) => getStatusColor(props.status) + '20'};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

// Texto dentro do badge
const StatusText = styled.Text<StyledProps>`
  color: ${(props: StyledProps) => getStatusColor(props.status)};
  font-size: 12px;
  font-weight: 500;
`;

export default PatientDashboardScreen; // Exporta o componente
