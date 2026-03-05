import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Select from '../../../components/common/Select';
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
    fetchAlmacenesByUbicacion,
    type AlmacenRow,
} from '../../../services/reports/catalogos/almacenService';

import {
    fetchGrupoMateriales,
    type GrupoMaterialRow,
} from '../../../services/reports/catalogos/grupoMaterialService';

import { fetchProduccionByGuia } from '../../../services/reports/operativos/produccionService';

import {
    fetchMaterialesByGrupoAndAlmacen,
    fetchMaterialesByGrupo,
    fetchMaterialById,
    type MaterialRow,
} from '../../../services/reports/catalogos/materialService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'EditarConsumoReporteOperacion'>;

type MaterialOption = MaterialRow & { label_material: string };

function safeNumber(v: any) {
    const n = parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
}

export default function EditarConsumoReporteOperacionScreen({ route, navigation }: Props) {
    const { id_consumo, id_guia, id_empresa, id_ubicacion } = route.params;

    const [loading, setLoading] = useState(false);

    // consumo actual
    const [consumo, setConsumo] = useState<ConsumoRow | null>(null);
    const [productoLabel, setProductoLabel] = useState<string>('Sin producto asignado');

    // catálogos
    const [almacenes, setAlmacenes] = useState<AlmacenRow[]>([]);
    const [grupos, setGrupos] = useState<GrupoMaterialRow[]>([]);
    const [materiales, setMateriales] = useState<MaterialRow[]>([]);

    const almacenesActivos = useMemo(() => almacenes.filter((a) => a.status), [almacenes]);
    const gruposActivos = useMemo(() => grupos.filter((g) => g.status_grupo_material), [grupos]);

    const [editCantidadPlaneada, setEditCantidadPlaneada] = useState('0.000');
    const [editCantidadReal, setEditCantidadReal] = useState('0.000');
    const [editExterno, setEditExterno] = useState(false);

    // selección
    const [editIdAlmacen, setEditIdAlmacen] = useState<number | null>(null);
    const [editIdGrupo, setEditIdGrupo] = useState<number | null>(null);
    const [editIdMaterial, setEditIdMaterial] = useState<number | null>(null);

    // inventario
    const [invRow, setInvRow] = useState<AlmacenMaterialRow | null>(null);
    const [invLoading, setInvLoading] = useState(false);

    const materialOptions = useMemo<MaterialOption[]>(
        () =>
            materiales
                .filter((m) => m.status_material)
                .map((m) => ({
                    ...m,
                    label_material: `${m.numero_almacen_material ? `${m.numero_almacen_material} - ` : ''}${m.nombre_material}`,
                })),
        [materiales]
    );

    const loadProductoFromProduccion = useCallback(
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

                const p = resp.data.find((x) => x.id_produccion === produccionId) ?? null;
                const nombre = (p?.nombre_producto ?? '').trim();
                setProductoLabel(nombre.length > 0 ? nombre : `Derivado de producción #${produccionId}`);
            } catch (e: any) {
                console.error('[EditarConsumo] loadProductoFromProduccion error:', e);
                setProductoLabel(`Derivado de producción #${produccionId}`);
            }
        },
        [id_guia]
    );

    const loadCatalogosBase = useCallback(async () => {
        const [aResp, gResp] = await Promise.all([
            fetchAlmacenesByUbicacion(id_ubicacion),
            fetchGrupoMateriales(),
        ]);

        if (aResp.success && aResp.data) setAlmacenes(aResp.data);
        else showToast('error', 'Almacenes', aResp.error ?? 'No se pudieron cargar almacenes');

        if (gResp.success && gResp.data) setGrupos(gResp.data);
        else showToast('error', 'Grupos', gResp.error ?? 'No se pudieron cargar grupos');
    }, [id_ubicacion]);

    const loadConsumo = useCallback(async () => {
        const resp = await fetchConsumosByGuia(id_guia);

        if (!resp.success || !resp.data) {
            showToast('error', 'Consumo', resp.error ?? 'No se pudieron cargar consumos');
            return null;
        }

        const found = resp.data.find((x) => x.id_consumo === id_consumo) ?? null;
        if (!found) {
            showToast('error', 'Consumo', 'No se encontró el consumo a editar');
            return null;
        }

        setConsumo(found);
        setEditCantidadPlaneada(String(found.cantidad_planeada ?? '0.000'));
        setEditCantidadReal(String(found.cantidad_consumo ?? '0.000'));
        setEditExterno(!!found.externo);
        setEditIdMaterial(found.id_material ?? null);
        setEditIdAlmacen((found as any)?.id_almacen ?? null);

        await loadProductoFromProduccion(found.produccion ?? null);

        return found;
    }, [id_guia, id_consumo, loadProductoFromProduccion]);

    const inferGrupoFromMaterial = useCallback(async (id_material: number | null) => {
        if (!id_material) return null;

        try {
            const resp = await fetchMaterialById(id_material);
            if (resp.success && resp.data && resp.data.length > 0) {
                const mat = resp.data[0];
                const grp = (mat as any)?.id_grupo_material ?? null;
                return typeof grp === 'number' ? grp : null;
            }
            return null;
        } catch (e) {
            return null;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;

            (async () => {
                setLoading(true);
                try {
                    await loadCatalogosBase();
                    const c = await loadConsumo();

                    if (!mounted) return;

                    // defaults si no venía almacén
                    if (!c?.externo) {
                        setEditIdAlmacen((prev) => prev ?? almacenesActivos.find((x) => x.status)?.id_almacen ?? null);
                    }

                    // inferir grupo por material
                    const inferred = await inferGrupoFromMaterial(c?.id_material ?? null);

                    if (!mounted) return;

                    if (inferred) setEditIdGrupo(inferred);
                    else {
                        // fallback a primer grupo activo
                        const firstGrp = gruposActivos.find((x) => x.status_grupo_material)?.id_grupo_material ?? null;
                        setEditIdGrupo((prev) => prev ?? firstGrp);
                    }
                } catch (e: any) {
                    console.error('[EditarConsumo] focus error:', e);
                    showToast('error', 'Editar consumo', e?.message ?? 'Error cargando editor');
                } finally {
                    if (mounted) setLoading(false);
                }
            })();

            return () => {
                mounted = false;
            };
        }, [loadCatalogosBase, loadConsumo, inferGrupoFromMaterial])
    );

    useEffect(() => {
        // Solo para preview interno
        if (editExterno) return;
        if (editIdAlmacen) return;

        const first = almacenesActivos.find((a) => a.status)?.id_almacen ?? null;
        if (first) setEditIdAlmacen(first);
    }, [editExterno, editIdAlmacen, almacenesActivos]);

    /**
     * Cuando cambia "externo":
     * - ocultamos almacén/inventario
     * - limpiamos inventario para no mostrar datos viejos
     */
    useEffect(() => {
        if (editExterno) {
            setInvRow(null);
            setInvLoading(false);
        }
    }, [editExterno]);

    /**
     * Cargar materiales:
     * - EXTERNO: por grupo
     * - INTERNO: por grupo + almacén
     */
    useEffect(() => {
        let mounted = true;

        (async () => {
            setMateriales([]);
            setInvRow(null);

            if (!editIdGrupo) return;

            // interno: requiere almacén
            if (!editExterno && !editIdAlmacen) return;

            try {
                const resp = editExterno
                    ? await fetchMaterialesByGrupo(editIdGrupo)
                    : await fetchMaterialesByGrupoAndAlmacen(editIdGrupo, editIdAlmacen as number);

                if (!mounted) return;

                if (resp.success && resp.data) {
                    setMateriales(resp.data);

                    // conservar el material actual si existe; si no, forzar null
                    setEditIdMaterial((prev) => {
                        const exists = prev && resp.data.some((m) => m.id_material === prev);
                        return exists ? prev : null;
                    });
                } else {
                    showToast('error', 'Materiales', resp.error ?? 'No se pudieron cargar materiales');
                }
            } catch (e: any) {
                if (!mounted) return;
                console.error('[EditarConsumo] materiales error:', e);
                showToast('error', 'Materiales', e?.message ?? 'Error cargando materiales');
            }
        })();

        return () => {
            mounted = false;
        };
    }, [editIdGrupo, editIdAlmacen, editExterno]);

    /**
     * Inventario (solo interno) depende de (material, almacén)
     */
    useEffect(() => {
        let mounted = true;

        (async () => {
            setInvRow(null);

            if (editExterno) return;
            if (!editIdMaterial) return;
            if (!editIdAlmacen) return;

            setInvLoading(true);
            try {
                const resp = await fetchAlmacenMateriales({
                    id_material: editIdMaterial,
                    id_almacen: editIdAlmacen,
                });

                if (!mounted) return;

                if (resp.success && resp.data) {
                    const row = resp.data.find((x) => x.status) ?? null;
                    setInvRow(row);
                } else {
                    showToast('error', 'Inventario', resp.error ?? 'No se pudo cargar inventario');
                }
            } catch (e: any) {
                if (!mounted) return;
                console.error('[EditarConsumo] inventario error:', e);
                showToast('error', 'Inventario', e?.message ?? 'Error cargando inventario');
            } finally {
                if (mounted) setInvLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [editIdMaterial, editIdAlmacen, editExterno]);

    // ===== cálculos (preview) =====
    const disponibleNum = useMemo(() => safeNumber(invRow?.cantidad), [invRow?.cantidad]);
    const realNum = useMemo(() => safeNumber(editCantidadReal), [editCantidadReal]);
    const faltanteNum = useMemo(() => {
        if (editExterno) return 0;
        const falt = realNum - disponibleNum;
        return falt > 0 ? falt : 0;
    }, [realNum, disponibleNum, editExterno]);

    const restanteNum = useMemo(() => {
        if (editExterno) return disponibleNum;
        const rest = disponibleNum - realNum;
        return rest >= 0 ? rest : 0;
    }, [disponibleNum, realNum, editExterno]);

    const costoUnitarioInventarioNum = useMemo(() => safeNumber(invRow?.costo), [invRow?.costo]);

    const costoUnitarioNum = useMemo(() => {
        return editExterno ? 0 : costoUnitarioInventarioNum;
    }, [editExterno, costoUnitarioInventarioNum]);

    const costoTotalNum = useMemo(() => {
        return realNum * costoUnitarioNum;
    }, [realNum, costoUnitarioNum]);

    // ===== guardar =====
    const handleSave = useCallback(async () => {
        if (!consumo) return;

        if (!editIdMaterial) {
            showToast('error', 'Material', 'Selecciona un material');
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
                id_material: editIdMaterial,
                cantidad_consumo: String(editCantidadReal),
                externo: !!editExterno,
            });

            if (!resp.success) {
                showToast('error', 'Editar', resp.error ?? 'No se pudo guardar');
                return;
            }

            showToast('success', 'Editar', 'Cambios guardados');
            navigation.goBack();
        } catch (e: any) {
            console.error('[EditarConsumo] guardar error:', e);
            showToast('error', 'Editar', e?.message ?? 'Error guardando');
        } finally {
            setLoading(false);
        }
    }, [consumo, editIdMaterial, editCantidadReal, editExterno, navigation]);

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Editar consumo" />

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.card}>
                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Consumo externo</Text>
                        <Switch value={editExterno} onValueChange={setEditExterno} disabled={loading} />
                    </View>

                    {/* Producto readonly */}
                    <Text style={styles.label}>Producto</Text>
                    <View style={styles.readonlyBox}>
                        <Text style={styles.readonlyText}>{productoLabel}</Text>
                    </View>

                    {/* Almacén SOLO si NO es externo */}
                    {!editExterno && (
                        <>
                            <Text style={styles.label}>Almacén</Text>
                            <Select<AlmacenRow>
                                options={almacenesActivos}
                                valueKey="id_almacen"
                                labelKey="nombre_almacen"
                                selectedValue={editIdAlmacen}
                                onValueChange={(v) => setEditIdAlmacen((v as number) ?? null)}
                                placeholder="Selecciona un almacén"
                                loading={loading}
                                disabled={loading || almacenesActivos.length === 0}
                                style={styles.selectLikeFastman}
                            />
                            {almacenesActivos.length === 0 ? (
                                <Text style={styles.metaMuted}>Sin almacenes para esta ubicación.</Text>
                            ) : null}
                        </>
                    )}

                    {/* Grupo */}
                    <Text style={styles.label}>Grupo de material</Text>
                    <Select<GrupoMaterialRow>
                        options={gruposActivos}
                        valueKey="id_grupo_material"
                        labelKey="nombre_grupo_material"
                        selectedValue={editIdGrupo}
                        onValueChange={(v) => setEditIdGrupo((v as number) ?? null)}
                        placeholder="Selecciona un grupo"
                        loading={loading}
                        disabled={loading || gruposActivos.length === 0}
                        style={styles.selectLikeFastman}
                    />
                    {gruposActivos.length === 0 ? <Text style={styles.metaMuted}>Sin grupos disponibles.</Text> : null}

                    {/* Material */}
                    <Text style={styles.label}>Material</Text>
                    <Select<MaterialOption>
                        options={materialOptions}
                        valueKey="id_material"
                        labelKey="label_material"
                        selectedValue={editIdMaterial}
                        onValueChange={(v) => setEditIdMaterial((v as number) ?? null)}
                        placeholder="Selecciona un material"
                        loading={loading}
                        disabled={loading || materialOptions.length === 0}
                        style={styles.selectLikeFastman}
                    />
                    {materialOptions.length === 0 ? (
                        <Text style={styles.metaMuted}>
                            {editExterno ? 'Sin materiales para este grupo.' : 'Sin materiales para este almacén/grupo.'}
                        </Text>
                    ) : null}

                    {/* Cantidades */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Cantidad planeada</Text>
                            <View style={styles.readonlyBox}>
                                <Text style={styles.readonlyText}>{editCantidadPlaneada}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>* Cantidad real</Text>
                            <TextInput
                                style={styles.input}
                                value={editCantidadReal}
                                onChangeText={setEditCantidadReal}
                                keyboardType="numeric"
                                placeholder="0.000"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Inventario SOLO si NO es externo */}
                    {!editExterno && (
                        <>
                            <Text style={styles.label}>Inventario del almacén</Text>
                            {invLoading ? (
                                <ActivityIndicator style={{ marginTop: 8 }} />
                            ) : !invRow ? (
                                <Text style={styles.metaMuted}>Sin existencias registradas para este material en este almacén.</Text>
                            ) : (
                                <View style={styles.readonlyBox}>
                                    <Text style={styles.readonlyText}>
                                        Existencia: {invRow.cantidad} {invRow.abreviatura_unidad ?? ''}
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.noteText}>
                                Restante: {restanteNum.toFixed(2)}
                                {faltanteNum > 0 ? ` | Faltante: ${faltanteNum.toFixed(2)}` : ''}
                            </Text>
                        </>
                    )}

                    {/* Costos (preview) */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Costo unitario</Text>
                            <View style={styles.readonlyBox}>
                                <Text style={styles.readonlyText}>{costoUnitarioNum.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Costo total</Text>
                            <View style={styles.readonlyBox}>
                                <Text style={styles.readonlyText}>{costoTotalNum.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.metaMuted}>* El egreso real se hace en “Registrar consumos”.</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnOutline]}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Text style={styles.btnOutlineText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave} disabled={loading}>
                            <Text style={styles.btnPrimaryText}>{loading ? 'Guardando…' : 'Guardar cambios'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#1B2A56',
    },
    label: { marginTop: 12, fontWeight: '800', color: '#1B2A56' },
    metaMuted: { marginTop: 8, color: '#666' },

    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1B2A56',
        marginTop: 6,
    },

    selectLikeFastman: { marginVertical: 6 },

    readonlyBox: {
        backgroundColor: '#F7F7FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D6D7E6',
        padding: 12,
        marginTop: 6,
    },
    readonlyText: { color: '#111', fontWeight: '700' },

    noteText: { marginTop: 10, color: '#1B2A56' },

    actions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        marginTop: 16,
        flexWrap: 'wrap',
    },
    btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
    btnOutline: { borderWidth: 1, borderColor: '#1B2A56', backgroundColor: '#FFF' },
    btnOutlineText: { color: '#1B2A56', fontWeight: '800' },
    btnPrimary: { backgroundColor: '#1B2A56' },
    btnPrimaryText: { color: '#FFF', fontWeight: '800' },

    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
});