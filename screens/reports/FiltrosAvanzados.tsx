// screens/reports/FiltrosAvanzados.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import HeaderTitle from '../../components/common/HeaderTitle';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';

import { AuthStackParamList } from '../../App';
import { fetchGrupoEquipos, GrupoEquipo } from '../../services/grupoEquipoService';

type FiltrosRouteProp = RouteProp<AuthStackParamList, 'FiltrosAvanzados'>;
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'FiltrosAvanzados'>;

export default function FiltrosAvanzados() {
  const route = useRoute<FiltrosRouteProp>();
  const navigation = useNavigation<NavProp>();
  const { grupoId: initialGrupoId } = route.params;

  // — Lista de grupos para el Select
  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [errorGrupos, setErrorGrupos] = useState<string>('');

  // — Estado del grupo seleccionado
  const [grupoSelected, setGrupoSelected] = useState<number | null>(initialGrupoId);

  // 1) Al montar, vamos por los grupos
  useEffect(() => {
    (async () => {
      try {
        console.log('[FiltrosAvanzados] cargando grupos...');
        const resp = await fetchGrupoEquipos();
        if (resp.success && resp.data) {
          setGrupos(resp.data);
        } else {
          setErrorGrupos(resp.error || 'Error al cargar grupos');
        }
      } catch (e) {
        console.error('[FiltrosAvanzados] excepción cargando grupos:', e);
        setErrorGrupos('Error inesperado');
      } finally {
        setLoadingGrupos(false);
      }
    })();
  }, []);

  // 2) Cuando cambia el grupoSelected, podrías volver a fetch si quisieras
  useEffect(() => {
    console.log('[FiltrosAvanzados] grupoSelected →', grupoSelected);
    // p.ej. fetchGrupoEquipoBacklog(grupoSelected)
  }, [grupoSelected]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderTitle title="Filtros Avanzados" />

        {/* Búsqueda libre */}
        <SearchInput placeholder="número económico, matrícula ó descripción" />

        {/* Selector de Grupo de Equipo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        {loadingGrupos ? (
          <ActivityIndicator style={{ marginVertical: 10 }} />
        ) : errorGrupos ? (
          <Text style={styles.error}>{errorGrupos}</Text>
        ) : (
          <Select<GrupoEquipo>
            options={grupos}
            valueKey="id_grupo_equipo"
            labelKey="nombre_grupo_equipo"
            selectedValue={grupoSelected}
            onValueChange={(val) => {
              console.log('[FiltrosAvanzados] Grupo cambiado →', val);
              setGrupoSelected(val as number | null);
            }}
            placeholder="— Selecciona grupo —"
          />
        )}

        {/* Aquí podrías renderizar más controles según el grupoSelected */}
        {/* ... */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    padding: 20,
    paddingTop: 35,
  },
  container: {
    paddingBottom: 30,
    backgroundColor: '#EFF0FA',
  },
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1B2A56',
  },
  error: {
    color: '#E53935',
    marginVertical: 8,
  },
});
