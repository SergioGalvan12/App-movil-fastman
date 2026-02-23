// src/screens/reports/operativo/ProduccionReporteOperacionScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

import { fetchCodigosProductivosByGrupoEquipo, CodigoProductivo } from '../../../services/reports/operativos/codigoService';
import {
  fetchCatalogosByProducto,
  fetchClasificacionesByCatalogo,
  CatalogoClasificacionEvento,
  ClasificacionEvento
} from '../../../services/reports/operativos/clasificacionesProduccionService';
import { createProduccion, fetchProduccionByGuia, ProduccionRow } from '../../../services/reports/operativos/produccionService';

import type { AuthStackParamList } from '../../../src/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProduccionReporteOperacion'>;
type Option = { id: number; label: string };

export default function ProduccionReporteOperacionScreen({ route }: Props) {
  const params = route.params;

  const [loading, setLoading] = useState(false);

  // Listas
  const [codigos, setCodigos] = useState<CodigoProductivo[]>([]);
  const codigoOptions: Option[] = useMemo(
    () =>
      codigos
        .map((c) => ({
          id: c.id_codigo,
          label: c.nombre_producto ?? `Código ${c.id_codigo}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [codigos]
  );

  const [produccionRows, setProduccionRows] = useState<ProduccionRow[]>([]);

  // Form
  const [idCodigo, setIdCodigo] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [porcentajeMerma, setPorcentajeMerma] = useState('0.0');

  // Clasificaciones opcionales
  const [catalogos, setCatalogos] = useState<CatalogoClasificacionEvento[]>([]);
  const catalogoOptions: Option[] = useMemo(
    () => catalogos.map((c) => ({ id: c.id_catalogo_clasificacion, label: c.nombre_catalogo })),
    [catalogos]
  );

  const [idCatalogo, setIdCatalogo] = useState<number | null>(null);

  const [clasificaciones, setClasificaciones] = useState<ClasificacionEvento[]>([]);
  const clasifOptions: Option[] = useMemo(
    () =>
      clasificaciones
        .map((x) => ({ id: x.id_clasificacion, label: x.nombre_clasificacion }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [clasificaciones]
  );

  const [idClasificacion, setIdClasificacion] = useState<number | null>(null);

  // Carga inicial: productos por grupo_equipo + produccion existente
  useEffect(() => {
    if (!params?.id_guia || !params?.id_grupo_equipo) return;

    (async () => {
      setLoading(true);

      const [cResp, pResp] = await Promise.all([
        fetchCodigosProductivosByGrupoEquipo(params.id_grupo_equipo),
        fetchProduccionByGuia(params.id_guia),
      ]);

      if (cResp.success && cResp.data) setCodigos(cResp.data);
      else showToast('error', 'Productos', cResp.error ?? 'No se pudieron cargar productos');

      if (pResp.success && pResp.data) setProduccionRows(pResp.data);

      setLoading(false);
    })();
  }, [params?.id_guia, params?.id_grupo_equipo]);

  // Cuando seleccionas producto/código → cargar catálogos por id_producto
  useEffect(() => {
    const codigo = codigos.find((c) => c.id_codigo === idCodigo);
    const idProducto = codigo?.id_producto;

    // reset dependencias
    setCatalogos([]);
    setIdCatalogo(null);
    setClasificaciones([]);
    setIdClasificacion(null);

    if (!idProducto) return;

    (async () => {
      const resp = await fetchCatalogosByProducto(idProducto);
      if (resp.success && resp.data) setCatalogos(resp.data);
      else showToast('error', 'Catálogos', resp.error ?? 'No se pudieron cargar catálogos');
    })();
  }, [idCodigo, codigos]);

  // Cuando eliges catálogo → cargar subclasificaciones
  useEffect(() => {
    setClasificaciones([]);
    setIdClasificacion(null);
    if (!idCatalogo) return;

    (async () => {
      const resp = await fetchClasificacionesByCatalogo(idCatalogo);
      if (resp.success && resp.data) setClasificaciones(resp.data);
      else showToast('error', 'Clasificaciones', resp.error ?? 'No se pudieron cargar clasificaciones');
    })();
  }, [idCatalogo]);

  const handleAddProduccion = async () => {
    if (!params?.id_guia || !params?.id_empresa) {
      showToast('error', 'Faltan datos', 'No llegó id_guia / id_empresa');
      return;
    }
    if (!idCodigo) {
      showToast('error', 'Producto', 'Selecciona un producto');
      return;
    }

    const codigo = codigos.find((c) => c.id_codigo === idCodigo);
    if (!codigo) {
      showToast('error', 'Producto', 'Código inválido');
      return;
    }

    const qty = Number.parseFloat(cantidad);
    if (!Number.isFinite(qty) || qty <= 0) {
      showToast('error', 'Cantidad', 'Ingresa una cantidad válida');
      return;
    }

    const payload = {
      id_produccion: null,
      id_empresa: params.id_empresa,
      id_guia: params.id_guia,
      id_codigo: idCodigo,
      cantidad: String(cantidad),
      unidad_control: codigo.unidad_control ?? null,
      status_produccion: true,
      porcentaje_merma: String(porcentajeMerma ?? '0.0'),
      nombre_producto: codigo.nombre_producto ?? null,

      // opcional
      clasificaciones: idCatalogo && idClasificacion ? [{ id_catalogo: idCatalogo, id_clasificacion: idClasificacion }] : [],
      nuevas_clasificaciones: idClasificacion ? [idClasificacion] : [],
    };

    setLoading(true);

    const resp = await createProduccion(payload);
    if (!resp.success) {
      setLoading(false);
      showToast('error', 'Producción', resp.error ?? 'No se pudo guardar');
      return;
    }

    // Refrescar producción
    const list = await fetchProduccionByGuia(params.id_guia);
    if (list.success && list.data) setProduccionRows(list.data);

    // Reset mínimo
    setCantidad('1');
    setPorcentajeMerma('0.0');
    setIdCatalogo(null);
    setIdClasificacion(null);

    setLoading(false);
    showToast('success', 'Producción', 'Se añadió la producción');
  };

  return (
    <ReportScreenLayout>
      <HeaderWithBack title="Producción" />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <Text style={styles.label}>* Producto</Text>
      <Select<Option>
        options={codigoOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={idCodigo}
        onValueChange={(v) => setIdCodigo(v as number)}
        placeholder="Selecciona un producto"
      />

      <Text style={styles.label}>Cantidad</Text>
      <TextInput style={styles.input} value={cantidad} onChangeText={setCantidad} keyboardType="numeric" />

      <Text style={styles.label}>% de merma</Text>
      <TextInput style={styles.input} value={porcentajeMerma} onChangeText={setPorcentajeMerma} keyboardType="numeric" />

      <Text style={[styles.label, { marginTop: 18 }]}>Clasificación (opcional)</Text>

      <Text style={styles.subLabel}>Catálogo</Text>
      <Select<Option>
        options={catalogoOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={idCatalogo}
        onValueChange={(v) => setIdCatalogo(v as number)}
        placeholder={idCodigo ? 'Selecciona un catálogo' : 'Selecciona producto primero'}
        disabled={!idCodigo || catalogoOptions.length === 0}
      />

      <Text style={styles.subLabel}>Subclasificación</Text>
      <Select<Option>
        options={clasifOptions}
        valueKey="id"
        labelKey="label"
        selectedValue={idClasificacion}
        onValueChange={(v) => setIdClasificacion(v as number)}
        placeholder={idCatalogo ? 'Selecciona subclasificación' : 'Selecciona catálogo primero'}
        disabled={!idCatalogo || clasifOptions.length === 0}
      />

      <TouchableOpacity style={styles.btn} onPress={handleAddProduccion} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Guardando…' : 'Añadir producción'}</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Producción registrada</Text>
      {produccionRows.length === 0 ? (
        <Text style={styles.empty}>Sin producción aún</Text>
      ) : (
        produccionRows.map((p) => (
          <View key={p.id_produccion} style={styles.row}>
            <Text style={styles.rowTitle}>{p.nombre_producto ?? `Producción ${p.id_produccion}`}</Text>
            <Text style={styles.rowMeta}>
              Cantidad: {p.cantidad} | Merma: {p.porcentaje_merma}%
            </Text>
          </View>
        ))
      )}
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 14, color: '#1B2A56' },
  subLabel: { fontSize: 13, marginTop: 10, color: '#1B2A56', fontWeight: '600' },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1B2A56', marginTop: 6 },
  btn: { marginTop: 18, backgroundColor: '#1B2A56', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#1B2A56', marginTop: 22 },
  empty: { marginTop: 10, color: '#555' },
  row: { backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#1B2A56' },
  rowTitle: { color: '#1B2A56', fontWeight: '700' },
  rowMeta: { marginTop: 4, color: '#333' },
});