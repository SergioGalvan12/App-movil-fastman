// services/clasificacionService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface ClasificacionUbicacion {
  id_clasificacion: number;
  nombre_clasificacion: string;
  descripcion_clasificacion: string;
  status: boolean;
  id_empresa: number;
}

export const fetchClasificacionesUbicacion = async (): Promise<ApiResponse<ClasificacionUbicacion[]>> => {
  const resp = await apiClient.get<ClasificacionUbicacion[]>('clasificacion-ubicacion/', {
    params: { status: true },
  });

  if (resp.success && resp.data) {
    // ordenamos por nombre, para que aparezcan alfabeticamente
    const sorted = resp.data.slice().sort((a, b) =>
      a.nombre_clasificacion.localeCompare(b.nombre_clasificacion)
    );
    return { ...resp, data: sorted };
  }
  return resp;
};
