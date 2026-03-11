import apiClient, { ApiResponse } from '../../apiClient';

export interface MaterialRow {
  id_material: number;
  numero_almacen_material: string | null;
  nombre_material: string;
  descripcion_material: string | null;
  abreviatura_unidad: string | null;
  costo_material: string; // "0.00"
  id_grupo_material: number;
  status_material: boolean;
  id_empresa: number;
}

export interface MaterialHomologadoRow {
  id_material: number;
  numero_almacen_material: string | null;
  nombre_material: string;
  descripcion_material: string | null;
  abreviatura_unidad: string | null;
  id_grupo_material: number | null;
  id_marca: number | null;
  id_modelo: number | null;
  homologado: number | null;
}

// Materiales por grupo (usado cuando consumo es externo)
export const fetchMaterialesByGrupo = async (
  id_grupo_material: number
): Promise<ApiResponse<MaterialRow[]>> => {
  return apiClient.get<MaterialRow[]>('material/', {
    params: {
      id_grupo_material,
      status_material: true,
      no_pagination: true,
    },
  });
};

/**
 inferir el grupo del material actual
 */
export const fetchMaterialById = async (
  id_material: number
): Promise<ApiResponse<MaterialRow[]>> => {
  return apiClient.get<MaterialRow[]>('material/', {
    params: {
      id_material,
      no_pagination: true,
    },
  });
};

// Materiales homologados
export const fetchMaterialesHomologados = async (
  id_material: number
): Promise<ApiResponse<MaterialHomologadoRow[]>> => {
  return apiClient.get<MaterialHomologadoRow[]>(`material/${id_material}/homologados/`, {
    params: { page_size: 25 },
  });
};

export const fetchMaterialesByGrupoAndAlmacen = async (
  id_grupo_material: number,
  id_almacen: number
): Promise<ApiResponse<MaterialRow[]>> => {
  return apiClient.get<MaterialRow[]>('material/', {
    params: {
      id_grupo_material,
      id_almacen,
      status_material: true,
      no_pagination: true,
    },
  });
};