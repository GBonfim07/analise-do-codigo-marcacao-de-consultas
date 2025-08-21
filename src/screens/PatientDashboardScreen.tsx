import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Button, ListItem, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext'; // Contexto de autenticação do usuário
import { useNavigation } from '@react-navigation/native'; // Hook de navegação
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native'; // Executa função sempre que a tela é focada
import { RootStackParamList } from '../types/navigation';
import theme from '../styles/theme'; // Tema do app (cores, tipografia)
import Header from '../components/Header'; // Cabeçalho da tela
import AsyncStorage from '@react-native-async-storage/async-storage'; // Armazenamento local

// Tipagem das props da tela
type PatientDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PatientDashboard'>;
};

// Interface de uma consulta
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

// Props para styled-components que recebem status
interface StyledProps {
  status: string;
}

// Função para obter cor do badge de status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return theme.colors.success; // Verde
    case 'cancelled':
      return theme.colors.error; // Vermelho
    default:
      return theme.colors.warning; // Amarelo
  }
};

// Função para obter texto do status
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
  const { user, signOut } = useAuth(); // Usuário logado e função de logout
  const navigation = useNavigation<PatientDashboardScreenProps['navigation']>(); // Navegação
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Lista de consultas
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função para carregar consultas do AsyncStorage
  const loadAppointments = async () => {
    try {
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments'); // Busca todas as consultas
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments); // Converte JSON
        const userAppointments = allAppointments.filter(
          (appointment) => appointment.patientId === user?.id // Filtra apenas as do paciente logado
        );
        setAppointments(userAppointments); // Atualiza estado
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false); // Termina loading
    }
  };

  // Carrega as consultas quando a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  return (
    <Container>
      <Header /> {/* Cabeçalho */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title>Minhas Consultas</Title> {/* Título da tela */}

        {/* Botão para agendar nova consulta */}
        <Button
          title="Agendar Nova Consulta"
          onPress={() => navigation.navigate('CreateAppointment')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para acessar o perfil do usuário */}
        <Button
          title="Meu Perfil"
          onPress={() => navigation.navigate('Profile')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para configurações */}
        <Button
          title="Configurações"
          onPress={() => navigation.navigate('Settings')}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.settingsButton}
        />

        {/* Condicional de carregamento */}
        {loading ? (
          <LoadingText>Carregando consultas...</LoadingText>
        ) : appointments.length === 0 ? (
          <EmptyText>Nenhuma consulta agendada</EmptyText> // Caso não haja consultas
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id}>
              <ListItem.Content>
                {/* Nome do paciente */}
                <ListItem.Title style={styles.patientName as TextStyle}>
                  Paciente: {appointment.patientName}
                </ListItem.Title>

                {/* Data e hora da consulta */}
                <ListItem.Subtitle style={styles.dateTime as TextStyle}>
                  {appointment.date} às {appointment.time}
                </ListItem.Subtitle>

                {/* Nome do médico */}
                <Text style={styles.doctorName as TextStyle}>
                  {appointment.doctorName}
                </Text>

                {/* Especialidade */}
                <Text style={styles.specialty as TextStyle}>
                  {appointment.specialty}
                </Text>

                {/* Badge de status */}
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

// ------------------- ESTILOS -------------------
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

// ------------------- COMPONENTES ESTILIZADOS -------------------
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const AppointmentCard = styled(ListItem)`
  background-color: ${theme.colors.background};
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 15px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const StatusBadge = styled.View<StyledProps>`
  background-color: ${(props: StyledProps) => getStatusColor(props.status) + '20'};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

const StatusText = styled.Text<StyledProps>`
  color: ${(props: StyledProps) => getStatusColor(props.status)};
  font-size: 12px;
  font-weight: 500;
`;

export default PatientDashboardScreen;
