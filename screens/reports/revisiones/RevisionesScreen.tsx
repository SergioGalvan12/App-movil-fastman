import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Componentes comunes del proyecto
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import Select from '../../../components/common/Select';
import { showToast } from '../../../services/notifications/ToastService';

// Services ya existentes en tu app
import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchPersonals, Personal } from '../../../services/reports/personal/personalService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../../services/reports/equipos/equipoService';

// Services nuevos (creados en el paso anterior)
import { fetchMarcas, Marca } from '../../../services/reports/catalogos/marcaService';
import { fetchModelos, Modelo } from '../../../services/reports/catalogos/modeloService';
import { createCheckLog, CreateCheckLogPayload } from '../../../services/reports/revisiones/checkLogService';
import { fetchRevisionesEquipo, RevisionEquipo } from
  '../../../services/reports/revisiones/revisionEquipoService';

// Contexto de auth para empresaId / username si lo necesitas
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Lista de “elementos de revisión” (lo que en la web pones en “Revisión”).
 * Si luego hay endpoint para esto, basta reemplazarlo por un fetch.
 */
const ELEMENTOS_REVISION = [
    'Temperatura',
    'Presión',
    'Nivel',
    'Vibración',
    'Ruido',
    'Fugas',
    'Limpieza',
];

type EstadoCheck = 'MAL' | 'REGULAR' | 'BIEN';

