import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, SafeAreaView,
  TouchableOpacity
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderTitle from '../../components/common/HeaderTitle';
import SelectPersonal from './SelectPersonal';
import Select from '../../components/common/Select';
import { fetchTurnos, TurnoInterface } from '../../services/turnoService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../services/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../services/equipoService';
import MenuItem from '../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../App';
import { fetchGrupoEquipoBacklog, GrupoEquipoBacklog } from '../../services/reports/averias/grupoEquipoBacklogService';
import { showToast } from '../../services/ToastService';
import Toast from 'react-native-toast-message';

export default function Averias() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  // Estado central del formulario
  const [formulario, setFormulario] = useState<{ id_personal: number }>({ id_personal: 0 });
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  // Descripción de avería
  const [descripcion, setDescripcion] = useState<string>('');

  // Estado para Turnos
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

  // Contador para acciones correctivas ficticias
  const [accionCount, setAccionCount] = useState(1);

  // Carga inicial y depuración
  useEffect(() => console.log('[Averias] formulario inicial →', formulario), []);
  useEffect(() => console.log('[Averias] formulario actual →', formulario), [formulario]);

  // Cargar turnos al montar
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetchTurnos();
        if (resp.success && resp.data) setTurnosList(resp.data);
        else setErrorTurnos(resp.error || 'Error al cargar turnos');
      } catch {
        setErrorTurnos('Error inesperado al cargar turnos');
      } finally {
        setLoadingTurnos(false);
      }
    })();
  }, []);

  // Cargar grupos
  useEffect(() => { loadGrupos(); }, []);
  const loadGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const resp = await fetchGrupoEquipos();
      if (resp.success && resp.data) setGrupos(resp.data);
      else setErrorGrupos(resp.error || 'Error al cargar grupos');
    } catch {
      setErrorGrupos('Error inesperado');
    } finally { setLoadingGrupos(false); }
  };

  // Cargar equipos según grupo
  useEffect(() => {
    if (!grupoSelected) return setEquipos([]);
    (async () => {
      try {
        setLoadingEquipos(true);
        const resp = await fetchEquipos();
        if (resp.success && resp.data) setEquipos(resp.data.filter(e => e.id_grupo_equipo === grupoSelected));
        else setErrorEquipos(resp.error || 'Error al cargar equipos');
      } catch {
        setErrorEquipos('Error inesperado');
      } finally { setLoadingEquipos(false); }
    })();
  }, [grupoSelected]);

  // Cargar averías según grupo y equipo
  useEffect(() => {
    (async () => {
      if (grupoSelected && equipoSelected) {
        try {
          setLoadingAverias(true);
          const resp = await fetchGrupoEquipoBacklog(grupoSelected);
          if (resp.success && resp.data) setAverias(resp.data);
          else setErrorAverias(resp.error || 'Error al cargar averías');
        } catch {
          setErrorAverias('Error inesperado al cargar averías');
        } finally { setLoadingAverias(false); }
      } else {
        setAverias([]);
        setAveriaSelected(null);
      }
    })();
  }, [grupoSelected, equipoSelected]);

  // Autopopula descripción cuando cambia avería
  useEffect(() => {
    const sel = averias.find(a => a.id_grupo_backlog === averiaSelected);
    setDescripcion(sel?.nombre_falla || '');
  }, [averiaSelected]);

  // Handler para crear acción correctiva
  const handleCrearAccionCorrectiva = () => {
    const mensaje = `Se ha creado la acción AC${accionCount} - ejemplo notificación`;
    showToast('success', mensaje, undefined, {position: 'top'});
    setAccionCount(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <HeaderTitle title="Reporte de Avería" />
        {/* Fecha */}
        <Text style={styles.label}>* Fecha</Text>
        <TextInput style={styles.input} value={fecha.toLocaleDateString()} onFocus={() => setShowDate(true)} editable={false} />
        {showDate && <DateTimePicker value={fecha} mode="date" display="default" onChange={(_, d) => d && setFecha(d)} />}

        {/* Turno */}
        <Text style={styles.label}>Turno</Text>
        <Select<TurnoInterface> options={turnosList} valueKey="id_turno" labelKey="descripcion_turno"
          selectedValue={turno} onValueChange={v => setTurno(v as number)} placeholder="— Selecciona un turno —"
          loading={loadingTurnos} error={errorTurnos} style={styles.pickerWrapper} />

        {/* Reporta */}
        <Text style={styles.label}>Reporta</Text>
        <SelectPersonal formulario={formulario} setFormulario={setFormulario} etiqueta="reporta" forceSingle />

        {/* Grupo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        <Select<GrupoEquipo> options={grupos} valueKey="id_grupo_equipo" labelKey="nombre_grupo_equipo"
          selectedValue={grupoSelected} onValueChange={v => setGrupoSelected(v as number)} placeholder="— Selecciona grupo —"
          loading={loadingGrupos} error={errorGrupos} />

        {/* Equipo */}
        <Text style={styles.label}>Equipo</Text>
        <Select<Equipo> options={equipos} valueKey="id_equipo" labelKey="matricula_equipo"
          selectedValue={equipoSelected} onValueChange={v => setEquipoSelected(v as number)}
          placeholder={grupoSelected && !equipos.length ? 'No hay equipos' : '— Selecciona equipo —'}
          loading={loadingEquipos} error={errorEquipos} />

        {/* Avería */}
        <Text style={styles.label}>Avería</Text>
        <Select<GrupoEquipoBacklog> options={averias} valueKey="id_grupo_backlog" labelKey="nombre_falla"
          selectedValue={averiaSelected} onValueChange={v => setAveriaSelected(v as number)}
          disabled={!grupoSelected || !equipoSelected}
          placeholder={!grupoSelected ? 'Seleccione un grupo' : !equipoSelected ? 'Seleccione un equipo' : averias.length === 0 ? 'Sin averías registradas' : 'Seleccione una avería'}
          loading={loadingAverias} error={errorAverias} />

        {/* Descripción editable */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, styles.textArea]} multiline value={descripcion}
          onChangeText={setDescripcion} placeholder="Describe la avería..." />

        {/* Crear acción correctiva */}
        <TouchableOpacity style={styles.createButton} onPress={handleCrearAccionCorrectiva}>
          <Text style={styles.createButtonText}>+ Crear acción correctiva</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EFF0FA', padding: 20, paddingTop: 35 },
  container: { flex: 1, backgroundColor: '#EFF0FA' },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 12, color: '#1B2A56' },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderColor: '#1B2A56', borderWidth: 1, marginTop: 4 },
  pickerWrapper: { marginTop: 4 },
  textArea: { height: 100, textAlignVertical: 'top' },
  createButton: { marginTop: 20, backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});