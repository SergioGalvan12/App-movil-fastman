// src/screens/reports/variables/ReporteVariables.tsx

import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchVariablesControl, VariableControl } from '../../../services/reports/variables/mantenimientoPredictivoService';
import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchPersonals, Personal } from '../../../services/reports/personal/personalService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { Equipo, fetchEquipos } from '../../../services/reports/equipos/equipoService';
import { showToast } from '../../../services/notifications/ToastService';
import { useAuth } from '../../../contexts/AuthContext';
import Select from '../../../components/common/Select';
import HeaderTitle from '../../../components/common/HeaderTitle';

// Extendemos Personal para mostrar nombre + apellido paterno
type PersonalOption = Personal & { fullName: string };

export default function ReporteVariablesScreen() {
  const { empresaId, personalId } = useAuth();

  // Fecha y hora
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [hora, setHora] = useState(new Date());
  const [showTime, setShowTime] = useState(false);

  // Turnos
  const [turnosList, setTurnosList] = useState<TurnoInterface[]>([]);
  const [turno, setTurno] = useState<number | null>(null);

  // Personal
  const [personalsOptions, setPersonalsOptions] = useState<PersonalOption[]>([]);
  const [selectedPersonal, setSelectedPersonal] = useState<number | null>(null);
  const [loadingPersonals, setLoadingPersonals] = useState(true);
  const [errorPersonals, setErrorPersonals] = useState<string>('');

  // Grupo y equipo
  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [grupoSelected, setGrupoSelected] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSelected, setEquipoSelected] = useState<number | null>(null);

  // Variables de control
  const [variables, setVariables] = useState<VariableControl[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<number | null>(null);
  const [loadingVariables, setLoadingVariables] = useState(true);
  const [errorVariables, setErrorVariables] = useState<string>('');

  // Código y valor
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');

  // Carga inicial de datos
  useEffect(() => {
    // Turnos
    fetchTurnos().then(resp => {
      if (resp.success && resp.data) setTurnosList(resp.data);
    });

    // Grupos de equipo
    fetchGrupoEquipos().then(resp => {
      if (resp.success && resp.data) setGrupos(resp.data);
    });
  }, []);

  // Carga de personal
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
          const sorted = mapped.sort((a, b) =>
            a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' })
          );
          setPersonalsOptions(sorted);
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

  // Carga de variables de control
  useEffect(() => {
    (async () => {
      try {
        setLoadingVariables(true);
        const resp = await fetchVariablesControl();
        if (resp.success && resp.data) {
          const sorted = resp.data.sort((a, b) =>
            a.descripcion_mantto_pred.localeCompare(b.descripcion_mantto_pred, 'es', { sensitivity: 'base' })
          );
          setVariables(sorted);
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

  // Recarga de equipos cuando cambia grupo
  useEffect(() => {
    if (!grupoSelected) {
      setEquipos([]);
      return;
    }
    fetchEquipos().then(resp => {
      if (resp.success && resp.data) {
        setEquipos(resp.data.filter(e => e.id_grupo_equipo === grupoSelected));
      }
    });
  }, [grupoSelected]);

  // Auto-completar código al seleccionar variable
  useEffect(() => {
    const sel = variables.find(v => v.id_mantto_pred === selectedVariable);
    setCodigo(sel?.id_mantto_pred_pub ?? '');
  }, [selectedVariable, variables]);

  const handleCrearReporte = () => {
    showToast('info', 'En desarrollo', 'Próximamente podrás crear tu reporte de variables.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <HeaderTitle title="Reporte de Variables" />

        {/* Fecha y Hora */}
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

        {/* Grupo y Equipo */}
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
        <TouchableOpacity style={styles.createButton} onPress={handleCrearReporte}>
          <Text style={styles.createButtonText}>+ Crear reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#EFF0FA', padding: 20, paddingTop: 35 },
  container:   { flex: 1, backgroundColor: '#EFF0FA' },
  row:         { flexDirection: 'row', justifyContent: 'space-between' },
  col:         { flex: 1, marginRight: 10 },
  label:       { fontWeight: 'bold', fontSize: 16, marginTop: 12, color: '#1B2A56' },
  input:       { backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderColor: '#1B2A56', borderWidth: 1, marginTop: 4 },
  pickerWrapper:{ marginTop: 4 },
  createButton:{ marginTop: 20, backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center' },
  createButtonText:{ color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
