// src/screens/ReportesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MenuItem from '../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';

export default function ReportesScreen() {
  const navigation = useNavigation();

  const handlePress = (routeName: string) => {
    // Navega a la pantalla que quieras
    navigation.navigate(routeName as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* <MenuItem 
          title="Órdenes de trabajo" 
          onPress={() => handlePress('OrdenesTrabajo')} 
        />
        
        <MenuItem 
          title="Lista de tareas" 
          onPress={() => handlePress('ListaTareas')} 
        />
        
        <MenuItem 
          title="Reporte de Operación" 
          onPress={() => handlePress('ReporteOperacion')} 
        />
        
        <MenuItem 
          title="Reporte de Consumos" 
          onPress={() => handlePress('ReporteConsumos')} 
        /> */}

        <MenuItem
          title="Reporte de Avería (MC)"
          onPress={() => handlePress('Averias')}
        />

        {/* Nuevo: Reporte Operativo */}
        <MenuItem
          title="Reporte Operativo"
          onPress={() => handlePress('ReporteOperacion')}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B2A56',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
