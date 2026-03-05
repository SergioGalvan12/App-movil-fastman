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

import { createConsumo } from '../../../services/reports/operativos/consumoService';

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

import {
    fetchMaterialesByGrupo,
    fetchMaterialesByGrupoAndAlmacen,
    type MaterialRow,
} from '../../../services/reports/catalogos/materialService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type MaterialOption = MaterialRow & { label_material: string };
type Props = NativeStackScreenProps<OperativoStackParamList, 'CrearConsumoReporteOperacion'>;

function safeNumber(v: any) {
    const n = parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
}

export default function CrearConsumoReporteOperacionScreen({ route, navigation }: Props) {
    const { id_guia, id_empresa, id_ubicacion } = route.params;

    const [loading, setLoading] = useState(false);

    // catálogos
    const [almacenes, setAlmacenes] = useState<AlmacenRow[]>([]);
    const [grupos, setGrupos] = useState<GrupoMaterialRow[]>([]);
    const [materiales, setMateriales] = useState<MaterialRow[]>([]);

    // inputs
    const [editCantidadPlaneada, setEditCantidadPlaneada] = useState('0.000');
    const [editCantidadReal, setEditCantidadReal] = useState('0.000');
    const [editExterno, setEditExterno] = useState(false);

    // costo unitario cuando es externo (editable)
    const [unitCostExterno, setUnitCostExterno] = useState('0.00');

    // selección
    const [editIdAlmacen, setEditIdAlmacen] = useState<number | null>(null);
    const [editIdGrupo, setEditIdGrupo] = useState<number | null>(null);
    const [editIdMaterial, setEditIdMaterial] = useState<number | null>(null);

    // inventario
    const [invRow, setInvRow] = useState<AlmacenMaterialRow | null>(null);
    const [invLoading, setInvLoading] = useState(false);

    const almacenesActivos = useMemo(() => almacenes.filter((a) => a.status), [almacenes]);
    const gruposActivos = useMemo(() => grupos.filter((g) => g.status_grupo_material), [grupos]);

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

    const loadCatalogosBase = useCallback(async () => {
        setLoading(true);
        try {
            const [aResp, gResp] = await Promise.all([
                fetchAlmacenesByUbicacion(id_ubicacion),
                fetchGrupoMateriales(),
            ]);

            if (aResp.success && aResp.data) setAlmacenes(aResp.data);
            else showToast('error', 'Almacenes', aResp.error ?? 'No se pudieron cargar almacenes');

            if (gResp.success && gResp.data) setGrupos(gResp.data);
            else showToast('error', 'Grupos', gResp.error ?? 'No se pudieron cargar grupos');

            // CREAR: iniciar en placeholders (sin selección)
            setEditIdAlmacen(null);
            setEditIdGrupo(null);
            setEditIdMaterial(null);
            setMateriales([]);
            setInvRow(null);
            setUnitCostExterno('0.00');
            setEditCantidadPlaneada('0.000');
            setEditCantidadReal('0.000');
        } catch (e: any) {
            console.error('[CrearConsumo] loadCatalogosBase error:', e);
            showToast('error', 'Consumo', e?.message ?? 'Error cargando catálogos');
        } finally {
            setLoading(false);
        }
    }, [id_ubicacion]);

    useFocusEffect(
        useCallback(() => {
            loadCatalogosBase();
        }, [loadCatalogosBase])
    );

    /**
     * Al cambiar externo/interno:
     * - Se limpia dependencias de material/inventario
     */
    useEffect(() => {
        setEditIdMaterial(null);
        setMateriales([]);
        setInvRow(null);

        // si cambia a consumo externo, ya no aplica inventario
        if (editExterno) {
            setInvLoading(false);
        }
    }, [editExterno]);

    /**
     *  Al cambiar grupo:
     * - resetea material + inventario
     * - y carga materiales según modo:
     *   - externo: materiales por grupo (sin almacén)
     *   - interno: requiere almacén + grupo
     */
    useEffect(() => {
        let mounted = true;

        (async () => {
            setMateriales([]);
            setEditIdMaterial(null);
            setInvRow(null);

            if (!editIdGrupo) return;

            // interno: exige almacén
            if (!editExterno && !editIdAlmacen) return;

            setLoading(true);
            try {
                const resp = editExterno
                    ? await fetchMaterialesByGrupo(editIdGrupo)
                    : await fetchMaterialesByGrupoAndAlmacen(editIdGrupo, editIdAlmacen as number);

                if (!mounted) return;

                if (resp.success && resp.data) {
                    setMateriales(resp.data);
                    // Modo CREAR: NO autoseleccionar material
                    setEditIdMaterial(null);
                } else {
                    showToast('error', 'Materiales', resp.error ?? 'No se pudieron cargar materiales');
                }
            } catch (e: any) {
                if (!mounted) return;
                console.error('[CrearConsumo] materiales error:', e);
                showToast('error', 'Materiales', e?.message ?? 'Error cargando materiales');
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [editIdGrupo, editIdAlmacen, editExterno]);

    /**
     * Inventario: solo modo interno y cuando haya almacén + material
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
                console.error('[CrearConsumo] inventario error:', e);
                showToast('error', 'Inventario', e?.message ?? 'Error cargando inventario');
            } finally {
                if (mounted) setInvLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [editIdMaterial, editIdAlmacen, editExterno]);

    // ===== cálculos =====
    const consumoInicio = useMemo(() => String(invRow?.cantidad ?? '0.000'), [invRow?.cantidad]);

    const realNum = useMemo(() => safeNumber(editCantidadReal), [editCantidadReal]);
    const disponibleNum = useMemo(() => safeNumber(invRow?.cantidad), [invRow?.cantidad]);

    const costoUnitarioInventarioNum = useMemo(() => safeNumber(invRow?.costo), [invRow?.costo]);
    const costoUnitarioExternoNum = useMemo(() => safeNumber(unitCostExterno), [unitCostExterno]);

    const costoUnitarioNum = useMemo(
        () => (editExterno ? costoUnitarioExternoNum : costoUnitarioInventarioNum),
        [editExterno, costoUnitarioExternoNum, costoUnitarioInventarioNum]
    );

    const costoTotalNum = useMemo(() => realNum * costoUnitarioNum, [realNum, costoUnitarioNum]);

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

    const handleSave = useCallback(async () => {
        // Validaciones mínimas de selección
        if (!editIdGrupo) {
            showToast('error', 'Grupo', 'Selecciona un grupo');
            return;
        }
        if (!editIdMaterial) {
            showToast('error', 'Material', 'Selecciona un material');
            return;
        }

        // interno: requiere almacén
        if (!editExterno && !editIdAlmacen) {
            showToast('error', 'Almacén', 'Selecciona un almacén');
            return;
        }

        const qtyReal = parseFloat(editCantidadReal);
        if (!Number.isFinite(qtyReal) || qtyReal < 0) {
            showToast('error', 'Cantidad real', 'Ingresa una cantidad válida (>= 0)');
            return;
        }

        const qtyPlan = parseFloat(editCantidadPlaneada);
        if (!Number.isFinite(qtyPlan) || qtyPlan < 0) {
            showToast('error', 'Cantidad planeada', 'Ingresa una cantidad válida (>= 0)');
            return;
        }

        // interno: sí requiere inventario
        if (!editExterno && !invRow) {
            showToast('error', 'Inventario', 'No hay inventario para ese material en el almacén seleccionado');
            return;
        }

        const costoInvNum = editExterno ? safeNumber(unitCostExterno) : safeNumber(invRow?.costo);

        setLoading(true);
        try {
            const resp = await createConsumo({
                id_consumo: 0,
                id_empresa,
                id_guia,
                produccion: route.params.produccion ?? null,
                id_material: editIdMaterial,
                id_almacen: editExterno ? 0 : (editIdAlmacen as number),
                consumo_inicio_consumo: consumoInicio,
                cantidad_planeada: editCantidadPlaneada,
                cantidad_consumo: editCantidadReal,

                costo: editExterno ? '0.00' : String(invRow?.costo ?? '0.00'),
                costo_inventario: costoInvNum,

                externo: !!editExterno,
                egresado: false,
            });

            if (!resp.success) {
                showToast('error', 'Crear consumo', resp.error ?? 'No se pudo crear');
                return;
            }

            showToast('success', 'Crear consumo', 'Consumo creado');
            navigation.goBack();
        } catch (e: any) {
            console.error('[CrearConsumo] error:', e);
            showToast('error', 'Crear consumo', e?.message ?? 'Error creando consumo');
        } finally {
            setLoading(false);
        }
    }, [
        editIdGrupo,
        editIdMaterial,
        editIdAlmacen,
        editCantidadReal,
        editCantidadPlaneada,
        editExterno,
        invRow,
        unitCostExterno,
        consumoInicio,
        id_empresa,
        id_guia,
        navigation,
        route.params.produccion,
    ]);

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Información del consumo" />

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.card}>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Consumo externo</Text>
                        <Switch value={editExterno} onValueChange={setEditExterno} disabled={loading} />
                    </View>

                    <Text style={styles.label}>Producto</Text>
                    <Select
                        options={[{ id: 0, nombre: 'Sin producto asignado' }]}
                        valueKey="id"
                        labelKey="nombre"
                        selectedValue={0}
                        onValueChange={() => { }}
                        disabled
                        placeholder="Selecciona un producto"
                        style={styles.selectLikeFastman}
                    />

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
                                loading={false}
                                disabled={loading || almacenesActivos.length === 0}
                                style={styles.selectLikeFastman}
                            />
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
                        loading={false}
                        disabled={loading || gruposActivos.length === 0}
                        style={styles.selectLikeFastman}
                    />

                    {/* Material */}
                    <Text style={styles.label}>Material</Text>
                    <Select<MaterialOption>
                        options={materialOptions}
                        valueKey="id_material"
                        labelKey="label_material"
                        selectedValue={editIdMaterial}
                        onValueChange={(v) => setEditIdMaterial((v as number) ?? null)}
                        placeholder="Selecciona un material"
                        loading={false}
                        disabled={loading || materialOptions.length === 0 || !editIdGrupo || (!editExterno && !editIdAlmacen)}
                        style={styles.selectLikeFastman}
                    />
                    {!editIdGrupo ? (
                        <Text style={styles.metaMuted}>Selecciona un grupo para ver materiales.</Text>
                    ) : (!editExterno && !editIdAlmacen) ? (
                        <Text style={styles.metaMuted}>Selecciona un almacén para ver materiales.</Text>
                    ) : materialOptions.length === 0 ? (
                        <Text style={styles.metaMuted}>Sin materiales para los filtros seleccionados.</Text>
                    ) : null}

                    {/* Cantidades */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Cantidad planeada</Text>
                            <TextInput
                                style={styles.input}
                                value={editCantidadPlaneada}
                                onChangeText={setEditCantidadPlaneada}
                                keyboardType="numeric"
                                placeholder="0.000"
                                editable={!loading}
                            />
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

                    {/* Inventario solo interno */}
                    {!editExterno && (
                        <>
                            <Text style={styles.label}>Inventario del almacén</Text>
                            {invLoading ? (
                                <ActivityIndicator style={{ marginTop: 8 }} />
                            ) : !editIdMaterial || !editIdAlmacen ? (
                                <Text style={styles.metaMuted}>Selecciona almacén y material para ver inventario.</Text>
                            ) : !invRow ? (
                                <Text style={styles.metaMuted}>Sin existencias registradas para este material en este almacén.</Text>
                            ) : (
                                <View style={styles.readonlyBox}>
                                    <Text style={styles.readonlyText}>
                                        Existencia: {invRow.cantidad} {invRow.abreviatura_unidad ?? ''}
                                    </Text>
                                </View>
                            )}

                            {!!invRow && (
                                <Text style={styles.noteText}>
                                    Restante: {restanteNum.toFixed(2)}
                                    {faltanteNum > 0 ? ` | Faltante: ${faltanteNum.toFixed(2)}` : ''}
                                </Text>
                            )}
                        </>
                    )}

                    {/* Costos */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Costo unitario</Text>
                            {editExterno ? (
                                <TextInput
                                    style={styles.input}
                                    value={unitCostExterno}
                                    onChangeText={setUnitCostExterno}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    editable={!loading}
                                />
                            ) : (
                                <View style={styles.readonlyBox}>
                                    <Text style={styles.readonlyText}>{costoUnitarioInventarioNum.toFixed(2)}</Text>
                                </View>
                            )}
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

                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.btnPrimaryText}>
                                {loading ? 'Guardando…' : '+ Crear consumo'}
                            </Text>
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

    selectLikeFastman: {
        marginVertical: 6,
    },

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