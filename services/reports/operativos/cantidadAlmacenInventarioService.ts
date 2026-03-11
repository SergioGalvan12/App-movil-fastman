import apiClient, { ApiResponse } from '../../apiClient';

export interface CantidadAlmacenInventarioItemPayload {
    id_almacen: number | null;
    id_ubicacion: number;
    id_material: number;
}

export interface CantidadAlmacenInventarioRow {
    id_almacen: number | null;
    id_ubicacion: number;
    id_material: number;
    numero_almacen_material: string | null;
    nombre_material: string;
    descripcion_material: string | null;
    nombre_unidad: string | null;
    abreviatura_unidad: string | null;
    cantidad: number;
    costo: number;
    nombre_almacen: string;
}

export interface CantidadAlmacenInventarioResponse {
    materiales: CantidadAlmacenInventarioRow[];
    refacciones: any[];
}

export const fetchCantidadAlmacenInventario = async (
    payload: CantidadAlmacenInventarioItemPayload[]
): Promise<ApiResponse<CantidadAlmacenInventarioResponse>> => {
    return apiClient.post<CantidadAlmacenInventarioResponse>('cantidad-almacen-inventario/', payload);
};