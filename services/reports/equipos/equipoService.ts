// services/reports/equipos/equipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface Equipo {
  id_equipo: number;
  matricula_equipo: string;
  id_grupo_equipo: number;

  // estos vienen en el listado:
  uso_equipo: string;         // p. ej. "2193.000"
  contador_control_ot: number; // p. ej. 0
}

interface ListResponse {
  results: Equipo[];
  next: string | null;
}

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
    if (resp.data.next) {
      page += 1;
    } else {
      keepGoing = false;
    }
  }

  return { success: true, data: all };
};
