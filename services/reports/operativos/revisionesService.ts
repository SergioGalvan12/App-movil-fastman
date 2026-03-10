import apiClient, { ApiResponse } from '../../apiClient';

export type EstadoCheck = 'MAL' | 'REGULAR' | 'BIEN' | 'NA';

export type CheckRow = {
    id_check?: number;
    id_guia: number;
    id_empresa: number;
    elemento_check: string;
    estado_check: EstadoCheck;
    observaciones_check: string;
    status_check?: boolean;
};

export type InspeccionRow = {
    id_inspeccion: number;
    nombre_inspeccion: string;
    descripcion_inspeccion?: string | null;
};

export const fetchChecksByGuia = async (
    id_guia: number
): Promise<ApiResponse<CheckRow[]>> => {
    return apiClient.get<CheckRow[]>('check/', {
        params: { id_guia, status_check: true, page_size: 25 },
    });
};

export const fetchInspeccionesPorGrupo = async (
    id_grupo_equipo: number
): Promise<ApiResponse<InspeccionRow[]>> => {
    return apiClient.get<InspeccionRow[]>('inspecciones-por-grupo/', {
        params: { id_grupo_equipo },
    });
};

// crear individual
export const createCheck = async (
    payload: Omit<CheckRow, 'id_check'>
): Promise<ApiResponse<CheckRow>> => {
    return apiClient.post<CheckRow>('check/', payload);
};

// editar
export const patchCheck = async (
    id_check: number,
    payload: Partial<Pick<CheckRow, 'elemento_check' | 'observaciones_check' | 'estado_check'>>
): Promise<ApiResponse<CheckRow>> => {
    return apiClient.patch<CheckRow>(`check/${id_check}/`, payload);
};

// soft delete 
export const softDeleteCheck = async (
    id_check: number
): Promise<ApiResponse<CheckRow>> => {
    return apiClient.patch<CheckRow>(`check/${id_check}/`, { status_check: false });
};