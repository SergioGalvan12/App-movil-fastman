// screens/Averias.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderTitle from '../../components/common/HeaderTitle';
import SelectPersonal from '../../components/SelectPersonal';

export default function Averias() {
  // Estado central del formulario
  const [formulario, setFormulario] = useState<{ id_personal: number }>({
    id_personal: 0
  });
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [turno, setTurno] = useState('');
  const [clasificacion, setClasificacion] = useState('');

  //Solo para depurar el valor inicial
  useEffect(() => {
    console.log('[Averias] formulario inicial →', formulario);
  }, []);

  // Depurar cada cambio
  useEffect(() => {
    console.log('[Averias] formulario actual →', formulario);
  }, [formulario]);

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

        {/* Turno */}
        <Text style={styles.label}>Turno</Text>
        <TextInput
          style={styles.input}
          placeholder="mañana / tarde"
          value={turno}
          onChangeText={v => {
            console.log('[Averias] turno →', v);
            setTurno(v);
          }}
        />

        {/* Clasificación */}
        <Text style={styles.label}>Clasificación</Text>
        <TextInput
          style={styles.input}
          placeholder="mecánica / eléctrica"
          value={clasificacion}
          onChangeText={v => {
            console.log('[Averias] clasificación →', v);
            setClasificacion(v);
          }}
        />

        {/* Reporta: fuerza usar personal-me/ y deshabilita */}
        <Text style={styles.label}>Reporta</Text>
        <SelectPersonal
          formulario={formulario}
          setFormulario={setFormulario}
          etiqueta="reporta"
          forceSingle={true}   // <— aquí
        />

        {/* … resto del formulario … */}
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
