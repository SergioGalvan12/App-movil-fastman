import React, { useState, useEffect } from 'react';
import {
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

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

import { AuthStackParamList } from '../../../App';
import { useAuth } from '../../../contexts/AuthContext';

import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchPersonals, Personal } from '../../../services/reports/personal/personalService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { Equipo, fetchEquiposByGrupo } from '../../../services/reports/equipos/equipoService';

import {
  fetchVariablesControl,
  createReporteManttoPredictivo,
  VariableControl,
  CreateReporteManttoPredictivoPayload
} from '../../../services/reports/variables/mantenimientoPredictivoService';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type PersonalOption = Personal & {
  fullName: string;
};

export default function ReporteVariablesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { empresaId, personalId } = useAuth();

  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [hora, setHora] = useState(new Date());
  const [showTime, setShowTime] = useState(false);

  const [turnosList, setTurnosList] = useState<TurnoInterface[]>([]);
  const [turno, setTurno] = useState<number | null>(null);

  const [personalsOptions, setPersonalsOptions] = useState<PersonalOption[]>([]);
  const [selectedPersonal, setSelectedPersonal] = useState<number | null>(null);
  const [loadingPersonals, setLoadingPersonals] = useState(true);
  const [errorPersonals, setErrorPersonals] = useState('');

  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [grupoSelected, setGrupoSelected] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSelected, setEquipoSelected] = useState<number | null>(null);

  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState('');

  const [variables, setVariables] = useState<VariableControl[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<number | null>(null);
  const [loadingVariables, setLoadingVariables] = useState(true);
  const [errorVariables, setErrorVariables] = useState('');

  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');

  useEffect(() => {
    fetchTurnos().then(r => r.success && r.data && setTurnosList(r.data));
    fetchGrupoEquipos().then(r => r.success && r.data && setGrupos(r.data));
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingPersonals(true);
      setErrorPersonals('');

      const resp = await fetchPersonals();

      if (resp.success && resp.data) {
        const mapped: PersonalOption[] = resp.data
          .map(p => ({
            ...p,
            fullName: `${p.nombre_personal} ${p.apaterno_personal}`,
          }))
          .sort((a, b) =>
            a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          );
        setPersonalsOptions(mapped);
      } else {
        setErrorPersonals(resp.error ?? 'Error al cargar personal');
      }

      setLoadingPersonals(false);
    })();
  }, []);


  useEffect(() => {
    (async () => {
      try {
        setLoadingVariables(true);
        const resp = await fetchVariablesControl();
        if (resp.success && resp.data) {
          setVariables(resp.data.sort((a, b) => a.descripcion_mantto_pred.localeCompare(b.descripcion_mantto_pred, 'es', { sensitivity: 'base' })));
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

  useEffect(() => {
    (async () => {
      setEquipoSelected(null);
      setEquipos([]);
      setErrorEquipos('');
      if (!grupoSelected) return;
      try {
        setLoadingEquipos(true);

        const resp = await fetchEquiposByGrupo(grupoSelected);

        if (resp.success && resp.data) {
          const sorted = resp.data.slice().sort((a, b) =>
            (a.matricula_equipo ?? '').localeCompare(b.matricula_equipo ?? '', 'es', { sensitivity: 'base' })
          );
          setEquipos(sorted);
        } else {
          setErrorEquipos(resp.error ?? 'Error al cargar equipos del grupo');
        }
      } finally {
        setLoadingEquipos(false);
      }
    })();
  }, [grupoSelected]);

  useEffect(() => {
    const sel = variables.find(v => v.id_mantto_pred === selectedVariable);
    setCodigo(sel?.id_mantto_pred_pub ?? '');
  }, [selectedVariable, variables]);

  const handleConfirmCreate = () => {
    const turnoDesc = turnosList.find(t => t.id_turno === turno)?.descripcion_turno || '–';
    const equipoMat = equipos.find(e => e.id_equipo === equipoSelected)?.matricula_equipo || '–';
    const variable = variables.find(v => v.id_mantto_pred === selectedVariable)?.descripcion_mantto_pred || '–';
    const nombrePersonal =
      personalsOptions.find(p => p.id_equipo === selectedPersonal)?.fullName || '–';

    const fechaTexto = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const horaTexto = hora.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    Alert.alert(
      'Confirmación',
      `¿Crear reporte con los siguientes datos?\n\n` +
      `📅 Fecha: ${fechaTexto}\n` +
      `⏰ Hora: ${horaTexto}\n` +
      `👷 Personal: ${nombrePersonal}\n` +
      `🕒 Turno: ${turnoDesc}\n` +
      `🛠️ Equipo: ${equipoMat}\n` +
      `📊 Variable: ${variable}\n` +
      `🔢 Valor: ${valor}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: createReporte }
      ]
    );
  };


  const createReporte = async () => {
    if (
      selectedVariable == null ||
      selectedPersonal == null ||
      turno == null ||
      equipoSelected == null ||
      grupoSelected == null ||
      valor.trim() === '' ||
      isNaN(parseFloat(valor))
    ) {
      showToast('error', 'Datos incompletos', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    const equipoObj = equipos.find(e => e.id_equipo === equipoSelected)!;
    const numero_economico = equipoObj.matricula_equipo.replace(/\D/g, '');
    const localTime = dayjs(hora);
    const combinedLocal = dayjs(fecha)
      .hour(localTime.hour())
      .minute(localTime.minute())
      .second(localTime.second());
    const fechaUTC = combinedLocal.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    const horaLocal = localTime.format('HH:mm:ss');

    const idPersonalToSend = selectedPersonal;
    if (idPersonalToSend == null) {
      showToast('error', 'Personal inválido', 'Selecciona un personal válido.');
      return;
    }

    console.log('[DBG] selectedPersonal raw:', selectedPersonal, typeof selectedPersonal);
    console.log('[DBG] personalId auth:', personalId, typeof personalId);
    console.log('[DBG] coalesce:', (selectedPersonal ?? personalId), typeof (selectedPersonal ?? personalId));

    if (!Number.isFinite(idPersonalToSend)) {
      showToast('error', 'Personal inválido', 'Selecciona un personal válido.');
      return;
    }

    const payload: CreateReporteManttoPredictivoPayload = {
      id_mantto_pred: selectedVariable,
      id_personal: idPersonalToSend,
      id_turno: turno,
      id_equipo: equipoSelected,
      numero_economico_equipo: numero_economico,
      id_grupo_equipo: grupoSelected,
      valor_reporte: valor.trim(),
      codigo_reporte: codigo,
      fecha_reporte: fechaUTC,
      hora_reporte: horaLocal,
      id_empresa: empresaId
    };

    console.log('[ReporteVariables] selectedPersonal →', selectedPersonal);
    console.log('[ReporteVariables] payload →', JSON.stringify(payload))

    try {
      const resp = await createReporteManttoPredictivo(payload);
      if (resp.success && resp.data) {
        showToast('success', 'Reporte creado con éxito', `Código: ${resp.data.codigo_reporte}`);
        setSelectedVariable(null);
        setCodigo('');
        setValor('');
      } else {
        throw new Error(resp.error);
      }
    } catch (err: any) {
      showToast('error', 'Error al crear reporte', err.message || '');
    }
  };

  return (
    <ReportScreenLayout>
      <HeaderWithBack title="Reporte de Variables" />

      {/* Fecha & Hora */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity onPress={() => setShowDate(true)}>
            <TextInput
              style={styles.input}
              value={fecha.toLocaleDateString()}
              editable={false}           // sigue sin permitir escribir a mano
              pointerEvents="none"       // delega el touch al TouchableOpacity
            />
          </TouchableOpacity>
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
          <TouchableOpacity onPress={() => setShowTime(true)}>
            <TextInput
              style={styles.input}
              value={hora.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
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
        valueKey="id_equipo" //Pk numérico del personal
        labelKey="fullName"
        selectedValue={selectedPersonal}
        onValueChange={v => setSelectedPersonal(v as number | null)}
        placeholder="— Selecciona un personal —"
        loading={loadingPersonals}
        error={errorPersonals}
        style={styles.pickerWrapper}
      />

      {/* Grupo */}
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
        loading={loadingEquipos}
        error={errorEquipos}
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
        editable={false}
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
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, marginRight: 10 },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 12, color: '#1B2A56' },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderColor: '#1B2A56', borderWidth: 1, marginTop: 4 },
  pickerWrapper: { marginTop: 4 },
  createButton: { marginTop: 20, backgroundColor: '#004F9F', padding: 14, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
