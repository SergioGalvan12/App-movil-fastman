// src/services/reports/averias/backlogImagenService.ts
import { apiClient, ApiResponse } from '../../apiClient';

/**
 * Representa un registro de imagen asociado a un backlog (acción correctiva).
 */
export interface BacklogImageInterface {
  id_imagen: number;
  imagen_url: string;
  status: boolean;
  id_empresa: number;
  backlog: number;
  // Si la API devuelve más campos, añádelos aquí:
  [key: string]: any;
}

/**
 * Obtiene todas las imágenes asociadas a una acción correctiva (backlog).
 * Hace GET /backlog-imagen/?status=true&backlog={backlogId}
 */
export async function fetchBacklogImages(
  backlogId: number
): Promise<ApiResponse<BacklogImageInterface[]>> {
  const res = await apiClient.get<BacklogImageInterface[]>(
    'backlog-imagen/',
    { params: { status: true, backlog: backlogId } }
  );
  return res;
}

/**
 * Sube una imagen para la acción correctiva indicada.
 * Hace POST multipart/form-data a /backlog-imagen/
 */
export async function uploadBacklogImage(
  backlogId: number,
  empresaId: number,
  uri: string
): Promise<ApiResponse<BacklogImageInterface>> {
  // Preparamos FormData:
  const form = new FormData();
  // @ts-ignore
  form.append('imagen', {
    uri,
    type: 'image/jpeg',
    name: `backlog_${backlogId}_${Date.now()}.jpg`,
  });
  form.append('backlog', String(backlogId));
  form.append('id_empresa', String(empresaId));
  form.append('status', 'true');

  // Importante: React Native/axios detecta automáticamente multipart
  const res = await apiClient.post<BacklogImageInterface>(
    'backlog-imagen/',
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res;
}
