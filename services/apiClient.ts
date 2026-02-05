import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  API_BASE_URL,
  API_TIMEOUT,
  LOCKED_DOMAIN,
  DEFAULT_DOMAIN,
  APP_ENV,
} from '@env';

console.log('[ApiClient] Variables de entorno →', {
  API_BASE_URL,
  API_TIMEOUT,
  APP_ENV,
  LOCKED_DOMAIN,
  DEFAULT_DOMAIN,
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private domain?: string;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: Number(API_TIMEOUT),
      headers: { 'Content-Type': 'application/json' }
    });
    const bootDomain = (LOCKED_DOMAIN || DEFAULT_DOMAIN || '').trim();
    if (bootDomain) {
      this.setDomain(bootDomain);
    }
    this.client.interceptors.response.use(
      (res) => res,
      (err) => Promise.reject(err)
    );
  }


  setDomain(domain: string) {
    const locked = (LOCKED_DOMAIN || '').trim();
    const nextDomain = (locked || domain || '').trim().toLowerCase();

    this.domain = nextDomain;

    const resolved = API_BASE_URL.includes('{DOMAIN}')
      ? API_BASE_URL.replace('{DOMAIN}', this.domain)
      : API_BASE_URL;

    this.client.defaults.baseURL = resolved;
    this.clearAuthToken();

    console.log('[ApiClient] setDomain()', {
      lockedDomain: locked || null,
      requestedDomain: domain,
      effectiveDomain: this.domain,
      resolvedBaseURL: resolved,
    });
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

  async patch<T>(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      console.log(`[ApiClient] PATCH → ${this.client.defaults.baseURL}${url}`, body);
      const res = await this.client.patch<T>(url, body, config);
      return { success: true, data: res.data };
    } catch (e) {
      return this.handleError(e);
    }
  }
}

const _apiClient = new ApiClient();
export const apiClient = _apiClient;
export default apiClient;
export const setAuthToken = (token: string) => _apiClient.setAuthToken(token);
export const clearAuthToken = () => _apiClient.clearAuthToken();
