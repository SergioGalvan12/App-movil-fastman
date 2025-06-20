// screens/ordens_trabajo/RealizarOTScreen.tsx
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
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActividadOrdenTrabajoById, getPersonalPorPuesto, getActividadesOrdenTrabajo } from '../../../services/reports/ordenesTrabajo/realizarOTService';
import { patchOrdenTrabajo } from '../../../services/reports/ordenesTrabajo/ordenTrabajoService';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';
import { guardarActividadOT } from '../../../services/reports/ordenesTrabajo/actividadOTService';
import { useNavigation } from '@react-navigation/native';
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
    materiales_actividad_orden?: MaterialActividad[];
    id_actividad: number;
    id_actividad_orden_pub: string;
    tipo_actividad: string;
    descripcion_servicio?: string;
    id_tipo_servicio_pub?: string;
    id_empresa: number;
}

interface MaterialActividad {
    id: number;
    material: number;
    nombre_material: string;
    cantidad_prog: string;
    cantidad_real: string | null;
    nombre_unidad: string;
    abreviatura_unidad: string;
    numero_almacen_material: string;
    disponible: boolean;
}

type RootStackParamList = {
    RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string };
};

export default function RealizarActividadOT() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string } }, 'RealizarActividadOT'>>();
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
    const [materiales, setMateriales] = useState<MaterialActividad[]>([]);
    const [actividadMeta, setActividadMeta] = useState({
        idActividad: 0,
        idActividadPub: '',
        tipoActividad: '',
        descripcionServicio: '',
        idTipoServicioPub: '',
        idEmpresa: 0,
    });

    async function fetchDatos() {
        setLoading(true);
        const res = await getActividadOrdenTrabajoById(idActividad);

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const actividad = res.data[0] as Actividad;

            setActividadMeta({
                idActividad: actividad.id_actividad,
                idActividadPub: actividad.id_actividad_orden_pub,
                tipoActividad: actividad.tipo_actividad,
                descripcionServicio: actividad.descripcion_servicio ?? '',
                idTipoServicioPub: actividad.id_tipo_servicio_pub ?? '',
                idEmpresa: actividad.id_empresa,
            });

            setDescripcion(actividad.observaciones_actividad || '');
            setComentarios(actividad.comentarios_actividad_orden || '');

            if (actividad.tiempo_actividad_orden) {
                const [h, m] = actividad.tiempo_actividad_orden.split(':');
                setDuracionReal({ h, m });
            }

            const duracionBase = actividad.tiempo_plan_actividad_orden ?? actividad.tiempo_actividad_orden;
            if (duracionBase) {
                const [h, m] = duracionBase.split(':');
                setDuracionPlan({ h, m });
            }

            if (actividad.fecha_inic_real_actividad_orden) {
                setHora(new Date(actividad.fecha_inic_real_actividad_orden));
            } else {
                setHora(new Date());
            }

            if (actividad.puestos_actividad_orden && actividad.puestos_actividad_orden.length > 0) {
                const puesto = actividad.puestos_actividad_orden[0];
                setCostoProg(puesto.costo_prog);
                setCostoReal(puesto.costo_real ?? '');
                setManoObra(puesto.personal_encargado || []);

                const idPuesto = puesto.puesto;
                const personalRes = await getPersonalPorPuesto(idPuesto);
                if (personalRes.success && Array.isArray(personalRes.data)) {
                    const data = personalRes.data.map((p: any) => ({
                        id: p.id_equipo,
                        nombre: `${p.nombre_personal} ${p.apaterno_personal} ${p.amaterno_personal ?? ''}`.trim(),
                        id_puesto_personal: p.id_puesto_personal,
                    }));
                    setTrabajadoresDisponibles(data);
                }
            }

            if (actividad.materiales_actividad_orden && Array.isArray(actividad.materiales_actividad_orden)) {
                setMateriales(actividad.materiales_actividad_orden);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchDatos();
    }, [idActividad]);

    useFocusEffect(
        React.useCallback(() => {
            fetchDatos();
        }, [idActividad])
    );

    const onGuardarActividad = async () => {
        if (!hora) {
            showToast('error', 'Debes seleccionar una hora de inicio');
            return;
        }

        if (manoObra.length === 0 || manoObra.includes(0)) {
            showToast('error', 'Selecciona al menos un trabajador válido');
            return;
        }

        const h = parseInt(duracionReal.h || '0', 10);
        const m = parseInt(duracionReal.m || '0', 10);
        const fechaInicio = hora.toISOString();
        const fechaFin = new Date(hora.getTime() + h * 60 * 60 * 1000 + m * 60 * 1000).toISOString();
        const tiempoActividad = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

        const payload = {
            id_actividad_orden: idActividad,
            id_actividad_orden_pub: actividadMeta.idActividadPub,
            id_empresa: actividadMeta.idEmpresa,
            id_orden_trabajo: idOrdenTrabajo,
            id_actividad: actividadMeta.idActividad,
            tipo_actividad: actividadMeta.tipoActividad,
            descripcion: descripcion,
            descripcion_servicio: actividadMeta.descripcionServicio,
            id_tipo_servicio_pub: actividadMeta.idTipoServicioPub,
            costo_total_actividad_orden: costoProg,
            costo_total_actividad_orden_real: costoReal || '0',
            fecha_inic_real_actividad_orden: fechaInicio,
            fecha_fin_real_actividad_orden: fechaFin,
            tiempo_actividad_orden: tiempoActividad,
            tiempo_plan_actividad_orden: `${duracionPlan.h.padStart(2, '0')}:${duracionPlan.m.padStart(2, '0')}:00`,
            comentarios_actividad_orden: comentarios,
            puestos_actividad_orden: [
                {
                    id: idActividad,
                    puesto: trabajadoresDisponibles[0]?.id_puesto_personal,
                    personal_encargado: manoObra,
                    cantidad_prog: 1,
                    cantidad_real: 1,
                    costo_prog: costoProg,
                    costo_real: costoReal || '0.00',
                    nombre_puesto: trabajadoresDisponibles[0]?.nombre || '',
                },
            ],
            materiales_actividad_orden: materiales.map((mat) => ({
                id: mat.id,
                material: mat.material,
                cantidad_prog: mat.cantidad_prog,
                cantidad_real: mat.cantidad_real ?? '0',
                nombre_material: mat.nombre_material,
                nombre_unidad: mat.nombre_unidad,
                abreviatura_unidad: mat.abreviatura_unidad,
                numero_almacen_material: mat.numero_almacen_material,
                disponible: mat.disponible,
            })),
            observaciones_actividad: descripcion,
            status_actividad_orden: true,
            inicia_actividad_orden: true,
        };

        const res = await guardarActividadOT(payload);

        if (res.success) {
            showToast('success', 'Actividad guardada correctamente');

            const otRes = await getActividadesOrdenTrabajo(idOrdenTrabajo);
            if (otRes.success && Array.isArray(otRes.data)) {
                const totalReal = otRes.data.reduce((acc, act) => {
                    const val = parseFloat(act.costo_total_actividad_orden_real || '0');
                    return acc + (isNaN(val) ? 0 : val);
                }, 0);

                await patchOrdenTrabajo(idOrdenTrabajo, {
                    id_orden_trabajo: idOrdenTrabajo,
                    costo_real: totalReal,
                });
            }

            navigation.goBack();
        } else {
            showToast('danger', 'Error al guardar actividad');
        }
    };

    const onChangeHora = (_: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setHora(selectedDate);
        }
    };

    const disponiblesParaAgregar = trabajadoresDisponibles.filter(
        (t) => !manoObra.includes(t.id)
    );

    // Si no hay manoObra inicial, agregar automáticamente un slot vacío
    useEffect(() => {
        if (!loading && manoObra.length === 0 && trabajadoresDisponibles.length > 0) {
            setManoObra([0]);
        }
    }, [trabajadoresDisponibles, loading]);

    return (
        <ReportScreenLayout>
            <HeaderWithBack title={`OT ${folio}`} />
            <ScrollView style={styles.container}>
                {loading ? <ActivityIndicator color="#5D74A6" /> : (
                    <>
                        {/* Hora */}
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

                        {/* Duración */}
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

                        {/* Descripción */}
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput style={[styles.inputBox, styles.inputDisabled]} multiline value={descripcion} editable={false} />

                        {/* Mano de obra */}
                        <Text style={styles.label}>Mano de obra</Text>
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
                                    {manoObra.length > 1 && (
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

                        <TouchableOpacity
                            style={styles.btnAgregar}
                            onPress={() => {
                                const disponibles = trabajadoresDisponibles.filter(t => !manoObra.includes(t.id));
                                if (disponibles.length === 0) {
                                    showToast('info', 'Todos los trabajadores ya han sido seleccionados');
                                    return;
                                }
                                if (manoObra.includes(0)) {
                                    showToast('info', 'Selecciona un trabajador antes de agregar otro');
                                    return;
                                }
                                setManoObra([...manoObra, 0]);
                            }}
                        >
                            <Text style={styles.btnText}>Agregar trabajador</Text>
                        </TouchableOpacity>

                        {materiales.length > 0 && (
                            <>
                                <Text style={styles.label}>Materiales</Text>
                                {materiales.map((mat, idx) => (
                                    <View key={idx} style={styles.materialBox}>
                                        <Text style={styles.textMini}>Artículo: <Text style={{ fontWeight: 'bold' }}>{mat.numero_almacen_material}</Text></Text>
                                        <Text style={styles.textMini}>Material: <Text style={{ fontWeight: 'bold' }}>{mat.nombre_material}</Text></Text>

                                        <View style={styles.rowBetween}>
                                            <View style={styles.column}>
                                                <Text style={styles.costLabel}>Cantidad planeada</Text>
                                                <TextInput style={styles.inputDisabled} value={mat.cantidad_prog} editable={false} />
                                            </View>
                                            <View style={styles.column}>
                                                <Text style={styles.costLabel}>Cantidad real</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={mat.cantidad_real ?? ''}
                                                    onChangeText={(val) => {
                                                        const nuevos = [...materiales];
                                                        nuevos[idx].cantidad_real = val;
                                                        setMateriales(nuevos);
                                                    }}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>

                                        <Text style={styles.textMini}>Unidad: {mat.abreviatura_unidad}</Text>
                                        <Text style={styles.textMini}>Disponible: <Text style={{ fontWeight: 'bold', color: mat.disponible ? 'green' : 'red' }}>{mat.disponible ? 'Sí' : 'No'}</Text></Text>

                                        <Text style={styles.costosTotales}>Costo planeado: ${costoProg}  Costo real: ${costoReal || '0.00'}</Text>
                                    </View>
                                ))}
                            </>
                        )}

                        <Text style={styles.label}>Comentarios</Text>
                        <TextInput style={[styles.inputBox, { minHeight: 60 }]} multiline value={comentarios} onChangeText={setComentarios} />

                        <Text style={styles.costosTotales}>
                            Costo planeado: ${costoProg}  Costo real: ${costoReal || '0.00'}
                        </Text>

                        <TouchableOpacity style={styles.btnGuardar} onPress={onGuardarActividad}>
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

    materialBox: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
    },
    textMini: {
        fontSize: 12,
        color: '#333',
        marginBottom: 2,
    },
});
