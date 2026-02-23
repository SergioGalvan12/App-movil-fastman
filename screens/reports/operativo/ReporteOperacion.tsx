// src/screens/reports/operativo/ReporteOperacion.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Select from '../../../components/common/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { showToast } from '../../../services/notifications/ToastService';
import { fetchTurnos } from '../../../services/reports/turnos/turnoService';
import { fetchGrupoEquipos } from '../../../services/reports/equipos/grupoEquipoService';
import { fetchEquiposByGrupo, Equipo } from '../../../services/reports/equipos/equipoService';
import {
  createReporteOperacion,
  ReporteOperacionPayload
} from '../../../services/reports/operativos/reporteOperacionService';
import type { AuthStackParamList } from '../../../src/navigation/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';

dayjs.extend(utc);
dayjs.extend(timezone);

type TabParamList = {
  Dashboard: undefined;
  Reportes: undefined;
  Notificaciones: undefined;
};
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

type SelectOption = { id: number; label: string };

const toUtcIsoWithZ_FromDateTime = (d: Date) => {
  return dayjs(d).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
};

export default function ReporteOperacionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { personalId, personalName } = useAuth();

  // — Estados Turno —
  const [turnoOptions, setTurnoOptions] = useState<SelectOption[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [errorTurnos, setErrorTurnos] = useState('');

  // — Estados Grupo de Equipo —
  const [grupoOptions, setGrupoOptions] = useState<SelectOption[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState('');

  // — Estados Equipos —
  const [equiposData, setEquiposData] = useState<Equipo[]>([]);
  const [equipoOptions, setEquipoOptions] = useState<SelectOption[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState('');

  // — Estados Formulario —
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [turno, setTurno] = useState<number | null>(null);
  const [grupoEquipo, setGrupoEquipo] = useState<number | null>(null);
  const [equipo, setEquipo] = useState<number | null>(null);
  const [unidadesIniciales, setUnidadesIniciales] = useState('0');
  const [unidadesFinales, setUnidadesFinales] = useState('0');
  const [unidadesControl, setUnidadesControl] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  // Carga turnos
  useEffect(() => {
    (async () => {
      setLoadingTurnos(true);
      setErrorTurnos('');
      const resp = await fetchTurnos();
      if (resp.success && resp.data) {
        setTurnoOptions(
          resp.data
            .map(t => ({ id: t.id_turno, label: t.descripcion_turno }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      } else {
        setErrorTurnos(resp.error || 'Error al cargar turnos');
      }
      setLoadingTurnos(false);
    })();
  }, []);

  // Carga de grupos de equipo
  useEffect(() => {
    (async () => {
      setLoadingGrupos(true);
      setErrorGrupos('');
      const resp = await fetchGrupoEquipos();
      if (resp.success && resp.data) {
        setGrupoOptions(
          resp.data
            .map(g => ({ id: g.id_grupo_equipo, label: g.nombre_grupo_equipo }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      } else {
        setErrorGrupos(resp.error || 'Error al cargar grupos');
      }
      setLoadingGrupos(false);
    })();
  }, []);

  // Carga equipos SOLO del grupo seleccionado
  useEffect(() => {
    if (!grupoEquipo) {
      setEquipoOptions([]);
      setEquiposData([]);
      setEquipo(null);
      return;
    }

    (async () => {
      setLoadingEquipos(true);
      setErrorEquipos('');

      const resp = await fetchEquiposByGrupo(grupoEquipo);
      if (resp.success && resp.data) {
        setEquiposData(resp.data);
        setEquipoOptions(
          resp.data
            .map(e => ({ id: e.id_equipo, label: e.matricula_equipo ?? `Equipo ${e.id_equipo}` }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      } else {
        setErrorEquipos(resp.error || 'Error al cargar equipos');
      }

      setLoadingEquipos(false);

      // limpiar previos al cambiar de grupo
      setEquipo(null);
      setUnidadesIniciales('0');
      setUnidadesFinales('0');
      setUnidadesControl('0');
    })();
  }, [grupoEquipo]);

  // Selección de equipo fija lecturas
  const onSelectEquipo = (value: number | null) => {
    setEquipo(value);
    if (!value) {
      setUnidadesIniciales('0');
      setUnidadesFinales('0');
      return;
    }
    const sel = equiposData.find(e => e.id_equipo === value)!;
    setUnidadesIniciales(sel.uso_equipo || '0.00');
    setUnidadesFinales(sel.uso_equipo || '0.00');
  };

  // Recalcular unidades de control
  useEffect(() => {
    const ui = parseFloat(unidadesIniciales) || 0;
    const uf = parseFloat(unidadesFinales) || 0;
    setUnidadesControl((uf - ui).toFixed(2));
  }, [unidadesIniciales, unidadesFinales]);

  // Confirmación y creación
  const confirmAndCreate = () => {
    Alert.alert(
      'Confirmación',
      '¿Quieres generar el reporte operativo?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', onPress: handleCrearReporte },
      ]
    );
  };

  const handleCrearReporte = async () => {
    if (!turno || !grupoEquipo || !equipo) {
      showToast('error', 'Faltan campos', 'Selecciona turno, grupo y equipo');
      return;
    }
    if (!personalId) {
      showToast('error', 'Falta responsable', 'No se detectó el responsable');
      return;
    }

    setSaving(true);

    try {
      const sel = equiposData.find(e => e.id_equipo === equipo);
      if (!sel) {
        showToast('error', 'Equipo inválido', 'Vuelve a seleccionar el equipo');
        setSaving(false);
        return;
      }

      const ui = parseFloat(unidadesIniciales) || 0;
      const uf = parseFloat(unidadesFinales) || 0;
      if (uf < ui) {
        showToast('error', 'Lecturas inválidas', 'La lectura final debe ser ≥ inicial');
        setSaving(false);
        return;
      }

      if (observaciones.length > 250) {
        showToast('error', 'Observaciones', 'Máximo 250 caracteres');
        setSaving(false);
        return;
      }

      const fechaUTCString = toUtcIsoWithZ_FromDateTime(fecha);
      console.log('[DEBUG] fecha_guia local:', dayjs(fecha).format());
      console.log('[DEBUG] fecha_guia UTC enviada:', fechaUTCString);

      const payload: ReporteOperacionPayload = {
        id_guia: null,
        numero_economico_equipo: sel.id_equipo,
        id_personal: personalId,
        id_turno: turno,

        id_empresa: sel.id_empresa,
        id_ubicacion: sel.id_ubicacion,
        id_area: sel.id_area,
        id_proceso: sel.id_proceso,
        id_subproceso: sel.id_subproceso,
        id_grupo_equipo: sel.id_grupo_equipo ?? grupoEquipo,

        unidad: null,
        descripcion_guia: observaciones,
        fecha_guia: fechaUTCString,

        consumo_unitario: true,
        km_hrs_inicio: unidadesIniciales,
        km_hrs_final: unidadesFinales,
        status_checklist_reporte: '',

        producto_1: '',
        producto_2: '',
        producto_3: '',
        produccion_1: '',
        produccion_2: '',
        produccion_3: '',
        status_guia_inspeccion: true,
      };

      const res = await createReporteOperacion(payload);

      if (res.success && res.data) {
        const det: any = res.data;
        const idGuia = det.id_guia;

        showToast('success', 'Se ha creado el reporte', `ID: ${idGuia}`);

        navigation.navigate('ReporteOperativoSecuencial', {
          id_guia: idGuia,
          id_equipo: sel.id_equipo,
          id_turno: turno,
          fecha_guia: fechaUTCString,
          descripcion_equipo: sel.descripcion_equipo ?? sel.matricula_equipo ?? null,
          responsable: personalName,
          id_empresa: sel.id_empresa,
          id_grupo_equipo: sel.id_grupo_equipo ?? grupoEquipo!,
        });
      } else {
        throw new Error(res.error || 'Error al crear reporte');
      }
    } catch (err: any) {
      console.error('Error guardando el reporte:', err);
      showToast('error', 'Error', err.message || 'No se pudo crear el reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ReportScreenLayout>
      <HeaderWithBack title="Reporte operativo" />

      {/* Fecha y hora */}
      <Text style={styles.label}>* Fecha y hora</Text>
      <TextInput
        style={styles.input}
        value={dayjs(fecha).format('DD/MM/YYYY hh:mm A')}
        editable={false}
        onFocus={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (!d) return;

            // Preservar hora actual y cambiar solo la fecha
            const prev = dayjs(fecha);
            const next = dayjs(d)
              .hour(prev.hour())
              .minute(prev.minute())
              .second(0)
              .millisecond(0);
            setFecha(next.toDate());
            setShowTimePicker(true);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={fecha}
          mode="time"
          display="default"
          onChange={(_, t) => {
            setShowTimePicker(false);
            if (!t) return;
            const prev = dayjs(fecha);
            const next = prev
              .hour(dayjs(t).hour())
              .minute(dayjs(t).minute())
              .second(0)
              .millisecond(0);

            setFecha(next.toDate());
          }}
        />
      )}

      {/* Turno */}
      <Text style={styles.label}>* Turno</Text>
      <Select<SelectOption>
        options={turnoOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={turno}
        onValueChange={v => setTurno(v as number)}
        placeholder="Selecciona un turno"
        loading={loadingTurnos}
        error={errorTurnos}
        style={styles.picker}
      />

      {/* Responsable */}
      <Text style={styles.label}>Responsable</Text>
      <TextInput style={styles.input} value={personalName} editable={false} />

      {/* Grupo */}
      <Text style={styles.label}>* Grupo de equipo</Text>
      <Select<SelectOption>
        options={grupoOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={grupoEquipo}
        onValueChange={v => setGrupoEquipo(v as number)}
        placeholder="Selecciona un grupo"
        loading={loadingGrupos}
        error={errorGrupos}
        style={styles.picker}
      />

      {/* Equipo */}
      <Text style={styles.label}>* Equipo</Text>
      <Select<SelectOption>
        options={equipoOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={equipo}
        onValueChange={v => onSelectEquipo(v as number)}
        placeholder={!grupoEquipo ? 'Selecciona grupo antes' : 'Selecciona un equipo'}
        loading={loadingEquipos}
        error={errorEquipos}
        disabled={!grupoEquipo}
        style={styles.picker}
      />

      {/* Unidades */}
      <Text style={styles.label}>* Unidades iniciales</Text>
      <TextInput style={styles.input} value={unidadesIniciales} onChangeText={setUnidadesIniciales} keyboardType="numeric" />

      <Text style={styles.label}>* Unidades finales</Text>
      <TextInput style={styles.input} value={unidadesFinales} onChangeText={setUnidadesFinales} keyboardType="numeric" />

      <Text style={styles.label}>Unidades de control</Text>
      <TextInput style={styles.input} value={unidadesControl} editable={false} />

      {/* Observaciones */}
      <Text style={styles.label}>Observaciones</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={observaciones}
        onChangeText={t => t.length <= 250 && setObservaciones(t)}
        placeholder="Escribe tus observaciones..."
      />
      <Text style={styles.counter}>{observaciones.length}/250</Text>

      {/* Crear */}
      <TouchableOpacity
        style={[styles.createButton, saving && styles.createButtonDisabled]}
        onPress={confirmAndCreate}
        disabled={saving}
      >
        <Text style={styles.createButtonText}>
          {saving ? 'Guardando...' : '+ Crear reporte'}
        </Text>
      </TouchableOpacity>

      {/* Nota */}
      <View style={styles.predef}>
        <Text>Reportar consumos de manera predefinida:</Text>
        <Ionicons name="checkmark-circle" size={20} style={styles.iconOK} />
      </View>
      <Text style={styles.note}>
        Nota: Elegir la opción predefinida generará los consumos a partir de productos predefinidos.
        Para consumos manuales, ve a su sección.
      </Text>
      <Text style={styles.required}>* Campos requeridos</Text>
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    color: '#1B2A56',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B2A56',
    marginTop: 4,
  },
  picker: { marginTop: 4 },
  textArea: { height: 120, textAlignVertical: 'top', marginTop: 4 },
  counter: { alignSelf: 'flex-end', marginTop: 4, color: '#666' },
  createButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: { backgroundColor: '#A0A0A0' },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  predef: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  iconOK: { color: '#28A745', marginLeft: 1 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#333' },
  required: { marginTop: 20, fontStyle: 'italic', color: '#333' },
});
