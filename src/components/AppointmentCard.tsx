import React from 'react'; // Importa React
import styled from 'styled-components/native'; // Importa styled-components para estilização
import { ViewStyle } from 'react-native'; // Importa tipo para estilo de view
import { Card, Text, Avatar } from 'react-native-elements'; // Importa componentes do react-native-elements
import theme from '../styles/theme'; // Importa tema com cores e estilos

// Define props esperadas para o card de consulta
interface AppointmentCardProps {
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  onPress?: () => void; // Função opcional ao clicar no card
  style?: ViewStyle; // Estilo opcional para sobrescrever o card
}

// Componente funcional do card de consulta
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctorName,
  date,
  time,
  specialty,
  status,
  onPress,
  style,
}) => {
  // Função para definir cor do status
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success; // Verde para confirmado
      case 'cancelled':
        return theme.colors.error; // Vermelho para cancelado
      default:
        return theme.colors.primary; // Azul para pendente
    }
  };

  return (
    <Card containerStyle={[styles.card, style]}> {/* Card com estilo customizável */}
      <CardContent>
        {/* Informações do médico */}
        <DoctorInfo>
          <Avatar
            size="medium"
            rounded
            source={{ uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 10)}.jpg` }} // Avatar aleatório
            containerStyle={styles.avatar}
          />
          <TextContainer>
            <DoctorName>{doctorName}</DoctorName> {/* Nome do médico */}
            <Specialty>{specialty}</Specialty> {/* Especialidade */}
          </TextContainer>
        </DoctorInfo>

        {/* Informações da consulta */}
        <AppointmentInfo>
          <InfoRow>
            <InfoLabel>Data:</InfoLabel>
            <InfoValue>{date}</InfoValue> {/* Data da consulta */}
          </InfoRow>
          <InfoRow>
            <InfoLabel>Horário:</InfoLabel>
            <InfoValue>{time}</InfoValue> {/* Horário da consulta */}
          </InfoRow>
        </AppointmentInfo>

        {/* Status da consulta */}
        <StatusContainer>
          <StatusDot color={getStatusColor()} /> {/* Pontinho colorido do status */}
          <StatusText color={getStatusColor()}>
            {status === 'confirmed' ? 'Confirmada' : status === 'cancelled' ? 'Cancelada' : 'Pendente'} {/* Texto do status */}
          </StatusText>
        </StatusContainer>
      </CardContent>
    </Card>
  );
};

// Estilos do Card e Avatar
const styles = {
  card: {
    borderRadius: 10,
    marginHorizontal: 0,
    marginVertical: 8,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    backgroundColor: theme.colors.primary, // Cor de fundo do avatar
  },
};

// Container interno do Card
const CardContent = styled.View`
  padding: 10px;
`;

// Seção com informações do médico
const DoctorInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

// Container para texto do médico
const TextContainer = styled.View`
  margin-left: 15px;
`;

// Nome do médico
const DoctorName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
`;

// Especialidade do médico
const Specialty = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

// Seção com informações da consulta
const AppointmentInfo = styled.View`
  margin-bottom: 15px;
`;

// Linha de informações (data, horário)
const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  marginBottom: 5px;
`;

// Label de cada informação
const InfoLabel = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  opacity: 0.7;
`;

// Valor de cada informação
const InfoValue = styled.Text`
  font-size: 14px;
  color: ${theme.colors.text};
  font-weight: 500;
`;

// Container do status
const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

// Pontinho colorido indicando status
const StatusDot = styled.View<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

// Texto do status
const StatusText = styled.Text<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  font-weight: 500;
`;

export default AppointmentCard; // Exporta o componente
