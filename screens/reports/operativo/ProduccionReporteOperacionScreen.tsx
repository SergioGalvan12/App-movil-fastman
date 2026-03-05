import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchCodigosProductivosByGrupoEquipo, CodigoProductivo } from '../../../services/reports/operativos/codigoService';
import {
  fetchCatalogosByProducto,
  fetchClasificacionesByCatalogo,
  CatalogoClasificacionEvento,
  ClasificacionEvento
} from '../../../services/reports/operativos/clasificacionesProduccionService';
import {
  createProduccion,
  fetchProduccionByGuia,
  patchProduccion,
  deleteProduccionSoft,
  ProduccionRow
} from '../../../services/reports/operativos/produccionService';

import type {
  OperativoStackParamList,
  AuthStackParamList,
} from '../../../src/navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<OperativoStackParamList, 'ProduccionReporteOperacion'>,
  NativeStackScreenProps<AuthStackParamList, 'Operativo'>
>;
type Option = { id: number; label: string };

export default function ProduccionReporteOperacionScreen({ route, navigation }: Props) {
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

  // Form (crear)
  const [idCodigo, setIdCodigo] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [porcentajeMerma, setPorcentajeMerma] = useState('0.0');

  // Clasificaciones opcionales (crear)
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

  // ====== estado para editar ======
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ProduccionRow | null>(null);
  const [editCantidad, setEditCantidad] = useState('1');
  const [editMerma, setEditMerma] = useState('0.0');

  const refreshProduccion = async () => {
    if (!params?.id_guia) return;

    const list = await fetchProduccionByGuia(params.id_guia);
    if (list.success && list.data) {
      setProduccionRows(list.data);
      // Marcar en el menú secuencial si ya hay producción
      const ok = list.data.length > 0;
    }
  };

  // Carga inicial: productos por grupo_equipo + produccion existente
  useEffect(() => {
    if (!params?.id_guia || !params?.id_grupo_equipo) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [cResp, pResp] = await Promise.all([
          fetchCodigosProductivosByGrupoEquipo(params.id_grupo_equipo),
          fetchProduccionByGuia(params.id_guia),
        ]);

        if (!mounted) return;

        if (cResp.success && cResp.data) setCodigos(cResp.data);
        else showToast('error', 'Productos', cResp.error ?? 'No se pudieron cargar productos');

        if (pResp.success && pResp.data) setProduccionRows(pResp.data);
        else if (!pResp.success) showToast('error', 'Producción', pResp.error ?? 'No se pudo cargar producción');
      } catch (e: any) {
        if (!mounted) return;
        console.error('[Produccion] load error:', e);
        showToast('error', 'Error', e?.message ?? 'Error cargando Producción');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
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

  // Cuando se elige catálogo → cargar subclasificaciones
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

    const m = Number.parseFloat(porcentajeMerma || '0');
    if (!Number.isFinite(m) || m < 0) {
      showToast('error', 'Merma', 'Ingresa una merma válida (>= 0)');
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

    await refreshProduccion();
    setCantidad('1');
    setPorcentajeMerma('0.0');
    setIdCatalogo(null);
    setIdClasificacion(null);
    setLoading(false);
    showToast('success', 'Producción', 'Se añadió la producción');
  };

  // ====== abrir editor ======
  const openEdit = (row: ProduccionRow) => {
    setEditing(row);
    setEditCantidad(String(row.cantidad ?? '1'));
    setEditMerma(String(row.porcentaje_merma ?? '0.0'));
    setEditOpen(true);
  };

  // ====== guardar edición ======
  const handleSaveEdit = async () => {
    if (!editing) return;

    const qty = Number.parseFloat(editCantidad);
    if (!Number.isFinite(qty) || qty <= 0) {
      showToast('error', 'Cantidad', 'Ingresa una cantidad válida (> 0)');
      return;
    }

    const m = Number.parseFloat(editMerma || '0');
    if (!Number.isFinite(m) || m < 0) {
      showToast('error', 'Merma', 'Ingresa una merma válida (>= 0)');
      return;
    }

    setLoading(true);

    const resp = await patchProduccion(editing.id_produccion, {
      cantidad: String(editCantidad),
      porcentaje_merma: String(editMerma),
    });

    if (!resp.success) {
      setLoading(false);
      showToast('error', 'Editar', resp.error ?? 'No se pudo editar');
      return;
    }

    await refreshProduccion();
    setLoading(false);

    setEditOpen(false);
    setEditing(null);
    showToast('success', 'Editar', 'Cambios guardados');
  };

  // ====== eliminar (soft) ======
  const handleDelete = (row: ProduccionRow) => {
    Alert.alert(
      'Eliminar producción',
      '¿Seguro que deseas eliminar esta producción? Si generó consumos predeterminados, estos también seran eliminados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);

            const resp = await deleteProduccionSoft(row.id_produccion);
            if (!resp.success) {
              setLoading(false);
              showToast('error', 'Eliminar', resp.error ?? 'No se pudo eliminar');
              return;
            }

            await refreshProduccion();
            setLoading(false);
            showToast('success', 'Eliminar', 'Producción eliminada');
          },
        },
      ]
    );
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

            {/* acciones */}
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => openEdit(p)}
                disabled={loading}
              >
                <Text style={styles.actionTextOutline}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() => handleDelete(p)}
                disabled={loading}
              >
                <Text style={styles.actionTextDanger}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal edición */}
      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar producción</Text>

            <Text style={styles.modalLabel}>Cantidad</Text>
            <TextInput
              style={styles.input}
              value={editCantidad}
              onChangeText={setEditCantidad}
              keyboardType="numeric"
            />

            <Text style={styles.modalLabel}>% de merma</Text>
            <TextInput
              style={styles.input}
              value={editMerma}
              onChangeText={setEditMerma}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => setEditOpen(false)}
                disabled={loading}
              >
                <Text style={styles.actionTextOutline}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={handleSaveEdit}
                disabled={loading}
              >
                <Text style={styles.actionTextPrimary}>{loading ? 'Guardando…' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  rowActions: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'flex-end' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  actionBtnOutline: { borderWidth: 1, borderColor: '#1B2A56', backgroundColor: '#FFF' },
  actionBtnPrimary: { backgroundColor: '#1B2A56' },
  actionBtnDanger: { backgroundColor: '#B00020' },

  actionTextOutline: { color: '#1B2A56', fontWeight: '700' },
  actionTextPrimary: { color: '#FFF', fontWeight: '700' },
  actionTextDanger: { color: '#FFF', fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1B2A56' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1B2A56' },
  modalLabel: { marginTop: 12, fontWeight: '700', color: '#1B2A56' },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 16 },
});