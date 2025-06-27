// services/reports/ordenesTrabajo/realizarOTService.ts
import apiClient from '../../apiClient';

// Obtener detalles completos de una orden de trabajo
export async function getOrdenTrabajo(id: number) {
    return apiClient.get(`/orden-trabajo/${id}`);
}

// Obtener actividades asociadas a una OT
export async function getActividadesOrdenTrabajo(id_orden_trabajo: number) {
    return apiClient.get(`/actividad-orden-trabajo/?id_orden_trabajo=${id_orden_trabajo}`);
}

// Obtener almacenes disponibles en la ubicación
export interface Almacen {
    id_almacen: number;
    nombre_almacen: string;
    descripcion_almacen: string;
    no_transferencias: number,
    residuos_peligrosos: boolean,
    status: boolean,
    id_empresa: number,
    id_ubicacion: number,
    id_encargado: number
}

export async function getAlmacenesPorUbicacion(id_ubicacion: number) {
    return apiClient.get<Almacen[]>(`/almacen/?id_ubicacion=${id_ubicacion}&status=true`);
}


// Obtener detalle del equipo
export async function getEquipo(id_equipo: number) {
    return apiClient.get(`/equipo/?id_equipo=${id_equipo}`);
}

// Obtener autorizaciones de la OT
export async function getAutorizacionProceso(id_orden_trabajo: number) {
    return apiClient.get(`/autorizacion-proceso/${id_orden_trabajo}`);
}

// Obtener turnos
export async function getTurnos() {
    return apiClient.get('/turno/?status_turno=true');
}

// Obtener revisiones de plantilla
export async function getRevisionesPlantilla() {
    return apiClient.get('/revision-plantilla/?status_revision=true');
}

/** Post genérico para inventario de materiales */
export async function getMaterialesInventario(
    payload: { id_almacen: number; id_ubicacion: number; id_material: number }[]
) {
    return apiClient.post('/cantidad-almacen-inventario/', payload);
}

/** Post para inventario de refacciones (mismo endpoint, distinto campo) */
export async function getRefaccionesInventario(
    payload: { id_almacen: number; id_ubicacion: number; id_refaccion: number }[]
) {
    return apiClient.post('/cantidad-almacen-inventario/', payload);
}

export async function getActividadOrdenTrabajoById(id_actividad: number) {
    return apiClient.get(`/actividad-orden-trabajo/?id_actividad_orden=${id_actividad}`);
}

export async function getPersonalPorPuesto(idPuesto: number) {
    return apiClient.get(`/personal/?id_puesto_personal=${idPuesto}&status_personal=true`);
}


