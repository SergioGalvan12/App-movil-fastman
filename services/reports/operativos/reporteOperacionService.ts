// services/reports/operativos/reporteOperacionService.ts
import apiClient, { ApiResponse } from '../../../services/apiClient';

/**
 * Payload completo para POST /api/guia-inspeccion/
 * Todos los campos reflejan el JSON que envía la web.
 */
export interface ReporteOperacionPayload {
  id_guia?: null;
  numero_economico_equipo: number;
  id_personal:           number;
  id_turno:              number;
  id_empresa:            number;
  id_ubicacion:          number | null;
  id_area:               number | null;
  id_proceso:            number | null;
  id_subproceso:         number | null;
  id_grupo_equipo:       number;
  unidad:                number | null;
  descripcion_guia:      string;
  fecha_guia:            string;
  consumo_unitario:      boolean;
  km_hrs_inicio:         string;
  km_hrs_final:          string;
  status_checklist_reporte?: string;
  producto_1?:           string;
  producto_2?:           string;
  producto_3?:           string;
  produccion_1?:         string;
  produccion_2?:         string;
  produccion_3?:         string;
  status_guia_inspeccion: boolean;
}

/**
 * Lo que devuelve el servidor tras crear
 */
export interface ReporteOperacionResponse {
  id_guia: number;
  // … otros campos si te interesa leerlos
}

/**
 * Crea un reporte operativo enviando
 * exactamente el mismo JSON que la web.
 */
export const createReporteOperacion = async (
  payload: ReporteOperacionPayload
): Promise<ApiResponse<ReporteOperacionResponse>> => {
  return await apiClient.post<ReporteOperacionResponse>(
    'guia-inspeccion/',
    payload
  );
};
