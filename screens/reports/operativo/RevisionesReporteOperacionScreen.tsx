import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    TextInput,
    Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { showToast } from '../../../services/notifications/ToastService';

import {
    fetchChecksByGuia,
    fetchInspeccionesPorGrupo,
    createCheck,
    patchCheck,
    softDeleteCheck,
    type CheckRow,
    type EstadoCheck,
} from '../../../services/reports/operativos/revisionesService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<
    OperativoStackParamList,
    'RevisionesReporteOperacion'
>;

const ESTADOS_UI: Array<{ key: Exclude<EstadoCheck, 'NA'>; label: string }> = [
    { key: 'MAL', label: 'Mal' },
    { key: 'REGULAR', label: 'Regular' },
    { key: 'BIEN', label: 'Bien' },
];

const normalizeText = (value?: string | null) =>
    (value ?? '').trim().toLowerCase();

export default function RevisionesReporteOperacionScreen({ route }: Props) {
    const { id_guia, id_empresa, id_grupo_equipo } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rows, setRows] = useState<CheckRow[]>([]);

    const hasSomethingToSave = useMemo(
        () => rows.some((r) => r.estado_check !== 'NA'),
        [rows]
    );

    const statusGeneral = useMemo(() => {
        const estados = rows
            .map((r) => r.estado_check)
            .filter((e) => e !== 'NA');

        if (estados.includes('MAL')) return 'MAL';
        if (estados.includes('REGULAR')) return 'REGULAR';
        if (estados.length > 0 && estados.every((e) => e === 'BIEN')) return 'BIEN';
        return 'NA';
    }, [rows]);

    const toggleEstado = useCallback(
        (index: number, nuevo: Exclude<EstadoCheck, 'NA'>) => {
            setRows((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (!current) return prev;
                const nextEstado: EstadoCheck =
                    current.estado_check === nuevo ? 'NA' : nuevo;

                copy[index] = {
                    ...current,
                    estado_check: nextEstado,
                };

                return copy;
            });
        },
        []
    );

    const updateObs = useCallback((index: number, text: string) => {
        setRows((prev) => {
            const copy = [...prev];
            const current = copy[index];
            if (!current) return prev;

            copy[index] = {
                ...current,
                observaciones_check: text,
            };

            return copy;
        });
    }, []);

    const load = useCallback(async () => {
        try {
            setLoading(true);

            const [existentesRes, inspeccionesRes] = await Promise.all([
                fetchChecksByGuia(id_guia),
                fetchInspeccionesPorGrupo(id_grupo_equipo),
            ]);

            if (!existentesRes.success) {
                throw new Error(existentesRes.error || 'No se pudieron cargar las revisiones');
            }

            if (!inspeccionesRes.success) {
                throw new Error(inspeccionesRes.error || 'No se pudieron cargar las inspecciones');
            }

            const existentes = existentesRes.data ?? [];
            const inspecciones = inspeccionesRes.data ?? [];

            const existentesMap = new Set(
                existentes.map((r) => normalizeText(r.elemento_check))
            );

            const faltantes: CheckRow[] = inspecciones
                .filter((insp) => !existentesMap.has(normalizeText(insp.nombre_inspeccion)))
                .map((insp) => ({
                    id_guia,
                    id_empresa,
                    elemento_check: insp.nombre_inspeccion,
                    observaciones_check: insp.descripcion_inspeccion ?? '',
                    estado_check: 'NA',
                }));

            setRows([...existentes, ...faltantes]);
        } catch (e: any) {
            console.log('Error load revisiones:', e?.message ?? e);
            showToast('error', 'Error', 'No se pudieron cargar las revisiones');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [id_guia, id_empresa, id_grupo_equipo]);

    const onGuardar = useCallback(async () => {
        const rowsToSave = rows.filter((r) => r.estado_check !== 'NA');

        if (rowsToSave.length === 0) {
            showToast(
                'info',
                'Sin cambios',
                'Selecciona Mal, Regular o Bien en al menos una revisión'
            );
            return;
        }

        try {
            setSaving(true);

            for (const r of rowsToSave) {
                if (r.id_check) {
                    const up = await patchCheck(r.id_check, {
                        elemento_check: r.elemento_check,
                        observaciones_check: r.observaciones_check,
                        estado_check: r.estado_check,
                    });

                    if (!up.success) {
                        throw new Error(up.error || 'No se pudo actualizar la revisión');
                    }
                } else {
                    const created = await createCheck({
                        id_guia,
                        id_empresa,
                        elemento_check: r.elemento_check,
                        observaciones_check: r.observaciones_check,
                        estado_check: r.estado_check,
                    });

                    if (!created.success) {
                        throw new Error(created.error || 'No se pudo crear la revisión');
                    }
                }
            }

            showToast('success', 'Listo', 'Revisiones guardadas');
            await load();
        } catch (e: any) {
            console.log('Error guardar revisiones:', e?.message ?? e);
            showToast('error', 'Error', 'No se pudieron guardar las revisiones');
        } finally {
            setSaving(false);
        }
    }, [rows, id_guia, id_empresa, load]);

    const onEliminar = useCallback(
        (item: CheckRow) => {
            if (!item.id_check) {
                setRows((prev) =>
                    prev.map((row) =>
                        row.elemento_check === item.elemento_check && !row.id_check
                            ? { ...row, estado_check: 'NA' }
                            : row
                    )
                );
                return;
            }

            Alert.alert(
                'Eliminar revisión',
                `¿Deseas eliminar "${item.elemento_check}"?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setSaving(true);

                                const resp = await softDeleteCheck(item.id_check!);
                                if (!resp.success) {
                                    throw new Error(resp.error || 'No se pudo eliminar la revisión');
                                }

                                showToast('success', 'Listo', 'Revisión eliminada');
                                await load();
                            } catch (e: any) {
                                console.log('Error eliminar revisión:', e?.message ?? e);
                                showToast('error', 'Error', 'No se pudo eliminar la revisión');
                            } finally {
                                setSaving(false);
                            }
                        },
                    },
                ]
            );
        },
        [load]
    );

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const renderItem = useCallback(
        ({ item, index }: { item: CheckRow; index: number }) => {
            const isPersisted = !!item.id_check;

            return (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>{item.elemento_check}</Text>

                        <View style={[styles.sourceBadge, isPersisted ? styles.sourceBadgeSaved : styles.sourceBadgeDraft]}>
                            <Text style={styles.sourceBadgeText}>
                                {isPersisted ? 'Guardada' : 'Pendiente'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.estadoRow}>
                        {ESTADOS_UI.map((b) => {
                            const selected = item.estado_check === b.key;

                            return (
                                <TouchableOpacity
                                    key={b.key}
                                    onPress={() => toggleEstado(index, b.key)}
                                    style={[
                                        styles.estadoBtn,
                                        selected && styles.estadoBtnSelected,
                                        saving && styles.estadoBtnDisabled,
                                    ]}
                                    disabled={saving || loading}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Estatus ${b.label} para ${item.elemento_check}`}
                                >
                                    <Text
                                        style={[
                                            styles.estadoText,
                                            selected && styles.estadoTextSelected,
                                        ]}
                                    >
                                        {b.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.naPill}>
                            <Text style={styles.naText}>Estado: {item.estado_check}</Text>
                        </View>
                    </View>

                    <Text style={styles.obsLabel}>Observaciones</Text>
                    <TextInput
                        value={item.observaciones_check}
                        onChangeText={(t) => updateObs(index, t)}
                        style={styles.input}
                        placeholder="Escribe observaciones..."
                        multiline
                        editable={!saving && !loading}
                        textAlignVertical="top"
                    />

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => onEliminar(item)}
                            disabled={saving || loading}
                        >
                            <Text style={styles.deleteText}>
                                {isPersisted ? 'Eliminar revisión' : 'Reiniciar/Cancelar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        },
        [toggleEstado, updateObs, onEliminar, saving, loading]
    );

    return (
        <View style={{ flex: 1 }}>
            <HeaderWithBack title="Revisiones" />

            <ReportScreenLayout scroll={false}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator />
                        <Text style={styles.muted}>Cargando revisiones…</Text>
                    </View>
                ) : rows.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.muted}>
                            No hay inspecciones configuradas para este grupo.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Estatus general de reporte</Text>
                            <Text style={styles.summaryValue}>{statusGeneral}</Text>
                            <Text style={styles.summaryHint}>
                                Se calcula localmente según el peor estado capturado.
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.summaryValue}>Lista de revisiones para el equipo</Text>
                        </View>

                        <FlatList
                            data={rows}
                            keyExtractor={(item, idx) =>
                                item.id_check
                                    ? `check-${item.id_check}`
                                    : `draft-${item.elemento_check}-${idx}`
                            }
                            renderItem={renderItem}
                            contentContainerStyle={{
                                paddingBottom: 120,
                                paddingHorizontal: 0,
                            }}
                            keyboardShouldPersistTaps="handled"
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    (!hasSomethingToSave || saving || loading) && styles.saveBtnDisabled,
                                ]}
                                onPress={() => {
                                    if (!hasSomethingToSave) {
                                        Alert.alert(
                                            'Sin estatus',
                                            'Selecciona Mal, Regular o Bien en al menos una revisión.'
                                        );
                                        return;
                                    }
                                    onGuardar();
                                }}
                                disabled={!hasSomethingToSave || saving || loading}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveText}>Guardar revisiones</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ReportScreenLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    muted: {
        marginTop: 8,
        opacity: 0.7,
        color: '#1F2A44',
        textAlign: 'center',
    },

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 7,
        marginTop: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#D8DBF5',
    },

    summaryTitle: {
        textAlign: 'center', 
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2A44',
        marginBottom: 4,
    },

    summaryValue: {
        textAlign: 'center', 
        fontSize: 18,
        fontWeight: '800',
        color: '#1F3A8A',
    },

    summaryHint: {
        textAlign: 'justify', 
        marginTop: 4,
        fontSize: 12,
        color: '#5B6480',
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#D8DBF5',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },

    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2A44',
    },

    sourceBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
    },

    sourceBadgeSaved: {
        backgroundColor: '#EAF7EE',
        borderColor: '#B9E3C4',
    },

    sourceBadgeDraft: {
        backgroundColor: '#FFF7E6',
        borderColor: '#F4D79A',
    },

    sourceBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1F2A44',
    },

    estadoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
    },

    estadoBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B9BFEA',
        backgroundColor: '#F5F6FF',
    },

    estadoBtnSelected: {
        backgroundColor: '#1F3A8A',
        borderColor: '#1F3A8A',
    },

    estadoBtnDisabled: {
        opacity: 0.6,
    },

    estadoText: {
        fontWeight: '600',
        color: '#1F2A44',
    },

    estadoTextSelected: {
        color: '#fff',
    },

    naPill: {
        marginLeft: 'auto',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: '#EFF0FA',
        borderWidth: 1,
        borderColor: '#D8DBF5',
    },

    naText: {
        fontSize: 12,
        opacity: 0.8,
        color: '#1F2A44',
    },

    obsLabel: {
        marginTop: 10,
        marginBottom: 6,
        fontWeight: '700',
        color: '#1F2A44',
    },

    input: {
        minHeight: 90,
        borderWidth: 1,
        borderColor: '#D8DBF5',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#fff',
        color: '#1F2A44',
    },

    actionsRow: {
        marginTop: 12,
        alignItems: 'flex-end',
    },

    deleteBtn: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },

    deleteText: {
        color: '#B3261E',
        fontWeight: '700',
    },

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

    saveBtn: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
    },

    saveBtnDisabled: {
        opacity: 0.6,
    },

    saveText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
});