import React, { useEffect } from 'react';
import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { PageState } from '../../src/ui/PageState/PageState';
import {
  ensureImagePermissions,
  ensureLocationPermissions,
} from '../../services/reports/permisos/permissions';

export default function DashboardScreen() {
  useEffect(() => {
    // Tras el login, pedimos permisos antes de mostrar el contenido.
    // Se mantiene la lógica tal como ya estaba.
    ensureImagePermissions();
    ensureLocationPermissions();
  }, []);

  return (
    <ScreenContainer>
      <PageState
        title="Dashboard"
        message="¡Bienvenido!"
      />
    </ScreenContainer>
  );
}