// services/reports/catalogos/marcaService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface Marca {
  id_marca: number;
  id_empresa: number;
  nombre_marca: string;
  descripcion_marca: string;
  status_marca: boolean;
}

/**
 * fetchMarcas — Trae marcas activas, ordenadas alfabéticamente por nombre.
 */
export const fetchMarcas = async (): Promise<ApiResponse<Marca[]>> => {
  const resp = await apiClient.get<Marca[]>('marca/', { params: { status_marca: true } });
  if (resp.success && resp.data) {
    const sorted = resp.data.slice().sort((a, b) => a.nombre_marca.localeCompare(b.nombre_marca));
    return { ...resp, data: sorted };
  }
  return resp;
};
