import apiClient, { ApiResponse } from '../../apiClient';

export interface CatalogoClasificacionEvento {
  id_catalogo_clasificacion: number;
  nombre_catalogo: string;
  status: boolean;
  productos: number[];
}

export interface ClasificacionEvento {
  id_clasificacion: number;
  nombre_clasificacion: string;
  descripcion_clasificacion: string | null;
  id_catalogo_clasificacion: number;
  status: boolean;
}

export const fetchCatalogosByProducto = async (
  id_producto: number
): Promise<ApiResponse<CatalogoClasificacionEvento[]>> => {
  return apiClient.get<CatalogoClasificacionEvento[]>(
    'catalogo-clasificacion-evento/',
    {
      params: {
        status: true,
        'productos__id_producto': id_producto,
      },
    }
  );
};

export const fetchClasificacionesByCatalogo = async (
  id_catalogo_clasificacion: number
): Promise<ApiResponse<ClasificacionEvento[]>> => {
  return apiClient.get<ClasificacionEvento[]>(
    'clasificacion-evento/',
    {
      params: {
        status: true,
        id_catalogo_clasificacion,
      },
    }
  );
};
