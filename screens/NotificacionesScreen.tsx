import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificacionesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.subtitle}>¡Estás en la pantalla de Notificaciones!</Text>
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
