import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MenuItem from '../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../src/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function ReportesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MenuItem title="Reporte de Avería (MC)" onPress={() => navigation.navigate('Averias')} />

        {/* Reporte Operativo ahora vive dentro de Operativo (stack anidado) */}
        <MenuItem
          title="Reporte de Operación de equipos"
          onPress={() =>
            navigation.navigate('Operativo', {
              screen: 'ReporteOperacion',
            })
          }
        />

        <MenuItem title="Reporte de Variables" onPress={() => navigation.navigate('ReporteVariables')} />
        <MenuItem title="Reporte de Revisiones" onPress={() => navigation.navigate('Revisiones')} />
        <MenuItem title="Calendario de Órdenes de Trabajo" onPress={() => navigation.navigate('Calendario_OT')} />
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