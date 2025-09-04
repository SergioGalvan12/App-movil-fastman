// services/reports/revisiones/revisionEquipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface RevisionEquipo {
  id_revision?: number;
  id_grupo_equipo: number | null;
  nombre_revision: string;        // p.ej. "Temperatura"
  descripcion_revision?: string;  // texto base sugerido
  status_revision?: boolean;
}

/**
 * Trae revisiones activas. Si el backend soporta filtrado por grupo,
 * puedes pasar id_grupo_equipo y evitamos traer todo.
 */
export const fetchRevisionesEquipo = async (
  id_grupo_equipo?: number
): Promise<ApiResponse<RevisionEquipo[]>> => {
  const params: Record<string, any> = { status_revision: true };
  if (id_grupo_equipo) params.id_grupo_equipo = id_grupo_equipo;

  const resp = await apiClient.get<RevisionEquipo[]>('revision-equipo/', { params });
  if (resp.success && resp.data) {
    // ordenar por nombre para una mejor UX
    const data = resp.data.slice().sort((a, b) =>
      a.nombre_revision.localeCompare(b.nombre_revision)
    );
    return { ...resp, data };
  }
  return resp;
};
