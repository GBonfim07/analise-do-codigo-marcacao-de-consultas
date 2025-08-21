// Importa bibliotecas e hooks principais
import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext'; // Hook de autenticação para obter usuário logado
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // Tipagem das rotas
import theme from '../styles/theme'; // Tema com cores
import Header from '../components/Header'; // Componente de cabeçalho
import DoctorList from '../components/DoctorList'; // Lista de médicos disponível na UI
import TimeSlotList from '../components/TimeSlotList'; // Lista de horários disponíveis na UI
import { notificationService } from '../services/notifications'; // Serviço para enviar notificações
import AsyncStorage from '@react-native-async-storage/async-storage'; // Armazenamento local

// Tipagem das props da tela (navegação stack)
type CreateAppointmentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAppointment'>;
};

// Interface que define estrutura de uma consulta (appointment)
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

// Interface que define estrutura de um médico
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

// Lista fixa de médicos disponíveis no sistema
const availableDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    specialty: 'Cardiologia',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Dra. Maria Santos',
    specialty: 'Pediatria',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '3',
    name: 'Dr. Pedro Oliveira',
    specialty: 'Ortopedia',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: '4',
    name: 'Dra. Ana Costa',
    specialty: 'Dermatologia',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '5',
    name: 'Dr. Carlos Mendes',
    specialty: 'Oftalmologia',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// Componente principal da tela de criação de consulta
const CreateAppointmentScreen: React.FC = () => {
  const { user } = useAuth(); // Obtém usuário logado
  const navigation = useNavigation<CreateAppointmentScreenProps['navigation']>();

  // Estados locais da tela
  const [date, setDate] = useState(''); // Data da consulta
  const [selectedTime, setSelectedTime] = useState<string>(''); // Horário selecionado
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null); // Médico selecionado
  const [loading, setLoading] = useState(false); // Controle de loading do botão
  const [error, setError] = useState(''); // Mensagens de erro

  // Função responsável por criar/agendar consulta
  const handleCreateAppointment = async () => {
    try {
      setLoading(true);
      setError('');

      // Validação: precisa ter data, médico e horário selecionados
      if (!date || !selectedTime || !selectedDoctor) {
        setError('Por favor, preencha a data e selecione um médico e horário');
        return;
      }

      // Recupera consultas salvas anteriormente no AsyncStorage
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
      const appointments: Appointment[] = storedAppointments ? JSON.parse(storedAppointments) : [];

      // Cria objeto da nova consulta
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: user?.id || '',
        patientName: user?.name || '',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        time: selectedTime,
        specialty: selectedDoctor.specialty,
        status: 'pending', // Nova consulta começa como pendente
      };

      // Adiciona nova consulta à lista
      appointments.push(newAppointment);

      // Salva lista atualizada no AsyncStorage
      await AsyncStorage.setItem('@MedicalApp:appointments', JSON.stringify(appointments));

      // Dispara notificação para o médico selecionado
      await notificationService.notifyNewAppointment(selectedDoctor.id, newAppointment);

      // Exibe alerta de sucesso e volta para a tela anterior
      alert('Consulta agendada com sucesso!');
      navigation.goBack();
    } catch (err) {
      setError('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Cabeçalho fixo da aplicação */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título principal da tela */}
        <Title>Agendar Consulta</Title>

        {/* Input para o usuário digitar a data da consulta */}
        <Input
          placeholder="Data (DD/MM/AAAA)"
          value={date}
          onChangeText={setDate}
          containerStyle={styles.input}
          keyboardType="numeric"
        />

        {/* Seção para seleção de horário */}
        <SectionTitle>Selecione um Horário</SectionTitle>
        <TimeSlotList
          onSelectTime={setSelectedTime} // Callback que atualiza estado ao escolher horário
          selectedTime={selectedTime} // Horário atual selecionado
        />

        {/* Seção para seleção de médico */}
        <SectionTitle>Selecione um Médico</SectionTitle>
        <DoctorList
          doctors={availableDoctors} // Lista fixa de médicos
          onSelectDoctor={setSelectedDoctor} // Callback que atualiza médico selecionado
          selectedDoctorId={selectedDoctor?.id} // Identifica médico ativo na UI
        />

        {/* Exibe mensagem de erro, se existir */}
        {error ? <ErrorText>{error}</ErrorText> : null}

        {/* Botão que confirma/agendar consulta */}
        <Button
          title="Agendar"
          onPress={handleCreateAppointment}
          loading={loading}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.buttonStyle}
        />

        {/* Botão para cancelar e voltar */}
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.cancelButton}
        />
      </ScrollView>
    </Container>
  );
};

// Estilos para espaçamento, botões e inputs
const styles = {
  scrollContent: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  buttonStyle: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
};

// Container principal da tela
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// Título maior no topo da tela
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

// Subtítulo das seções ("Selecione um Horário" / "Selecione um Médico")
const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 10px;
  margin-top: 10px;
`;

// Texto de erro exibido em vermelho
const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default CreateAppointmentScreen;
