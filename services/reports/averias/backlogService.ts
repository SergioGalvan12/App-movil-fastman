// services/reports/averias/backlogService.ts

/**
 * Servicio para gestionar la creación de "acciones correctivas" (backlog) en el backend.
 * Utiliza el cliente HTTP basado en Axios configurado en apiClient.ts.
 */

import apiClient, { ApiResponse } from '../../../services/apiClient';

/** Filtros para listar acciones correctivas */
export interface BacklogListFilters {
    page?: number;
    status_backlog?: boolean;
    search?: string; // texto libre para buscar por id_pub o descripción
    // ...otros filtros que necesites...
}

/** Interface para cada fila de la lista */
export interface BacklogListItem {
    id_backlog: number;
    id_backlog_pub: string;
    numero_economico_equipo: number;
    descripcion_equipo: string;
    nombre_falla: string;
    descripcion_backlog: string;
    fecha_backlog: string;
    status_backlog: boolean;
    id_grupo_equipo: number;
    // …añade aquí las columnas que vayas a mostrar…
}

/** Paginación estándar si tu API la devuelve */
export interface Paginated<T> {
    results: T[];
    countItemsOnPage: number;
    current: number;
    lastPage: number;
    next?: string;
    previous?: string;
}

/**
 * Interfaz que describe el cuerpo de la petición para crear una acción correctiva.
 * Estos campos deben coincidir exactamente con lo que el endpoint POST /backlog/ espera.
 */
export interface BacklogPayload {
    id_backlog: number | null;                // Null al crear una nueva
    id_backlog_pub: string;                   // Código visible (ej: "AC9 - Suspensión dañada")
    id_empresa: number;                       // ID de la empresa asociada
    numero_economico_equipo: number;          // Identificador interno del equipo
    descripcion_backlog: string;              // Descripción de la falla
    descripcion_equipo?: string;              // Descripción adicional del equipo (opcional)
    estatus?: any;                            // Estado interno (opcional)
    fecha_backlog: string;                    // Fecha de reporte en formato YYYY-MM-DD
    ejecutada_backlog: boolean;               // Si la orden se ha ejecutado
    fecha_ejecucion_orden_trabajo: string | null; // Fecha de ejecución (null si no aplica)
    tipo_backlog: string;                     // Tipo de acción (p.ej. 'MC')
    ot_created: boolean;                      // Si se generó OT automáticamente
    id_ubicacion: number | null;              // ID de ubicación (opcional)
    id_area: number | null;                   // ID de área (opcional)
    id_proceso: number | null;                // ID de proceso (opcional)
    id_subproceso: number | null;             // ID de subproceso (opcional)
    id_orden_trabajo: number | null;          // ID de orden de trabajo relacionada (opcional)
    grupo_equipo: number;                     // Grupo de equipo (número interno)
    id_marca_equipo: number | null;           // ID de marca de equipo (opcional)
    id_modelo_equipo: number | null;          // ID de modelo de equipo (opcional)
    nombre_falla: string;                     // Nombre de la falla (plantilla)
    error_origen: number;                     // ID de la falla seleccionada
    id_personal: number;                      // ID del usuario que reporta/importante para auditoría
    id_turno: number;                         // ID del turno
    actividades_backlog: number[];            // Lista de IDs de actividades asociadas
    status_backlog: boolean;                  // Estado activo/inactivo
    id_equipo: number;                        // ID interno del equipo
    id_grupo_equipo: number;                  // ID de grupo de equipo (duplicado de grupo_equipo)
}

/**
 * Interfaz que describe la respuesta que devuelve el backend al crear una acción.
 * Incluye al menos el nuevo id_backlog y cualquier otro dato devuelto.
 */
export interface BacklogResponse {
    id_backlog: number;
    id_backlog_pub: string;
    id_empresa: number;
    numero_economico_equipo: number;
    descripcion_equipo: string;
    nombre_falla: string;
    descripcion_backlog: string;
    fecha_backlog: string;
    ejecutada_backlog: boolean;
    tipo_backlog: string;
    id_personal: number;
    id_turno: number;
    status_backlog: boolean;
    id_ubicacion: number | null;
    id_area: number | null;
    id_proceso: number | null;
    id_subproceso: number | null;
    id_marca_equipo: number | null;
    id_modelo_equipo: number | null;
    // …y cualquier otro que uses en el detalle…
    [key: string]: any;
}
/**
 * Realiza la petición POST /backlog/ para crear una nueva acción correctiva.
 * Devuelve una promesa con ApiResponse<BacklogResponse> que indica éxito/fallo.
 * @param payload Objeto con todos los datos necesarios para la creación
 */
export const createBacklog = async (
    payload: BacklogPayload
): Promise<ApiResponse<BacklogResponse>> => {
    // apiClient.post envía el payload al endpoint 'backlog/' (se concatena a baseURL)
    return apiClient.post<BacklogResponse>('backlog/', payload);
};


/**
 * GET /backlog/ — lista acciones correctivas
 */
export const listBacklogs = async (
    filters?: BacklogListFilters
): Promise<ApiResponse<Paginated<BacklogListItem>>> => {
    return apiClient.get<Paginated<BacklogListItem>>('backlog/', {
        params: filters,
    });
};

/**
 * GET /backlog/{id}/ — trae un detalle completo de una acción
 */
export const getBacklogById = async (
    id: number
): Promise<ApiResponse<BacklogResponse>> => {
    return apiClient.get<BacklogResponse>(`backlog/${id}/`);
};