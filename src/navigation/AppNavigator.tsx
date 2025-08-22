import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Container principal de navegação
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack Navigator nativo
import { useAuth } from '../contexts/AuthContext'; // Hook de autenticação
import { RootStackParamList } from '../types/navigation'; // Tipagem das rotas

// Importação das telas (screens) da aplicação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateAppointmentScreen from '../screens/CreateAppointmentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';
import PatientDashboardScreen from '../screens/PatientDashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Criação do Stack Navigator tipado
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth(); // Obtém usuário autenticado e estado de carregamento

  if (loading) {
    return null; // Enquanto carrega, não renderiza nada (pode ser trocado por componente de loading)
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Remove o header padrão
        }}
      >
        {!user ? (
          // Se não houver usuário logado → rotas públicas
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Se houver usuário logado → rotas protegidas
          <>
            {/* Rotas específicas por tipo de usuário */}
            {user.role === 'admin' && (
              <Stack.Screen 
                name="AdminDashboard" 
                component={AdminDashboardScreen}
                options={{ title: 'Painel Administrativo' }}
              />
            )}
            
            {user.role === 'doctor' && (
              <Stack.Screen 
                name="DoctorDashboard" 
                component={DoctorDashboardScreen}
                options={{ title: 'Painel do Médico' }}
              />
            )}
            
            {user.role === 'patient' && (
              <Stack.Screen 
                name="PatientDashboard" 
                component={PatientDashboardScreen}
                options={{ title: 'Painel do Paciente' }}
              />
            )}

            {/* Rotas comuns para todos os usuários autenticados */}
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Início' }}
            />
            <Stack.Screen 
              name="CreateAppointment" 
              component={CreateAppointmentScreen}
              options={{ title: 'Agendar Consulta' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Perfil' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ title: 'Editar Perfil' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ title: 'Notificações' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Configurações' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
