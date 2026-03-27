import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import MenuItem from '../../components/common/MenuItem';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../src/navigation/types';
import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { PageHeader } from '../../src/ui/PageHeader/PageHeader';
import { spacing } from '../../src/theme';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function ReportesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer>
      <PageHeader title="Reportes" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MenuItem
          title="Reporte de Avería (MC)"
          onPress={() => navigation.navigate('Averias')}
        />

        <MenuItem
          title="Reporte de Operación de equipos"
          onPress={() =>
            navigation.navigate('Operativo', {
              screen: 'ReporteOperacion',
            })
          }
        />

        <MenuItem
          title="Reporte de Variables"
          onPress={() => navigation.navigate('ReporteVariables')}
        />

        <MenuItem
          title="Reporte de Revisiones"
          onPress={() => navigation.navigate('Revisiones')}
        />

        <MenuItem
          title="Calendario de Órdenes de Trabajo"
          onPress={() => navigation.navigate('Calendario_OT')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});