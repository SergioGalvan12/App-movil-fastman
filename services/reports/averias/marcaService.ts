import apiClient, { ApiResponse } from "../../apiClient";
/**
 * Interfaz que representa una marca de equipo.
 */
export interface Marca {
    id_marca: number;
    nombre_marca: string;
    //se pueden agregar más campos si es necesario
}

/**
 * Función para obtener la lista de marcas de equipo.
 * Realiza una solicitud GET a la API y devuelve una promesa con los datos.
 */
export const fetchMarcas = async (): Promise<ApiResponse<Marca[]>> => {
    const resp = await apiClient.get<Marca[]>(
        'marca/',
        { params: { status_marca: true } }
    );
    if (resp.success && resp.data) {
        // Ordenar los datos por nombre_marca alfabéticamente
        const sorted = resp.data.slice().sort((a, b) =>
            a.nombre_marca.localeCompare(b.nombre_marca)
        );
        return { ...resp, data: sorted };
    }
    return resp;

}
