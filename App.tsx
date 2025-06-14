import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DomainScreen from './screens/auth/DomainScreen';
import UserScreen from './screens/auth/UserScreen';
import PasswordScreen from './screens/auth/PasswordScreen';
import Toast from 'react-native-toast-message';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import AveriasScreen from './screens/reports/averias/Averias';
import FiltrosAvanzados from './screens/reports/FiltrosAvanzados';
import CargarImagen from './screens/reports/averias/CargarImagen';
import { AuthProvider } from './contexts/AuthContext';
import ReporteOperacionScreen from './screens/reports/operativo/ReporteOperacion';
import ReporteVariablesScreen from './screens/reports/variables/ReporteVariables';
import Calendario_OT from './screens/reports/ordenes_trabajo/Calendario_OT';
import OrdenesTrabajoDiaScreen from './screens/reports/ordenes_trabajo/OrdenesTrabajoDiaScreen';
import RealizarOTScreen from './screens/reports/ordenes_trabajo/RealizarOTScreen';
import RealizarActividadOT from './screens/reports/ordenes_trabajo/RealizarActividadOT';
import './src/config/calendarLocale';
// import ReporteOperativoSecuencial from './screens/reports/operativo/ReporteOperativoSecuencial';
// import TipoReporteOperacionScreen from './screens/reports/operativo/TipoReporteOperacionScreen';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    text: '#1B2A56',
    primary: '#1B2A56',
    card: '#FFFFFF',
    border: '#DDDDDD',
    notification: '#FF453A',
  },
};

// Definir los tipos para los parámetros de navegación
export type AuthStackParamList = {
  Domain: undefined;
  User: { domain: string, username: string };
  Password: { domain: string; username: string; empresaId?: number };
  Main: undefined;
  Averias: undefined;
  FiltrosAvanzados: { grupoId: number, grupoName: string; };
  CargarImagen: { backlogId: number; empresaId: number, titulo: string };
  ReporteVariables: undefined;
  ReporteOperacion: undefined;
  // OT
  Calendario_OT: undefined;
  OrdenesTrabajoDia: { fecha: string };
  RealizarOT: { id: number; folio: string };
  RealizarActividadOT: { idActividad: number, idOrdenTrabajo: number, folio: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={LightTheme}>
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
          {/* <Stack.Screen name="TipoReporteOperacion" component={TipoReporteOperacionScreen} /> */}
          <Stack.Screen name="ReporteOperacion" component={ReporteOperacionScreen} />
          {/* <Stack.Screen name="ReporteOperativoSecuencial" component={ReporteOperativoSecuencial} /> */}
          <Stack.Screen name="ReporteVariables" component={ReporteVariablesScreen} />
          <Stack.Screen name="CargarImagen" component={CargarImagen} />
          <Stack.Screen name="Calendario_OT" component={Calendario_OT} />
          <Stack.Screen name="OrdenesTrabajoDia" component={OrdenesTrabajoDiaScreen} />
          <Stack.Screen name="RealizarOT" component={RealizarOTScreen} />
          <Stack.Screen name="RealizarActividadOT" component={RealizarActividadOT} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}