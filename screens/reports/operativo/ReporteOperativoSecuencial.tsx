// src/screens/reports/operativo/ReporteOperativoSecuencial.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReporteOperativoSecuencial() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Pantalla para Reporte Operativo ¡Secuencial!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF0FA' },
  text: { fontSize: 16, color: '#1B2A56' },
});
