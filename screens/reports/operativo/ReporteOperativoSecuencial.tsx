// src/screens/reports/operativo/ReporteOperativoSecuencial.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

type RouteParams = {
  id_guia: number;
  id_equipo?: number;
  id_turno?: number;
  fecha_guia?: string;
  descripcion_equipo?: string | null;
  responsable?: string;
};

export default function ReporteOperativoSecuencial() {
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const hasReporte = !!params.id_guia;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte Operativo (Secuencial)</Text>

      <View style={styles.card}>
        <Text style={styles.label}>ID reporte:</Text>
        <Text style={styles.value}>{params.id_guia ?? '—'}</Text>

        <Text style={styles.label}>Equipo:</Text>
        <Text style={styles.value}>{params.descripcion_equipo ?? '—'}</Text>

        <Text style={styles.label}>Responsable:</Text>
        <Text style={styles.value}>{params.responsable ?? '—'}</Text>

        <Text style={styles.label}>Fecha (UTC enviada):</Text>
        <Text style={styles.value}>{params.fecha_guia ?? '—'}</Text>
      </View>

      <Text style={styles.subtitle}>Apartados</Text>

      {[
        { key: 'info', label: 'Información del reporte (OK)' },
        { key: 'prod', label: 'Producción' },
        { key: 'cons', label: 'Consumos' },
        { key: 'inv', label: 'Producción en inventario' },
        { key: 'evt', label: 'Eventos' },
        { key: 'rev', label: 'Revisiones' },
      ].map((s) => (
        <TouchableOpacity
          key={s.key}
          style={[styles.step, !hasReporte && styles.stepDisabled]}
          disabled={!hasReporte}
          onPress={() => {
            console.log('Abrir sección:', s.key, 'id_guia:', params.id_guia);
          }}
        >
          <Text style={styles.stepText}>{s.label}</Text>
        </TouchableOpacity>
      ))}

      {!hasReporte && (
        <Text style={styles.warn}>
          Primero debes crear el reporte para habilitar los apartados.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#EFF0FA' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1B2A56', marginBottom: 12, marginTop: 50 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#1B2A56', marginTop: 30, marginBottom: 4, },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1B2A56' },
  label: { marginTop: 10, fontSize: 12, color: '#1B2A56', fontWeight: '600' },
  value: { fontSize: 14, color: '#111' },
  step: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#1B2A56' },
  stepDisabled: { opacity: 0.5 },
  stepText: { color: '#1B2A56', fontWeight: '600' },
  warn: { marginTop: 12, color: '#B00020' },
});
