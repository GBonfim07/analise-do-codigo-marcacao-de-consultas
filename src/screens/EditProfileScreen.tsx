// Importações de bibliotecas e dependências
import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext'; // Hook de contexto de autenticação (dados do usuário)
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; // Tipagem das rotas
import theme from '../styles/theme'; // Estilos globais
import Header from '../components/Header'; // Componente de cabeçalho visível na UI
import AsyncStorage from '@react-native-async-storage/async-storage'; // Armazenamento local persistente

// Tipagem das props da tela de edição de perfil
type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

// Componente principal da tela de edição de perfil
const EditProfileScreen: React.FC = () => {
  // Obtém o usuário e a função de atualização do contexto
  const { user, updateUser } = useAuth();

  // Hook de navegação tipado
  const navigation = useNavigation<EditProfileScreenProps['navigation']>();
  
  // Estados locais controlando os inputs da tela
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [loading, setLoading] = useState(false);

  // Função que salva as alterações no perfil
  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Validação simples de campos obrigatórios
      if (!name.trim() || !email.trim()) {
        Alert.alert('Erro', 'Nome e email são obrigatórios');
        return;
      }

      // Cria objeto do usuário atualizado
      const updatedUser = {
        ...user!,
        name: name.trim(),
        email: email.trim(),
        // Se for médico, adiciona o campo de especialidade
        ...(user?.role === 'doctor' && { specialty: specialty.trim() }),
      };

      // Atualiza no contexto global
      await updateUser(updatedUser);

      // Salva no armazenamento local (AsyncStorage)
      await AsyncStorage.setItem('@MedicalApp:user', JSON.stringify(updatedUser));

      // Mostra mensagem de sucesso e volta para a tela anterior
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      // Caso ocorra falha na atualização
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container /* Container principal da tela */>
      {/* Cabeçalho padrão exibido no topo */}
      <Header /> 

      {/* Área rolável com todo o conteúdo da tela */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Título principal da tela */}
        <Title>Editar Perfil</Title>

        {/* Card que agrupa avatar, inputs e badge */}
        <ProfileCard>
          {/* Avatar do usuário, ou imagem padrão caso não tenha */}
          <Avatar source={{ uri: user?.image || 'https://via.placeholder.com/150' }} />
          
          {/* Campo de entrada para nome */}
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            containerStyle={styles.input}
            placeholder="Digite seu nome"
          />

          {/* Campo de entrada para email */}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Campo de entrada adicional exibido apenas se o usuário for médico */}
          {user?.role === 'doctor' && (
            <Input
              label="Especialidade"
              value={specialty}
              onChangeText={setSpecialty}
              containerStyle={styles.input}
              placeholder="Digite sua especialidade"
            />
          )}

          {/* Badge que mostra o papel do usuário (Admin / Médico / Paciente) */}
          <RoleBadge role={user?.role || ''}>
            <RoleText>
              {user?.role === 'admin' ? 'Administrador' 
                : user?.role === 'doctor' ? 'Médico' 
                : 'Paciente'}
            </RoleText>
          </RoleBadge>
        </ProfileCard>

        {/* Botão para salvar alterações feitas */}
        <Button
          title="Salvar Alterações"
          onPress={handleSaveProfile}
          loading={loading}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.saveButton}
        />

        {/* Botão para cancelar e voltar sem salvar */}
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

// Estilos inline para inputs, botões e área de scroll
const styles = {
  scrollContent: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginBottom: 15,
    width: '100%',
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
};

// Styled-components para layout e estilo customizado
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

const ProfileCard = styled.View`
  background-color: ${theme.colors.white};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  align-items: center;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const Avatar = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 16px;
`;

// Badge com cor diferente de acordo com o papel do usuário
const RoleBadge = styled.View<{ role: string }>`
  background-color: ${(props: { role: string }) => {
    switch (props.role) {
      case 'admin':
        return theme.colors.primary + '20';
      case 'doctor':
        return theme.colors.success + '20';
      default:
        return theme.colors.secondary + '20';
    }
  }};
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
`;

const RoleText = styled.Text`
  color: ${theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

export default EditProfileScreen;
