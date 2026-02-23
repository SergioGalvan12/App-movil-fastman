export type AuthStackParamList = {
  Domain: undefined;
  User: { domain: string; username: string };
  Password: { domain: string; username: string; empresaId?: number };
  Main: undefined;

  Averias: undefined;
  FiltrosAvanzados: { grupoId: number; grupoName: string };
  CargarImagen: { backlogId: number; empresaId: number; titulo: string };

  ReporteVariables: undefined;
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
  };

  ProduccionReporteOperacion: {
    id_guia: number;
    id_empresa: number;
    id_grupo_equipo: number;
    responsable?: string;
    descripcion_equipo?: string | null;
  };

  // OT
  Calendario_OT: undefined;
  OrdenesTrabajoDia: { fecha: string };
  RealizarOT: { id: number; folio: string };
  RealizarActividadOT: { idActividad: number; idOrdenTrabajo: number; folio: string };

  // Revisiones
  Revisiones: undefined;
};
