// screens/reports/ordenes_trabajo/RealizarOTScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  getOrdenTrabajo,
  getActividadesOrdenTrabajo,
  getAlmacenesPorUbicacion
} from '../../../services/reports/ordenesTrabajo/realizarOTService';
import Select from '../../../components/common/Select';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../App';
import { useFocusEffect } from '@react-navigation/native';

interface Actividad {
  id_actividad_orden: number;
  id_actividad_orden_pub: string;
  observaciones_actividad: string;
  comentarios_actividad_orden: string;
  status_actividad_orden: boolean;
  fecha_inic_real_actividad_orden?: string;
  tiempo_actividad_orden?: string;
}


type RootStackParamList = {
  RealizarOT: { id: number; folio: string };
};

export default function RealizarOTScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RealizarOT'>>();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const { id, folio } = route.params;

  const [loading, setLoading] = useState(true);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<number | null>(null);
  const [fechas, setFechas] = useState({ inicio: '', fin: '' });
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      async function fetchData() {
        const ordenRes = await getOrdenTrabajo(id);
        const actividadesRes = await getActividadesOrdenTrabajo(id);

        if (ordenRes.success && ordenRes.data) {
          const data = ordenRes.data as any;
          setFechas({
            inicio: data.fecha_inic_ejec_plan_orden_trabajo,
            fin: data.fecha_fin_ejec_plan_orden_trabajo,
          });
          if (data.id_ubicacion) {
            const almacenesRes = await getAlmacenesPorUbicacion(Number(data.id_ubicacion));
            if (almacenesRes.success && almacenesRes.data) {
              setAlmacenes(almacenesRes.data);
            }
          }
        }
        if (actividadesRes.success && actividadesRes.data) {
          setActividades(actividadesRes.data as Actividad[]);
        }
        setLoading(false);
      }
      fetchData();
    }, [id])
  );

  const onChangeInicio = (_: any, selectedDate?: Date) => {
    setShowInicioPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setFechas((prev) => ({ ...prev, inicio: iso }));
    }
  };

  const onChangeFin = (_: any, selectedDate?: Date) => {
    setShowFinPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setFechas((prev) => ({ ...prev, fin: iso }));
    }
  };

  function getColorEstadoActividad(act: any) {
    const tieneHora = !!act.fecha_inic_real_actividad_orden;
    const tieneCostoReal = !!act.costo_total_actividad_orden_real && act.costo_total_actividad_orden_real !== '0.00';
    const tieneComentarios = !!act.comentarios_actividad_orden && act.comentarios_actividad_orden.trim() !== '';
    const tienePersonal = Array.isArray(act.puestos_actividad_orden) &&
      act.puestos_actividad_orden.some((p: any) => Array.isArray(p.personal_encargado) && p.personal_encargado.length > 0);

    if (tieneHora && tieneCostoReal && tienePersonal) return '#4CAF50'; // verde
    if (tieneHora || tieneCostoReal || tienePersonal || tieneComentarios) return '#FFC107'; // amarillo
    return '#F44336'; // rojo
  }


  return (
    <ReportScreenLayout>
      <HeaderWithBack title={`OT ${folio}`} />
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator color="#5D74A6" />
        ) : (
          <>
            <Text style={styles.sectionLabel}>Ejecución</Text>
            <View style={styles.rowBetween}>
              <View style={{ flex: 0.48 }}>
                <Text style={styles.label}>Inicio</Text>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowInicioPicker(true)}
                >
                  <Text>{fechas.inicio}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 0.48 }}>
                <Text style={styles.label}>Fin</Text>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowFinPicker(true)}
                >
                  <Text>{fechas.fin}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showInicioPicker && (
              <DateTimePicker
                value={fechas.inicio ? new Date(fechas.inicio) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeInicio}
              />
            )}
            {showFinPicker && (
              <DateTimePicker
                value={fechas.fin ? new Date(fechas.fin) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeFin}
              />
            )}

            <Text style={styles.sectionLabel}>Almacén</Text>
            <Select
              options={almacenes}
              valueKey="id_almacen"
              labelKey="nombre_almacen"
              selectedValue={almacenSeleccionado}
              onValueChange={(value) => setAlmacenSeleccionado(value)}
              placeholder="Selecciona un almacén"
            />

            <Text style={styles.semaforoLabel}>Estados de colores</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
              <Text style={{ color: '#F44336' }}>🔴 Pendiente</Text>
              <Text style={{ color: '#FFC107' }}>🟡 Proceso</Text>
              <Text style={{ color: '#4CAF50' }}>🟢 Completada</Text>
            </View>

            <Text style={styles.sectionLabel}>Actividades</Text>
            {actividades.map((act, i) => (
              <TouchableOpacity
                key={act.id_actividad_orden}
                style={[styles.actividadBtn, { borderColor: getColorEstadoActividad(act) }]}
                onPress={() =>
                  navigation.navigate('RealizarActividadOT', {
                    idActividad: act.id_actividad_orden,
                    idOrdenTrabajo: id,
                    folio: `${folio} AC ${i + 1}`,
                  })
                }
              >
                <Text style={styles.actividadText}>{i + 1}. {act.id_actividad_orden_pub}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.btnGuardar}>
              <Text style={styles.btnText}>Guardar y cerrar</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2A56',
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#5D74A6',
    marginBottom: 4,
  },
  dateBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  actividadBtn: {
    borderWidth: 2,
    borderColor: '#5D74A6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  actividadText: {
    color: '#1B2A56',
    fontWeight: '600',
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
  semaforoLabel: {
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#1B2A56',
  }
});
