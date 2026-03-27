import React from 'react';
import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { PageState } from '../../src/ui/PageState/PageState';

export default function NotificacionesScreen() {
  return (
    <ScreenContainer>
      <PageState
        title="Notificaciones"
        message="¡Estás en la pantalla de Notificaciones!"
        secondaryMessage="Esta sección será implementada en futuras actualizaciones."
      />
    </ScreenContainer>
  );
}