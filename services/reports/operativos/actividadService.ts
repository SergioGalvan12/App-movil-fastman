import apiClient, { ApiResponse } from '../../apiClient';

export type ActividadRow = {
    id_actividad: number;
    id_empresa: number;
    id_guia: number;
    id_codigo: number;
    executed: boolean;
    inicio_actividad: string;
    fin_actividad: string;
    duracion?: string | null;
    tipo_codigo?: string | null;
    descripcion_codigo?: string | null;
    status_actividad: boolean;
};

export type CrearActividadPayload = {
    id_actividad: number;
    id_guia: number;
    id_codigo: number;
    inicio_actividad: string;
    fin_actividad: string;
    id_empresa: number;
    duracion: string;
    executed?: boolean;
    status_actividad?: boolean;
};

export const fetchActividadesByGuia = async (
    id_guia: number
): Promise<ApiResponse<ActividadRow[]>> => {
    return apiClient.get<ActividadRow[]>('actividad/', {
        params: { id_guia, status_actividad: true },
    });
};

export const createActividad = async (
    payload: CrearActividadPayload
): Promise<ApiResponse<ActividadRow>> => {
    return apiClient.post<ActividadRow>('actividad/', {
        ...payload,
        executed: payload.executed ?? true,
        status_actividad: payload.status_actividad ?? true,
    });
};

export const patchActividad = async (
    id_actividad: number,
    payload: Partial<CrearActividadPayload> & { status_actividad?: boolean }
): Promise<ApiResponse<ActividadRow>> => {
    return apiClient.patch<ActividadRow>(`actividad/${id_actividad}/`, payload);
};

export const softDeleteActividad = async (
    id_actividad: number
): Promise<ApiResponse<ActividadRow>> => {
    return apiClient.patch<ActividadRow>(`actividad/${id_actividad}/`, {
        status_actividad: false,
    });
};