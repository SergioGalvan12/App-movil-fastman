import type { NavigatorScreenParams } from '@react-navigation/native';

export type OperativoStackParamList = {
  ReporteOperacion: undefined;

  ReporteOperativoSecuencial: {
    id_guia: number;
    id_equipo?: number;
    id_turno?: number;
    fecha_guia?: string;
    descripcion_equipo?: string | null;
    responsable?: string;
    id_empresa: number;
    id_grupo_equipo: number;
    id_ubicacion: number;
    produccion_ok?: boolean;
  };

  ConsumosReporteOperacion: {
    id_guia: number;
    id_empresa: number;
    id_ubicacion: number;
  };

  ProduccionReporteOperacion: {
    id_guia: number;
    id_empresa: number;
    id_grupo_equipo: number;
    id_ubicacion: number;
    fecha_guia: string;
    responsable?: string;
    descripcion_equipo?: string | null;
  };

  // CONSUMOS
  CrearConsumoReporteOperacion: {
    id_guia: number;
    id_empresa: number;
    id_ubicacion: number;
    produccion?: number | null;
  }

  // Pantalla: editar consumo.
  EditarConsumoReporteOperacion: {
    id_consumo: number;
    id_guia: number;
    id_empresa: number;
    id_ubicacion: number;
  };
};

// Root stack (AuthStackParamList) ahora incluye el módulo Operativo como stack anidado.
export type AuthStackParamList = {
  Domain: undefined;
  User: { domain: string; username: string };
  Password: { domain: string; username: string; empresaId?: number };
  Main: undefined;

  Averias: undefined;
  FiltrosAvanzados: { grupoId: number; grupoName: string };
  CargarImagen: { backlogId: number; empresaId: number; titulo: string };

  ReporteVariables: undefined;
  Operativo: NavigatorScreenParams<OperativoStackParamList>;

  // OT
  Calendario_OT: undefined;
  OrdenesTrabajoDia: { fecha: string };
  RealizarOT: { id: number; folio: string };
  RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string };

  // Revisiones
  Revisiones: undefined;
};