// services/reports/averias/grupoEquipoBacklogService.ts
import apiClient, { ApiResponse } from '../../apiClient';

/**
 * Interfaz que representa un backlog asociado a un grupo de equipo.
 * Corresponde a cada objeto que devuelve GET /grupo-equipo-backlog/
 */
export interface GrupoEquipoBacklog {
  id_grupo_backlog: number;  
  nombre_falla: string;
  id_grupo_equipo: number;
  id_backlog_plantilla: number;   // ← NUEVO
  // ...añade aquí otros campos si los necesitas
}

/**
 * fetchGrupoEquipoBacklog
 * -----------------------
 * Llama al endpoint:
 *   GET /grupo-equipo-backlog/?id_grupo_equipo=<grupoId>&status=true
 *
 * @param grupoId  El id del grupo de equipo para filtrar
 * @returns        ApiResponse<GrupoEquipoBacklog[]>
 */
export const fetchGrupoEquipoBacklog = async (
  grupoId: number
): Promise<ApiResponse<GrupoEquipoBacklog[]>> => {
  return apiClient.get<GrupoEquipoBacklog[]>(
    'grupo-equipo-backlog/',
    {
      params: {
        id_grupo_equipo: grupoId,
        status: true
      }
    }
  );
};
