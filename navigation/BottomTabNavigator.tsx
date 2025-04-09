import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // librería de íconos 

// Importa tus pantallas:
import DashboardScreen from '../screens/DashboardScreen';
import ReportesScreen from '../screens/ReportesScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            id={undefined}  // Agregamos este prop para satisfacer el tipado
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: '#2059BF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // Ocultar el header nativo si quieres
                tabBarStyle: { backgroundColor: '#FFF' },
                tabBarIcon: ({ color, size }) => {
                    let iconName: "home" | "list" | "notifications" = "home";
                    if (route.name === 'Dashboard') iconName = 'home';
                    else if (route.name === 'Reportes') iconName = 'list';
                    else if (route.name === 'Notificaciones') iconName = 'notifications';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Reportes" component={ReportesScreen} />
            <Tab.Screen name="Notificaciones" component={NotificacionesScreen} />
        </Tab.Navigator>
    );
}
