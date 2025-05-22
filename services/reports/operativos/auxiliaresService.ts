// services/reports/operativos/auxiliaresService.ts
import apiClient, { ApiResponse } from '../../../services/apiClient';

export interface Unidad {
  id_unidad: number;
  nombre_unidad: string;
  uso_equipo: boolean;
}

export const fetchUnidades = async (): Promise<ApiResponse<Unidad[]>> => {
  return await apiClient.get<Unidad[]>('unidades/', {
    params: { status_unidad: true },
  });
};
