// services/turnoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

/**
 * Interfaz que describe un turno según la API.
 */
export interface TurnoInterface {
  id_turno: number;
  id_empresa: number;
  descripcion_turno: string;
  hrs_inicio_turno: string;
  hrs_final_turno: string;
  status_turno: boolean;
}

/**
 * fetchTurnos — Llama a GET /turno/?status_turno=true
 * Devuelve ApiResponse<TurnoInterface[]> con la lista de turnos activos.
 */
export const fetchTurnos = async (): Promise<ApiResponse<TurnoInterface[]>> => {
  console.log('[turnoService] GET → turno/ con status_turno=true');
  const response = await apiClient.get<TurnoInterface[]>('turno/', {
    params: { status_turno: true }
  });
  console.log('[turnoService] respuesta →', response.success ? response.data?.slice(0,5) : response);
  return response;
};
