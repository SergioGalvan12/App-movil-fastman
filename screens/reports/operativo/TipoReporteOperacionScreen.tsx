// src/screens/reports/operativo/TipoReporteOperacionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MenuItem from '../../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../App';
import { Appbar } from 'react-native-paper';

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
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Reporte Operativo" />
            </Appbar.Header>

            {/* Contenedor principal */}
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.text}>Seleccione el tipo de reporte operativo</Text>

                    {/* Opciones de reporte */}
                    <MenuItem
                        title="Reporte Global"
                        onPress={() => navigation.navigate('ReporteOperacion')}
                    />
                    <MenuItem
                        title="Reporte Secuencial"
                        onPress={() => navigation.navigate('ReporteOperativoSecuencial')}
                    />
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF0FA',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#1B2A56',
        marginBottom: 10,
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 10,
    },
});
