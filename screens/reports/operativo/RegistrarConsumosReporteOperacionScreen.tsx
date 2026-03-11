import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

import {
    fetchConsumosByGuia,
    patchConsumo,
    registrarConsumo,
    type ConsumoRow,
} from '../../../services/reports/operativos/consumoService';

import {
    fetchAlmacenesByUbicacion,
    type AlmacenRow,
} from '../../../services/reports/catalogos/almacenService';

import {
    fetchCantidadAlmacenInventario,
    type CantidadAlmacenInventarioRow,
} from '../../../services/reports/operativos/cantidadAlmacenInventarioService';

import {
    fetchMaterialesHomologados,
    type MaterialHomologadoRow,
} from '../../../services/reports/catalogos/materialService';

type Props = NativeStackScreenProps<OperativoStackParamList, 'RegistrarConsumosReporteOperacion'>;

type InventoryMap = Record<number, CantidadAlmacenInventarioRow | null>;
type CantidadMap = Record<number, string>;
type MaterialUsadoMap = Record<number, number | null>;

function safeNumber(v: any) {
    const n = parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: any) {
    return `$${safeNumber(value).toFixed(2)}`;
}

function formatQty(qty: any, unidad?: string | null) {
    const q = safeNumber(qty).toFixed(3);
    const u = (unidad ?? '').trim();
    return u ? `${q} ${u}` : q;
}

