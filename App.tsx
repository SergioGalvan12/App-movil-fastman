import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DomainScreen from './screens/Inicio/DomainScreen';
import UserScreen from './screens/Inicio/UserScreen';
import PasswordScreen from './screens/Inicio/PasswordScreen';
import ReportesScreen from './screens/ReportesScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';


// Definir los tipos para los parámetros de navegación
export type AuthStackParamList = {
  Domain: undefined;
  User: { domain: string, username: string };
  Password: { domain: string; username: string; empresaId?: number };
  Main: undefined;
  // Añade aquí otras rutas si es necesario
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}