import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';
import type { AuthStackParamList } from '../../../src/navigation/types';
import {
    fetchCodigosEventoActivos,
    type CodigoEventoRow,
} from '../../../services/reports/operativos/codigoService';

import {
    fetchActividadesByGuia,
    createActividad,
    patchActividad,
    softDeleteActividad,
    type ActividadRow,
} from '../../../services/reports/operativos/actividadService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'EventosReporteOperacion'>;

type FormState = {
    id_actividad?: number;
    id_codigo: number | null;
    inicio_actividad: string;
    fin_actividad: string;
};

type Option = { value: number; label: string };

const normalizeTime = (v: string) => {
    const s = (v ?? '').trim();
    return s;
};

const formatTimeToHHmm = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const parseTimeToDate = (time?: string) => {
    const base = new Date();
    const raw = (time ?? '').trim();

    if (!raw) return base;

    const parts = raw.split(':');
    const hours = Number(parts[0] ?? 0);
    const minutes = Number(parts[1] ?? 0);
    const seconds = Number(parts[2] ?? 0);

    base.setHours(hours, minutes, seconds, 0);
    return base;
};

export default function EventosReporteOperacionScreen({ route }: Props) {
    const { id_guia, id_grupo_equipo, id_empresa } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actividades, setActividades] = useState<ActividadRow[]>([]);
    const [codigos, setCodigos] = useState<CodigoEventoRow[]>([]);
    const [showInicioPicker, setShowInicioPicker] = useState(false);
    const [showFinPicker, setShowFinPicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState<FormState>({
        id_codigo: null,
        inicio_actividad: '',
        fin_actividad: '',
    });

    const codigoOptions: Option[] = useMemo(() => {
        const options = (codigos ?? []).map((c) => ({
            value: c.id_codigo,
            label:
                c.id_codigo_pub && (c.descripcion_codigo || c.nombre)
                    ? `${c.id_codigo_pub} - ${c.descripcion_codigo || c.nombre}`
                    : c.descripcion_codigo || c.nombre || c.id_codigo_pub || `Código ${c.id_codigo}`,
        }));
        return options.sort((a, b) =>
            a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
        );
    }, [codigos]);

    const resolveCodigoLabel = useCallback(
        (id_codigo: number) => codigoOptions.find((o) => o.value === id_codigo)?.label ?? `Código ${id_codigo}`,
        [codigoOptions]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);

            const actsRes = await fetchActividadesByGuia(id_guia);
            if (!actsRes.success) throw new Error(actsRes.error);
            setActividades(actsRes.data ?? []);

            const codRes = await fetchCodigosEventoActivos();
            if (!codRes.success) throw new Error(codRes.error);

            const codigosFiltrados = (codRes.data ?? []).filter((codigo) => {
                return codigo.id_grupo_equipo === id_grupo_equipo || codigo.id_grupo_equipo == null;
            });

            setCodigos(codigosFiltrados);
        } catch (e: any) {
            console.log('Error load actividades(eventos):', e?.message ?? e);
            showToast('error', 'Error', 'No se pudieron cargar los eventos');
        } finally {
            setLoading(false);
        }
    }, [id_guia, id_grupo_equipo]);

    useEffect(() => {
        load();
    }, [load]);

    const openNuevo = useCallback(() => {
        setForm({ id_codigo: null, inicio_actividad: '', fin_actividad: '' });
        setModalVisible(true);
    }, []);

    const openEditar = useCallback((row: ActividadRow) => {
        setForm({
            id_actividad: row.id_actividad,
            id_codigo: row.id_codigo,
            inicio_actividad: row.inicio_actividad ?? '',
            fin_actividad: row.fin_actividad ?? '',
        });
        setModalVisible(true);
    }, []);

    const onGuardar = useCallback(async () => {
        const id_codigo = form.id_codigo;
        const inicio_actividad = normalizeTime(form.inicio_actividad);
        const fin_actividad = normalizeTime(form.fin_actividad);

        if (!id_codigo || !inicio_actividad || !fin_actividad) {
            showToast('info', 'Faltan datos', 'Selecciona evento y captura hora inicio/fin');
            return;
        }

        if (inicio_actividad === fin_actividad) {
            showToast('info', 'Dato inválido', 'La hora de fin debe ser diferente a la hora de inicio');
            return;
        }

        try {
            setSaving(true);

            if (form.id_actividad) {
                const upRes = await patchActividad(form.id_actividad, {
                    id_codigo,
                    inicio_actividad,
                    fin_actividad,
                    status_actividad: true,
                });
                if (!upRes.success) throw new Error(upRes.error);
                showToast('success', 'Listo', 'Evento actualizado');
            } else {
                const crRes = await createActividad({
                    id_actividad: 0,
                    id_guia,
                    id_codigo,
                    inicio_actividad,
                    fin_actividad,
                    id_empresa,
                    duracion: '',
                    executed: true,
                    status_actividad: true,
                });
                if (!crRes.success) throw new Error(crRes.error);
                showToast('success', 'Listo', 'Evento creado');
            }

            setModalVisible(false);
            await load();
        } catch (e: any) {
            console.log('Error guardar actividad(evento):', e?.message ?? e);
            showToast('error', 'Error', 'No se pudo guardar el evento');
        } finally {
            setSaving(false);
        }
    }, [form, id_guia, id_empresa, load]);

    const onEliminar = useCallback(
        (row: ActividadRow) => {
            Alert.alert('Eliminar evento', '¿Seguro que deseas eliminar este evento?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const delRes = await softDeleteActividad(row.id_actividad);
                            if (!delRes.success) throw new Error(delRes.error);
                            showToast('success', 'Listo', 'Evento eliminado');
                            await load();
                        } catch (e: any) {
                            console.log('Error eliminar actividad(evento):', e?.message ?? e);
                            showToast('error', 'Error', 'No se pudo eliminar el evento');
                        }
                    },
                },
            ]);
        },
        [load]
    );

    const renderItem = useCallback(
        ({ item }: { item: ActividadRow }) => {
            return (
                <View style={styles.card}>
                    <Text style={styles.title}>{resolveCodigoLabel(item.id_codigo)}</Text>

                    <Text style={styles.meta}>
                        Inicio: {item.inicio_actividad}   •   Fin: {item.fin_actividad}
                    </Text>

                    {item.duracion ? <Text style={styles.meta}>Duración: {item.duracion}</Text> : null}

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.btnOutline} onPress={() => openEditar(item)}>
                            <Text style={styles.btnOutlineText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnDanger} onPress={() => onEliminar(item)}>
                            <Text style={styles.btnDangerText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        },
        [openEditar, onEliminar, resolveCodigoLabel]
    );

    const handleInicioTimeChange = (_event: any, selectedDate?: Date) => {
        setShowInicioPicker(false);
        if (!selectedDate) return;
        setForm((prev) => ({
            ...prev,
            inicio_actividad: formatTimeToHHmm(selectedDate),
        }));
    };

    const handleFinTimeChange = (_event: any, selectedDate?: Date) => {
        setShowFinPicker(false);
        if (!selectedDate) return;
        setForm((prev) => ({
            ...prev,
            fin_actividad: formatTimeToHHmm(selectedDate),
        }));
    };

    return (
        <View style={{ flex: 1 }}>
            <HeaderWithBack title="Eventos" />

            <ReportScreenLayout scroll={false}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator />
                        <Text style={styles.muted}>Cargando eventos…</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={actividades}
                            keyExtractor={(it) => `act-${it.id_actividad}`}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 110 }}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={
                                <View style={styles.center}>
                                    <Text style={styles.muted}>Aún no hay eventos registrados.</Text>
                                </View>
                            }
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.newBtn} onPress={openNuevo}>
                                <Text style={styles.newBtnText}>+ Nuevo evento</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ReportScreenLayout>

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{form.id_actividad ? 'Editar evento' : 'Nuevo evento'}</Text>

                        <Text style={styles.label}>Evento</Text>
                        <Select<Option>
                            options={codigoOptions}
                            valueKey="value"
                            labelKey="label"
                            selectedValue={form.id_codigo}
                            onValueChange={(v) => setForm((p) => ({ ...p, id_codigo: (v as number) ?? null }))}
                            placeholder="Selecciona un evento"
                            disabled={saving}
                        />

                        <Text style={styles.label}>Hora de inicio</Text>
                        <TouchableOpacity onPress={() => !saving && setShowInicioPicker(true)} activeOpacity={0.8}>
                            <TextInput
                                value={form.inicio_actividad}
                                style={styles.input}
                                placeholder="Selecciona la hora de inicio"
                                editable={false}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>

                        {showInicioPicker && (
                            <DateTimePicker
                                value={parseTimeToDate(form.inicio_actividad)}
                                mode="time"
                                display="default"
                                is24Hour={true}
                                onChange={handleInicioTimeChange}
                            />
                        )}

                        <Text style={styles.label}>Hora de fin</Text>
                        <TouchableOpacity onPress={() => !saving && setShowFinPicker(true)} activeOpacity={0.8}>
                            <TextInput
                                value={form.fin_actividad}
                                style={styles.input}
                                placeholder="Selecciona la hora de fin"
                                editable={false}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>

                        {showFinPicker && (
                            <DateTimePicker
                                value={parseTimeToDate(form.fin_actividad)}
                                mode="time"
                                display="default"
                                is24Hour={true}
                                onChange={handleFinTimeChange}
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => setModalVisible(false)} disabled={saving}>
                                <Text style={styles.btnOutlineText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnPrimary} onPress={onGuardar} disabled={saving}>
                                {saving ? <ActivityIndicator /> : <Text style={styles.btnPrimaryText}>Guardar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { padding: 20, alignItems: 'center', justifyContent: 'center' },
    muted: { marginTop: 8, opacity: 0.7 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#D8DBF5',
    },
    title: { fontSize: 14, fontWeight: '800', color: '#1F2A44', marginBottom: 6 },
    meta: { opacity: 0.8 },

    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    btnOutline: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F3A8A',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    btnOutlineText: { fontWeight: '800', color: '#1F3A8A' },

    btnDanger: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C62828',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    btnDangerText: { fontWeight: '800', color: '#C62828' },

    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        backgroundColor: '#EFF0FA',
        borderTopWidth: 1,
        borderTopColor: '#D8DBF5',
    },
    newBtn: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1F3A8A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: '#EFF0FA',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#D8DBF5',
    },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#1F2A44', marginBottom: 12 },
    label: { marginTop: 10, marginBottom: 6, fontWeight: '800', color: '#1F2A44' },
    input: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#D8DBF5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
    btnPrimary: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#2E7D32',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimaryText: { color: '#fff', fontWeight: '900' },
});