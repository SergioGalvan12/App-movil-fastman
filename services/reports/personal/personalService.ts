// services/personalService.ts
import apiClient, { ApiResponse } from './apiClient';

// Modelo mínimo del personal que necesitamos
export interface Personal {
  id_equipo: number;
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
  const endpoint = 'personal/';
  const params = { status_personal: true };
  console.log(`[personalService] GET → ${apiClient['client'].defaults.baseURL}${endpoint}`, params);
  
  const response = await apiClient.get<Personal[]>(endpoint, { params });
  
  console.log('[personalService] respuesta fetchPersonals →', response);
  return response;
};
