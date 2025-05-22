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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import HeaderTitle from '../../../components/common/HeaderTitle';
import Select from '../../../components/common/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { showToast } from '../../../services/notifications/ToastService';

import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../../services/reports/equipos/equipoService';
import {
  createReporteOperacion,
  ReporteOperacionPayload
} from '../../../services/reports/operativos/reporteOperacionService';
import { AuthStackParamList } from '../../../App';

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
  const [showDate, setShowDate] = useState(false);
  const [turno, setTurno] = useState<number | null>(null);
  const [grupoEquipo, setGrupoEquipo] = useState<number | null>(null);
  const [equipo, setEquipo] = useState<number | null>(null);
  const [unidadesIniciales, setUnidadesIniciales] = useState('0');
  const [unidadesFinales, setUnidadesFinales] = useState('0');
  const [unidadesControl, setUnidadesControl] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  // 1) Carga de turnos
  useEffect(() => {
    ; (async () => {
      setLoadingTurnos(true);
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

  // 2) Carga de grupos de equipo
  useEffect(() => {
    ; (async () => {
      setLoadingGrupos(true);
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

  // 3) Carga de equipos paginados al cambiar grupo
  useEffect(() => {
    if (!grupoEquipo) {
      setEquipoOptions([]);
      setEquiposData([]);
      return;
    }
    ; (async () => {
      setLoadingEquipos(true);
      const resp = await fetchEquipos();
      if (resp.success && resp.data) {
        setEquiposData(resp.data);
        setEquipoOptions(
          resp.data
            .filter(e => e.id_grupo_equipo === grupoEquipo)
            .map(e => ({ id: e.id_equipo, label: e.matricula_equipo }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      } else {
        setErrorEquipos(resp.error || 'Error al cargar equipos');
      }
      setLoadingEquipos(false);
      // limpiar lecturas previas
      setEquipo(null);
      setUnidadesIniciales('0');
      setUnidadesFinales('0');
      setUnidadesControl('0');
    })();
  }, [grupoEquipo]);

  // 4) Al seleccionar equipo, fijar lecturas
  const onSelectEquipo = (value: number | null) => {
    setEquipo(value);
    if (!value) {
      setUnidadesIniciales('0');
      setUnidadesFinales('0');
      return;
    }
    const sel = equiposData.find(e => e.id_equipo === value)!;
    setUnidadesIniciales(sel.uso_equipo);
    setUnidadesFinales(sel.uso_equipo);
  };

  // 5) Recalcular unidades de control
  useEffect(() => {
    const init = parseFloat(unidadesIniciales) || 0;
    const fin = parseFloat(unidadesFinales) || 0;
    setUnidadesControl((fin - init).toFixed(2));
  }, [unidadesIniciales, unidadesFinales]);

  // 6) Crear reporte
  const handleCrearReporte = async () => {
    if (!turno || !grupoEquipo || !equipo) {
      showToast('error', 'Faltan campos', 'Selecciona turno, grupo y equipo');
      return;
    }
    setSaving(true);

    try {
      // 6.1) obtener registro completo del equipo desde la lista ya cargada
      const eq = equiposData.find(e => e.id_equipo === equipo);
      if (!eq) throw new Error('Equipo no encontrado');

      // 6.2) armar payload idéntico al de la web
      const payload: ReporteOperacionPayload = {
        id_guia: null,
        numero_economico_equipo: eq.id_equipo,
        id_personal: personalId,
        id_turno: turno,
        id_empresa: eq.id_empresa,
        id_ubicacion: eq.id_ubicacion,
        id_area: eq.id_area,
        id_proceso: eq.id_proceso,
        id_subproceso: eq.id_subproceso,
        id_grupo_equipo: eq.id_grupo_equipo,
        unidad: null,
        descripcion_guia: observaciones,
        fecha_guia: fecha.toISOString(),
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

      // 6.3) enviar al servicio
      const res = await createReporteOperacion(payload);
      if (res.success && res.data) {
        showToast('success', 'Reporte creado', `ID: ${res.data.id_guia}`);
        navigation.getParent<BottomTabNavigationProp<any>>()?.navigate('Reportes');
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderTitle title="Información del reporte" />

        {/* Fecha */}
        <Text style={styles.label}>* Fecha</Text>
        <TextInput
          style={styles.input}
          value={fecha.toLocaleDateString()}
          editable={false}
          onFocus={() => setShowDate(true)}
        />
        {showDate && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={(_, d) => {
              if (d) setFecha(d);
              setShowDate(false);
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
        <TextInput
          style={styles.input}
          value={personalName}
          editable={false}
        />

        {/* Grupo de equipo */}
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

        {/* Unidades iniciales */}
        <Text style={styles.label}>* Unidades iniciales</Text>
        <TextInput
          style={styles.input}
          value={unidadesIniciales}
          onChangeText={setUnidadesIniciales}
          keyboardType="numeric"
        />

        {/* Unidades finales */}
        <Text style={styles.label}>* Unidades finales</Text>
        <TextInput
          style={styles.input}
          value={unidadesFinales}
          onChangeText={setUnidadesFinales}
          keyboardType="numeric"
        />

        {/* Unidades de control */}
        <Text style={styles.label}>Unidades de control</Text>
        <TextInput
          style={styles.input}
          value={unidadesControl}
          editable={false}
        />

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

        {/* Botón Crear reporte */}
        <TouchableOpacity
          style={[styles.createButton, saving && styles.createButtonDisabled]}
          onPress={handleCrearReporte}
          disabled={saving}
        >
          <Text style={styles.createButtonText}>
            {saving ? 'Guardando...' : '+ Crear reporte'}
          </Text>
        </TouchableOpacity>

        {/* Nota sobre consumos predefinidos */}
        <View style={styles.predef}>
          <Text>Reportar consumos de manera predefinida:</Text>
          <Ionicons name="checkmark-circle" size={20} style={styles.iconOK} />
        </View>
        <Text style={styles.note}>
          Nota: Elegir la opción predefinida generará los consumos del reporte a
          partir de los definidos en productos. Si deseas generar nuevos consumos,
          deberás hacerlo manualmente en su sección.
        </Text>
        <Text style={styles.required}>* Campos requeridos</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EFF0FA' },
  container: { padding: 22, paddingBottom: 40 },
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
  iconOK: { color: '#28A745', marginLeft: 8 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#333' },
  required: { marginTop: 20, fontStyle: 'italic', color: '#333' },
});
