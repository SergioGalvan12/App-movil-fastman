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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useFocusEffect, useNavigation, RouteProp } from '@react-navigation/native';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';
import {
    getActividadOrdenTrabajoById,
    getPersonalPorPuesto,
    getActividadesOrdenTrabajo,
    getMaterialesInventario,
    getRefaccionesInventario,
} from '../../../services/reports/ordenesTrabajo/realizarOTService';
import { guardarActividadOT } from '../../../services/reports/ordenesTrabajo/actividadOTService';
import { patchOrdenTrabajo } from '../../../services/reports/ordenesTrabajo/ordenTrabajoService';

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

interface MaterialActividad {
    id: number;
    id_almacen: number | null;
    material: number;
    nombre_material: string;
    cantidad_prog: string;
    cantidad_real: string | null;
    nombre_unidad: string;
    abreviatura_unidad: string;
    numero_almacen_material: string;
    disponible: boolean;
    costo_prog?: string;
    costo_real?: string;
}

interface RefaccionActividad {
    id: number;
    refaccion: number;                    // el FK
    id_almacen: number | null;
    no_parte_refaccion: string | null;    // el “código” de la refacción
    descripcion_refaccion: string | null;
    cantidad_prog: string;
    cantidad_real: string | null;
    abreviatura_unidad: string;
    nombre_unidad: string;
    disponible: boolean;
    costo_prog: string | null;
    costo_real: string | null;
}


interface Actividad {
    id_actividad_orden: number;
    id_actividad_orden_pub: string;
    id_empresa: number;
    id_orden_trabajo: number;
    id_actividad: number;
    tipo_actividad: string;
    descripcion_servicio?: string;
    id_tipo_servicio_pub?: string;
    observaciones_actividad: string;
    comentarios_actividad_orden: string | null;
    tiempo_actividad_orden: string | null;
    tiempo_plan_actividad_orden: string | null;
    fecha_inic_real_actividad_orden: string | null;
    inicia_actividad_orden: boolean;
    puestos_actividad_orden: PuestoActividad[];
    materiales_actividad_orden?: MaterialActividad[];
    refacciones_actividad_orden?: RefaccionActividad[];
    status_actividad_orden: boolean;
    tiempo_excedente: boolean;
    disposicion_actividad_orden: any;
    costo_total_actividad_orden: any;
}

type RootStackParamList = {
    RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string };
};

