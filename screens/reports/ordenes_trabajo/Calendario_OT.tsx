// screens/reports/ordenes_trabajo/Calendario_OT.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet,
    SafeAreaView, ScrollView
} from 'react-native';

import { Calendar } from 'react-native-calendars';
import '../../../src/config/calendarLocale';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { getResumenOrdenesTrabajoPorMes } from '../../../services/reports/ordenesTrabajo/ordenTrabajoService'

export default function Calendario_OT() {
    const [selectedDate, setSelectedDate] = useState('');
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const [resumenOTs, setResumenOTs] = useState<Map<string, number>>(new Map());

    // Inicializar el calendario con el mes actual
    useEffect(() => {
        const today = new Date();
        handleMonthChange(today.getFullYear(), today.getMonth() + 1);
    }, []);

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
        result.data.forEach(({ fecha, ots }) => {
            resumenMap.set(fecha, ots);
            newMarkedDates[fecha] = {
                customStyles: {
                    container: {
                        backgroundColor: ots >= 5 ? '#d32f2f' : '#1976d2',
                        borderRadius: 5,
                    },
                    text: {
                        color: 'white',
                        fontWeight: 'bold',
                    },
                },
            };
        });

        setMarkedDates(newMarkedDates);
        setResumenOTs(resumenMap);
    };




    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Calendario OT" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView>
                    <Text style={styles.title}>Órdenes de Trabajo</Text>
                    <Text style={styles.subtitle}>Selecciona un día para ver las órdenes</Text>

                    <Calendar
                        markingType="custom"  // <-- necesario para estilos avanzados
                        markedDates={markedDates}  // <-- lo generaremos dinámicamente
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
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
                            <Text style={styles.infoTitle}>Órdenes de trabajo {selectedDate}</Text>

                            {resumenOTs.has(selectedDate) ? (
                                <>
                                    <Text style={styles.infoText}>
                                        Tienes {resumenOTs.get(selectedDate)} OT disponible{resumenOTs.get(selectedDate)! > 1 ? 's' : ''}
                                    </Text>
                                    <Text
                                        style={styles.linkText}
                                        onPress={() => {
                                            // Aquí navegarías a la pantalla de detalles
                                            console.log('Ir a ver OTs del día:', selectedDate);
                                        }}
                                    >
                                        Ver OT disponibles
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
        marginTop: 30,
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
