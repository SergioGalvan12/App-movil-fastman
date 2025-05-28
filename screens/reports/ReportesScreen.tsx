// src/screens/ReportesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MenuItem from '../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../App';
import { fetchPersonals, Personal } from '../../services/reports/personal/personalService';

export default function ReportesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handlePress = (routeName: string) => {
    // Navega a la pantalla que quieras
    navigation.navigate(routeName as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <MenuItem
          title="Reporte de Avería (MC)"
          onPress={() => handlePress('Averias')}
        />

        {/* Nuevo: Reporte Operativo */}
        <MenuItem
          title="Reporte Operativo"
          onPress={() => handlePress('TipoReporteOperacion')}
        />

        {/* Nuevo: Reporte de Variables */}
        <MenuItem
          title="Reporte de Variables"
          onPress={() => handlePress('ReporteVariables')}
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
