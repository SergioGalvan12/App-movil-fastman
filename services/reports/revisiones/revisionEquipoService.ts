// services/reports/revisiones/revisionEquipoService.ts
import apiClient, { ApiResponse } from '../../apiClient';

export interface RevisionEquipo {
    id_revision: number;
    id_grupo_equipo: number;
    nombre_revision: string;
    codigo_revision: string;
    descripcion_revision: string;
    status_revision: boolean;
}

/**
 * GET /revision-equipo/?status_revision=true
 */
type ListResponse = { results: RevisionEquipo[]; next: string | null };

export const fetchRevisionesEquipo = async (): Promise<ApiResponse<RevisionEquipo[]>> => {
    let all: RevisionEquipo[] = [];
    let page = 1;
    let next = true;
    while (next) {
        const resp = await apiClient.get<ListResponse>('revision-equipo/', {
            params: { page, status_revision: true },
        });
        if (!resp.success || !resp.data) break;
        all = all.concat(resp.data.results);
        next = !!resp.data.next;
        page += 1;
    }
    return { success: true, data: all };
};

/** Utilidad para traerlas filtradas por grupo en cliente */
export const fetchRevisionesPorGrupo = async (
    id_grupo_equipo: number
): Promise<ApiResponse<RevisionEquipo[]>> => {
    const r = await fetchRevisionesEquipo();
    if (!r.success || !r.data) return r as ApiResponse<RevisionEquipo[]>;
    const filtradas = r.data.filter(x => x.id_grupo_equipo === id_grupo_equipo);
    return { success: true, data: filtradas };
};
