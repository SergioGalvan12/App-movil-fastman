// src/screens/reports/variables/ReporteVariables.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import HeaderTitle from '../../../components/common/HeaderTitle';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

import { AuthStackParamList } from '../../../App';
import { useAuth } from '../../../contexts/AuthContext';

import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchPersonals, Personal } from '../../../services/reports/personal/personalService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { Equipo, fetchEquipos } from '../../../services/reports/equipos/equipoService';

import {
  fetchVariablesControl,
  createReporteManttoPredictivo,
  VariableControl,
  CreateReporteManttoPredictivoPayload
} from '../../../services/reports/variables/mantenimientoPredictivoService';

// Extendemos Personal para mostrar Nombre + Apellido paterno
type PersonalOption = Personal & { fullName: string };

export default function ReporteVariablesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { empresaId } = useAuth();

  // Fecha & Hora
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [hora, setHora] = useState(new Date());
  const [showTime, setShowTime] = useState(false);

  // Turno
  const [turnosList, setTurnosList] = useState<TurnoInterface[]>([]);
  const [turno, setTurno] = useState<number | null>(null);

  // Personal
  const [personalsOptions, setPersonalsOptions] = useState<PersonalOption[]>([]);
  const [selectedPersonal, setSelectedPersonal] = useState<number | null>(null);
  const [loadingPersonals, setLoadingPersonals] = useState(true);
  const [errorPersonals, setErrorPersonals] = useState<string>('');

  // Grupo & Equipo
  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [grupoSelected, setGrupoSelected] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSelected, setEquipoSelected] = useState<number | null>(null);

  // Variable de control
  const [variables, setVariables] = useState<VariableControl[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<number | null>(null);
  const [loadingVariables, setLoadingVariables] = useState(true);
  const [errorVariables, setErrorVariables] = useState<string>('');

  // Código & Valor
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');

  // Carga inicial de turnos y grupos
  useEffect(() => {
    fetchTurnos().then(r => r.success && r.data && setTurnosList(r.data));
    fetchGrupoEquipos().then(r => r.success && r.data && setGrupos(r.data));
  }, []);

  // Carga inicial de personal
  useEffect(() => {
    (async () => {
      try {
        setLoadingPersonals(true);
        const resp = await fetchPersonals();
        if (resp.success && resp.data) {
          const mapped = resp.data.map<PersonalOption>(p => ({
            ...p,
            fullName: `${p.nombre_personal} ${p.apaterno_personal}`
          }));
          setPersonalsOptions(
            mapped.sort((a, b) =>
              a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
            )
          );
        } else {
          setErrorPersonals(resp.error ?? 'Error al cargar personal');
        }
      } catch {
        setErrorPersonals('Error inesperado al cargar personal');
      } finally {
        setLoadingPersonals(false);
      }
    })();
  }, []);

  // Carga inicial de variables de control
  useEffect(() => {
    (async () => {
      try {
        setLoadingVariables(true);
        const resp = await fetchVariablesControl();
        if (resp.success && resp.data) {
          setVariables(
            resp.data.sort((a, b) =>
              a.descripcion_mantto_pred.localeCompare(b.descripcion_mantto_pred, 'es', { sensitivity: 'base' })
            )
          );
        } else {
          setErrorVariables(resp.error ?? 'Error al cargar variables');
        }
      } catch {
        setErrorVariables('Error inesperado al cargar variables');
      } finally {
        setLoadingVariables(false);
      }
    })();
  }, []);

  // Recarga de equipos cuando cambia grupo seleccionado
  useEffect(() => {
    if (!grupoSelected) {
      setEquipos([]);
      return;
    }
    fetchEquipos().then(r => {
      if (r.success && r.data) {
        setEquipos(r.data.filter(e => e.id_grupo_equipo === grupoSelected));
      }
    });
  }, [grupoSelected]);

  // Auto-completar el campo Código al cambiar variable
  useEffect(() => {
    const sel = variables.find(v => v.id_mantto_pred === selectedVariable);
    setCodigo(sel?.id_mantto_pred_pub ?? '');
  }, [selectedVariable, variables]);

  // Confirmación antes de crear
  const handleConfirmCreate = () => {
    Alert.alert(
      'Crear reporte',
      '¿Deseas crear este reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear', onPress: createReporte }
      ],
      { cancelable: true }
    );
  };

  // Llamada al servicio POST
  const createReporte = async () => {
    if (!selectedVariable || !selectedPersonal || !turno || !equipoSelected || !grupoSelected) {
      showToast('error', 'Datos incompletos', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    const equipoObj = equipos.find(e => e.id_equipo === equipoSelected)!;
    const payload: CreateReporteManttoPredictivoPayload = {
      id_mantto_pred: selectedVariable,
      id_personal:    selectedPersonal,
      id_turno:       turno,
      id_equipo:      equipoSelected,
      numero_economico_equipo: equipoObj.matricula_equipo,
      id_grupo_equipo: grupoSelected,
      valor_reporte:  valor,
      codigo_reporte: codigo,
      fecha_reporte:  `${fecha.toISOString().slice(0,10)}T00:00:00`,
      hora_reporte:   `${String(hora.getHours()).padStart(2,'0')}:${String(hora.getMinutes()).padStart(2,'0')}:00`,
      id_empresa:     empresaId
    };

    try {
      const resp = await createReporteManttoPredictivo(payload);
      if (resp.success && resp.data) {
        showToast('success', `Se ha creado el reporte: ${resp.data.codigo_reporte}`);
        navigation.navigate('Main');
      } else {
        throw new Error(resp.error);
      }
    } catch (err: any) {
      showToast('error', 'Error al crear reporte', err.message || '');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <HeaderTitle title="Reporte de Variables" />

        {/* Fecha & Hora */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Fecha</Text>
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
                onChange={(_, d) => { d && setFecha(d); setShowDate(false); }}
              />
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Hora</Text>
            <TextInput
              style={styles.input}
              value={hora.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
              onFocus={() => setShowTime(true)}
              editable={false}
            />
            {showTime && (
              <DateTimePicker
                value={hora}
                mode="time"
                display="default"
                onChange={(_, t) => { t && setHora(t); setShowTime(false); }}
              />
            )}
          </View>
        </View>

        {/* Turno */}
        <Text style={styles.label}>Turno</Text>
        <Select<TurnoInterface>
          options={turnosList}
          valueKey="id_turno"
          labelKey="descripcion_turno"
          selectedValue={turno}
          onValueChange={v => setTurno(v as number)}
          placeholder="— Selecciona un turno —"
          style={styles.pickerWrapper}
        />

        {/* Personal */}
        <Text style={styles.label}>Personal</Text>
        <Select<PersonalOption>
          options={personalsOptions}
          valueKey="id_personal"
          labelKey="fullName"
          selectedValue={selectedPersonal}
          onValueChange={v => setSelectedPersonal(v as number)}
          placeholder="— Selecciona un personal —"
          loading={loadingPersonals}
          error={errorPersonals}
          style={styles.pickerWrapper}
        />

        {/* Grupo de equipo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        <Select<GrupoEquipo>
          options={grupos}
          valueKey="id_grupo_equipo"
          labelKey="nombre_grupo_equipo"
          selectedValue={grupoSelected}
          onValueChange={v => setGrupoSelected(v as number)}
          placeholder="Todos los grupos"
          style={styles.pickerWrapper}
        />

        {/* Equipo */}
        <Text style={styles.label}>Equipo</Text>
        <Select<Equipo>
          options={equipos}
          valueKey="id_equipo"
          labelKey="matricula_equipo"
          selectedValue={equipoSelected}
          onValueChange={v => setEquipoSelected(v as number)}
          placeholder="— Selecciona un equipo —"
          style={styles.pickerWrapper}
        />

        {/* Variable de control */}
        <Text style={styles.label}>Variable de control</Text>
        <Select<VariableControl>
          options={variables}
          valueKey="id_mantto_pred"
          labelKey="descripcion_mantto_pred"
          selectedValue={selectedVariable}
          onValueChange={v => setSelectedVariable(v as number)}
          placeholder="— Selecciona una variable —"
          loading={loadingVariables}
          error={errorVariables}
          style={styles.pickerWrapper}
        />

        {/* Código */}
        <Text style={styles.label}>Código</Text>
        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Código"
        />

        {/* Valor */}
        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          placeholder="0"
        />

        {/* Botón Crear */}
        <TouchableOpacity style={styles.createButton} onPress={handleConfirmCreate}>
          <Text style={styles.createButtonText}>+ Nuevo reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:         { flex: 1, backgroundColor: '#EFF0FA', padding: 20, paddingTop: 35 },
  container:        { flex: 1, backgroundColor: '#EFF0FA' },
  row:              { flexDirection: 'row', justifyContent: 'space-between' },
  col:              { flex: 1, marginRight: 10 },
  label:            { fontWeight: 'bold', fontSize: 16, marginTop: 12, color: '#1B2A56' },
  input:            { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderColor: '#1B2A56', borderWidth: 1, marginTop: 4 },
  pickerWrapper:    { marginTop: 4 },
  createButton:     { marginTop: 20, backgroundColor: '#004F9F', padding: 14, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
