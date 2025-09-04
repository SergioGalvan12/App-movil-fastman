// services/reports/revisiones/checkLogService.ts
import apiClient, { ApiResponse } from '../../apiClient';

/**
 * Estructura del payload para crear una revisión (check-log)
 * según lo que devuelve/espera el backend.
 */
export interface CreateCheckLogPayload {
  id_equipo: number;         // requerido
  id_personal: string | number; // en web llega string, normalizamos a string|number
  id_turno: string | number;
  elemento_check: string;    // p.ej. “Temperatura”
  observaciones_check?: string;
  estado_check: 'MAL' | 'REGULAR' | 'BIEN';
  fecha_check: string;       // AAAA-MM-DD (enviamos en UTC como acordamos para reportes)
  id_empresa: number;
}

/**
 * createCheckLog — Llama a POST /check-log/ para registrar la revisión.
 * Devuelve el objeto creado (201).
 */
export const createCheckLog = async (
  payload: CreateCheckLogPayload
): Promise<ApiResponse<any>> => {
  // Nota: apiClient ya maneja baseURL, headers y errores
  return apiClient.post<any>('check-log/', payload);
};
