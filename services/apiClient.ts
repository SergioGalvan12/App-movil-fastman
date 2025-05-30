// services/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_TIMEOUT } from '@env';
import { getAccessToken, getRefreshToken } from './auth/authStorage';

console.log('[ApiClient] Variables de entorno →', { API_BASE_URL, API_TIMEOUT });

const TOKEN_KEYS = {
  ACCESS:     '@fastman:accessToken',
  REFRESH:    '@fastman:refreshToken',
  ACCESS_EXP: '@fastman:accessExp',
};

export interface ApiResponse<T> {
  success: boolean;
  data?:    T;
  error?:   string;
}

class ApiClient {
  private client: AxiosInstance;
  private domain?: string;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: Number(API_TIMEOUT),
      headers: { 'Content-Type': 'application/json' },
    });

    // 1) Inyectar automáticamente el access token en cada petición
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await getAccessToken();
        if (token) {
          // Aseguramos que exista un objeto headers compatible
          if (!config.headers) {
            config.headers = {} as AxiosRequestHeaders;
          }
          // Mutamos directamente la propiedad Authorization
          // @ts-ignore: permitimos esta asignación pese al tipo rigid de AxiosHeaders
          (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2) Capturar 401 y refrescar token "on the fly"
    this.client.interceptors.response.use(
      (res) => res,
      async (err: AxiosError & { config?: any }) => {
        const originalReq = err.config;
        if (
          err.response?.status === 401 &&
          originalReq &&
          !originalReq._retry
        ) {
          originalReq._retry = true;
          const refresh = await getRefreshToken();
          if (!refresh) {
            console.warn('[ApiClient] No hay refresh token, logout necesario');
            return Promise.reject(err);
          }
          try {
            const { data } = await axios.post(
              `${this.client.defaults.baseURL}/token/refresh/`,
              { refresh }
            );
            const { access, refresh: newRefresh } = data as {
              access: string;
              refresh: string;
            };

            // Extraer exp del JWT renovado
            let exp = '';
            try {
              const { exp: expSec } = jwtDecode<{ exp: number }>(access);
              exp = String(expSec);
            } catch {
              console.warn('[ApiClient] No se pudo decodificar exp del JWT renovado');
            }

            // Guardar nuevos tokens
            await AsyncStorage.multiSet([
              [TOKEN_KEYS.ACCESS,  access],
              [TOKEN_KEYS.REFRESH, newRefresh],
              [TOKEN_KEYS.ACCESS_EXP, exp],
            ]);
            console.log('[ApiClient] Tokens renovados on the fly');

            // Actualizar header por defecto y de la petición original
            this.client.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            originalReq.headers['Authorization'] = `Bearer ${access}`;

            // Reintentar petición original
            return this.client(originalReq);
          } catch (refreshErr) {
            console.error('[ApiClient] Error al refrescar token:', refreshErr);
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(err);
      }
    );
  }

  setDomain(domain: string) {
    this.domain = domain.trim();
    const resolved = API_BASE_URL.replace('{DOMAIN}', this.domain);
    this.client.defaults.baseURL = resolved;
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
      if (error.response)      msg = `Error ${error.response.status}: ${error.response.statusText}`;
      else if (error.request) msg = 'No se recibió respuesta del servidor';
      else                     msg = error.message;
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

  async post<T>(
    endpoint: string,
    body?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
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
export const apiClient    = _apiClient;
export default apiClient;
export const setAuthToken   = (token: string) => _apiClient.setAuthToken(token);
export const clearAuthToken = () => _apiClient.clearAuthToken();
