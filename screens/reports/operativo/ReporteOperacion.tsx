// src/screens/reports/operativo/ReporteOperacion.tsx
import React, { useState } from 'react';
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
import HeaderTitle from '../../../components/common/HeaderTitle';
import Select from '../../../components/common/Select';

type SelectOption = {
  id: number;
  label: string;
};

export default function ReporteOperacionScreen() {
  // Opciones (más adelante vendrán de tu fetch)
  const turnoOptions: SelectOption[] = [];
  const grupoOptions: SelectOption[] = [];
  const equipoOptions: SelectOption[] = [];

  // Estados de formulario
  const [fecha, setFecha] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);

  const [turno, setTurno] = useState<number | null>(null);
  const [responsable, setResponsable] = useState<string>('');

  const [grupoEquipo, setGrupoEquipo] = useState<number | null>(null);
  const [equipo, setEquipo] = useState<number | null>(null);

  const [unidadesIniciales, setUnidadesIniciales] = useState<string>('0');
  const [unidadesFinales, setUnidadesFinales] = useState<string>('0');
  const [unidadesControl, setUnidadesControl] = useState<string>('0');

  const [observaciones, setObservaciones] = useState<string>('');

  const handleCrearReporte = () => {
    console.log('Crear reporte…');
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
          style={styles.picker}
        />

        {/* Responsable */}
        <Text style={styles.label}>Responsable</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex]}
            value={responsable}
            placeholder="— José Luis Cárdenas —"
            editable={false}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setResponsable('')}
          >
            <Text style={styles.clearText}>Quitar</Text>
          </TouchableOpacity>
        </View>

        {/* Grupo de equipo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        <Select<SelectOption>
          options={grupoOptions}
          valueKey="id"
          labelKey="label"
          selectedValue={grupoEquipo}
          onValueChange={v => setGrupoEquipo(v as number)}
          placeholder="Todos los grupos"
          style={styles.picker}
        />

        {/* Equipo */}
        <Text style={styles.label}>* Equipo</Text>
        <Select<SelectOption>
          options={equipoOptions}
          valueKey="id"
          labelKey="label"
          selectedValue={equipo}
          onValueChange={v => setEquipo(v as number)}
          placeholder="Selecciona un equipo"
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
          onChangeText={setUnidadesControl}
          keyboardType="numeric"
        />

        {/* Observaciones */}
        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={observaciones}
          onChangeText={t =>
            t.length <= 250 && setObservaciones(t)
          }
          placeholder="Escribe tus observaciones..."
        />
        <Text style={styles.counter}>{observaciones.length}/250</Text>

        {/* Botón Crear */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCrearReporte}
        >
          <Text style={styles.createButtonText}>+ Crear reporte</Text>
        </TouchableOpacity>

        {/* Indicador predefinidos */}
        <View style={styles.predef}>
          <Text>Reportar consumos de manera predefinida:</Text>
          <Ionicons
            name="checkmark-circle"
            size={20}
            style={styles.iconOK}
          />
        </View>

        <Text style={styles.note}>
          Nota: Elegir la opción predefinida generará los consumos del
          reporte a partir de los definidos en productos. Si deseas
          generar nuevos consumos, deberás hacerlo manualmente en su sección.
        </Text>

        <Text style={styles.required}>* Campos requeridos</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EFF0FA' },
  container: { padding: 20, paddingBottom: 40 },
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
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  clearButton: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#1B2A56',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  clearText: { color: '#1B2A56', fontWeight: '600' },
  textArea: { height: 120, textAlignVertical: 'top', marginTop: 4 },
  counter: { alignSelf: 'flex-end', marginTop: 4, color: '#666' },
  createButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  predef: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  iconOK: { color: '#28A745', marginLeft: 8 },
  note: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#333' },
  required: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#333',
  },
});
