import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);


// -----------------------------------------------------------------------------
// SOBRE O PROJETO (comentário geral)
//
// Este projeto é um aplicativo de marcação de consultas médicas desenvolvido em
// React Native com Expo. Ele utiliza navegação com React Navigation, contexto
// de autenticação para login/cadastro de usuários (pacientes, médicos e admin),
// e componentes reutilizáveis (como cartões e listas).
//
// O sistema é dividido em telas específicas para cada perfil de usuário,
// permitindo agendamento, visualização de consultas, edição de perfil, notificações
// e gerenciamento administrativo. Além disso, segue boas práticas de organização
// de código, uso de styled-components para estilização, e persistência de dados
// com AsyncStorage.
//
// Em resumo: é um app completo de gestão de consultas médicas, modular,
// escalável e pronto para ser expandido com novas funcionalidades.
// -----------------------------------------------------------------------------