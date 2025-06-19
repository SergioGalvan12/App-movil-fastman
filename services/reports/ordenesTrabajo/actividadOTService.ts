// src/services/reports/ordenesTrabajo/actividadOTService.ts
import apiClient from '../../apiClient';

export interface GuardarActividadPayload {
  id_actividad_orden: number;
  id_actividad_orden_pub: string;
  id_empresa: number;
  id_orden_trabajo: number;
  id_actividad: number;
  tipo_actividad: string;
  costo_total_actividad_orden: string;
  costo_total_actividad_orden_real: string;
  fecha_inic_real_actividad_orden: string; // formato ISO
  fecha_fin_real_actividad_orden: string; // formato ISO
  tiempo_actividad_orden: string; // "HH:MM:SS"
  tiempo_plan_actividad_orden: string; // "HH:MM:SS"
  comentarios_actividad_orden: string;
  puestos_actividad_orden: any[];
  materiales_actividad_orden: any[];
  observaciones_actividad?: string;
  refacciones_actividad_orden?: any[];
  status_actividad_orden: boolean;
  descripcion_servicio?: string;
  id_tipo_servicio_pub?: string;
  tipo_servicio?: string;
  descripcion: string;
  tiempo_excedente?: boolean;
  inicia_actividad_orden?: boolean;
}

export async function guardarActividadOT(payload: GuardarActividadPayload) {
  try {
    const response = await apiClient.patch('/actividad-orden-trabajo-many/', [payload]);
    return response;
  } catch (error) {
    console.error('[guardarActividadOT] Error al guardar actividad:', error);
    return { success: false, error };
  }
}
