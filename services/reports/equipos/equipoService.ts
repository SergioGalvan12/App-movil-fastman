// service/equipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface Equipo {
  id_equipo: number;
  numero_economico_equipo: string;
  matricula_equipo: string; 
  id_grupo_equipo: number;
}

export const fetchEquipos = async (): Promise<ApiResponse<Equipo[]>> => {
  const response = await apiClient.get<{ results: Equipo[] }>('equipo/', {
    params: { page: 1, status_equipo: true }
  });
  return { ...response, data: response.data.results };
};
