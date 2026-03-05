import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../src/navigation/types';
import { fetchProduccionByGuia } from '../../../services/reports/operativos/produccionService';
import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'ReporteOperativoSecuencial'>;

export default function ReporteOperativoSecuencial({ route, navigation }: Props) {
  const params = route.params ?? ({} as any);
  const hasReporte = !!params?.id_guia;

  const [produccionOk, setProduccionOk] = useState<boolean>(!!params?.produccion_ok);
  const [checking, setChecking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!params?.id_guia) return;

      let mounted = true;
      (async () => {
        setChecking(true);
        try {
          const resp = await fetchProduccionByGuia(params.id_guia);
          if (!mounted) return;
          const ok = !!(resp.success && resp.data && resp.data.length > 0);
          setProduccionOk(ok);
        } finally {
          if (mounted) setChecking(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [params?.id_guia])
  );

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

      {checking && <ActivityIndicator style={{ marginTop: 8 }} />}

      <Text style={styles.subtitle}>Apartados</Text>

      {[
        { key: 'prod', label: `Producción${produccionOk ? ' (OK)' : ''}` },
        { key: 'cons', label: 'Consumos' },
        { key: 'evt', label: 'Eventos' },
        { key: 'rev', label: 'Revisiones' },
      ].map((s) => (
        <TouchableOpacity
          key={s.key}
          style={[styles.step, !hasReporte && styles.stepDisabled]}
          disabled={!hasReporte}
          onPress={() => {
            if (!hasReporte) return;

            if (s.key === 'prod') {
              navigation.navigate('ProduccionReporteOperacion', {
                id_guia: params.id_guia,
                id_empresa: params.id_empresa,
                id_grupo_equipo: params.id_grupo_equipo,
                id_ubicacion: params.id_ubicacion,
                fecha_guia: params.fecha_guia,
                responsable: params.responsable,
                descripcion_equipo: params.descripcion_equipo ?? null,
              });
              return;
            }

            if (s.key === 'cons') {
              navigation.navigate('ConsumosReporteOperacion', {
                id_guia: params.id_guia,
                id_empresa: params.id_empresa,
                id_ubicacion: params.id_ubicacion,
              });
              return;
            }
          }}
        >
          <Text style={styles.stepText}>{s.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#EFF0FA' },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B2A56',
    marginBottom: 12,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2A56',
    marginTop: 30,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1B2A56',
  },
  label: { marginTop: 10, fontSize: 12, color: '#1B2A56', fontWeight: '600' },
  value: { fontSize: 14, color: '#111' },
  step: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1B2A56',
  },
  stepDisabled: { opacity: 0.5 },
  stepText: { color: '#1B2A56', fontWeight: '600' },
});