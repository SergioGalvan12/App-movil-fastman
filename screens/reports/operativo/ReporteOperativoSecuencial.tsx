import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchProduccionByGuia } from '../../../services/reports/operativos/produccionService';
import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'ReporteOperativoSecuencial'>;

export default function ReporteOperativoSecuencial({ route, navigation }: Props) {
  const params = route.params ?? ({} as any);
  const hasReporte = !!params?.id_guia;

  const [produccionOk, setProduccionOk] = useState<boolean>(!!params?.produccion_ok);
  const [checking, setChecking] = useState(false);

  /**
   * Cuando es false, bloqueamos la salida de esta pantalla.
   * Cuando el usuario confirma, la activamos temporalmente y navegamos.
   */
  const [canExit, setCanExit] = useState(false);

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

  /**
   * Este hook bloquea cualquier intento de salir de la pantalla:
   * - botón back Android
   * - gesto de retroceso
   * - back del stack
   */
  usePreventRemove(!canExit, ({ data }) => {
    Alert.alert(
      'Salir del reporte',
      'Si sales de aquí, ya no podrás acceder nuevamente al reporte actual desde la app. Su registro deberá continuarse en línea. ¿Deseas salir?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            setCanExit(true);

            /**
             * IMPORTANTE:
             * En tu AuthStackParamList NO existe una ruta llamada "Reportes".
             * Por lo que aquí te dejo la salida segura al stack principal.
             *
             * Si tu pantalla de Reportes vive dentro de Main (BottomTabNavigator),
             * después hay que navegar a esa tab/pantalla según cómo esté definido tu BottomTab.
             */
            const parent = navigation.getParent();

            if (parent) {
              parent.navigate('Main');
            } else {
              navigation.navigate('ReporteOperacion');
            }
          },
        },
      ]
    );
  });

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

            if (s.key === 'evt') {
              navigation.navigate('EventosReporteOperacion', {
                id_guia: params.id_guia,
                id_empresa: params.id_empresa,
                id_grupo_equipo: params.id_grupo_equipo,
              });
              return;
            }

            if (s.key === 'rev') {
              navigation.navigate('RevisionesReporteOperacion', {
                id_guia: params.id_guia,
                id_empresa: params.id_empresa,
                id_grupo_equipo: params.id_grupo_equipo,
              });
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
    fontSize: 20,
    textAlign: 'center',
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
    backgroundColor: 'hsl(218, 61%, 28%)',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1B2A56',
  },
  stepDisabled: { opacity: 0.5 },
  stepText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});