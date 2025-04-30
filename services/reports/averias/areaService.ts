// services/reports/averias/areaService.ts
import apiClient, { ApiResponse } from '../../apiClient';

/**
 * Interfaz que representa un área de un backlog de avería.
 */
export interface Area {
  id_area: number;
  id_ubicacion: number;
  nombre_area: string;
  descripcion_area: string;
  administrador_area: number;
  maintenance_is_automatic: boolean;
  centro_costo: string | null;
  status_area: boolean;
}

/**
 * fetchAreas
 * ----------
 * Llama a GET /areas/?status_area=true,
 * devuelve la lista de áreas activas,
 * ordenadas alfabéticamente por nombre_area.
 */
export const fetchAreas = async (): Promise<ApiResponse<Area[]>> => {
  const resp = await apiClient.get<Area[]>('areas/', {
    params: { status_area: true },
  });

  if (resp.success && resp.data) {
    // orden alfabético
    const sorted = resp.data.slice().sort((a, b) =>
      a.nombre_area.localeCompare(b.nombre_area)
    );
    return { ...resp, data: sorted };
  }
  return resp;
};
