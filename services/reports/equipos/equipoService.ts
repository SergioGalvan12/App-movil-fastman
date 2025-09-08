// services/reports/equipos/equipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface Equipo {
  id_equipo: number;

  // Identificadores visibles en UI (pueden venir vacíos en algunos equipos)
  matricula_equipo: string | null;            // ej. "TER-532075"
  numero_economico_equipo?: string | null;    // ej. "532075"
  descripcion_equipo?: string | null;         // ej. "Tractocamion 126"

  id_grupo_equipo: number | null;

  // Lecturas (suelen venir como string/number o null)
  uso_equipo: string | null;          // p.ej. "2193.000"
  contador_control_ot: number;        // p.ej. 0

  // Relacionales que necesita el payload
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

/** Trae todas las páginas de /equipo/?status_equipo=true */
export const fetchEquipos = async (): Promise<ApiResponse<Equipo[]>> => {
  let all: Equipo[] = [];
  let page = 1;
  let keepGoing = true;

  while (keepGoing) {
    const resp = await apiClient.get<ListResponse>('equipo/', {
      params: { page, status_equipo: true },
    });
    if (!resp.success || !resp.data) break;
    all = all.concat(resp.data.results);
    keepGoing = !!resp.data.next;
    page += 1;
  }

  return { success: true, data: all };
};

/** Trae el detalle completo de un equipo por ID */
export const fetchEquipoById = async (
  id: number
): Promise<ApiResponse<Equipo>> => {
  return await apiClient.get<Equipo>(`equipo/${id}/`);
};