const formatUTCDate = (d: Date) => {
    // normalizamos a YYYY-MM-DD en UTC (acorde a tu convención)
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
type SimpleOption = { label: string; value: string };
const ELEMENTOS_REVISION_OPTS: SimpleOption[] = ELEMENTOS_REVISION.map(x => ({ label: x, value: x }));

export default function RevisionesScreen() {
    const { empresaId } = useAuth();

    // ----- estado de catálogos -----
    const [turnos, setTurnos] = useState<TurnoInterface[]>([]);
    const [personales, setPersonales] = useState<Personal[]>([]);
    const [grupos, setGrupos] = useState<GrupoEquipo[]>([]);
    const [equiposAll, setEquiposAll] = useState<Equipo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [revisiones, setRevisiones] = useState<RevisionEquipo[]>([]);

    // ----- estado de selección -----
    const [fecha, setFecha] = useState<Date>(new Date());
    const [showDate, setShowDate] = useState(false);

    const [idTurno, setIdTurno] = useState<number | null>(null);
    const [idPersonal, setIdPersonal] = useState<string | null>(null);
    const [idGrupo, setIdGrupo] = useState<number | null>(null);
    const [idEquipo, setIdEquipo] = useState<number | null>(null);

    const [idMarca, setIdMarca] = useState<number | null>(null);
    const [idModelo, setIdModelo] = useState<number | null>(null);

    const [elemento, setElemento] = useState<string | null>(null);
    const [estado, setEstado] = useState<EstadoCheck | null>(null);
    const [observaciones, setObservaciones] = useState('');

    // Equipos filtrados por grupo
    const equipos = useMemo(() => {
        if (!idGrupo) return equiposAll;
        return equiposAll.filter(e => e.id_grupo_equipo === idGrupo);
    }, [equiposAll, idGrupo]);

    // Modelos filtrados por marca
    const modelosFiltrados = useMemo(() => {
        if (!idMarca) return modelos;
        return modelos.filter(m => m.id_marca === idMarca);
    }, [modelos, idMarca]);

    // ----- carga inicial de catálogos -----
    useEffect(() => {
        let mounted = true;

        const load = async () => {
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
        };

        load();
        return () => { mounted = false; };
    }, []);

    // Si cambian grupo o marca, limpiamos dependientes para evitar selecciones inválidas
    useEffect(() => {
        setIdEquipo(null);
    }, [idGrupo]);

    useEffect(() => {
        setIdModelo(null);
    }, [idMarca]);

    const onChangeDate = (_: any, selected?: Date) => {
        setShowDate(false);
        if (selected) setFecha(selected);
    };

    // ----- validaciones mínimas previas al POST -----
    const canSubmit = useMemo(() => {
        return Boolean(
            fecha &&
            idTurno &&
            idPersonal &&
            idEquipo &&
            elemento &&
            estado &&
            empresaId
        );
    }, [fecha, idTurno, idPersonal, idEquipo, elemento, estado, empresaId]);

    const handleSubmit = async () => {
        if (!canSubmit) {
            showToast('error', 'Faltan datos', 'Completa los campos obligatorios.');
            return;
        }

        const payload: CreateCheckLogPayload = {
            id_equipo: idEquipo!,                    // requerido
            id_personal: idPersonal!,                // en backend se acepta string/number
            id_turno: idTurno!,
            elemento_check: elemento!,               // p.ej. “Temperatura”
            observaciones_check: observaciones || undefined,
            estado_check: estado!,                   // 'MAL' | 'REGULAR' | 'BIEN'
            fecha_check: formatUTCDate(fecha),       // AAAA-MM-DD (UTC)
            id_empresa: Number(empresaId),           // del contexto
        };

        const resp = await createCheckLog(payload);
        if (resp.success) {
            showToast('success', 'Revisión creada', 'Se registró correctamente.');
            // limpieza parcial para una nueva captura
            setObservaciones('');
            setEstado(null);
            // (opcional) mantener selecciones de catálogos
        } else {
            showToast('error', 'No se pudo guardar', resp.error || 'Error desconocido');
        }
    };

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Revisiones" />

            <View style={styles.body}>
                <Text style={styles.title}>Información de la revisión</Text>

                {/* Fecha */}
                <Text style={styles.label}>Fecha de revisión</Text>
                <TouchableOpacity
                    style={styles.dateBox}
                    onPress={() => setShowDate(true)}
                >
                    <Text style={styles.dateText}>
                        {new Date(fecha).toLocaleDateString()}
                    </Text>
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
                    onValueChange={(val) => setIdTurno(val ? Number(val) : null)}
                    placeholder="Selecciona un turno"
                />


                {/* Personal */}
                <Text style={styles.label}>Personal</Text>
                <Select<Personal & { nombre_completo: string }>
                    options={personales.map(p => ({
                        ...p,
                        nombre_completo: `${p.nombre_personal} ${p.apaterno_personal ?? ''} ${p.amaterno_personal ?? ''}`.replace(/\s+/g, ' ').trim(),
                    }))}
                    valueKey="id_personal"
                    labelKey="nombre_completo"
                    selectedValue={idPersonal}
                    onValueChange={(val) => setIdPersonal(val ? String(val) : null)}
                    placeholder="Selecciona un personal"
                />



                {/* Grupo de equipo */}
                <Text style={styles.label}>Grupo de equipo</Text>
                <Select<GrupoEquipo>
                    options={grupos}
                    valueKey="id_grupo_equipo"
                    labelKey="nombre_grupo_equipo"
                    selectedValue={idGrupo}
                    onValueChange={(val) => setIdGrupo(val ? Number(val) : null)}
                    placeholder="Todos los grupos"
                />


                {/* Equipo */}
                <Text style={styles.label}>Equipo</Text>
                <Select<Equipo>
                    options={equipos}
                    valueKey="id_equipo"
                    labelKey="matricula_equipo"
                    selectedValue={idEquipo}
                    onValueChange={(val) => setIdEquipo(val ? Number(val) : null)}
                    placeholder={idGrupo && !equipos.length ? 'No hay equipos' : 'Selecciona un equipo'}
                />


                {/* Marca / Modelo (opcionales, solo catálogos de apoyo como en la web)
                <Text style={styles.label}>Marca</Text>
                <Select<Marca>
                    options={marcas}
                    valueKey="id_marca"
                    labelKey="nombre_marca"
                    selectedValue={idMarca}
                    onValueChange={(val) => setIdMarca(val ? Number(val) : null)}
                    placeholder="Todas las marcas"
                />


                <Text style={styles.label}>Modelo</Text>
                <Select<Modelo>
                    options={modelosFiltrados}
                    valueKey="id_modelo"
                    labelKey="nombre_modelo"
                    selectedValue={idModelo}
                    onValueChange={(val) => setIdModelo(val ? Number(val) : null)}
                    placeholder="Todos los modelos"
                />
                 */}

                {/* Revisión (elemento) */}
                <Text style={styles.label}>Revisión</Text>
                <Select<SimpleOption>
                    options={ELEMENTOS_REVISION_OPTS}
                    valueKey="value"
                    labelKey="label"
                    selectedValue={elemento}
                    onValueChange={(val) => setElemento((val as string) ?? null)}
                    placeholder="Selecciona una revisión"
                />


                {/* Estado (Mal / Regular / Bien) */}
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

                {/* Guardar */}
                <TouchableOpacity
                    style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                >
                    <Text style={styles.saveText}>+ Crear revisión</Text>
                </TouchableOpacity>
            </View>
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
