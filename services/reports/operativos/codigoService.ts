import apiClient, { ApiResponse } from '../../apiClient';

export interface CodigoProductivo {
  id_codigo: number;
  id_producto: number | null;
  nombre_producto: string | null;
  nombre_unidad_codigo?: string | null;
  unidad_control: number | null;
  tipo_codigo: string;
  id_grupo_equipo: number | null;
  status_codigo: boolean;
}

export const fetchCodigosProductivosByGrupoEquipo = async (
  id_grupo_equipo: number
): Promise<ApiResponse<CodigoProductivo[]>> => {
  return apiClient.get<CodigoProductivo[]>('codigo/', {
    params: {
      status_codigo: true,
      id_grupo_equipo,
    },
  });
};
