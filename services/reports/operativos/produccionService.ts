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
  porcentaje_merma: string;
  nombre_producto?: string | null;
  nuevas_clasificaciones?: number[];
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

export type ProduccionPatchPayload = Partial<Pick<
  ProduccionPayload,
  'id_codigo' | 'cantidad' | 'porcentaje_merma' | 'status_produccion' | 'clasificaciones' | 'nuevas_clasificaciones'
>>;

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

// Editar producción (PATCH)
export const patchProduccion = async (
  id_produccion: number,
  payload: ProduccionPatchPayload
): Promise<ApiResponse<any>> => {
  return apiClient.patch<any>(`produccion/${id_produccion}/`, payload);
};


// Eliminar producción (SOFT DELETE)
export const deleteProduccionSoft = async (
  id_produccion: number
): Promise<ApiResponse<any>> => {
  return apiClient.patch<any>(`produccion/${id_produccion}/`, {
    status_produccion: false,
  });
};
