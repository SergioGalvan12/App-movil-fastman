import { apiClient, ApiResponse } from '../../apiClient';

/**
 * Interfaz que representa una ubicación de avería.
 */
export interface Ubicacion {
  id_ubicacion: number;
  id_empresa: number;
  nombre_ubicacion: string;
  calle_ubicacion: string;
  no_exterior_ubicacion: number;
  no_interior_ubicacion: string;
  colonia_ubicacion: string;
  localidad_ubicacion: string;
  codigo_postal_ubicacion: string;
  municipio_ubicacion: string;
  estado_ubicacion: string;
  pais_ubicacion: string;
  telefono_ubicacion: string;
  administrador_ubicacion: number;
  maintenance_is_automatic: boolean;
  centro_costo: string;
  unidad_ubicacion: number;
  id_clasificacion: number | null;
  tipo_moneda: string;
  abreviacion_tipo_moneda: string;
  status_ubicacion: boolean;
}

/**
 * Función para obtener la lista de ubicaciones activas, ordenadas alfabéticamente.
 */
export const fetchUbicaciones = async (): Promise<ApiResponse<Ubicacion[]>> => {
  const resp = await apiClient.get<Ubicacion[]>('ubicaciones/', {
    params: { status_ubicacion: true },
  });

  if (resp.success && resp.data) {
    const sorted = resp.data.slice().sort((a, b) =>
      a.nombre_ubicacion.localeCompare(b.nombre_ubicacion)
    );
    return { ...resp, data: sorted };
  }

  return resp;
};
