import apiClient, { ApiResponse } from '../../apiClient';

export interface Equipo {
  id_equipo: number;
  matricula_equipo: string | null;
  numero_economico_equipo?: string | null;
  descripcion_equipo?: string | null;
  id_grupo_equipo: number | null;
  uso_equipo: string | null;
  contador_control_ot: number;
  id_empresa: number;
  id_ubicacion: number | null;
  id_area: number | null;
  id_proceso: number | null;
  id_subproceso: number | null;
}

interface ListResponse {
  results: Equipo[];
  next: string | null;
}

/**
 * Trae todas las páginas de /equipo/ con filtros.
 */
const fetchEquiposPaged = async (params: Record<string, any>): Promise<ApiResponse<Equipo[]>> => {
  let all: Equipo[] = [];
  let page = 1;
  let keepGoing = true;

  while (keepGoing) {
    const resp = await apiClient.get<ListResponse>('equipo/', {
      params: { ...params, page },
    });

    if (!resp.success || !resp.data) {
      return { success: false, error: resp.error ?? 'Error al cargar equipos' };
    }

    all = all.concat(resp.data.results);
    keepGoing = !!resp.data.next;
    page += 1;
  }

  return { success: true, data: all };
};

export const fetchEquipos = async (): Promise<ApiResponse<Equipo[]>> => {
  return fetchEquiposPaged({ status_equipo: true });
};

export const fetchEquiposByGrupo = async (
  id_grupo_equipo: number
): Promise<ApiResponse<Equipo[]>> => {
  return fetchEquiposPaged({
    status_equipo: true,
    id_grupo_equipo,
  });
};

export const fetchEquipoById = async (
  id: number
): Promise<ApiResponse<Equipo>> => {
  return await apiClient.get<Equipo>(`equipo/${id}/`);
};
