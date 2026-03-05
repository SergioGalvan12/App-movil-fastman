import apiClient, { ApiResponse } from '../../apiClient';

export interface ConsumoRow {
  id_consumo: number;
  id_empresa: number;
  id_almacen?: number | null;
  id_guia: number;
  produccion: number | null;
  id_material: number;
  nombre_material: string | null;
  cantidad_consumo: string;
  cantidad_planeada: string;
  consumo_inicio_consumo: string | null;
  costo: string;
  externo: boolean;
  egresado: boolean;
  status_consumo: boolean;
  abreviatura_unidad: string | null;
  created?: string;
  modified?: string;
}

export type CreateConsumoPayload = {
  id_consumo?: number;
  id_empresa: number;
  id_guia: number;
  produccion: number | null;
  id_material: number;
  id_almacen: number;
  consumo_inicio_consumo: string;
  cantidad_planeada: string;
  cantidad_consumo: string;
  costo: string;
  costo_inventario: number;
  externo: boolean;
  egresado: boolean;
  status_consumo?: boolean;
  id_material_usado?: number | null;
};

export const createConsumo = async (
  payload: CreateConsumoPayload
): Promise<ApiResponse<ConsumoRow>> => {
  return apiClient.post<ConsumoRow>('consumo/', payload);
};

export const fetchConsumosByGuia = async (
  id_guia: number
): Promise<ApiResponse<ConsumoRow[]>> => {
  return apiClient.get<ConsumoRow[]>('consumo/', {
    params: {
      id_guia,
      status_consumo: true,
    },
  });
};

export type PatchConsumoPayload = Partial<{
  cantidad_consumo: string;
  externo: boolean;
  id_material: number;
  id_material_usado: number | null;
}>;

export const patchConsumo = async (
  id_consumo: number,
  payload: PatchConsumoPayload
): Promise<ApiResponse<any>> => {
  return apiClient.patch<any>(`consumo/${id_consumo}/`, payload);
};

/**
 * Soft delete: PATCH status_consumo=false
 */
export const deleteConsumoSoft = async (
  id_consumo: number
): Promise<ApiResponse<any>> => {
  return apiClient.patch<any>(`consumo/${id_consumo}/`, { status_consumo: false });
};