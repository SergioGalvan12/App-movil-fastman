import apiClient, { ApiResponse } from '../../apiClient';

export interface CodigoProductivo {
  id_codigo: number;
  id_producto: number | null;
  nombre_producto: string | null;
  nombre_unidad_codigo?: string | null;
  unidad_control: number | null;
  tipo_codigo: string;
  id_grupo_equipo: number | null;
  status_codigo: boolean;
}

/**
 * Tipo orientado al flujo de Eventos.
 * campos como id_codigo_pub y descripcion_codigo para mostrar
 * correctamente el select de eventos para reportes operativos.
 */
export interface CodigoEventoRow {
  id_codigo: number;
  id_codigo_pub?: string | null;
  nombre?: string | null;
  descripcion_codigo?: string | null;
  tipo_codigo?: string | null;
  id_grupo_equipo?: number | null;
  status_codigo?: boolean;
  id_producto?: number | null;
  nombre_producto?: string | null;
  nombre_grupo_equipo?: string | null;
  nombre_unidad_codigo?: string | null;
}

/**
 * Servicio ya existente para otros flujos de la app.
 * donde se solicite cidogos productivos activos por grupo de equipo
 */
export const fetchCodigosProductivosByGrupoEquipo = async (
  id_grupo_equipo: number
): Promise<ApiResponse<CodigoProductivo[]>> => {
  return apiClient.get<CodigoProductivo[]>('codigo/', {
    params: {
      status_codigo: true,
      id_grupo_equipo,
    },
  });
};

export const fetchCodigosEventoActivos = async (): Promise<ApiResponse<CodigoEventoRow[]>> => {
  return apiClient.get<CodigoEventoRow[]>('codigo/', {
    params: {
      status_codigo: true,
    },
  });
};

/**
 * si se quiere codigos de evento activos por grupo de equipo.
 * Coincide con datos de web:
 * GET /codigo/?status_codigo=true&id_grupo_equipo={id_grupo_equipo}
 */
export const fetchCodigosEventoByGrupoEquipo = async (
  id_grupo_equipo: number
): Promise<ApiResponse<CodigoEventoRow[]>> => {
  return apiClient.get<CodigoEventoRow[]>('codigo/', {
    params: {
      status_codigo: true,
      id_grupo_equipo,
    },
  });
};