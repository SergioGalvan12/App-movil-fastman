import apiClient, { ApiResponse } from '../../apiClient';

export interface GrupoMaterialRow {
  id_grupo_material: number;
  nombre_grupo_material: string;
  descripcion_grupo_material: string | null;
  editable: boolean;
  status_grupo_material: boolean;
  id_empresa: number;
}

export const fetchGrupoMateriales = async (): Promise<ApiResponse<GrupoMaterialRow[]>> => {
  return apiClient.get<GrupoMaterialRow[]>('grupo-material/', {
    params: { status_grupo_material: true },
  });
};