// services/reports/catalogos/modeloService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface Modelo {
  id_modelo: number;
  id_empresa: number;
  id_marca: number;
  nombre_modelo: string;
  descripcion_modelo: string;
  status_modelo: boolean;
}

/**
 * fetchModelos — Trae modelos activos, opcionalmente filtrados por id_marca.
 * Si pasas idMarca, hace GET /modelo/?status_modelo=true&id_marca=XX
 * Si no, trae todos los modelos activos.
 */
export const fetchModelos = async (idMarca?: number): Promise<ApiResponse<Modelo[]>> => {
  const params: Record<string, any> = { status_modelo: true };
  if (idMarca) params.id_marca = idMarca;

  const resp = await apiClient.get<Modelo[]>('modelo/', { params });
  if (resp.success && resp.data) {
    const sorted = resp.data.slice().sort((a, b) => a.nombre_modelo.localeCompare(b.nombre_modelo));
    return { ...resp, data: sorted };
  }
  return resp;
};
