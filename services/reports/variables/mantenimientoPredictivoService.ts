// src/services/mantenimientoPredictivoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface VariableControl {
  id_mantto_pred: number;
  id_mantto_pred_pub: string;
  descripcion_mantto_pred: string;
  unidad: number;
  lim_inf_mantto_pred: string;
  lim_sup_mantto_pred: string;
  nombre_unidad: string;
  // …otros campos si los necesitas
}

/**
 * fetchVariablesControl — Llama a GET /mantenimiento-predictivo/?status_mantto_pred=true
 */
export const fetchVariablesControl = async (): Promise<ApiResponse<VariableControl[]>> => {
  const endpoint = 'mantenimiento-predictivo/';
  const params = { status_mantto_pred: true };
  console.log(`[mantenimientoPredictivoService] GET → ${apiClient['client'].defaults.baseURL}${endpoint}`, params);
  const response = await apiClient.get<VariableControl[]>(endpoint, { params });
  console.log('[mantenimientoPredictivoService] respuesta →', response);
  return response;
};
