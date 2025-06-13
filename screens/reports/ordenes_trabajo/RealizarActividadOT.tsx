// screens/reports/ordenes_trabajo/RealizarActividadOT.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { RouteProp, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Ajustar si se tienen los servicios disponibles
// import { getActividadById } from '../../../services/reports/ordenesTrabajo/realizarOTService';

type RootStackParamList = {
  RealizarActividadOT: { idActividad: number; folio: string };
};

export default function RealizarActividadOT() {
  const route = useRoute<RouteProp<RootStackParamList, 'RealizarActividadOT'>>();
  const { idActividad, folio } = route.params;

  const [hora, setHora] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [duracionPlan, setDuracionPlan] = useState({ h: '', m: '' });
  const [duracionReal, setDuracionReal] = useState({ h: '', m: '' });
  const [descripcion, setDescripcion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);

  // Simular carga desde API en useEffect si se desea
  useEffect(() => {
    setLoading(true);
    // getActividadById(idActividad).then((res) => {
    //   if (res.success && res.data) {
    //     setDescripcion(res.data.observaciones_actividad);
    //     // set más campos si los hay
    //   }
    //   setLoading(false);
    // });
    setTimeout(() => setLoading(false), 500); // quitar cuando se use API real
  }, [idActividad]);

  const onChangeHora = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHora(selectedDate);
    }
  };

  return (
    <ReportScreenLayout>
      <HeaderWithBack title={`OT ${folio}`} />
      <ScrollView style={styles.container}>
        {loading ? <ActivityIndicator color="#5D74A6" /> : (
          <>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowPicker(true)}>
              <Text>{hora ? hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={hora || new Date()}
                mode="time"
                display="default"
                onChange={onChangeHora}
              />
            )}

            <Text style={styles.label}>Duración planeada</Text>
            <View style={styles.rowBetween}>
              <TextInput style={styles.input} placeholder="Hrs" keyboardType="numeric" value={duracionPlan.h} onChangeText={h => setDuracionPlan(p => ({ ...p, h }))} />
              <TextInput style={styles.input} placeholder="Mins" keyboardType="numeric" value={duracionPlan.m} onChangeText={m => setDuracionPlan(p => ({ ...p, m }))} />
            </View>

            <Text style={styles.label}>Duración real</Text>
            <View style={styles.rowBetween}>
              <TextInput style={styles.input} placeholder="Hrs" keyboardType="numeric" value={duracionReal.h} onChangeText={h => setDuracionReal(p => ({ ...p, h }))} />
              <TextInput style={styles.input} placeholder="Mins" keyboardType="numeric" value={duracionReal.m} onChangeText={m => setDuracionReal(p => ({ ...p, m }))} />
            </View>

            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.inputBox, { minHeight: 60 }]} multiline value={descripcion} onChangeText={setDescripcion} />

            <Text style={styles.label}>Comentarios</Text>
            <TextInput style={[styles.inputBox, { minHeight: 60 }]} multiline value={comentarios} onChangeText={setComentarios} />

            <TouchableOpacity style={styles.btnGuardar}>
              <Text style={styles.btnText}>Guardar cambios</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: {
    fontSize: 14,
    color: '#5D74A6',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    flex: 0.48,
    backgroundColor: '#FFF',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  btnGuardar: {
    backgroundColor: '#1B2A56',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
