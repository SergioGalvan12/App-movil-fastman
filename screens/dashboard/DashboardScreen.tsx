// screens/dashboard/DashboardScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ensureImagePermissions } from '../../services/permisos/permissions';

export default function DashboardScreen() {
  useEffect(() => {
    // Tras el login, pedimos permisos antes de mostrar el contenido
    ensureImagePermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>¡Bienvenido!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B2A56',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#1B2A56',
  },
});