// screens/reports/FiltrosAvanzados.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';

import type { AuthStackParamList } from '../../src/navigation/types';
import { fetchGrupoEquipos, GrupoEquipo } from '../../services/reports/equipos/grupoEquipoService';
import { fetchMarcas, Marca } from '../../services/reports/averias/marcaService';
import { fetchModelos, Modelo } from '../../services/reports/averias/modeloService';
import {
  ClasificacionUbicacion,
  fetchClasificacionesUbicacion,
} from '../../services/reports/averias/clasificacionService';
import { Ubicacion, fetchUbicaciones } from '../../services/reports/averias/ubicacionService';
import { Area, fetchAreas } from '../../services/reports/averias/areaService';

import { ScrollScreenContainer } from '../../src/ui/ScrollScreenContainer/ScrollScreenContainer';
import { PageHeader } from '../../src/ui/PageHeader/PageHeader';
import { FormSectionLabel } from '../../src/ui/FormSectionLabel/FormSectionLabel';
import { FieldFeedback } from '../../src/ui/FieldFeedback/FieldFeedback';
import { colors, spacing } from '../../src/theme';

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

  // — Estado para Áreas —
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [errorAreas, setErrorAreas] = useState('');
  const [areaSelected, setAreaSelected] = useState<number | null>(null);

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


  // Carga de áreas
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetchAreas();
        if (resp.success && resp.data) setAreas(resp.data);
        else setErrorAreas(resp.error || 'Error al cargar áreas');
      } catch {
        setErrorAreas('Error inesperado');
      } finally {
        setLoadingAreas(false);
      }
    })();
  }, []);

  return (
    <ScrollScreenContainer>
      <PageHeader
        title="Filtros Avanzados"
        subtitle="Refina la búsqueda de equipos y reportes con filtros más específicos."
      />

      <SearchInput placeholder="número económico, matrícula ó descripción" />

      <FormSectionLabel>Grupo de equipo</FormSectionLabel>
      <FieldFeedback loading={loadingGrupos} error={errorGrupos} />
      {!loadingGrupos && !errorGrupos && (
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

      <FormSectionLabel>Marca</FormSectionLabel>
      <FieldFeedback loading={loadingMarcas} error={errorMarcas} />
      {!loadingMarcas && !errorMarcas && (
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

      <FormSectionLabel>Modelo</FormSectionLabel>
      <FieldFeedback loading={loadingModelos} error={errorModelos} />
      {!loadingModelos && !errorModelos && (
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

      <FormSectionLabel>Clasificación</FormSectionLabel>
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

      <FormSectionLabel>Ubicación</FormSectionLabel>
      <FieldFeedback loading={loadingUbicaciones} error={errorUbicaciones} />
      {!loadingUbicaciones && !errorUbicaciones && (
        <Select<Ubicacion>
          options={ubicaciones}
          valueKey="id_ubicacion"
          labelKey="nombre_ubicacion"
          selectedValue={ubicacionSelected}
          onValueChange={(val) => setUbicacionSelected(val as number | null)}
          placeholder="— Selecciona ubicación —"
        />
      )}

      <FormSectionLabel>Área</FormSectionLabel>
      <FieldFeedback loading={loadingAreas} error={errorAreas} />
      {!loadingAreas && !errorAreas && (
        <Select<Area>
          options={areas}
          valueKey="id_area"
          labelKey="nombre_area"
          selectedValue={areaSelected}
          onValueChange={(val) => setAreaSelected(val as number | null)}
          placeholder="— Selecciona área —"
        />
      )}

      <View style={styles.bottomSpacer} />
    </ScrollScreenContainer>
  );
}

const styles = StyleSheet.create({
  bottomSpacer: {
    height: spacing.md,
  },
});