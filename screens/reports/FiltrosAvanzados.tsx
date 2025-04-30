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
import { fetchMarcas, Marca } from '../../services/reports/averias/marcaService';
import { fetchModelos, Modelo } from '../../services/reports/averias/modeloService';
import { ClasificacionUbicacion, fetchClasificacionesUbicacion } from '../../services/reports/averias/clasificacionService';
import { Ubicacion, fetchUbicaciones } from '../../services/reports/averias/ubicacionService';

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


  // — marcas
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(true);
  const [errorMarcas, setErrorMarcas] = useState<string>('');
  const [marcaSelected, setMarcaSelected] = useState<number | null>(null);

  // — Modelos (depende de la marca seleccionada) —
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [errorModelos, setErrorModelos] = useState<string>('');
  const [modeloSelected, setModeloSelected] = useState<number | null>(null);

  // Estado para Clasificación Ubicación
  const [clasificacionSelected, setClasificacionSelected] = useState<number | null>(null);
  const [clasificaciones, setClasificaciones] = useState<ClasificacionUbicacion[]>([]);
  const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);
  const [errorClasificaciones, setErrorClasificaciones] = useState('');

  // Estado para Ubicación
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  const [errorUbicaciones, setErrorUbicaciones] = useState('');
  const [ubicacionSelected, setUbicacionSelected] = useState<number | null>(null);


  // carga inicial de grupos
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

    // carga inicial de marcas
    (async () => {
      try {
        const resp = await fetchMarcas();
        if (resp.success && resp.data) setMarcas(resp.data);
        else setErrorMarcas(resp.error || 'Error al cargar marcas');
      } catch {
        setErrorMarcas('Error inesperado al cargar marcas');
      } finally {
        setLoadingMarcas(false);
      }
    })();
  }, []); // fin useEffect

  // cuando cambia la marca seleccionada, cargamos los modelos
  useEffect(() => {
    if (marcaSelected == null) {
      setModelos([]);
      setModeloSelected(null);
      return;
    }
    (async () => {
      setLoadingModelos(true);
      try {
        console.log('[FiltrosAvanzados] cargando modelos para marca:', marcaSelected);
        const resp = await fetchModelos(marcaSelected);
        if (resp.success && resp.data) {
          setModelos(resp.data);
        } else {
          setErrorModelos(resp.error || 'Error al cargar modelos');
        }
      } catch (e) {
        console.error(e);
        setErrorModelos('Error inesperado con modelos');
      } finally {
        setLoadingModelos(false);
      }
    })();
  }, [marcaSelected]); // fin useEffect

  // Cargar clasificaciones al montar
  useEffect(() => {
    loadClasificaciones();
  }, []);

  const loadClasificaciones = async () => {
    try {
      setLoadingClasificaciones(true);
      const resp = await fetchClasificacionesUbicacion();
      if (resp.success && resp.data) {
        setClasificaciones(resp.data);
      } else {
        setErrorClasificaciones(resp.error || 'Error al cargar clasificaciones');
      }
    } catch (error) {
      setErrorClasificaciones('Error inesperado');
    } finally {
      setLoadingClasificaciones(false);
    }
  };


  // 2) Cuando cambia el grupoSelected, podrías volver a fetch si quisieras
  useEffect(() => {
    console.log('[FiltrosAvanzados] grupoSelected →', grupoSelected);
    // p.ej. fetchGrupoEquipoBacklog(grupoSelected)
  }, [grupoSelected]);

  // Carga inicial de ubicaciones
  useEffect(() => {
    (async () => {
      try {
        console.log('[FiltrosAvanzados] cargando ubicaciones...');
        const resp = await fetchUbicaciones();
        if (resp.success && resp.data) {
          setUbicaciones(resp.data);
        } else {
          setErrorUbicaciones(resp.error || 'Error al cargar ubicaciones');
        }
      } catch (e) {
        console.error(e);
        setErrorUbicaciones('Error inesperado');
      } finally {
        setLoadingUbicaciones(false);
      }
    })();
  }, []);


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

        {/* Selector de Marca */}
        <Text style={styles.label}>Marca</Text>
        {loadingMarcas ? (
          <ActivityIndicator style={{ marginVertical: 10 }} />
        ) : errorMarcas ? (
          <Text style={styles.error}>{errorMarcas}</Text>
        ) : (
          <Select<Marca>
            options={marcas}
            valueKey="id_marca"
            labelKey="nombre_marca"
            selectedValue={marcaSelected}
            onValueChange={(val) => {
              console.log('[FiltrosAvanzados] Marca cambiada →', val);
              setMarcaSelected(val as number | null);
            }}
            placeholder="— Selecciona marca —"
          />
        )}

        {/* Selector de Modelo  depende de la marca*/}
        <Text style={styles.label}>Modelo</Text>
        {loadingModelos ? (
          <ActivityIndicator style={{ marginVertical: 10 }} />
        ) : errorModelos ? (
          <Text style={styles.error}>{errorModelos}</Text>
        ) : (
          <Select<Modelo>
            options={modelos}
            valueKey="id_modelo"
            labelKey="nombre_modelo"
            selectedValue={modeloSelected}
            onValueChange={(val) => {
              console.log('[FiltrosAvanzados] Modelo cambiado →', val);
              setModeloSelected(val as number | null);
            }}
            placeholder={
              marcaSelected != null && modelos.length === 0
                ? 'No hay modelos para esta marca'
                : '— Selecciona modelo —'
            }
          />
        )}

        <Text style={styles.label}>Clasificación</Text>
        <Select<ClasificacionUbicacion>
          options={clasificaciones}
          valueKey="id_clasificacion"
          labelKey="nombre_clasificacion"
          selectedValue={clasificacionSelected}
          onValueChange={(val) => {
            console.log('[Averias] Clasificación seleccionada:', val);
            setClasificacionSelected(val as number | null);
          }}
          placeholder="Todas las ubicaciones"
          loading={loadingClasificaciones}
          error={errorClasificaciones}
        />

        <Text style={styles.label}>Ubicación</Text>
        {loadingUbicaciones ? (
          <ActivityIndicator style={{ marginVertical: 10 }} />
        ) : errorUbicaciones ? (
          <Text style={styles.error}>{errorUbicaciones}</Text>
        ) : (
          <Select<Ubicacion>
            options={ubicaciones}
            valueKey="id_ubicacion"
            labelKey="nombre_ubicacion"
            selectedValue={ubicacionSelected}
            onValueChange={val => setUbicacionSelected(val as number | null)}
            placeholder="— Selecciona ubicación —"
          />
        )}

        {/* Selector de Ubicación */}
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
