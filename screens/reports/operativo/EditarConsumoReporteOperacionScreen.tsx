import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { showToast } from '../../../services/notifications/ToastService';

import {
    fetchConsumosByGuia,
    patchConsumo,
    type ConsumoRow,
} from '../../../services/reports/operativos/consumoService';

import {
    fetchAlmacenMateriales,
    type AlmacenMaterialRow,
} from '../../../services/reports/operativos/almacenMaterialesService';

import {
    fetchProduccionByGuia,
    type ProduccionRow,
} from '../../../services/reports/operativos/produccionService';

import {
    fetchAlmacenesByUbicacion,
    type AlmacenRow,
} from '../../../services/reports/catalogos/almacenService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'EditarConsumoReporteOperacion'>;

function safeNumber(v: any) {
    const n = parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
}

function formatQty(qty: string | null | undefined, unidad: string | null | undefined) {
    const q = String(qty ?? '0.000');
    const u = (unidad ?? '').trim();
    return u ? `${q} ${u}` : q;
}

function formatMoney(value: any) {
    const n = safeNumber(value);
    return `$${n.toFixed(2)}`;
}

export default function EditarConsumoReporteOperacionScreen({ route, navigation }: Props) {
    const { id_consumo, id_guia } = route.params;
    const [previewCostoUnitario, setPreviewCostoUnitario] = useState(0);
    const [loading, setLoading] = useState(false);
    const [consumo, setConsumo] = useState<ConsumoRow | null>(null);

    const [productoLabel, setProductoLabel] = useState('Sin producto asignado');
    const [almacenLabel, setAlmacenLabel] = useState('No disponible');

    const [editCantidadReal, setEditCantidadReal] = useState('0.000');
    const [editExterno, setEditExterno] = useState(false);

    const isDetalle = !!consumo?.egresado;
    const unidadLabel = (consumo?.abreviatura_unidad ?? '').trim();

    const loadPreviewCostoUnitario = useCallback(async (currentConsumo: ConsumoRow) => {
        const cantidadReal = safeNumber(currentConsumo.cantidad_consumo);
        const costoTotal = safeNumber(currentConsumo.costo);
        const costoUnitarioBackend = safeNumber((currentConsumo as any).costo_inventario);
        if (costoUnitarioBackend > 0) {
            setPreviewCostoUnitario(costoUnitarioBackend);
            return;
        }

        if (costoTotal > 0 && cantidadReal > 0) {
            setPreviewCostoUnitario(costoTotal / cantidadReal);
            return;
        }

        if (!currentConsumo.externo && currentConsumo.id_almacen) {
            try {
                const resp = await fetchAlmacenMateriales({
                    id_material: currentConsumo.id_material,
                    id_almacen: currentConsumo.id_almacen,
                });

                if (!resp.success || !resp.data || resp.data.length === 0) {
                    setPreviewCostoUnitario(0);
                    return;
                }

                const firstRow: AlmacenMaterialRow | undefined = resp.data[0];
                setPreviewCostoUnitario(safeNumber(firstRow?.costo));
                return;
            } catch (e) {
                console.error('[EditarConsumo] loadPreviewCostoUnitario error:', e);
            }
        }
        setPreviewCostoUnitario(0);
    }, []);

    const loadProductoLabel = useCallback(
        async (produccionId: number | null) => {
            if (!produccionId) {
                setProductoLabel('Sin producto asignado');
                return;
            }

            try {
                const resp = await fetchProduccionByGuia(id_guia);
                if (!resp.success || !resp.data) {
                    setProductoLabel(`Derivado de producción #${produccionId}`);
                    return;
                }

                const prod: ProduccionRow | undefined = resp.data.find(
                    (x) => x.id_produccion === produccionId
                );

                const nombre = (prod?.nombre_producto ?? '').trim();
                setProductoLabel(nombre.length > 0 ? nombre : `Derivado de producción #${produccionId}`);
            } catch (e) {
                console.error('[EditarConsumo] loadProductoLabel error:', e);
                setProductoLabel(`Derivado de producción #${produccionId}`);
            }
        },
        [id_guia]
    );

    const loadAlmacenLabel = useCallback(
        async (idAlmacen: number | null | undefined, externo: boolean) => {
            if (externo || !idAlmacen) {
                setAlmacenLabel('No disponible');
                return;
            }

            try {
                const resp = await fetchAlmacenesByUbicacion(route.params.id_ubicacion);

                if (!resp.success || !resp.data) {
                    setAlmacenLabel('No disponible');
                    return;
                }

                const almacen = resp.data.find((a: AlmacenRow) => a.id_almacen === idAlmacen);
                setAlmacenLabel(almacen?.nombre_almacen ?? 'No disponible');
            } catch (e) {
                console.error('[EditarConsumo] loadAlmacenLabel error:', e);
                setAlmacenLabel('No disponible');
            }
        },
        [route.params.id_ubicacion]
    );

    const loadScreenData = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await fetchConsumosByGuia(id_guia);

            if (!resp.success || !resp.data) {
                showToast('error', 'Consumo', resp.error ?? 'No se pudieron cargar consumos');
                return;
            }

            const found = resp.data.find((x) => x.id_consumo === id_consumo) ?? null;

            if (!found) {
                showToast('error', 'Consumo', 'No se encontró el consumo');
                return;
            }

            setConsumo(found);
            setEditCantidadReal(String(found.cantidad_consumo ?? '0.000'));
            setEditExterno(!!found.externo);
            await Promise.all([
                loadProductoLabel(found.produccion ?? null),
                loadAlmacenLabel(found.id_almacen, !!found.externo),
                loadPreviewCostoUnitario(found),
            ]);
        } catch (e: any) {
            console.error('[EditarConsumo] loadScreenData error:', e);
            showToast('error', 'Consumo', e?.message ?? 'Error cargando información');
        } finally {
            setLoading(false);
        }
    }, [id_consumo, id_guia, loadProductoLabel, loadAlmacenLabel, loadPreviewCostoUnitario]);

    useFocusEffect(
        useCallback(() => {
            loadScreenData();
        }, [loadScreenData])
    );

    const cantidadRealNum = useMemo(() => safeNumber(editCantidadReal), [editCantidadReal]);

    const costoUnitarioNum = useMemo(() => {
        return previewCostoUnitario;
    }, [previewCostoUnitario]);

    const costoTotalNum = useMemo(() => {
        return cantidadRealNum * costoUnitarioNum;
    }, [cantidadRealNum, costoUnitarioNum]);

    const handleSave = useCallback(async () => {
        if (!consumo) return;
        if (isDetalle) {
            navigation.goBack();
            return;
        }

        const qty = parseFloat(editCantidadReal);
        if (!Number.isFinite(qty) || qty < 0) {
            showToast('error', 'Cantidad real', 'Ingresa una cantidad válida (>= 0)');
            return;
        }

        setLoading(true);
        try {
            const resp = await patchConsumo(consumo.id_consumo, {
                cantidad_consumo: String(editCantidadReal),
                costo: String(costoTotalNum.toFixed(2)),
                externo: !!editExterno,
            });

            if (!resp.success) {
                showToast('error', 'Consumo', resp.error ?? 'No se pudo guardar');
                return;
            }

            showToast('success', 'Consumo', 'Cambios guardados');
            navigation.goBack();
        } catch (e: any) {
            console.error('[EditarConsumo] handleSave error:', e);
            showToast('error', 'Consumo', e?.message ?? 'Error guardando cambios');
        } finally {
            setLoading(false);
        }
    }, [consumo, editCantidadReal, editExterno, isDetalle, navigation]);

    return (
        <ReportScreenLayout>
            <HeaderWithBack title={isDetalle ? 'Detalle de consumo' : 'Editar consumo'} />

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.card}>
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Consumo externo</Text>
                        <Switch
                            value={editExterno}
                            onValueChange={setEditExterno}
                            disabled={loading || isDetalle}
                        />
                    </View>

                    {!editExterno && (
                        <>
                            <Text style={styles.label}>Almacén</Text>
                            <View style={styles.readonlyBox}>
                                <Text style={styles.readonlyText}>{almacenLabel}</Text>
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>Producto</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>{productoLabel}</Text>
                    </View>

                    <Text style={styles.label}>Material</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>
                            {(consumo?.nombre_material ?? '').trim() || `Material #${consumo?.id_material ?? '-'}`}
                        </Text>
                    </View>

                    <Text style={styles.label}>Cantidad planeada</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>
                            {formatQty(consumo?.cantidad_planeada, unidadLabel)}
                        </Text>
                    </View>

                    <Text style={styles.label}>{isDetalle ? 'Cantidad real' : '* Cantidad real'}</Text>
                    {isDetalle ? (
                        <View style={styles.readonlyBox}>
                            <Text style={styles.readonlyText}>
                                {formatQty(editCantidadReal, unidadLabel)}
                            </Text>
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            value={editCantidadReal}
                            onChangeText={setEditCantidadReal}
                            keyboardType="numeric"
                            placeholder="0.000"
                            editable={!loading}
                        />
                    )}

                    <Text style={styles.label}>Costo unitario</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>{formatMoney(costoUnitarioNum)}</Text>
                    </View>

                    <Text style={styles.label}>Costo total</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>{formatMoney(costoTotalNum)}</Text>
                    </View>

                    <Text style={styles.label}>Unidad</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>{unidadLabel || 'No especificada'}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnOutline]}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Text style={styles.btnOutlineText}>
                                {isDetalle ? 'Volver' : 'Cancelar'}
                            </Text>
                        </TouchableOpacity>

                        {!isDetalle && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    {loading ? 'Guardando…' : 'Guardar cambios'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Información</Text>
                    <Text style={styles.infoText}>
                        Para cambiar almacén, grupo o material, elimina este consumo y créalo nuevamente.
                    </Text>
                </View>
            </ScrollView>
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    infoBox: {
        marginTop: 20,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#F7F7FF',
        borderWidth: 1,
        borderColor: '#D6D7E6',
    },

    infoTitle: {
        color: '#1B2A56',
        fontWeight: '800',
        marginBottom: 6,
    },

    infoText: {
        color: '#444',
        lineHeight: 20,
        marginTop: 4,
        textAlign: 'justify',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#1B2A56',
    },

    label: {
        marginTop: 12,
        fontWeight: '800',
        color: '#1B2A56',
    },

    metaMuted: {
        marginTop: 10,
        color: '#666',
    },

    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1B2A56',
        marginTop: 6,
    },

    readonlyBox: {
        backgroundColor: '#F7F7FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D6D7E6',
        padding: 12,
        marginTop: 6,
    },

    readonlyText: {
        color: '#111',
        fontWeight: '700',
    },

    actions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        marginTop: 16,
        flexWrap: 'wrap',
    },

    btn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },

    btnOutline: {
        borderWidth: 1,
        borderColor: '#1B2A56',
        backgroundColor: '#FFF',
    },

    btnOutlineText: {
        color: '#1B2A56',
        fontWeight: '800',
    },

    btnPrimary: {
        backgroundColor: '#1B2A56',
    },

    btnPrimaryText: {
        color: '#FFF',
        fontWeight: '800',
    },

    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
});