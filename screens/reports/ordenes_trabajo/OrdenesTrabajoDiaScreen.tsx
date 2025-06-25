import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import HeaderWithBack from '../../../components/common/HeaderWithBack';
import ReportScreenLayout from '../../../components/layouts/ReportScreenLayout';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getOrdenesTrabajoPorFecha } from '../../../services/reports/ordenesTrabajo/ordenTrabajoService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../App';
import { useIsFocused } from '@react-navigation/native';

type RootStackParamList = {
    OrdenesTrabajoDia: { fecha: string };
};

type Orden = {
    id_orden_trabajo: number;
    id_orden_trabajo_pub: string;
    descripcion_equipo: string;
    descripcion: string;
};


export default function OrdenesTrabajoDiaScreen() {
    const route = useRoute<RouteProp<RootStackParamList, 'OrdenesTrabajoDia'>>();
    const { fecha } = route.params;

    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            getOrdenesTrabajoPorFecha(fecha).then((res) => {
                if (res.success && res.data) {
                    setOrdenes(res.data.results);
                }
                setLoading(false);
            });
        }
    }, [fecha, isFocused]);


    return (
        <ReportScreenLayout>
            <HeaderWithBack title="Órdenes de trabajo" />
            <ScrollView style={styles.container}>
                <Text style={styles.fecha}>{fecha}</Text>

                {loading ? (
                    <ActivityIndicator color="#5D74A6" />
                ) : ordenes.length === 0 ? (
                    <Text style={styles.mensaje}>No hay OTs para este día.</Text>
                ) : (
                    ordenes.map((orden, index) => (
                        <TarjetaOT
                            key={index}
                            id={orden.id_orden_trabajo}
                            orden={orden.id_orden_trabajo_pub}
                            equipo={orden.descripcion_equipo}
                            descripcion={orden.descripcion}
                        />
                    ))
                )}
            </ScrollView>
        </ReportScreenLayout>
    );
}

function TarjetaOT({
    orden,
    equipo,
    descripcion,
    id,
}: {
    orden: string;
    equipo: string;
    descripcion: string;
    id: number;
}) {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    return (
        <View style={styles.card}>
            <Text style={styles.label}>Orden:</Text>
            <Text>{orden}</Text>

            <Text style={styles.label}>Equipo:</Text>
            <Text>{equipo}</Text>

            <Text style={styles.label}>Descripción:</Text>
            <Text>{descripcion}</Text>

            <Text
                style={styles.boton}
                onPress={() => navigation.navigate('RealizarOT', {
                    id,
                    folio: orden,
                })}
            >
                Realizar OT →
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { padding: 15 },
    fecha: { fontSize: 16, fontWeight: 'bold', color: '#1B2A56', marginBottom: 10 },
    mensaje: { fontSize: 16, color: '#5D74A6' },
    card: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#FFF',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 5,
        color: '#1B2A56',
    },
    boton: {
        marginTop: 10,
        color: '#1976d2',
        fontWeight: 'bold',
        textAlign: 'right',
    },
});