export default function RealizarActividadOT() {
    const navigation = useNavigation();
    const { idActividad, idOrdenTrabajo, folio } = useRoute<RouteProp<RootStackParamList, 'RealizarActividadOT'>>().params;

    // Estado completo de la actividad según la API:
    const [actividad, setActividad] = useState<Actividad | null>(null);

    // Estados controlados para inputs:
    const [hora, setHora] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [duracionPlan, setDuracionPlan] = useState({ h: '', m: '' });
    const [duracionReal, setDuracionReal] = useState({ h: '', m: '' });
    const [descripcion, setDescripcion] = useState('');
    const [comentarios, setComentarios] = useState('');
    const [manoObra, setManoObra] = useState<number[]>([]);
    const [trabajadoresDisponibles, setTrabajadoresDisponibles] = useState<Trabajador[]>([]);
    const [materiales, setMateriales] = useState<MaterialActividad[]>([]);
    const [refacciones, setRefacciones] = useState<RefaccionActividad[]>([]);

    // Mano de obra
    const [costoProgMano, setCostoProgMano] = useState('0.00');
    const [costoRealMano, setCostoRealMano] = useState('0.00');

    const [loading, setLoading] = useState(false);

    const [invMateriales, setInvMateriales] = useState<
        Record<number, { costo: string; disponible: boolean }>
    >({});
    const [invRefacciones, setInvRefacciones] = useState<
        Record<number, { costo: string; disponible: boolean }>
    >({});

    // Totales de actividad
    const [totalProgActividad, setTotalProgActividad] = useState('0.00'); // viene del back
    // Total real dinámico de la actividad (mano + mat + ref)
    const [totalRealActividad, setTotalRealActividad] = useState('0.00');

    // Fetch y mapeo de datos
    async function fetchDatos() {
        setLoading(true);
        const res = await getActividadOrdenTrabajoById(idActividad);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            const act = res.data[0] as Actividad;
            setActividad(act);

            // Inicializamos los campos controlados:
            setDescripcion(act.observaciones_actividad);
            setComentarios(act.comentarios_actividad_orden || '');
            setDuracionReal(act.tiempo_actividad_orden
                ? { h: act.tiempo_actividad_orden.split(':')[0], m: act.tiempo_actividad_orden.split(':')[1] }
                : { h: '', m: '' });
            const base = act.tiempo_plan_actividad_orden ?? act.tiempo_actividad_orden;
            if (base) setDuracionPlan({ h: base.split(':')[0], m: base.split(':')[1] });
            setHora(act.fecha_inic_real_actividad_orden ? new Date(act.fecha_inic_real_actividad_orden) : new Date());

            // Mano de obra
            if (act.puestos_actividad_orden.length) {
                const puesto = act.puestos_actividad_orden[0];
                setCostoProgMano(puesto.costo_prog);
                setCostoRealMano(puesto.costo_real ?? '0');
                setTotalProgActividad(act.costo_total_actividad_orden);
                setManoObra(puesto.personal_encargado);
                const perRes = await getPersonalPorPuesto(puesto.puesto);
                if (perRes.success) {
                    setTrabajadoresDisponibles((perRes.data as any[]).map((p: any) => ({
                        id: p.id_equipo,
                        nombre: `${p.nombre_personal} ${p.apaterno_personal}`.trim(),
                        id_puesto_personal: p.id_puesto_personal,
                    })));
                }
            }

            // Materiales y Refacciones
            setMateriales(
                (act.materiales_actividad_orden ?? []).map(m => ({
                    ...m,
                    costo_prog: m.costo_prog ?? '0.00',
                    costo_real: m.costo_real ?? '0.00',
                }))
            );
            setRefacciones(
                (act.refacciones_actividad_orden ?? []).map((r: any) => ({
                    id: r.id,
                    refaccion: r.refaccion,
                    id_almacen: r.id_almacen,                     // <-- aquí
                    no_parte_refaccion: r.no_parte_refaccion,     // <-- aquí
                    descripcion_refaccion: r.descripcion_refaccion,
                    cantidad_prog: String(r.cantidad_prog),
                    cantidad_real: r.cantidad_real != null ? String(r.cantidad_real) : null,
                    abreviatura_unidad: r.abreviatura_unidad,
                    nombre_unidad: r.nombre_unidad,
                    disponible: r.disponible,
                    costo_prog: r.costo_prog,
                    costo_real: r.costo_real,
                }))
            );
        }
        setLoading(false);
    }

    useEffect(() => { fetchDatos(); }, [idActividad]);
    useFocusEffect(React.useCallback(() => { fetchDatos(); }, [idActividad]));

    // Guardar cambios
    const onGuardarActividad = async () => {
        if (actividad?.inicia_actividad_orden && !hora) {
            showToast('error', 'Debes seleccionar una hora de inicio');
            return;
        }
        if (manoObra.length === 0 || manoObra.includes(0)) {
            showToast('error', 'Selecciona al menos un trabajador válido');
            return;
        }

        // Calculamos tiempos y payload
        const h = parseInt(duracionReal.h || '0', 10);
        const m = parseInt(duracionReal.m || '0', 10);
        const fechaInicio = hora!.toISOString();
        const fechaFin = new Date(hora!.getTime() + h * 3600000 + m * 60000).toISOString();
        const tiempoAct = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

        const payload: any = {
            id_actividad_orden: actividad!.id_actividad_orden,
            id_actividad_orden_pub: actividad!.id_actividad_orden_pub,
            id_empresa: actividad!.id_empresa,
            id_orden_trabajo: actividad!.id_orden_trabajo,
            id_actividad: actividad!.id_actividad,
            tipo_actividad: actividad!.tipo_actividad,
            descripcion: descripcion,
            descripcion_servicio: actividad!.descripcion_servicio,
            id_tipo_servicio_pub: actividad!.id_tipo_servicio_pub,
            costo_total_actividad_orden: totalProgActividad,          // planeado
            costo_total_actividad_orden_real: totalRealActividad,     // recalc real
            fecha_inic_real_actividad_orden: fechaInicio,
            fecha_fin_real_actividad_orden: fechaFin,
            tiempo_actividad_orden: tiempoAct,
            tiempo_plan_actividad_orden: `${duracionPlan.h.padStart(2, '0')}:${duracionPlan.m.padStart(2, '0')}:00`,
            comentarios_actividad_orden: comentarios,
            puestos_actividad_orden: [{
                id: actividad!.id_actividad_orden,
                puesto: trabajadoresDisponibles[0]?.id_puesto_personal,
                personal_encargado: manoObra,
                cantidad_prog: 1,
                cantidad_real: 1,
                costo_prog: costoProgMano,
                costo_real: costoRealMano || '0.00',
                nombre_puesto: trabajadoresDisponibles[0]?.nombre || '',
            }],
            materiales_actividad_orden: materiales.map(mat => ({
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
            refacciones_actividad_orden: refacciones.map(r => ({
                id: r.id,
                refaccion: r.refaccion,
                id_almacen: r.id_almacen,
                cantidad_prog: r.cantidad_prog,
                cantidad_real: r.cantidad_real ?? '0',
            })),

            observaciones_actividad: descripcion,
            status_actividad_orden: true,
            inicia_actividad_orden: true,
        };

        const res = await guardarActividadOT(payload);
        if (res.success) {
            showToast('success', 'Actividad guardada correctamente');
            const otRes = await getActividadesOrdenTrabajo(actividad!.id_orden_trabajo);
            if (otRes.success) {
                const totalReal = (otRes.data as any[]).reduce((sum: any, a: any) =>
                    sum + parseFloat(a.costo_total_actividad_orden_real || '0'), 0);
                await patchOrdenTrabajo(actividad!.id_orden_trabajo, { id_orden_trabajo: actividad!.id_orden_trabajo, costo_real: totalReal });
            }
            navigation.goBack();
        } else {
            showToast('danger', 'Error al guardar actividad');
        }
    };

    // ——— Efecto: cargar inventario cuando cambian materiales o refacciones ———
    useEffect(() => {
        if (!actividad) return;

        // materiales
        if (materiales.length) {
            getMaterialesInventario(
                materiales.map(m => ({
                    id_almacen: m.id_almacen!,          // ahora usamos el id real del almacén
                    id_ubicacion: actividad.id_empresa,
                    id_material: m.material,
                }))
            ).then(res => {
                if (!res.success) return;
                const inv: Record<number, { costo: string; disponible: boolean }> = {};
                (res.data as any[]).forEach(d => {
                    inv[d.id_material] = {
                        costo: d.costo,
                        disponible:
                            parseFloat(d.cantidad) >=
                            parseFloat(materiales.find(x => x.material === d.id_material)!.cantidad_real || '0'),
                    };
                });
                setInvMateriales(inv);
                // actualiza costo_prog y costo_real con los datos recién traídos
                setMateriales(prev =>
                    prev.map(m => ({
                        ...m,
                        costo_prog: inv[m.material]?.costo ?? m.costo_prog,
                        costo_real: m.cantidad_real
                            ? (parseFloat(m.cantidad_real) * parseFloat(inv[m.material]?.costo || '0')).toFixed(2)
                            : m.costo_real ?? '0.00',
                        disponible: inv[m.material]?.disponible ?? m.disponible,
                    }))
                );
            });
        }

        // refacciones
        if (refacciones.length) {
            getRefaccionesInventario(
                refacciones.map(r => ({
                    id_almacen: r.id_almacen!,          // idem para refacciones
                    id_ubicacion: actividad.id_empresa,
                    id_refaccion: r.refaccion,
                }))
            ).then(res => {
                if (!res.success) return;
                const inv: Record<number, { costo: string; disponible: boolean }> = {};
                (res.data as any[]).forEach(d => {
                    inv[d.id_refaccion] = {
                        costo: d.costo,
                        disponible:
                            parseFloat(d.cantidad) >=
                            parseFloat(refacciones.find(x => x.refaccion === d.id_refaccion)!.cantidad_real || '0'),
                    };
                });
                setInvRefacciones(inv);
                setRefacciones(prev =>
                    prev.map(r => ({
                        ...r,
                        costo_prog: inv[r.refaccion]?.costo ?? r.costo_prog,
                        costo_real: r.cantidad_real
                            ? (parseFloat(r.cantidad_real) * parseFloat(inv[r.refaccion]?.costo || '0')).toFixed(2)
                            : r.costo_real ?? '0.00',
                        disponible: inv[r.refaccion]?.disponible ?? r.disponible,
                    }))
                );
            });
        }
    }, [actividad, materiales, refacciones]);

    // ——— Handlers: recalcular fila al cambiar cantidad real ———
    function handleChangeMaterialQty(val: string, idx: number) {
        const nuevos = [...materiales];
        nuevos[idx].cantidad_real = val;
        const inv = invMateriales[nuevos[idx].material];
        if (inv) {
            nuevos[idx].costo_real = (parseFloat(val || '0') * parseFloat(inv.costo)).toFixed(2);
            nuevos[idx].disponible = inv.disponible;
        }
        setMateriales(nuevos);
    }

    function handleChangeRefaccionQty(val: string, idx: number) {
        const nuevos = [...refacciones];
        nuevos[idx].cantidad_real = val;
        const inv = invRefacciones[nuevos[idx].refaccion];
        if (inv) {
            nuevos[idx].costo_real = (parseFloat(val || '0') * parseFloat(inv.costo)).toFixed(2);
            nuevos[idx].disponible = inv.disponible;
        }
        setRefacciones(nuevos);
    }

    // ——— Efecto: recalcular costo real total (mano + materiales + refacciones) ———
    useEffect(() => {
        const subMat = materiales.reduce(
            (sum, m) => sum + parseFloat(m.costo_real ?? '0'),
            0
        );
        const subRef = refacciones.reduce(
            (sum, r) => sum + parseFloat(r.costo_real ?? '0'),
            0
        );
        const mano = parseFloat(costoRealMano);
        setTotalRealActividad((mano + subMat + subRef).toFixed(2));
    }, [materiales, refacciones, costoRealMano]);



    return (
        <ReportScreenLayout>
            <HeaderWithBack title={`OT ${folio}`} />
            <ScrollView style={styles.container}>
                {loading || !actividad
                    ? <ActivityIndicator color="#5D74A6" />
                    : <>
                        {/* Hora */}
                        {actividad.inicia_actividad_orden && (
                            <>
                                <Text style={styles.label}>Hora</Text>
                                <TouchableOpacity style={styles.inputBox} onPress={() => setShowPicker(true)}>
                                    <Text>
                                        {hora
                                            ? hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '--:--'}
                                    </Text>
                                </TouchableOpacity>
                                {showPicker && (
                                    <DateTimePicker
                                        value={hora!}
                                        mode="time"
                                        display="default"
                                        onChange={(_, d) => { setShowPicker(Platform.OS === 'ios'); d && setHora(d); }}
                                    />
                                )}
                            </>
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

                        {/* Costos de mano de obra */}
                        <Text style={styles.label}>Costos</Text>
                        <View style={styles.rowBetween}>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Costo planeado</Text>
                                <TextInput
                                    style={styles.inputDisabled}
                                    value={costoProgMano}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Costo real</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Costo real"
                                    value={costoRealMano}
                                    onChangeText={setCostoRealMano}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>


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
                                                <TextInput
                                                    style={styles.inputDisabled}
                                                    value={mat.cantidad_prog}
                                                    editable={false}
                                                />
                                            </View>
                                            <View style={styles.column}>
                                                <Text style={styles.costLabel}>Cantidad real</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={mat.cantidad_real ?? ''}
                                                    keyboardType="numeric"
                                                    // **LLAMAMOS** al handler que sí calcula el costo_real
                                                    onChangeText={val => handleChangeMaterialQty(val, idx)}
                                                />
                                            </View>
                                        </View>

                                        <Text style={styles.textMini}>Unidad: {mat.abreviatura_unidad}</Text>
                                        <Text style={styles.textMini}>Disponible: <Text style={{ fontWeight: 'bold', color: mat.disponible ? 'green' : 'red' }}>{mat.disponible ? 'Sí' : 'No'}</Text></Text>

                                        <Text style={styles.costosTotales}>
                                            Costo planeado: ${totalProgActividad}   Costo real: ${mat.costo_real}
                                        </Text>

                                    </View>
                                ))}
                            </>
                        )}
                        {refacciones.length > 0 && (
                            <>
                                <Text style={styles.label}>Refacciones</Text>
                                {refacciones.map((r, idx) => (
                                    <View key={idx} style={styles.materialBox}>
                                        <Text style={styles.textMini}>
                                            Artículo: <Text style={{ fontWeight: 'bold' }}>{r.no_parte_refaccion}</Text>
                                        </Text>
                                        <Text style={styles.textMini}>
                                            Refacción: <Text style={{ fontWeight: 'bold' }}>{r.descripcion_refaccion}</Text>
                                        </Text>
                                        <View style={styles.rowBetween}>
                                            <View style={styles.column}>
                                                <Text style={styles.costLabel}>Cantidad planeada</Text>
                                                <TextInput
                                                    style={styles.inputDisabled}
                                                    value={r.cantidad_prog}
                                                    editable={false}
                                                />
                                            </View>
                                            <View style={styles.column}>
                                                <Text style={styles.costLabel}>Cantidad real</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    value={r.cantidad_real}
                                                    onChangeText={val => handleChangeRefaccionQty(val, idx)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                        <Text style={styles.textMini}>Unidad: {r.abreviatura_unidad}</Text>
                                        <Text style={styles.textMini}>
                                            Disponible:{' '}
                                            <Text style={{ fontWeight: 'bold', color: r.disponible ? 'green' : 'red' }}>
                                                {r.disponible ? 'Sí' : 'No'}
                                            </Text>
                                        </Text>
                                        <Text style={styles.costosTotales}>
                                            Costo planeado: ${r.costo_prog}  Costo real: ${r.costo_real}
                                        </Text>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Comentarios y Guardar */}
                        <Text style={styles.label}>Comentarios</Text>
                        <TextInput
                            style={[styles.inputBox, { minHeight: 60 }]}
                            multiline value={comentarios}
                            onChangeText={setComentarios}
                        />

                        <Text style={styles.sectionLabel}>Totales de la actividad</Text>
                        <View style={styles.rowBetween}>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Planeado</Text>
                                <Text style={styles.costosTotales}>${totalProgActividad}</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.costLabel}>Real</Text>
                                <Text style={styles.costosTotales}>${totalRealActividad}</Text>
                            </View>
                        </View>


                        <TouchableOpacity style={styles.btnGuardar} onPress={onGuardarActividad}>
                            <Text style={styles.btnText}>Guardar cambios</Text>
                        </TouchableOpacity>
                    </>}
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
