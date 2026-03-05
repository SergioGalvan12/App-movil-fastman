import React, { useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { showToast } from '../../../services/notifications/ToastService';

import {
    fetchConsumosByGuia,
    deleteConsumoSoft,
    type ConsumoRow,
} from '../../../services/reports/operativos/consumoService';

import {
    fetchProduccionByGuia,
    type ProduccionRow,
} from '../../../services/reports/operativos/produccionService';

import type { OperativoStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<OperativoStackParamList, 'ConsumosReporteOperacion'>;

function safeNumber(v: any) {
    const n = parseFloat(String(v ?? '0'));
    return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: any) {
    const n = safeNumber(value);
    return `$${n.toFixed(2)}`;
}

function formatQty(qty: string | null | undefined, unidad: string | null | undefined) {
    const q = String(qty ?? '0.000');
    const u = (unidad ?? '').trim();
    return u ? `${q} ${u}` : q;
}

export default function ConsumosReporteOperacionScreen({ route, navigation }: Props) {
    const { id_guia } = route.params;

    const [loading, setLoading] = useState(false);
    const [consumos, setConsumos] = useState<ConsumoRow[]>([]);
    const [producciones, setProducciones] = useState<ProduccionRow[]>([]);

    const produccionMap = useMemo(() => {
        const map = new Map<number, ProduccionRow>();
        for (const p of producciones) map.set(p.id_produccion, p);
        return map;
    }, [producciones]);

    const getProductoLabel = useCallback(
        (c: ConsumoRow) => {
            if (!c.produccion) return 'No especificado';
            const p = produccionMap.get(c.produccion);
            const nombre = (p?.nombre_producto ?? '').trim();
            return nombre.length > 0 ? nombre : 'No especificado';
        },
        [produccionMap]
    );

    const getMaterialLabel = useCallback((c: ConsumoRow) => {
        const nombre = (c.nombre_material ?? '').trim();
        if (nombre.length > 0) return nombre;
        if (c.id_material) return `Material #${c.id_material}`;
        return 'Material no especificado';
    }, []);

    const getRegistradoLabel = useCallback((c: ConsumoRow) => {
        return c.egresado ? 'Completo' : 'Pendiente';
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [cRes, pRes] = await Promise.allSettled([
                fetchConsumosByGuia(id_guia),
                fetchProduccionByGuia(id_guia),
            ]);

            if (cRes.status === 'fulfilled') {
                const resp = cRes.value;
                if (resp.success && resp.data) setConsumos(resp.data);
                else showToast('error', 'Consumos', resp.error ?? 'No se pudieron cargar consumos');
            } else {
                console.error('[Consumos] fetchConsumosByGuia error:', cRes.reason);
                showToast('error', 'Consumos', 'Error cargando consumos');
            }

            if (pRes.status === 'fulfilled') {
                const resp = pRes.value;
                if (resp.success && resp.data) setProducciones(resp.data);
                else setProducciones([]);
            } else {
                console.error('[Consumos] fetchProduccionByGuia error:', pRes.reason);
                setProducciones([]);
            }
        } catch (e: any) {
            console.error('[Consumos] refresh error:', e);
            showToast('error', 'Consumos', e?.message ?? 'Error cargando consumos');
        } finally {
            setLoading(false);
        }
    }, [id_guia]);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    const confirmDelete = useCallback(
        (c: ConsumoRow) => {
            Alert.alert(
                'Eliminar consumo',
                '¿Seguro que deseas eliminar este consumo? Esto solo lo oculta del reporte (no descuenta inventario).',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                            setLoading(true);
                            try {
                                const resp = await deleteConsumoSoft(c.id_consumo);
                                if (!resp.success) {
                                    showToast('error', 'Eliminar', resp.error ?? 'No se pudo eliminar');
                                    return;
                                }
                                await refresh();
                                showToast('success', 'Eliminar', 'Consumo eliminado');
                            } catch (e: any) {
                                console.error('[Eliminar consumo] error:', e);
                                showToast('error', 'Eliminar', e?.message ?? 'Error eliminando');
                            } finally {
                                setLoading(false);
                            }
                        },
                    },
                ]
            );
        },
        [refresh]
    );

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Lista de consumos" />

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

            <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { alignSelf: 'flex-end', marginTop: 10 }]}
                onPress={() =>
                    navigation.navigate('CrearConsumoReporteOperacion', {
                        id_guia,
                        id_empresa: route.params.id_empresa,
                        id_ubicacion: route.params.id_ubicacion,
                    })
                }
                disabled={loading}
            >
                <Text style={styles.btnPrimaryText}>+ Nuevo consumo</Text>
            </TouchableOpacity>

            {consumos.length === 0 ? (
                <Text style={styles.empty}>Sin consumos</Text>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {consumos.map((c) => {
                        const producto = getProductoLabel(c);
                        const material = getMaterialLabel(c);

                        const planeada = formatQty(c.cantidad_planeada, c.abreviatura_unidad);
                        const real = formatQty(c.cantidad_consumo, c.abreviatura_unidad);

                        const costo = formatMoney(c.costo);
                        const registrado = getRegistradoLabel(c);

                        return (
                            <View key={c.id_consumo} style={styles.card}>
                                <Text style={styles.title}>{material}</Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Producto: </Text>
                                    {producto}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Material: </Text>
                                    {material}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Cantidad planeada: </Text>
                                    {planeada}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Cantidad real: </Text>
                                    {real}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Costo: </Text>
                                    {costo}
                                </Text>

                                <Text style={styles.meta}>
                                    <Text style={styles.k}>Consumo registrado: </Text>
                                    {registrado}
                                </Text>

                                {!!c.produccion && (
                                    <Text style={styles.metaMuted}>Derivado de producción #{c.produccion}</Text>
                                )}

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnOutline]}
                                        onPress={() =>
                                            navigation.navigate('EditarConsumoReporteOperacion', {
                                                id_consumo: c.id_consumo,
                                                id_guia,
                                                id_empresa: route.params.id_empresa,
                                                id_ubicacion: route.params.id_ubicacion,
                                            })
                                        }
                                        disabled={loading}
                                    >
                                        <Text style={styles.btnOutlineText}>Editar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnDanger]}
                                        onPress={() => confirmDelete(c)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.btnDangerText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    empty: { marginTop: 10, color: '#555' },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#1B2A56',
    },

    title: { color: '#1B2A56', fontWeight: '900' },

    meta: { marginTop: 6, color: '#333' },
    metaMuted: { marginTop: 8, color: '#666' },

    k: { color: '#1B2A56', fontWeight: '800' },

    actions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        marginTop: 12,
        flexWrap: 'wrap',
    },

    btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
    btnOutline: { borderWidth: 1, borderColor: '#1B2A56', backgroundColor: '#FFF' },
    btnOutlineText: { color: '#1B2A56', fontWeight: '800' },
    btnDanger: { backgroundColor: '#B00020' },
    btnDangerText: { color: '#FFF', fontWeight: '800' },
    btnPrimary: { backgroundColor: '#1B2A56' },
    btnPrimaryText: { color: '#FFF', fontWeight: '800' },
});