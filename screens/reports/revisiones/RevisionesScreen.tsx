// screens/reports/revisiones/RevisionesScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchPersonals, Personal } from '../../../services/reports/personal/personalService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../../services/reports/equipos/equipoService';

import { fetchMarcas, Marca } from '../../../services/reports/catalogos/marcaService';
import { fetchModelos, Modelo } from '../../../services/reports/catalogos/modeloService';

import { createCheckLog, CreateCheckLogPayload } from '../../../services/reports/revisiones/checkLogService';
import { fetchRevisionesPorGrupo, RevisionPlantilla } from '../../../services/reports/revisiones/revisionPlantillaService';

import { useAuth } from '../../../contexts/AuthContext';

type EstadoCheck = 'MAL' | 'REGULAR' | 'BIEN';

/** Formatea fecha en UTC (AAAA-MM-DD) para el backend */
const formatUTCDate = (d: Date) => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Convierte valores del Picker a número o null (evita strings como "5" o "") */
const toNumOrNull = (v: any) =>
  v === null || v === undefined || v === '' ? null : Number(v);

/** Chequeo de entero positivo */
const isPosInt = (v: any) => typeof v === 'number' && Number.isInteger(v) && v > 0;

export default function RevisionesScreen() {
  const { empresaId, personalId } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  // --------- catálogos ----------
  const [turnos, setTurnos] = useState<TurnoInterface[]>([]);
  const [personales, setPersonales] = useState<Personal[]>([]);
  const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
  const [equiposAll, setEquiposAll] = useState<Equipo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);

  // revisiones (dependen del grupo)
  const [revisiones, setRevisiones] = useState<RevisionPlantilla[]>([]);
  const [loadingRevisiones, setLoadingRevisiones] = useState(false);
  const [errorRevisiones, setErrorRevisiones] = useState('');

  // --------- selección ----------
  const [fecha, setFecha] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState(false);

  const [idTurno, setIdTurno] = useState<number | null>(null);
  const [idPersonal, setIdPersonal] = useState<number | null>(null);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);
  const [idEquipo, setIdEquipo] = useState<number | null>(null);

  const [idMarca, setIdMarca] = useState<number | null>(null);
  const [idModelo, setIdModelo] = useState<number | null>(null);

  const [idRevisionSel, setIdRevisionSel] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoCheck>('BIEN'); // default como web
  const [observaciones, setObservaciones] = useState('');

  // Autoselect rápido con el personal logueado (si viene en la sesión)
  useEffect(() => {
    if (isPosInt(Number(personalId))) setIdPersonal(Number(personalId));
  }, [personalId]);

  // Carga inicial de catálogos
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [t, p, g, e, mk, ml] = await Promise.all([
        fetchTurnos(),
        fetchPersonals(),
        fetchGrupoEquipos(),
        fetchEquipos(),
        fetchMarcas(),
        fetchModelos(),
      ]);
      if (!mounted) return;

      if (t.success && t.data) setTurnos(t.data);
      if (p.success && p.data) setPersonales(p.data);
      if (g.success && g.data) setGrupos(g.data);
      if (e.success && e.data) setEquiposAll(e.data);
      if (mk.success && mk.data) setMarcas(mk.data);
      if (ml.success && ml.data) setModelos(ml.data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Equipos filtrados por grupo
  const equipos = useMemo(
    () => (!idGrupo ? equiposAll : equiposAll.filter((e) => e.id_grupo_equipo === idGrupo)),
    [equiposAll, idGrupo]
  );

  // Opciones de personal con PK numérica (_id_pk) + nombre_completo
  const personalOptions = useMemo(() => {
    return personales
      .map((p) => {
        const anyP: any = p;
        const idPk =
          (typeof anyP.id_personal === 'number' && anyP.id_personal) ||
          (typeof anyP.id === 'number' && anyP.id) ||
          (typeof anyP.id_equipo === 'number' && anyP.id_equipo) ||
          null;

        return {
          ...p,
          _id_pk: idPk,
          nombre_completo: `${p.nombre_personal} ${p.apaterno_personal ?? ''} ${p.amaterno_personal ?? ''}`
            .replace(/\s+/g, ' ')
            .trim(),
        };
      })
      .filter((p) => p._id_pk !== null);
  }, [personales]);

  // Si sólo hay 1 personal y no viene en sesión, autoselect con su _id_pk
  useEffect(() => {
    if (!personalId && personalOptions.length === 1) {
      setIdPersonal(personalOptions[0]._id_pk);
    }
  }, [personalOptions, personalId]);

  // Al cambiar grupo → limpiar dependientes y obtener revisiones del grupo
  useEffect(() => {
    setIdEquipo(null);
    setIdRevisionSel(null);
    setObservaciones('');
    if (!idGrupo) {
      setRevisiones([]);
      return;
    }

    (async () => {
      try {
        setLoadingRevisiones(true);
        setErrorRevisiones('');
        const r = await fetchRevisionesPorGrupo(idGrupo);
        setRevisiones(r.success && r.data ? r.data : []);
        if (!r.success) setErrorRevisiones(r.error || 'No se pudieron cargar revisiones');
      } finally {
        setLoadingRevisiones(false);
      }
    })();
  }, [idGrupo]);

  // Observaciones base desde la revisión seleccionada
  useEffect(() => {
    if (!idRevisionSel) {
      setObservaciones('');
      return;
    }
    const sel = revisiones.find((r) => r.id_revision === idRevisionSel);
    setObservaciones(sel?.descripcion_revision || '');
  }, [idRevisionSel, revisiones]);

  const onChangeDate = (_: any, selected?: Date) => {
    setShowDate(false);
    if (selected) setFecha(selected);
  };

  // Derivar nombre de la revisión (para elemento_check)
  const nombreRevision = useMemo(
    () => (revisiones.find((r) => r.id_revision === idRevisionSel)?.nombre_revision || '').trim(),
    [revisiones, idRevisionSel]
  );

  // Validaciones sólidas
  const canSubmit = useMemo(() => {
    const hasFecha = fecha instanceof Date && !isNaN(fecha.getTime());
    const ok =
      hasFecha &&
      isPosInt(idTurno) &&
      isPosInt(idPersonal) &&
      isPosInt(idGrupo) &&
      isPosInt(idEquipo) &&
      isPosInt(idRevisionSel) &&
      nombreRevision.length > 0 &&
      isPosInt(empresaId);
    return ok;
  }, [fecha, idTurno, idPersonal, idGrupo, idEquipo, idRevisionSel, nombreRevision, empresaId]);

  /** Limpia campos para facilitar reportes consecutivos.
   *  Ahora también limpia: turno, personal y equipo.
   *  Dejamos el grupo y la fecha tal como están.
   */
  const resetForNext = () => {
    setIdTurno(null);
    setIdPersonal(null);
    setIdEquipo(null);
    setIdRevisionSel(null);
    setObservaciones('');
    setEstado('BIEN');
  };

  // Confirmación previa (como en ReporteVariables)
  const handleConfirmCreate = () => {
    if (!canSubmit) return;

    const turnoDesc =
      turnos.find((t) => t.id_turno === idTurno)?.descripcion_turno || '–';
    const equipoMat =
      equiposAll.find((e) => e.id_equipo === idEquipo)?.matricula_equipo || '–';
    const nombrePers =
      personalOptions.find((p) => p._id_pk === idPersonal)?.nombre_completo || '–';
    const grupoNom =
      grupos.find((g) => g.id_grupo_equipo === idGrupo)?.nombre_grupo_equipo || '–';

    const fechaTexto = new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    Alert.alert(
      'Confirmación',
      `¿Crear revisión con los siguientes datos?\n\n` +
        `📅 Fecha: ${fechaTexto}\n` +
        `👷 Personal: ${nombrePers}\n` +
        `🕒 Turno: ${turnoDesc}\n` +
        `📦 Grupo: ${grupoNom}\n` +
        `🛠️ Equipo: ${equipoMat}\n` +
        `✅ Revisión: ${nombreRevision}\n` +
        `📌 Estado: ${estado}\n` +
        (observaciones?.trim() ? `📝 Obs.: ${observaciones.trim()}\n` : ''),
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: handleSubmit },
      ]
    );
  };

  // Guardar
  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast('error', 'Faltan datos', 'Completa los campos obligatorios.');
      return;
    }

    const payload: CreateCheckLogPayload = {
      id_equipo: idEquipo!, // ya validado
      id_personal: idPersonal!, // numérico
      id_turno: idTurno!, // numérico
      elemento_check: nombreRevision,
      observaciones_check: (observaciones || '').trim() || undefined,
      estado_check: estado,
      fecha_check: formatUTCDate(fecha),
      id_empresa: Number(empresaId),
    };

    const resp = await createCheckLog(payload);
    if (resp.success) {
      showToast('success', 'Revisión creada', 'Se registró correctamente.');
      // Subir al inicio y limpiar campos
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      resetForNext();
    } else {
      showToast('error', 'No se pudo guardar', resp.error || 'Error desconocido');
    }
  };

  return (
    <ReportScreenLayout>
      <HeaderWithBack title="Revisiones" />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.body}>
        <Text style={styles.title}>Información de la revisión</Text>

        {/* Fecha */}
        <Text style={styles.label}>Fecha de revisión</Text>
        <TouchableOpacity style={styles.dateBox} onPress={() => setShowDate(true)}>
          <Text style={styles.dateText}>{new Date(fecha).toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChangeDate}
          />
        )}

        {/* Turno */}
        <Text style={styles.label}>Turno</Text>
        <Select<TurnoInterface>
          options={turnos}
          valueKey="id_turno"
          labelKey="descripcion_turno"
          selectedValue={idTurno}
          onValueChange={(val) => setIdTurno(toNumOrNull(val))}
          placeholder="Selecciona un turno"
        />

        {/* Personal (usa _id_pk numérico) */}
        <Text style={styles.label}>Personal</Text>
        <Select<typeof personalOptions[number]>
          options={personalOptions}
          valueKey="_id_pk"
          labelKey="nombre_completo"
          selectedValue={idPersonal}
          onValueChange={(val) => setIdPersonal(toNumOrNull(val))}
          placeholder="Selecciona un personal"
        />

        {/* Grupo */}
        <Text style={styles.label}>Grupo de equipo</Text>
        <Select<GrupoEquipo>
          options={grupos}
          valueKey="id_grupo_equipo"
          labelKey="nombre_grupo_equipo"
          selectedValue={idGrupo}
          onValueChange={(val) => setIdGrupo(toNumOrNull(val))}
          placeholder="Todos los grupos"
        />

        {/* Equipo */}
        <Text style={styles.label}>Equipo</Text>
        <Select<Equipo>
          options={equipos}
          valueKey="id_equipo"
          labelKey="matricula_equipo"
          selectedValue={idEquipo}
          onValueChange={(val) => setIdEquipo(toNumOrNull(val))}
          placeholder={idGrupo && !equipos.length ? 'No hay equipos' : 'Selecciona un equipo'}
        />

        {/* Revisión */}
        <Text style={styles.label}>Revisión</Text>
        <Select<RevisionPlantilla>
          options={revisiones}
          valueKey="id_revision"
          labelKey="nombre_revision"
          selectedValue={idRevisionSel}
          onValueChange={(val) => setIdRevisionSel(toNumOrNull(val))}
          placeholder={
            idGrupo
              ? loadingRevisiones
                ? 'Cargando revisiones...'
                : revisiones.length
                ? 'Selecciona una revisión'
                : 'Sin revisiones para el grupo'
              : 'Seleccione primero un grupo'
          }
          loading={loadingRevisiones}
          error={errorRevisiones}
          disabled={!idGrupo}
        />

        {/* Estado */}
        <Text style={styles.label}>Estatus de revisión</Text>
        <View style={styles.estadoRow}>
          {(['MAL', 'REGULAR', 'BIEN'] as EstadoCheck[]).map((e) => {
            const active = estado === e;
            return (
              <TouchableOpacity
                key={e}
                onPress={() => setEstado(e)}
                style={[
                  styles.estadoBtn,
                  active && styles.estadoBtnActive,
                  e === 'MAL' && styles.bad,
                  e === 'REGULAR' && styles.avg,
                  e === 'BIEN' && styles.good,
                ]}
              >
                <Text style={[styles.estadoText, active && styles.estadoTextActive]}>
                  {e === 'MAL' ? 'Mal' : e === 'REGULAR' ? 'Regular' : 'Bien'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Observaciones */}
        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={styles.obs}
          placeholder="Escribe observaciones (opcional)"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
        />

        {/* Guardar (abre confirmación) */}
        <TouchableOpacity
          style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
          onPress={handleConfirmCreate}
          disabled={!canSubmit}
        >
          <Text style={styles.saveText}>+ Crear revisión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ReportScreenLayout>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B2A56', marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 6, color: '#1B2A56', fontWeight: '600' },

  dateBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D6DBEF',
  },
  dateText: { color: '#1B2A56' },

  estadoRow: { flexDirection: 'row', gap: 12 },
  estadoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#E6E9F7',
  },
  estadoBtnActive: {
    borderWidth: 2,
    borderColor: '#1B2A56',
    backgroundColor: '#fff',
  },
  estadoText: { color: '#1B2A56', fontWeight: '600' },
  estadoTextActive: { color: '#1B2A56' },

  bad: { backgroundColor: '#F5C6CB' },
  avg: { backgroundColor: '#FEE8C8' },
  good: { backgroundColor: '#CDEECD' },

  obs: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D6DBEF',
    borderRadius: 10,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },

  saveBtn: {
    marginTop: 18,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontWeight: '700' },
});
