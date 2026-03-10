import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReporteOperacionScreen from '../../../screens/reports/operativo/ReporteOperacion';
import ReporteOperativoSecuencial from '../../../screens/reports/operativo/ReporteOperativoSecuencial';
import ProduccionReporteOperacionScreen from '../../../screens/reports/operativo/ProduccionReporteOperacionScreen';
import ConsumosReporteOperacionScreen from '../../../screens/reports/operativo/ConsumosReporteOperacionScreen';

import CrearConsumoReporteOperacionScreen from '../../../screens/reports/operativo/CrearConsumoReporteOperacionScreen';
import EditarConsumoReporteOperacionScreen from '../../../screens/reports/operativo/EditarConsumoReporteOperacionScreen';
import RevisionesReporteOperacionScreen from '../../../screens/reports/operativo/RevisionesReporteOperacionScreen';
import EventosReporteOperacionScreen from '../../../screens/reports/operativo/EventosReporteOperacionScreen';
import type { OperativoStackParamList } from '../types';

const Stack = createNativeStackNavigator<OperativoStackParamList>();

export default function ReporteOperativoStackNavigator() {
    return (
        <Stack.Navigator
            id={undefined}
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#EFF0FA' },
            }}
        >
            <Stack.Screen name="ReporteOperacion" component={ReporteOperacionScreen} />
            <Stack.Screen name="ReporteOperativoSecuencial" component={ReporteOperativoSecuencial} />
            <Stack.Screen name="ProduccionReporteOperacion" component={ProduccionReporteOperacionScreen} />
            <Stack.Screen name="ConsumosReporteOperacion" component={ConsumosReporteOperacionScreen} />
            <Stack.Screen name="EditarConsumoReporteOperacion" component={EditarConsumoReporteOperacionScreen} />
            <Stack.Screen name="CrearConsumoReporteOperacion" component={CrearConsumoReporteOperacionScreen} />
            <Stack.Screen name="RevisionesReporteOperacion" component={RevisionesReporteOperacionScreen} />
            <Stack.Screen name="EventosReporteOperacion" component={EventosReporteOperacionScreen} />
        </Stack.Navigator>
    );
}