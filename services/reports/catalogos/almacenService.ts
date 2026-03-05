import apiClient, { ApiResponse } from '../../apiClient';

export interface AlmacenRow {
  id_almacen: number;
  nombre_almacen: string;
  descripcion_almacen: string | null;
  status: boolean;
  id_empresa: number;
  id_ubicacion: number;
}

export const fetchAlmacenesByUbicacion = async (
  id_ubicacion: number
): Promise<ApiResponse<AlmacenRow[]>> => {
  return apiClient.get<AlmacenRow[]>('almacen/', {
    params: { id_ubicacion, status: true },
  });
};