//screens/reports/ordenes_trabajo/Calendario_OT.tsx
import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet,
    ScrollView, SafeAreaView,
    TouchableOpacity,
    Alert,
} from 'react-native';

import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../../App';

export default function Calendario_OT() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Calendario OT" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView>
                    <View style={styles.container}>
                        <Text>Calendario de Órdenes de Trabajo</Text>
                        <Text>
                            Aquí podrás visualizar y gestionar las órdenes de trabajo programadas.
                        </Text>
                        {/* Aquí puedes agregar más componentes o lógica según sea necesario */}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ReportScreenLayout>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#EFF0FA', padding: 20, paddingTop: 35 },
    container: { flex: 1, backgroundColor: '#EFF0FA' },
});