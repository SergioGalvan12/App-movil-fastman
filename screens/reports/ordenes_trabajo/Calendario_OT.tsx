// screens/reports/ordenes_trabajo/Calendario_OT.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet,
    SafeAreaView, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../App';
import { Calendar } from 'react-native-calendars';
import '../../../src/config/calendarLocale';
import { useIsFocused } from '@react-navigation/native';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { getResumenOrdenesTrabajoPorMes } from '../../../services/reports/ordenesTrabajo/ordenTrabajoService'

// al inicio de tu componente:

export default function Calendario_OT() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [selectedDate, setSelectedDate] = useState('');

    const [baseMarkedDates, setBaseMarkedDates] = useState<{ [key: string]: any }>({});
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const [resumenOTs, setResumenOTs] = useState<Map<string, number>>(new Map());

    // Inicializar el calendario con el mes actual
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            const today = new Date();
            handleMonthChange(today.getFullYear(), today.getMonth() + 1);
        }
    }, [isFocused]);


    const handleMonthChange = async (year: number, month: number) => {
        const desde = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDayDate = new Date(year, month, 0); // ← día 0 del siguiente mes = último día del actual
        const hasta = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

        const result = await getResumenOrdenesTrabajoPorMes(desde, hasta);

        console.log('Resumen OTs:', result.data);

        if (!result.success || !result.data) {
            console.warn('No se pudo obtener resumen de OTs');
            return;
        }

        const newMarkedDates: { [key: string]: any } = {};
        const resumenMap = new Map<string, number>();
        const today = new Date();

        result.data.forEach(({ fecha, ots }) => {
            const [year, month, day] = fecha.split('-').map(Number);
            const fechaOT = new Date(year, month - 1, day);  // ← ¡local, sin zona UTC!
            const diffInMs = today.getTime() - fechaOT.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            let backgroundColor = '#1976d2'; // azul por defecto (futuras o actuales)
            if (diffInDays > 0 && diffInDays <= 4) {
                backgroundColor = '#f9a825'; // amarillo
            } else if (diffInDays > 4) {
                backgroundColor = '#d32f2f'; // rojo
            }

            newMarkedDates[fecha] = {
                customStyles: {
                    container: {
                        backgroundColor,
                        borderRadius: 5,
                    },
                    text: {
                        color: 'white',
                        fontWeight: 'bold',
                    },
                },
            };

            resumenMap.set(fecha, ots);
        });
        setBaseMarkedDates(newMarkedDates);
        setMarkedDates(newMarkedDates);
        setResumenOTs(resumenMap);
    };

    function getCombinedMarkedDates(baseMarks: { [key: string]: any }, selected: string) {
        const updated: { [key: string]: any } = {};
        // Copiar todas las marcas base
        Object.keys(baseMarks).forEach((fecha) => {
            updated[fecha] = { ...baseMarks[fecha] };
        });
        // Aplicar el estilo de selección solo a la fecha seleccionada
        if (selected) {
            updated[selected] = {
                ...(baseMarks[selected] || {}),
                customStyles: {
                    container: {
                        ...(baseMarks[selected]?.customStyles?.container || {}),
                        borderWidth: 2,
                        borderColor: '#000',
                    },
                    text: {
                        ...(baseMarks[selected]?.customStyles?.text || {}),
                        fontWeight: 'bold',
                    },
                },
            };
        }
        return updated;
    }

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Calendario OT" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView>
                    <Text style={styles.title}>Órdenes de Trabajo</Text>
                    <Text style={styles.subtitle}>Selecciona un día para ver las órdenes</Text>

                    <Calendar
                        markingType="custom"
                        markedDates={markedDates}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                            setMarkedDates(getCombinedMarkedDates(baseMarkedDates, day.dateString));
                        }}

                        onMonthChange={(month) => {
                            handleMonthChange(month.year, month.month);
                        }}
                        theme={{
                            todayTextColor: '#E53935',
                            arrowColor: '#5D74A6',
                            textSectionTitleColor: '#1B2A56',
                        }}
                    />
                    {selectedDate !== '' && (
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>
                                Órdenes de trabajo {selectedDate.split('-').reverse().join('-')}
                            </Text>

                            {resumenOTs.has(selectedDate) ? (
                                <>
                                    <Text style={styles.infoText}>
                                        Tienes {resumenOTs.get(selectedDate)} OT pendiente{resumenOTs.get(selectedDate)! > 1 ? 's' : ''}
                                    </Text>
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => {
                                            navigation.navigate('OrdenesTrabajoDia', { fecha: selectedDate });
                                        }}
                                    >
                                        Ver OT por ejecución
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.infoText}>No OTs asignadas</Text>
                            )}
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#EFF0FA',
        padding: 20,
        paddingTop: 35,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1B2A56',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#5D74A6',
        marginBottom: 20,
    },
    infoContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B2A56',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 15,
        color: '#5D74A6',
    },
    linkText: {
        marginTop: 8,
        fontSize: 15,
        color: '#1976d2',
        textDecorationLine: 'underline',
    },


});
