// src/screens/reports/operativo/ReporteOperacion.tsx
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderTitle from '../../../components/common/HeaderTitle';
import Select from '../../../components/common/Select';
import { fetchTurnos, TurnoInterface } from '../../../services/reports/turnos/turnoService';
import { fetchGrupoEquipos, GrupoEquipo } from '../../../services/reports/equipos/grupoEquipoService';
import { fetchEquipos, Equipo } from '../../../services/reports/equipos/equipoService';

type SelectOption = { id: number; label: string };

export default function ReporteOperacionScreen() {
    // — Estado de Turnos —
    const [turnoOptions, setTurnoOptions] = useState<SelectOption[]>([]);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [errorTurnos, setErrorTurnos] = useState<string>('');

    // — Estado de Grupos de Equipo —
    const [grupoOptions, setGrupoOptions] = useState<SelectOption[]>([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [errorGrupos, setErrorGrupos] = useState<string>('');

    // — Estado de Equipos —
    const [equiposData, setEquiposData] = useState<Equipo[]>([]);
    const [equipoOptions, setEquipoOptions] = useState<SelectOption[]>([]);
    const [loadingEquipos, setLoadingEquipos] = useState(false);
    const [errorEquipos, setErrorEquipos] = useState<string>('');

    // — Estado del Formulario —
    const [fecha, setFecha] = useState<Date>(new Date());
    const [showDate, setShowDate] = useState(false);
    const [turno, setTurno] = useState<number | null>(null);
    const [responsable, setResponsable] = useState<string>('');
    const [grupoEquipo, setGrupoEquipo] = useState<number | null>(null);
    const [equipo, setEquipo] = useState<number | null>(null);
    const [unidadesIniciales, setUnidadesIniciales] = useState<string>('0');
    const [unidadesFinales, setUnidadesFinales] = useState<string>('0');
    const [unidadesControl, setUnidadesControl] = useState<string>('0');
    const [observaciones, setObservaciones] = useState<string>('');

    // Carga de turnos
    useEffect(() => {
        const loadTurnos = async () => {
            setLoadingTurnos(true);
            const resp = await fetchTurnos();
            if (resp.success && resp.data) {
                const opts = resp.data
                    .map((t: TurnoInterface) => ({
                        id: t.id_turno,
                        label: t.descripcion_turno,
                    }))
                    // orden alfabético por label
                    .sort((a, b) => a.label.localeCompare(b.label));
                setTurnoOptions(opts);
            } else {
                setErrorTurnos(resp.error || 'Error al cargar turnos');
            }
            setLoadingTurnos(false);
        };
        loadTurnos();
    }, []);

    // Carga de grupos de equipo
    useEffect(() => {
        const loadGrupos = async () => {
            setLoadingGrupos(true);
            const resp = await fetchGrupoEquipos();
            if (resp.success && resp.data) {
                const opts = resp.data
                    .map((g: GrupoEquipo) => ({
                        id: g.id_grupo_equipo,
                        label: g.nombre_grupo_equipo,
                    }))
                    // orden alfabético por label
                    .sort((a, b) => a.label.localeCompare(b.label));
                setGrupoOptions(opts);
            } else {
                setErrorGrupos(resp.error || 'Error al cargar grupos');
            }
            setLoadingGrupos(false);
        };
        loadGrupos();
    }, []);

    // Carga y paginación de equipos, filtrado por grupo seleccionado
    useEffect(() => {
        const loadEquipos = async () => {
            setLoadingEquipos(true);
            const resp = await fetchEquipos();
            if (resp.success && resp.data) {
                setEquiposData(resp.data);
                const opts = resp.data
                    .filter(e => e.id_grupo_equipo === grupoEquipo)
                    .map(e => ({ id: e.id_equipo, label: e.matricula_equipo }))
                    // orden alfabético por matrícula
                    .sort((a, b) => a.label.localeCompare(b.label));
                setEquipoOptions(opts);
            } else {
                setErrorEquipos(resp.error || 'Error al cargar equipos');
            }
            setLoadingEquipos(false);
        };

        if (grupoEquipo) {
            setEquipo(null);
            setUnidadesIniciales('0');
            setUnidadesFinales('0');
            setUnidadesControl('0');
            loadEquipos();
        } else {
            setEquipoOptions([]);
            setEquiposData([]);
        }
    }, [grupoEquipo]);


    // Handler al seleccionar un equipo
    const onSelectEquipo = (value: number | null) => {
        setEquipo(value);
        if (!value) {
            setUnidadesIniciales('0');
            setUnidadesFinales('0');
            setUnidadesControl('0');
            return;
        }
        const sel = equiposData.find(e => e.id_equipo === value)!;
        setUnidadesIniciales(sel.uso_equipo);
        setUnidadesFinales(sel.uso_equipo);
        setUnidadesControl(String(sel.contador_control_ot));
    };

    // Handler del botón Crear
    const handleCrearReporte = () => {
        console.log('Crear reporte…');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <HeaderTitle title="Información del reporte" />

                {/* Fecha */}
                <Text style={styles.label}>* Fecha</Text>
                <TextInput
                    style={styles.input}
                    value={fecha.toLocaleDateString()}
                    editable={false}
                    onFocus={() => setShowDate(true)}
                />
                {showDate && (
                    <DateTimePicker
                        value={fecha}
                        mode="date"
                        display="default"
                        onChange={(_, d) => {
                            if (d) setFecha(d);
                            setShowDate(false);
                        }}
                    />
                )}

                {/* Turno */}
                <Text style={styles.label}>* Turno</Text>
                <Select<SelectOption>
                    options={turnoOptions}
                    valueKey="id"
                    labelKey="label"
                    selectedValue={turno}
                    onValueChange={v => setTurno(v as number)}
                    placeholder="Selecciona un turno"
                    style={styles.picker}
                />

                {/* Responsable */}
                <Text style={styles.label}>Responsable</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.flex]}
                        value={responsable}
                        placeholder="— José Luis Cárdenas —"
                        editable={false}
                    />
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setResponsable('')}
                    >
                        <Text style={styles.clearText}>Quitar</Text>
                    </TouchableOpacity>
                </View>

                {/* Grupo de equipo */}
                <Text style={styles.label}>* Grupo de equipo</Text>
                <Select<SelectOption>
                    options={grupoOptions}
                    valueKey="id"
                    labelKey="label"
                    selectedValue={grupoEquipo}
                    onValueChange={v => setGrupoEquipo(v as number)}
                    placeholder="Selecciona un grupo"
                    loading={loadingGrupos}
                    error={errorGrupos}
                    style={styles.picker}
                />

                {/* Equipo */}
                <Text style={styles.label}>* Equipo</Text>
                <Select<SelectOption>
                    options={equipoOptions}
                    valueKey="id"
                    labelKey="label"
                    selectedValue={equipo}
                    onValueChange={v => onSelectEquipo(v as number)}
                    placeholder={
                        !grupoEquipo
                            ? 'Selecciona un grupo antes'
                            : 'Selecciona un equipo'
                    }
                    loading={loadingEquipos}
                    error={errorEquipos}
                    disabled={!grupoEquipo}
                    style={styles.picker}
                />


                {/* Unidades iniciales */}
                <Text style={styles.label}>* Unidades iniciales</Text>
                <TextInput
                    style={styles.input}
                    value={unidadesIniciales}
                    onChangeText={setUnidadesIniciales}
                    keyboardType="numeric"
                />

                {/* Unidades finales */}
                <Text style={styles.label}>* Unidades finales</Text>
                <TextInput
                    style={styles.input}
                    value={unidadesFinales}
                    onChangeText={setUnidadesFinales}
                    keyboardType="numeric"
                />

                {/* Unidades de control */}
                <Text style={styles.label}>Unidades de control</Text>
                <TextInput
                    style={styles.input}
                    value={unidadesControl}
                    onChangeText={setUnidadesControl}
                    keyboardType="numeric"
                />

                {/* Observaciones */}
                <Text style={styles.label}>Observaciones</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    value={observaciones}
                    onChangeText={t =>
                        t.length <= 250 && setObservaciones(t)
                    }
                    placeholder="Escribe tus observaciones..."
                />
                <Text style={styles.counter}>{observaciones.length}/250</Text>

                {/* Botón Crear */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCrearReporte}
                >
                    <Text style={styles.createButtonText}>+ Crear reporte</Text>
                </TouchableOpacity>

                {/* Indicador predefinidos */}
                <View style={styles.predef}>
                    <Text>Reportar consumos de manera predefinida:</Text>
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        style={styles.iconOK}
                    />
                </View>

                <Text style={styles.note}>
                    Nota: Elegir la opción predefinida generará los consumos del
                    reporte a partir de los definidos en productos. Si deseas
                    generar nuevos consumos, deberás hacerlo manualmente en su sección.
                </Text>

                <Text style={styles.required}>* Campos requeridos</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#EFF0FA' },
    container: { padding: 22, paddingBottom: 40 },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
        color: '#1B2A56',
    },
    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1B2A56',
        marginTop: 4,
    },
    picker: { marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    flex: { flex: 1 },
    clearButton: {
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#1B2A56',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    clearText: { color: '#1B2A56', fontWeight: '600' },
    textArea: { height: 120, textAlignVertical: 'top', marginTop: 4 },
    counter: { alignSelf: 'flex-end', marginTop: 4, color: '#666' },
    createButton: {
        marginTop: 24,
        backgroundColor: '#4CAF50',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    predef: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    iconOK: { color: '#28A745', marginLeft: 8 },
    note: { marginTop: 8, fontSize: 14, lineHeight: 20, color: '#333' },
    required: {
        marginTop: 20,
        fontStyle: 'italic',
        color: '#333',
    },
});
