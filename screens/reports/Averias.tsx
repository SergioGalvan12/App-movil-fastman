// screens/Averias.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderTitle from '../../components/common/HeaderTitle';
import SelectPersonal from './SelectPersonal';
import Select from '../../components/common/Select';
import { fetchTurnos, TurnoInterface } from '../../services/turnoService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../services/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../services/equipoService';
import { ClasificacionUbicacion, fetchClasificacionesUbicacion } from '../../services/reports/averias/clasificacionService';
import MenuItem from '../../components/common/MenuItem';
import BtnOutlineSecundary from '../../components/common/BtnOutlineSecundary';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../App';
import { fetchGrupoEquipoBacklog, GrupoEquipoBacklog } from '../../services/reports/averias/grupoEquipoBacklogService';

export default function Averias() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // Estado central del formulario
  const [formulario, setFormulario] = useState<{ id_personal: number }>({
    id_personal: 0
  });
  // — otros campos —
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [clasificacion, setClasificacion] = useState('');

  // — Estado para Turnos —
  const [turno, setTurno] = useState<number | null>(null);
  const [turnosList, setTurnosList] = useState<TurnoInterface[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [errorTurnos, setErrorTurnos] = useState<string>('');

  // Estado para Grupo de Equipo
  const [grupoSelected, setGrupoSelected] = useState<number | null>(null);
  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState('');

  // Estado para Equipo (depende del grupo)
  const [equipoSelected, setEquipoSelected] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState('');

  // Estado para Averías
  const [averias, setAverias] = useState<GrupoEquipoBacklog[]>([]);
  const [averiaSelected, setAveriaSelected] = useState<number | null>(null);
  const [loadingAverias, setLoadingAverias] = useState(false);
  const [errorAverias, setErrorAverias] = useState('');

  //Solo para depurar el valor inicial
  useEffect(() => {
    console.log('[Averias] formulario inicial →', formulario);
  }, []);

  // Depurar cada cambio
  useEffect(() => {
    console.log('[Averias] formulario actual →', formulario);
  }, [formulario]);

  // Cargar turnos al montar
  // Al montar, cargamos y ordenamos turnos desde API
  useEffect(() => {
    (async () => {
      try {
        console.log('[Averias] cargando turnos...');
        const resp = await fetchTurnos();

        if (resp.success && resp.data) {
          // Ordenamos descendente por “Qn” cuando aplique
          const sorted = resp.data.slice().sort((a, b) => {
            const regex = /^Q(\d+)/;               // buscamos “Q” seguido de dígitos
            const ma = a.descripcion_turno.match(regex);
            const mb = b.descripcion_turno.match(regex);

            if (ma && mb) {
              // ambos tienen “Qn”: comparamos numéricamente
              parseInt(ma[1], 10) - parseInt(mb[1], 10) // ↑ ascendente

            } else if (ma) {
              // sólo a tiene “Qn”: lo ponemos antes
              return -1;
            } else if (mb) {
              // sólo b tiene “Qn”: lo ponemos antes
              return 1;
            }
            // ninguno o ambos no tienen “Qn”: orden alfabético simple
            return a.descripcion_turno.localeCompare(b.descripcion_turno);
          });

          setTurnosList(sorted);
        } else {
          setErrorTurnos(resp.error || 'Error al cargar turnos');
        }
      } catch (e) {
        console.error('[Averias] excepción cargando turnos:', e);
        setErrorTurnos('Error inesperado al cargar turnos');
      } finally {
        setLoadingTurnos(false);
      }
    })();
  }, []);

  // Cargar grupos de equipos 
  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const resp = await fetchGrupoEquipos();
      if (resp.success && resp.data) {
        setGrupos(resp.data);
      } else {
        setErrorGrupos(resp.error || 'Error al cargar grupos');
      }
    } catch (error) {
      setErrorGrupos('Error inesperado');
    } finally {
      setLoadingGrupos(false);
    }
  };

  useEffect(() => {
    if (grupoSelected == null) {
      setEquipos([]);
      setEquipoSelected(null);
      return;
    }
    loadEquiposByGrupo(grupoSelected);
  }, [grupoSelected]);

  // Cargar equipos por grupo
  const loadEquiposByGrupo = async (grupoId: number) => {
    try {
      setLoadingEquipos(true);
      const resp = await fetchEquipos();
      if (resp.success && resp.data) {
        const filtrados = resp.data.filter(
          (eq) => eq.id_grupo_equipo === grupoId
        );
        setEquipos(filtrados);
      } else {
        setErrorEquipos(resp.error || 'Error al cargar equipos');
      }
    } catch (error) {
      setErrorEquipos('Error inesperado');
    } finally {
      setLoadingEquipos(false);
    }
  };

  useEffect(() => {
    const loadAverias = async () => {
      if (grupoSelected && equipoSelected) {
        try {
          setLoadingAverias(true);
          const resp = await fetchGrupoEquipoBacklog(grupoSelected);
          if (resp.success && resp.data) {
            setAverias(resp.data);
          } else {
            setErrorAverias(resp.error || 'Error al cargar averías');
          }
        } catch (error) {
          setErrorAverias('Error inesperado al cargar averías');
        } finally {
          setLoadingAverias(false);
        }
      } else {
        setAverias([]);
        setAveriaSelected(null);
      }
    };

    loadAverias();
  }, [grupoSelected, equipoSelected]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <HeaderTitle title="Reporte de Avería" />

        {/* Fecha */}
        <Text style={styles.label}>* Fecha</Text>
        <TextInput
          style={styles.input}
          value={fecha.toLocaleDateString()}
          onFocus={() => setShowDate(true)}
          editable={false}
        />
        {showDate && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={(_, d) => {
              setShowDate(false);
              if (d) {
                console.log('[Averias] nueva fecha →', d);
                setFecha(d);
              }
            }}
          />
        )}

        {/* — Turno — */}
        <Text style={styles.label}>Turno</Text>
        <Select<TurnoInterface>
          options={turnosList}
          valueKey="id_turno"
          labelKey="descripcion_turno"
          selectedValue={turno}
          onValueChange={(v) => {
            console.log('[Averias] turno seleccionado →', v);
            setTurno(v as number);
          }}
          placeholder="— Selecciona un turno —"
          loading={loadingTurnos}
          error={errorTurnos}
          style={styles.pickerWrapper}
        />

        {/* Reporta: fuerza usar personal-me/ y deshabilita */}
        <Text style={styles.label}>Reporta</Text>
        <SelectPersonal
          formulario={formulario}
          setFormulario={setFormulario}
          etiqueta="reporta"
          forceSingle={true}   // <— aquí
        />

        {/* Grupo de equipo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        <Select<GrupoEquipo>
          options={grupos}
          valueKey="id_grupo_equipo"
          labelKey="nombre_grupo_equipo"
          selectedValue={grupoSelected}
          onValueChange={(val) => {
            console.log('[Averias] Grupo seleccionado:', val);
            setGrupoSelected(val as number | null);
          }}
          placeholder="— Selecciona grupo —"
          loading={loadingGrupos}
          error={errorGrupos}
        />

        {/* Equipo */}
        <Text style={styles.label}>Equipo</Text>
        <Select<Equipo>
          options={equipos}
          valueKey="id_equipo"
          labelKey="matricula_equipo"
          selectedValue={equipoSelected}
          onValueChange={(val) => {
            console.log('[Averias] Equipo seleccionado:', val);
            setEquipoSelected(val as number | null);
          }}
          // 2) Si hay grupo pero no equipos, mostramos este texto:
          placeholder={
            grupoSelected != null && equipos.length === 0
              ? 'No hay equipos'
              : '— Selecciona equipo —'
          }
          loading={loadingEquipos}
          error={errorEquipos}
        />

        {/* Avería */}
        <Text style={styles.label}>Avería</Text>
        <Select<GrupoEquipoBacklog>
          options={averias}
          valueKey="id_grupo_backlog"
          labelKey="nombre_falla"
          selectedValue={averiaSelected}
          onValueChange={(val) => {
            console.log('[Averias] Avería seleccionada:', val);
            setAveriaSelected(val as number);
          }}
          placeholder={
            grupoSelected == null
              ? 'Seleccione un grupo'
              : equipoSelected == null
                ? 'Seleccione un equipo'
                : 'Seleccione una avería'
          }
          loading={loadingAverias}
          error={errorAverias}
        />

        {/* Se podria habilitar en un futuro */}
        {/* <BtnOutlineSecundary
          title="Filtros avanzados"
          onPress={() => {
            // busca el nombre del grupo en tu lista
            const grupo = grupos.find(g => g.id_grupo_equipo === grupoSelected);
            navigation.navigate('FiltrosAvanzados', {
              grupoId: grupoSelected,
              grupoName: grupo ? grupo.nombre_grupo_equipo : ''
            });
          }}
        /> 
        */}

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
    flex: 1,
    backgroundColor: '#EFF0FA',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 12,
    color: '#1B2A56',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderColor: '#1B2A56',
    borderWidth: 1,
    marginTop: 4,
  },
  pickerWrapper: {
    marginTop: 4,
  },
});
