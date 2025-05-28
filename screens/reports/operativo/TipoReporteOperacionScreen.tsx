// src/screens/reports/operativo/TipoReporteOperacionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MenuItem from '../../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../App';

type TabParamList = {
    Dashboard: undefined;
    Reportes: undefined;
    Notificaciones: undefined;
};

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<AuthStackParamList>,
    BottomTabNavigationProp<TabParamList>
>;

export default function TipoReporteOperacionScreen() {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tipo de Reporte Operativo</Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <MenuItem
                    title="1. Reporte Global"
                    onPress={() => navigation.navigate('ReporteOperacion')}
                />
                <MenuItem
                    title="2. Reporte Secuencial"
                    onPress={() => navigation.navigate('ReporteOperativoSecuencial')}
                />
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF0FA',
        padding: 20,
        paddingTop: 50,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1B2A56',
        marginBottom: 20,
        textAlign: 'center',
    },
});
