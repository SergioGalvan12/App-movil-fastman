import apiClient, { ApiResponse } from '../../apiClient';

export interface AlmacenMaterialRow {
  id: number;
  id_almacen: number;
  nombre_almacen: string;
  id_material: number;
  nombre_material: string;
  cantidad: string;
  costo: string;
  abreviatura_unidad: string | null;
  numero_almacen_material?: string | null;
  id_empresa: number;
  status: boolean;
}

export const fetchAlmacenMateriales = async (
  params: { id_material: number; id_almacen?: number }
): Promise<ApiResponse<AlmacenMaterialRow[]>> => {
  return apiClient.get<AlmacenMaterialRow[]>('almacen-materiales/', { params });
};