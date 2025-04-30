// services/reports/averias/modeloService.ts
import apiClient, { ApiResponse } from "../../apiClient";

/**
 * Interfaz que representa un modelo de equipo.
 */
export interface Modelo {
    id_modelo: number;
    id_empresa: number; // ID de la empresa asociada
    id_marca: number; // ID de la marca asociada
    nombre_modelo: string;
    descripcion_modelo: string;
    status_modelo: boolean; // Estado del modelo (activo/inactivo)
    //se pueden agregar más campos si es necesario
}

export const fetchModelos = async (
    marcaId?: number
): Promise<ApiResponse<Modelo[]>> => {
    //llamamos al endpoint de la API para obtener todos los modelos
    const resp = await apiClient.get<Modelo[]>('modelo/', {
        params: { status_modelo: true },
    });
    // si la respuesta es exitosa y filtramos y ordenamos
    if (resp.success && resp.data) {
        let datos = resp.data;
        if (marcaId != null) {
            datos = datos.filter(m => m.id_marca === marcaId);
        }
        // orden alfabéticamente por nombre_modelo
        const sorted = datos.slice().sort((a, b) =>
            a.nombre_modelo.localeCompare(b.nombre_modelo)
        );
        return { ...resp, data: sorted };
    }
    return resp;
}