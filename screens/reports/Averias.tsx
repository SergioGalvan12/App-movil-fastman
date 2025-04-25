// screens/Averias.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderTitle from '../../components/common/HeaderTitle';
import SelectPersonal from '../../components/SelectPersonal';
import Select from '../../components/common/Select';
import { fetchTurnos, TurnoInterface } from '../../services/turnoService';


export default function Averias() {
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