export default function RegistrarConsumosReporteOperacionScreen({ route, navigation }: Props) {
    const { id_guia, id_ubicacion } = route.params;

    const [loading, setLoading] = useState(false);
    const [registeringId, setRegisteringId] = useState<number | null>(null);

    const [consumos, setConsumos] = useState<ConsumoRow[]>([]);
    const [almacenes, setAlmacenes] = useState<AlmacenRow[]>([]);
    const [selectedAlmacenId, setSelectedAlmacenId] = useState<number | null>(null);

    const [cantidadMap, setCantidadMap] = useState<CantidadMap>({});
    const [materialUsadoMap, setMaterialUsadoMap] = useState<MaterialUsadoMap>({});
    const [inventoryMap, setInventoryMap] = useState<InventoryMap>({});

    const [homologadosModalVisible, setHomologadosModalVisible] = useState(false);
    const [homologadosLoading, setHomologadosLoading] = useState(false);
    const [homologados, setHomologados] = useState<MaterialHomologadoRow[]>([]);
    const [activeConsumoForHomologado, setActiveConsumoForHomologado] = useState<ConsumoRow | null>(null);

    const almacenesActivos = useMemo(
        () => almacenes.filter((a) => a.status),
        [almacenes]
    );

    const consumosPendientes = useMemo(
        () => consumos.filter((c) => !c.egresado && !c.externo),
        [consumos]
    );

    const getEffectiveMaterialId = useCallback(
        (c: ConsumoRow) => {
            const override = materialUsadoMap[c.id_consumo];
            if (override) return override;
            if (c.id_material_usado) return c.id_material_usado;
            return c.id_material;
        },
        [materialUsadoMap]
    );

    const loadBaseData = useCallback(async () => {
        setLoading(true);
        try {
            const [consumosResp, almacenesResp] = await Promise.all([
                fetchConsumosByGuia(id_guia),
                fetchAlmacenesByUbicacion(id_ubicacion),
            ]);

            if (!consumosResp.success || !consumosResp.data) {
                showToast('error', 'Consumos', consumosResp.error ?? 'No se pudieron cargar consumos');
                setConsumos([]);
            } else {
                const pendientes = consumosResp.data.filter((c) => !c.egresado && !c.externo);
                setConsumos(pendientes);

                const nextCantidadMap: CantidadMap = {};
                const nextMaterialUsadoMap: MaterialUsadoMap = {};

                pendientes.forEach((c) => {
                    nextCantidadMap[c.id_consumo] = String(c.cantidad_consumo ?? '0.000');
                    nextMaterialUsadoMap[c.id_consumo] = c.id_material_usado ?? null;
                });

                setCantidadMap(nextCantidadMap);
                setMaterialUsadoMap(nextMaterialUsadoMap);
            }

            if (!almacenesResp.success || !almacenesResp.data) {
                showToast('error', 'Almacenes', almacenesResp.error ?? 'No se pudieron cargar almacenes');
                setAlmacenes([]);
            } else {
                setAlmacenes(almacenesResp.data);
            }
        } catch (e: any) {
            console.error('[RegistrarConsumos] loadBaseData error:', e);
            showToast('error', 'Registrar consumos', e?.message ?? 'Error cargando información');
        } finally {
            setLoading(false);
        }
    }, [id_guia, id_ubicacion]);

    useFocusEffect(
        useCallback(() => {
            loadBaseData();
        }, [loadBaseData])
    );

    useEffect(() => {
        if (!selectedAlmacenId && almacenesActivos.length > 0) {
            setSelectedAlmacenId(almacenesActivos[0].id_almacen);
        }
    }, [selectedAlmacenId, almacenesActivos]);

    const recalculateInventories = useCallback(async () => {
        if (!selectedAlmacenId || consumosPendientes.length === 0) {
            setInventoryMap({});
            return;
        }

        try {
            const payload = consumosPendientes.map((c) => ({
                id_almacen: selectedAlmacenId,
                id_ubicacion,
                id_material: getEffectiveMaterialId(c),
            }));

            const resp = await fetchCantidadAlmacenInventario(payload);

            if (!resp.success || !resp.data) {
                showToast('error', 'Inventario', resp.error ?? 'No se pudo calcular inventario');
                return;
            }

            const nextInventoryMap: InventoryMap = {};

            consumosPendientes.forEach((consumo, index) => {
                nextInventoryMap[consumo.id_consumo] = resp.data?.materiales?.[index] ?? null;
            });

            setInventoryMap(nextInventoryMap);
        } catch (e: any) {
            console.error('[RegistrarConsumos] recalculateInventories error:', e);
            showToast('error', 'Inventario', e?.message ?? 'Error recalculando inventario');
        }
    }, [selectedAlmacenId, consumosPendientes, id_ubicacion, getEffectiveMaterialId]);

    useEffect(() => {
        recalculateInventories();
    }, [recalculateInventories]);

    const handleChangeCantidad = useCallback(
        async (consumo: ConsumoRow, value: string) => {
            setCantidadMap((prev) => ({
                ...prev,
                [consumo.id_consumo]: value,
            }));

            const qty = safeNumber(value);
            const inventory = inventoryMap[consumo.id_consumo];
            const unitCost = safeNumber(inventory?.costo);
            const totalCost = qty * unitCost;

            try {
                await patchConsumo(consumo.id_consumo, {
                    cantidad_consumo: String(value),
                    costo: String(totalCost.toFixed(2)),
                });

                /**
                 * En web, al cambiar cantidad real se vuelve a recalcular
                 * disponibilidad/costo/faltante en caliente.
                 */
                await recalculateInventories();
            } catch (e) {
                console.error('[RegistrarConsumos] patch cantidad error:', e);
            }
        },
        [inventoryMap, recalculateInventories]
    );

    const openHomologados = useCallback(async (consumo: ConsumoRow) => {
        setActiveConsumoForHomologado(consumo);
        setHomologados([]);
        setHomologadosModalVisible(true);
        setHomologadosLoading(true);

        try {
            const resp = await fetchMaterialesHomologados(consumo.id_material);
            if (!resp.success || !resp.data) {
                showToast('error', 'Homologados', resp.error ?? 'No se pudieron cargar homologados');
                return;
            }

            setHomologados(resp.data);
        } catch (e: any) {
            console.error('[RegistrarConsumos] openHomologados error:', e);
            showToast('error', 'Homologados', e?.message ?? 'Error cargando homologados');
        } finally {
            setHomologadosLoading(false);
        }
    }, []);

    const handleSelectHomologado = useCallback(async (material: MaterialHomologadoRow) => {
        if (!activeConsumoForHomologado) return;

        setLoading(true);
        try {
            const resp = await patchConsumo(activeConsumoForHomologado.id_consumo, {
                id_material_usado: material.id_material,
            });

            if (!resp.success) {
                showToast('error', 'Homologado', resp.error ?? 'No se pudo actualizar el consumo');
                return;
            }

            setMaterialUsadoMap((prev) => ({
                ...prev,
                [activeConsumoForHomologado.id_consumo]: material.id_material,
            }));

            setConsumos((prev) =>
                prev.map((c) =>
                    c.id_consumo === activeConsumoForHomologado.id_consumo
                        ? {
                            ...c,
                            id_material_usado: material.id_material,
                            nombre_material: material.nombre_material,
                            abreviatura_unidad: material.abreviatura_unidad,
                        }
                        : c
                )
            );

            setHomologadosModalVisible(false);
            setActiveConsumoForHomologado(null);
            await recalculateInventories();
            showToast('success', 'Homologado', 'Material homologado aplicado');
        } catch (e: any) {
            console.error('[RegistrarConsumos] select homologado error:', e);
            showToast('error', 'Homologado', e?.message ?? 'Error seleccionando homologado');
        } finally {
            setLoading(false);
        }
    }, [activeConsumoForHomologado, recalculateInventories]);

    const handleRegistrar = useCallback(async (consumo: ConsumoRow) => {
        if (!selectedAlmacenId) {
            showToast('error', 'Almacén', 'Selecciona un almacén');
            return;
        }

        const inventory = inventoryMap[consumo.id_consumo];
        const cantidadReal = safeNumber(cantidadMap[consumo.id_consumo]);
        const disponible = safeNumber(inventory?.cantidad);

        if (!inventory) {
            showToast('error', 'Inventario', 'No se pudo calcular disponibilidad para este consumo');
            return;
        }

        if (cantidadReal <= 0) {
            showToast('error', 'Cantidad real', 'Ingresa una cantidad real válida');
            return;
        }

        if (disponible < cantidadReal) {
            Alert.alert(
                'Inventario insuficiente',
                'La cantidad disponible es menor a la cantidad real capturada. Ajusta el almacén, la cantidad o usa un homologado con existencia.'
            );
            return;
        }

        setRegisteringId(consumo.id_consumo);
        try {
            const resp = await registrarConsumo({
                items: [
                    {
                        consumo_id: consumo.id_consumo,
                        id_almacen: selectedAlmacenId,
                    },
                ],
            });

            if (!resp.success) {
                showToast('error', 'Registrar', resp.error ?? 'No se pudo registrar el consumo');
                return;
            }

            if (resp.data?.errors?.length) {
                showToast('error', 'Registrar', 'El backend reportó errores al registrar el consumo');
                return;
            }

            showToast('success', 'Registrar', 'Consumo registrado correctamente');
            await loadBaseData();
        } catch (e: any) {
            console.error('[RegistrarConsumos] registrar error:', e);
            showToast('error', 'Registrar', e?.message ?? 'Error registrando consumo');
        } finally {
            setRegisteringId(null);
        }
    }, [selectedAlmacenId, inventoryMap, cantidadMap, loadBaseData]);

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Registrar consumos" />

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <Text style={styles.label}>Almacén</Text>
            <Select<AlmacenRow>
                options={almacenesActivos}
                valueKey="id_almacen"
                labelKey="nombre_almacen"
                selectedValue={selectedAlmacenId}
                onValueChange={(v) => setSelectedAlmacenId((v as number) ?? null)}
                placeholder="Selecciona un almacén"
                disabled={loading || almacenesActivos.length === 0}
                style={styles.selectLikeFastman}
            />

            {consumosPendientes.length === 0 ? (
                <Text style={styles.empty}>No hay consumos pendientes por registrar.</Text>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {consumosPendientes.map((c) => {
                        const inventory = inventoryMap[c.id_consumo];
                        const cantidadReal = safeNumber(cantidadMap[c.id_consumo]);
                        const disponible = safeNumber(inventory?.cantidad);
                        const faltante = Math.max(cantidadReal - disponible, 0);
                        const costoUnitario = safeNumber(inventory?.costo);
                        const costoTotal = cantidadReal * costoUnitario;
                        const unidad = inventory?.abreviatura_unidad ?? c.abreviatura_unidad ?? '';
                        const materialName = inventory?.nombre_material ?? c.nombre_material ?? `Material #${c.id_material}`;
                        const puedeRegistrar = !!selectedAlmacenId && disponible >= cantidadReal && cantidadReal > 0;

                        return (
                            <View key={c.id_consumo} style={styles.card}>
                                <Text style={styles.title}>{materialName}</Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Cantidad planeada: </Text>
                                    {formatQty(c.cantidad_planeada, unidad)}
                                </Text>

                                <Text style={styles.label}>Cantidad real</Text>
                                <TextInput
                                    style={styles.input}
                                    value={cantidadMap[c.id_consumo] ?? String(c.cantidad_consumo ?? '0.000')}
                                    onChangeText={(value) => handleChangeCantidad(c, value)}
                                    keyboardType="numeric"
                                    editable={!loading && registeringId !== c.id_consumo}
                                />

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Disponible: </Text>
                                    <Text style={styles.meta}>
                                        <Text style={styles.k}>Disponible: </Text>
                                        {inventory
                                            ? disponible > 0
                                                ? formatQty(disponible, unidad)
                                                : `0 ${unidad}`.trim()
                                            : '—'}
                                    </Text>
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Faltante: </Text>
                                    {faltante > 0 ? formatQty(faltante, unidad) : formatQty(0, unidad)}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Costo: </Text>
                                    {formatMoney(costoTotal)}
                                </Text>

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnOutline]}
                                        onPress={() => openHomologados(c)}
                                        disabled={loading || registeringId === c.id_consumo}
                                    >
                                        <Text style={styles.btnOutlineText}>Elegir homologado</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.btn,
                                            puedeRegistrar ? styles.btnPrimary : styles.btnDisabled,
                                        ]}
                                        onPress={() => handleRegistrar(c)}
                                        disabled={!puedeRegistrar || loading || registeringId === c.id_consumo}
                                    >
                                        <Text style={styles.btnPrimaryText}>
                                            {registeringId === c.id_consumo ? 'Registrando…' : 'Registrar'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            <Modal
                visible={homologadosModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setHomologadosModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Seleccionar material homologado</Text>

                        {!!activeConsumoForHomologado && (
                            <Text style={styles.modalSubtitle}>
                                Material base: {activeConsumoForHomologado.nombre_material ?? `#${activeConsumoForHomologado.id_material}`}
                            </Text>
                        )}

                        {homologadosLoading ? (
                            <ActivityIndicator style={{ marginTop: 16 }} />
                        ) : homologados.length === 0 ? (
                            <Text style={styles.empty}>Sin homologados disponibles.</Text>
                        ) : (
                            <ScrollView style={{ maxHeight: 350 }}>
                                {homologados.map((item) => (
                                    <View key={item.id_material} style={styles.homologadoRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.homologadoCode}>
                                                {item.numero_almacen_material || 'Sin código'}
                                            </Text>
                                            <Text style={styles.homologadoName}>{item.nombre_material}</Text>
                                            <Text style={styles.homologadoUnit}>
                                                Unidad: {item.abreviatura_unidad || '—'}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.btn, styles.btnOutline]}
                                            onPress={() => handleSelectHomologado(item)}
                                        >
                                            <Text style={styles.btnOutlineText}>Usar este</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary, { marginTop: 16, alignSelf: 'flex-end' }]}
                            onPress={() => setHomologadosModalVisible(false)}
                        >
                            <Text style={styles.btnPrimaryText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    label: {
        marginTop: 12,
        fontWeight: '800',
        color: '#1B2A56',
    },

    selectLikeFastman: {
        marginVertical: 6,
    },

    empty: {
        marginTop: 12,
        color: '#555',
    },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#1B2A56',
    },

    title: {
        color: '#1B2A56',
        fontWeight: '900',
        fontSize: 16,
    },

    meta: {
        marginTop: 8,
        color: '#333',
    },

    k: {
        color: '#1B2A56',
        fontWeight: '800',
    },

    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1B2A56',
        marginTop: 6,
    },

    actions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        marginTop: 14,
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

    btnDisabled: {
        backgroundColor: '#9CA3AF',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        padding: 16,
    },

    modalCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        maxHeight: '85%',
    },

    modalTitle: {
        color: '#1B2A56',
        fontWeight: '900',
        fontSize: 18,
    },

    modalSubtitle: {
        color: '#1B2A56',
        marginTop: 8,
        fontWeight: '700',
    },

    homologadoRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },

    homologadoCode: {
        color: '#1B2A56',
        fontWeight: '800',
    },

    homologadoName: {
        color: '#111',
        marginTop: 4,
    },

    homologadoUnit: {
        color: '#666',
        marginTop: 4,
    },
});