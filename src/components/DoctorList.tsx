import React from 'react';
import styled from 'styled-components/native';
import { ViewStyle } from 'react-native'; // Para tipar o estilo do container externo
import { ListItem, Avatar } from 'react-native-elements'; // Componentes do react-native-elements
import theme from '../styles/theme'; // Tema com cores, bordas e espaçamentos

// Tipo do médico
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

// Props do componente DoctorList
interface DoctorListProps {
  doctors: Doctor[]; // Lista de médicos
  onSelectDoctor: (doctor: Doctor) => void; // Função chamada ao selecionar um médico
  selectedDoctorId?: string; // Id do médico selecionado
  style?: ViewStyle; // Estilo opcional para o container
}

// Componente funcional
const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  onSelectDoctor,
  selectedDoctorId,
  style,
}) => {
  return (
    <Container style={style}>
      {doctors.map((doctor) => (
        <ListItem
          key={doctor.id} // Key única para cada item
          onPress={() => onSelectDoctor(doctor)} // Ao tocar no item, chama onSelectDoctor
          containerStyle={[
            styles.listItem, // Estilo base
            selectedDoctorId === doctor.id && styles.selectedItem, // Estilo extra se selecionado
          ]}
        >
          {/* Avatar do médico */}
          <Avatar
            size="medium"
            rounded
            source={{ uri: doctor.image }} // Foto do médico
            containerStyle={styles.avatar}
          />
          <ListItem.Content>
            {/* Nome do médico */}
            <ListItem.Title style={styles.name}>{doctor.name}</ListItem.Title>
            {/* Especialidade */}
            <ListItem.Subtitle style={styles.specialty}>
              {doctor.specialty}
            </ListItem.Subtitle>
          </ListItem.Content>
          {/* Chevron padrão do ListItem */}
          <ListItem.Chevron />
        </ListItem>
      ))}
    </Container>
  );
};

// Estilos do ListItem e elementos internos
const styles = {
  listItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: theme.colors.background, // Cor de fundo padrão
    borderWidth: 1,
    borderColor: theme.colors.border, // Borda padrão
  },
  selectedItem: {
    backgroundColor: theme.colors.primary + '20', // Fundo com transparência quando selecionado
    borderColor: theme.colors.primary, // Borda principal quando selecionado
  },
  avatar: {
    backgroundColor: theme.colors.primary, // Cor de fundo do avatar
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text, // Cor do texto
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7, // Mais transparente para subtítulo
  },
};

// Container externo do componente
const Container = styled.View`
  margin-bottom: 15px;
`;

export default DoctorList; // Exporta o componente
