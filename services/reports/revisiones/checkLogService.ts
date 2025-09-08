// services/reports/revisiones/checkLogService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface CreateCheckLogPayload {
  id_equipo: number;
  id_personal: number;
  id_turno: number;
  elemento_check: string;
  observaciones_check?: string;
  estado_check: 'MAL' | 'REGULAR' | 'BIEN';
  fecha_check: string;
  id_empresa: number;
}

/**
 * createCheckLog — Llama a POST /check-log/ para registrar la revisión.
 * Devuelve el objeto creado (201).
 */
export const createCheckLog = async (
  payload: CreateCheckLogPayload
): Promise<ApiResponse<any>> => {
  return apiClient.post<any>('check-log/', payload);
};