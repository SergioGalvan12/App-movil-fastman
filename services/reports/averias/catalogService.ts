// services/reports/averias/catalogService.ts
import apiClient, { ApiResponse } from '../../apiClient';

/**
 * Interfaz genérica para un ítem de catálogo (clasificación, ubicación, área, etc.)
 */
export interface CatalogItem {
  id: number;
  nombre: string;
}

/**
 * fetchClasificacionUbicacion
 * ---------------------------
 * GET /clasificacion-ubicacion/?status=true
 */
// export const fetchClasificacionUbicacion = async (): Promise<ApiResponse<CatalogItem[]>> =>
//   apiClient.get<CatalogItem[]>('clasificacion-ubicacion/', { params: { status: true } });

/**
 * fetchUbicaciones
 * ----------------
 * GET /ubicaciones/?status_ubicacion=true
 */
// export const fetchUbicaciones = async (): Promise<ApiResponse<CatalogItem[]>> =>
//   apiClient.get<CatalogItem[]>('ubicaciones/', { params: { status_ubicacion: true } });

/**
 * fetchAreas
 * ----------
 * GET /areas/?status_area=true
 */
// export const fetchAreas = async (): Promise<ApiResponse<CatalogItem[]>> =>
//   apiClient.get<CatalogItem[]>('areas/', { params: { status_area: true } });

/**
 * fetchProcesos
 * -------------
 * GET /procesos/?status_proceso=true
 */
// export const fetchProcesos = async (): Promise<ApiResponse<CatalogItem[]>> =>
//   apiClient.get<CatalogItem[]>('procesos/', { params: { status_proceso: true } });

/**
 * fetchSubprocesos
 * ----------------
 * GET /sub-procesos/?status_subproceso=true
 */
// export const fetchSubprocesos = async (): Promise<ApiResponse<CatalogItem[]>> =>
//   apiClient.get<CatalogItem[]>('sub-procesos/', { params: { status_subproceso: true } });
