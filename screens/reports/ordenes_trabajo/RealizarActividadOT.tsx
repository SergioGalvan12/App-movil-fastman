import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { RouteProp, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActividadOrdenTrabajoById, getPersonalPorPuesto } from '../../../services/reports/ordenesTrabajo/realizarOTService';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

interface Trabajador {
    id: number;
    nombre: string;
    id_puesto_personal: number;
}

interface PuestoActividad {
    id: number;
    puesto: number;
    nombre_puesto: string;
    personal_encargado: number[];
    cantidad_prog: number;
    cantidad_real?: number | null;
    costo_prog: string;
    costo_real?: string | null;
}

interface Actividad {
    id_actividad_orden: number;
    observaciones_actividad: string;
    comentarios_actividad_orden: string | null;
    tiempo_actividad_orden: string | null;
    tiempo_plan_actividad_orden: string | null;
    fecha_inic_real_actividad_orden: string | null;
    puestos_actividad_orden: PuestoActividad[];
}

type RootStackParamList = {
    RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string };
};

export default function RealizarActividadOT() {
    const route = useRoute<RouteProp<RootStackParamList, 'RealizarActividadOT'>>();
    const { idActividad, idOrdenTrabajo, folio } = route.params;

    const [hora, setHora] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [duracionPlan, setDuracionPlan] = useState({ h: '', m: '' });
    const [duracionReal, setDuracionReal] = useState({ h: '', m: '' });
    const [descripcion, setDescripcion] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [manoObra, setManoObra] = useState<number[]>([]);
    const [nuevoTrabajador, setNuevoTrabajador] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [trabajadoresDisponibles, setTrabajadoresDisponibles] = useState<Trabajador[]>([]);
    const [costoProg, setCostoProg] = useState('0.00');
    const [costoReal, setCostoReal] = useState('');

    useEffect(() => {
        async function fetchDatos() {
            setLoading(true);
            const res = await getActividadOrdenTrabajoById(idActividad);
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                const actividad = res.data[0] as Actividad;

                setDescripcion(actividad.observaciones_actividad || '');
                setComentarios(actividad.comentarios_actividad_orden || '');

                if (actividad.tiempo_actividad_orden) {
                    const [h, m] = actividad.tiempo_actividad_orden.split(':');
                    setDuracionReal({ h, m });
                }

                if (actividad.tiempo_actividad_orden) {
                    const [h, m] = actividad.tiempo_actividad_orden.split(':');
                    setDuracionPlan({ h, m });
                }


                if (actividad.fecha_inic_real_actividad_orden) {
                    setHora(new Date(actividad.fecha_inic_real_actividad_orden));
                }

                if (actividad.puestos_actividad_orden && actividad.puestos_actividad_orden.length > 0) {
                    const puesto = actividad.puestos_actividad_orden[0];
                    setCostoProg(puesto.costo_prog);
                    setCostoReal(puesto.costo_real ?? '');

                    const idPuesto = puesto.puesto;
                    const personalRes = await getPersonalPorPuesto(idPuesto);
                    if (personalRes.success && Array.isArray(personalRes.data)) {
                        const data = personalRes.data.map((p: any) => ({
                            id: p.id_equipo,
                            nombre: `${p.nombre_personal} ${p.apaterno_personal} ${p.amaterno_personal ?? ''}`.trim(),
                            id_puesto_personal: p.id_puesto_personal,
                        }));
                        setTrabajadoresDisponibles(data);
                        setManoObra([]); // inicial sin trabajadores seleccionados
                    }
                }
            }
            setLoading(false);
        }
        fetchDatos();
    }, [idActividad]);

    const onChangeHora = (_: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setHora(selectedDate);
        }
    };

    const disponiblesParaAgregar = trabajadoresDisponibles.filter(
        (t) => !manoObra.includes(t.id)
    );

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
                            <TextInput style={styles.inputDisabled} placeholder="Hrs" keyboardType="numeric" value={duracionPlan.h} editable={false} />
                            <TextInput style={styles.inputDisabled} placeholder="Mins" keyboardType="numeric" value={duracionPlan.m} editable={false} />
                        </View>

                        <Text style={styles.label}>Duración real</Text>
                        <View style={styles.rowBetween}>
                            <TextInput style={styles.input} placeholder="Hrs" keyboardType="numeric" value={duracionReal.h} onChangeText={h => setDuracionReal(p => ({ ...p, h }))} />
                            <TextInput style={styles.input} placeholder="Mins" keyboardType="numeric" value={duracionReal.m} onChangeText={m => setDuracionReal(p => ({ ...p, m }))} />
                        </View>

                        <Text style={styles.label}>Descripción</Text>
                        <TextInput style={[styles.inputBox, styles.inputDisabled]} multiline value={descripcion} editable={false} />

                        <Text style={styles.label}>Mano de obra</Text>

                        <Text style={styles.label}>Costos</Text>
                        <View style={styles.rowBetween}>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Costo planeado</Text>
                                <TextInput
                                    style={styles.inputDisabled}
                                    value={costoProg}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Costo real</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Costo real"
                                    value={costoReal}
                                    onChangeText={setCostoReal}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>


                        {manoObra.map((id, i) => {
                            const opcionesFiltradas = trabajadoresDisponibles.filter(
                                (t) => !manoObra.includes(t.id) || t.id === id
                            );

                            return (
                                <View key={i} style={styles.manoObraBox}>
                                    <Select
                                        options={opcionesFiltradas}
                                        valueKey="id"
                                        labelKey="nombre"
                                        selectedValue={id || null}
                                        onValueChange={(val) => {
                                            const nuevos = [...manoObra];
                                            nuevos[i] = val ? Number(val) : 0;
                                            setManoObra(nuevos);
                                        }}
                                        placeholder="Selecciona un trabajador"
                                    />
                                    {manoObra.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.btnRemover}
                                            onPress={() => {
                                                const nuevos = manoObra.filter((_, idx) => idx !== i);
                                                setManoObra(nuevos);
                                            }}
                                        >
                                            <Text style={styles.btnRemoverText}>Remover</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}



                        <Select
                            options={disponiblesParaAgregar}
                            valueKey="id"
                            labelKey="nombre"
                            selectedValue={nuevoTrabajador}
                            onValueChange={(val) => setNuevoTrabajador(val !== null ? Number(val) : null)}
                            placeholder="Selecciona un trabajador"
                        />

                        <TouchableOpacity
                            style={styles.btnAgregar}
                            onPress={() => {
                                const disponiblesParaAgregar = trabajadoresDisponibles.filter(
                                    (t) => !manoObra.includes(t.id)
                                );

                                // Validación antes de agregar nuevo select
                                if (
                                    disponiblesParaAgregar.length === 0 ||
                                    manoObra.length >= trabajadoresDisponibles.length
                                ) {
                                    showToast('info', 'Todos los trabajadores ya han sido seleccionados');
                                    return;
                                }

                                // Validar si hay algún Select sin selección aún
                                if (manoObra.includes(0)) {
                                    showToast('info', 'Selecciona un trabajador antes de agregar uno nuevo');
                                    return;
                                }

                                // Verificar si ya se asignaron todos los trabajadores
                                if (manoObra.length >= trabajadoresDisponibles.length) {
                                    showToast('info', 'Todos los trabajadores ya han sido seleccionados');
                                    return;
                                }

                                // Agrega un nuevo Select vacío (id 0) solo si aún hay trabajadores por asignar
                                setManoObra([...manoObra, 0]);


                            }}
                        >
                            <Text style={styles.btnText}>Agregar trabajador</Text>
                        </TouchableOpacity>



                        <Text style={styles.costosTotales}>
                            Costo planeado: ${costoProg}{'  '}
                            Costo real: ${costoReal || '0.00'}
                        </Text>

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
    subLabel: {
        fontWeight: 'bold',
        color: '#1B2A56',
        marginBottom: 5,
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
    inputDisabled: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 10,
        flex: 0.48,
        backgroundColor: '#F2F2F2',
        color: '#666'
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },
    manoObraBox: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#FAFAFA',
    },
    btnAgregar: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
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
    btnRemover: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    btnRemoverText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    costosTotales: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B2A56',
        marginTop: 10,
    },
    column: {
        flex: 0.48,
        flexDirection: 'column',
    },
    costLabel: {
        fontSize: 13,
        color: '#1B2A56',
        marginBottom: 4,
        fontWeight: '500',
    },
});
