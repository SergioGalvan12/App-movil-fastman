import apiClient, { ApiResponse } from '../../../services/apiClient';

export interface ReporteOperacionPayload {
  id_guia:                     number | null;
  numero_economico_equipo:     number;
  id_personal:                 number;
  id_turno:                    number;
  id_empresa:                  number;
  id_ubicacion:                number | null;
  id_area:                     number | null;
  id_proceso:                  number | null;
  id_subproceso:               number | null;
  id_grupo_equipo:             number;
  unidad:                      any;            // null en tu payload
  descripcion_guia:            string;
  fecha_guia:                  string;
  consumo_unitario:            boolean;
  km_hrs_inicio:               string;         // usas strings para igualar tu UI
  km_hrs_final:                string;
  status_checklist_reporte:    string;
  producto_1:                  string;
  producto_2:                  string;
  producto_3:                  string;
  produccion_1:                string;
  produccion_2:                string;
  produccion_3:                string;
  status_guia_inspeccion:      boolean;
}

export interface ReporteOperacionResponse {
  id_guia: number;
}

export const createReporteOperacion = async (
  payload: ReporteOperacionPayload
): Promise<ApiResponse<ReporteOperacionResponse>> => {
  return apiClient.post<ReporteOperacionResponse>(
    'guia-inspeccion/',
    payload
  );
};
