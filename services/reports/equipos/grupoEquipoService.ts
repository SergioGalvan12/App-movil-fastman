// service/grupoEquipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface GrupoEquipo {
  id_grupo_equipo: number;
  nombre_grupo_equipo: string;
}

// services/grupoEquipoService.ts

export const fetchGrupoEquipos = async (): Promise<ApiResponse<GrupoEquipo[]>> => {
    const resp = await apiClient.get<GrupoEquipo[]>('grupo-equipo/', {
      params: { status_grupo_equipo: true }
    });
  
    if (resp.success && resp.data) {
      // ordenamos antes de devolver
      const sorted = resp.data.slice().sort((a, b) =>
        a.nombre_grupo_equipo.localeCompare(b.nombre_grupo_equipo)
      );
      return { ...resp, data: sorted };
    }
    return resp;
  };
  
