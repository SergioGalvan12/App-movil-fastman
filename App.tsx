import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DomainScreen from './screens/auth/DomainScreen';
import UserScreen from './screens/auth/UserScreen';
import PasswordScreen from './screens/auth/PasswordScreen';
import Toast from 'react-native-toast-message';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import AveriasScreen from './screens/reports/Averias';
import FiltrosAvanzados from './screens/reports/FiltrosAvanzados';
import CargarImagen from './screens/reports/CargarImagen';
import { AuthProvider } from './contexts/AuthContext';
import ReporteOperacionScreen from './screens/reports/operativo/ReporteOperacion';
import ReporteVariablesScreen from './screens/reports/variables/ReporteVariables';

// Definir los tipos para los parámetros de navegación
export type AuthStackParamList = {
  Domain: undefined;
  User: { domain: string, username: string };
  Password: { domain: string; username: string; empresaId?: number };
  Main: undefined;
  Averias: undefined;
  FiltrosAvanzados: { grupoId: number, grupoName: string; };
  CargarImagen: { backlogId: number; empresaId: number };
  ReporteOperacion: undefined; 
  ReporteVariables: undefined;

};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#EFF0FA' }
          }}
        >
          <Stack.Screen name="Domain" component={DomainScreen} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="Password" component={PasswordScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Averias" component={AveriasScreen} />
          <Stack.Screen name="FiltrosAvanzados" component={FiltrosAvanzados} />
          <Stack.Screen name="ReporteOperacion" component={ReporteOperacionScreen} />
          <Stack.Screen name="ReporteVariables" component={ReporteVariablesScreen} />
          <Stack.Screen name="CargarImagen" component={CargarImagen} /> 
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}