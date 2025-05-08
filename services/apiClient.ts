// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@env';  // vendrán de .env.production
console.log('[ApiClient] Variables de entorno →', { API_BASE_URL, API_TIMEOUT });
/**
 * ApiResponse<T> estructura estándar de respuesta:
 *  - success: éxito o no
 *  - data: datos en caso de éxito
 *  - error: mensaje en caso de fallo
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private domain?: string; // guardaremos aquí el subdominio en runtime

  constructor() {
    // Creamos cliente axios con timeout de .env.production
    this.client = axios.create({
      baseURL: API_BASE_URL,          // URL base con placeholder `{DOMAIN}` aún
      timeout: Number(API_TIMEOUT),
      headers: { 'Content-Type': 'application/json' }
    });
    // Interceptor global de errores
    this.client.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(err)
    );
  }

  /**
   * Configura en runtime el subdominio (por ejemplo 'gpp' o 'otro').
   * Lo usaremos para reemplazar {DOMAIN} en la URL base.
   */
  setDomain(domain: string) {
    this.domain = domain.trim();
    // reemplazamos baseURL en el cliente:
    const resolved = API_BASE_URL.replace('{DOMAIN}', this.domain);
    this.client.defaults.baseURL = resolved;
    // Al cambiar de dominio, borramos cualquier token antiguo
    this.clearAuthToken();
    console.log(`[ApiClient] Base URL resuelta: ${resolved}`);
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  private handleError(error: any): ApiResponse<any> {
    let msg = 'Error desconocido';
    if (axios.isAxiosError(error)) {
      if (error.response) {
        msg = `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        msg = 'No se recibió respuesta del servidor';
      } else {
        msg = error.message;
      }
    }
    console.error('[ApiClient] API Error:', msg);
    return { success: false, error: msg };
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      console.log(`[ApiClient] GET → ${this.client.defaults.baseURL}${url}`);
      const res = await this.client.get<T>(url, config);
      return { success: true, data: res.data };
    } catch (e) {
      return this.handleError(e);
    }
  }

  async post<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      console.log(`[ApiClient] POST → ${this.client.defaults.baseURL}${url}`, body);
      const res = await this.client.post<T>(url, body, config);
      return { success: true, data: res.data };
    } catch (e) {
      return this.handleError(e);
    }
  }
}

const _apiClient = new ApiClient();
export const apiClient = _apiClient;
export default apiClient;

// Exportamos funciones de control de token para importarlas directamente
export const setAuthToken = (token: string) => _apiClient.setAuthToken(token);
export const clearAuthToken = () => _apiClient.clearAuthToken();
