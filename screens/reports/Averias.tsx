// screens/Averias.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderTitle from '../../components/common/HeaderTitle';

export default function Averias() {
    const [fecha, setFecha] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [turno, setTurno] = useState('');
    const [clasificacion, setClasificacion] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [area, setArea] = useState('');
    const [proceso, setProceso] = useState('');
    const [subproceso, setSubproceso] = useState('');
    const [grupoEquipo, setGrupoEquipo] = useState('');
    const [equipo, setEquipo] = useState('');
    const [falla, setFalla] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <HeaderTitle title="Reporte de Avería" />
                <Text style={styles.label}>* Fecha</Text>
                <TextInput
                    style={styles.input}
                    value={fecha.toLocaleDateString()}
                    onFocus={() => setShowDate(true)}
                    editable={false}
                />
                {showDate && (
                    <DateTimePicker
                        value={fecha}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDate(false);
                            if (selectedDate) setFecha(selectedDate);
                        }}
                    />
                )}

                {/* Turno */}
                <Text style={styles.label}>Turno</Text>
                <Picker
                    selectedValue={turno}
                    onValueChange={itemValue => setTurno(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Selecciona un turno" value="" />
                    <Picker.Item label="Mañana" value="mañana" />
                    <Picker.Item label="Tarde" value="tarde" />
                </Picker>

                {/* Clasificación */}
                <Text style={styles.label}>Clasificación</Text>
                <Picker
                    selectedValue={clasificacion}
                    onValueChange={itemValue => setClasificacion(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Todas las clasificaciones" value="" />
                    <Picker.Item label="Mecánica" value="mecanica" />
                    <Picker.Item label="Eléctrica" value="electrica" />
                </Picker>

                {/* Ubicación, Área, Proceso, etc. puedes seguir replicando igual... */}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#EFF0FA', // Color de fondo de la pantalla completa
        padding: 20,
        paddingTop: 35, // Para evitar el padding superior en la parte superior de la pantalla
      },
      container: {
        flex: 1,
        backgroundColor: '#EFF0FA', // También el fondo del contenido
      },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 12,
        color: '#1B2A56',
    },
    input: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 10,
        borderColor: '#1B2A56',
        borderWidth: 1,
        marginTop: 4,
    },
    picker: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: '#1B2A56',
        borderWidth: 1,
        marginTop: 4,
    },
});
