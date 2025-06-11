// services/reports/ordenesTrabajo/ordenTrabajoService.ts
import apiClient from '../../apiClient';

export interface ResumenOT {
  fecha: string; // formato YYYY-MM-DD
  ots: number;
}

/**
 * Consulta las órdenes de trabajo resumidas por día en un rango de fechas
 */
export async function getResumenOrdenesTrabajoPorMes(desde: string, hasta: string) {
  const params = {
    planeada_orden_trabajo: true,
    programada_orden_trabajo: true,
    ejecutada_orden_trabajo: false,
    desde,
    hasta,
    fecha_prog_orden_trabajo_after: desde,
    fecha_prog_orden_trabajo_before: hasta,
    ordering: '-fecha_fin_ejec_plan_orden_trabajo',
    status_orden_trabajo: true,
  };

  const result = await apiClient.get<ResumenOT[]>('/orden-trabajo-resumen-programa/', { params });
  return result;
}
