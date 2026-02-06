// src/services/variables/mantenimientoPredictivoService.ts
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
  const base = (apiClient as any)['client']?.defaults?.baseURL ?? '';
  console.log(`[mantenimientoPredictivoService] GET → ${base}/${endpoint}`, params);
  const response = await apiClient.get<VariableControl[]>(endpoint, { params });
  console.log('[mantenimientoPredictivoService] respuesta →', response);
  return response;
};


export interface CreateReporteManttoPredictivoPayload {
  id_mantto_pred: number | string;
  id_personal: number | string;
  id_turno: number | string;
  id_equipo: number;
  numero_economico_equipo: string;
  id_grupo_equipo: number;
  valor_reporte: string;
  codigo_reporte: string;
  fecha_reporte: string; // “YYYY-MM-DDTHH:mm:ss”
  hora_reporte: string; // “HH:mm:ss”
  id_empresa: number;
}

export interface CreateReporteManttoPredictivoResponse {
  id_reporte: number;
  id_empresa: number;
  id_mantto_pred: number;
  id_equipo: number;
  codigo_reporte: string;
  valor_reporte: string;
  fecha_reporte: string;
  id_personal: number;
  id_turno: number;
  status_reporte: boolean;
}

/**
 * createReporteManttoPredictivo — Llama a POST /reporte-mantenimiento-predictivo/
 */
export const createReporteManttoPredictivo = async (
  payload: CreateReporteManttoPredictivoPayload
): Promise<ApiResponse<CreateReporteManttoPredictivoResponse>> => {
  const endpoint = 'reporte-mantenimiento-predictivo/';
  console.log(
    `[mantenimientoPredictivoService] POST → ${apiClient['client'].defaults.baseURL}${endpoint}`,
    payload
  );
  const response = await apiClient.post<CreateReporteManttoPredictivoResponse>(endpoint, payload);
  console.log('[mantenimientoPredictivoService] create response →', response);
  return response;
};
