// services/personalService.ts
import apiClient, { ApiResponse } from '../../apiClient';

// Modelo mínimo del personal que necesitamos
export interface Personal {
  id_equipo: number;        // ← ésta es la PK
  id_personal: string;      // código visible
  nombre_personal: string;
  apaterno_personal: string;
  amaterno_personal: string;
  id_puesto_personal: number;
}

/**
 * fetchPersonals — Llama a GET /personal/?status_personal=true
 * Devuelve ApiResponse<Personal[]> con la lista de personal activo.
 */
export const fetchPersonals = async (): Promise<ApiResponse<Personal[]>> => {
  return apiClient.get<Personal[]>('personal/', { params: { status_personal: true } });
};
