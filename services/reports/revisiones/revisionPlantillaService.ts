// services/reports/revisiones/revisionPlantillaService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface RevisionPlantilla {
  id_revision: number;
  id_empresa: number;
  id_grupo_equipo: number;
  codigo_revision: string;
  nombre_revision: string;
  descripcion_revision: string;
  status_revision: boolean;
}

// El backend puede regresar:
type Paged<T> = { results: T[]; next: string | null };

function normalizeResponse(data: any): { items: RevisionPlantilla[]; next: string | null } {
  if (Array.isArray(data)) {
    return { items: data as RevisionPlantilla[], next: null };
  }
  const paged = data as Paged<RevisionPlantilla>;
  return { items: paged?.results ?? [], next: paged?.next ?? null };
}

/** GET /revision-plantilla/?status_revision=true */
export const fetchRevisionesPlantilla = async (): Promise<ApiResponse<RevisionPlantilla[]>> => {
  try {
    let all: RevisionPlantilla[] = [];
    let page = 1;
    let next: string | null = 'start';

    while (next) {
      const resp = await apiClient.get<any>('revision-plantilla/', {
        params: { page, status_revision: true },
      });

      if (!resp.success || resp.data == null) {
        return { success: false, error: 'No se pudieron obtener revisiones' };
      }

      const { items, next: nextUrl } = normalizeResponse(resp.data);
      all = all.concat(items);

      // Si el backend devolvió arreglo plano, no hay "next" → salimos
      if (!nextUrl) break;

      next = nextUrl;
      page += 1;
    }

    return { success: true, data: all };
  } catch (err: any) {
    console.error('[revisionPlantillaService] Error:', err?.message || err);
    return { success: false, error: err?.message || 'Error al obtener revisiones' };
  }
};

/** Filtra en cliente por id_grupo_equipo */
export const fetchRevisionesPorGrupo = async (
  id_grupo_equipo: number
): Promise<ApiResponse<RevisionPlantilla[]>> => {
  const r = await fetchRevisionesPlantilla();
  if (!r.success || !r.data) return r as ApiResponse<RevisionPlantilla[]>;
  const filtradas = r.data.filter(x => x.id_grupo_equipo === id_grupo_equipo);
  return { success: true, data: filtradas };
};
