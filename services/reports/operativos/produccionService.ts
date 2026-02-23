import apiClient, { ApiResponse } from '../../apiClient';

export type ProduccionClasificacionPayload = {
  id_catalogo: number;
  id_clasificacion: number;
};

export interface ProduccionPayload {
  id_produccion: number | null;
  id_empresa: number;
  id_guia: number;
  id_codigo: number;
  cantidad: string;
  unidad_control: number | null;
  status_produccion: boolean;
  clasificaciones: ProduccionClasificacionPayload[];
  porcentaje_merma: string; // "0.0"
  nombre_producto?: string | null;
  nuevas_clasificaciones?: number[]; // ids de clasificacion seleccionadas
}

export interface ProduccionRow {
  id_produccion: number;
  id_guia: number;
  id_codigo: number;
  cantidad: string;
  porcentaje_merma: string;
  nombre_producto: string | null;
  unidad_control: number | null;
  status_produccion: boolean;
}

export const createProduccion = async (
  payload: ProduccionPayload
): Promise<ApiResponse<any>> => {
  return apiClient.post<any>('produccion/', payload);
};

export const fetchProduccionByGuia = async (
  id_guia: number
): Promise<ApiResponse<ProduccionRow[]>> => {
  return apiClient.get<ProduccionRow[]>('produccion/', {
    params: {
      id_guia,
      status_produccion: true,
    },
  });
};
