import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Input, Button, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext'; // Contexto de autenticação
import theme from '../styles/theme';
import { ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Tipagem das props da tela de Login
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth(); // Hook de autenticação (pega função signIn do contexto)
  const navigation = useNavigation<LoginScreenProps['navigation']>(); // Hook para navegação

  // Estados locais para os campos e feedback
  const [email, setEmail] = useState(''); // Estado para armazenar email digitado
  const [password, setPassword] = useState(''); // Estado para armazenar senha digitada
  const [loading, setLoading] = useState(false); // Estado para loading do botão
  const [error, setError] = useState(''); // Estado para mensagens de erro

  // Função que executa o login
  const handleLogin = async () => {
    try {
      setLoading(true); // Ativa o loading do botão
      setError(''); // Limpa mensagem de erro
      await signIn({ email, password }); // Chama função de login do contexto
    } catch (err) {
      setError('Email ou senha inválidos'); // Caso falhe, mostra erro
    } finally {
      setLoading(false); // Desativa o loading do botão
    }
  };

  return (
    <Container>
      {/* Título do app */}
      <Title>App Marcação de Consultas</Title>
      
      {/* Input de Email */}
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />

      {/* Input de Senha */}
      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      {/* Exibe mensagem de erro se houver */}
      {error ? <ErrorText>{error}</ErrorText> : null}

      {/* Botão de Login */}
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
        containerStyle={styles.button as ViewStyle}
        buttonStyle={styles.buttonStyle}
      />

      {/* Botão para ir até a tela de cadastro */}
      <Button
        title="Cadastrar Novo Paciente"
        onPress={() => navigation.navigate('Register')}
        containerStyle={styles.registerButton as ViewStyle}
        buttonStyle={styles.registerButtonStyle}
      />

      {/* Credenciais de exemplo (texto fixo) */}
      <Text style={styles.hint}>
        Use as credenciais de exemplo:
      </Text>
      <Text style={styles.credentials}>
        Admin: admin@example.com / 123456{'\n'}
        Médicos: joao@example.com, maria@example.com, pedro@example.com / 123456
      </Text>
    </Container>
  );
};

// Estilos usados nos componentes
const styles = {
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
  registerButton: {
    marginTop: 10,
    width: '100%',
  },
  registerButtonStyle: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
  },
  hint: {
    marginTop: 20,
    textAlign: 'center' as const,
    color: theme.colors.text,
  },
  credentials: {
    marginTop: 10,
    textAlign: 'center' as const,
    color: theme.colors.text,
    fontSize: 12,
  },
};

// Container da tela
const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: ${theme.colors.background};
`;

// Título do app
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: ${theme.colors.text};
`;

// Texto de erro
const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default LoginScreen;
