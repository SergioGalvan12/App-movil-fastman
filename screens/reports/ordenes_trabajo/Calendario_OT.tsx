// screens/reports/ordenes_trabajo/Calendario_OT.tsx
import React, { useState } from 'react';
import {
    View, Text, StyleSheet,
    SafeAreaView, ScrollView
} from 'react-native';

import { Calendar } from 'react-native-calendars';
import '../../../src/config/calendarLocale';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';

export default function Calendario_OT() {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Calendario OT" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView>
                    <Text style={styles.title}>Órdenes de Trabajo</Text>
                    <Text style={styles.subtitle}>Selecciona un día para ver las órdenes</Text>

                    <Calendar
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                            // aquí eventualmente navegaremos a los detalles del día
                            console.log('Día seleccionado:', day.dateString);
                        }}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: '#5D74A6',
                            },
                        }}
                        theme={{
                            todayTextColor: '#E53935',
                            selectedDayBackgroundColor: '#5D74A6',
                            arrowColor: '#5D74A6',
                            textSectionTitleColor: '#1B2A56',
                        }}
                    />
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
});
