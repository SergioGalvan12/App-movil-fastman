// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import configService, { Environment } from './configService';

// tipos para las respuestas de la API
export interface ApiResponse<T> {
    success: boolean; // indica si la solicitud fue exitosa
    data?: T; // datos devueltos por la API (opcional)
    error?: string; // mensaje de error (opcional)
}

//Definición de la clase apiClient
class ApiClient {
    private client: AxiosInstance;

    // Constructor de la clase ApiClient
    constructor() {
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: configService.getConfig().apiTimeout
        });

        //interceptor para manejar errores de forma centralizada
        this.client.interceptors.response.use(
            (response) => response, // si es exitoso, devuelve la respuesta sin modificarla
            (error) => {
                // aqui para manejar errores globales como tokens expirados
                console.error('Error en la respuesta de la API:', error);
                return Promise.reject(error);
            }
        );
    }//fin constructor

    // Método para configurar el cliente
    //establecer el dominio para todas las peticiones
    setDomain(domain: string): void {
        // Si el dominio es "local", configuramos el entorno de desarrollo
        if (domain.trim().toLowerCase() === 'local') {
            configService.setEnvironment(Environment.DEVELOPMENT);
        } else {
            configService.setEnvironment(Environment.PRODUCTION);
            configService.setDomain(domain);
        }
    }

    //establecer el token de la autenticación
    setAuthToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // limpiar el token de autenticación
    clearAuthToken(): void {
        delete this.client.defaults.headers.common['Authorization'];
    }

    // Método para hacer una solicitud GET a la API
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint);
            console.log(`Solicitud GET a: ${url}`);

            const response: AxiosResponse<T> = await this.client.get(url, config);
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    //solicitud POST a la API
    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint);
            console.log(`Solicitud POST a: ${url}`, data);

            const response: AxiosResponse<T> = await this.client.post(url, data, config);
            return { success: true, data: response.data };
        } catch (error: any) {
            return this.handleError(error);
        }
    }

    //Métodos auxiliares privados
    // construir la URL completa con el dominio
    private buildUrl(endpoint: string): string {
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        
        const baseUrl = configService.getApiBaseUrl();
        return `${baseUrl}${endpoint}`;
    }

    // Manejar errores de forma consistente
    private handleError(error: any): ApiResponse<any> {
        let errorMessage = 'Error desconocido';

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Tiempo de espera agotado. Verifica tu conexión a internet.';
            } else if (error.response) {
                const status = error.response.status;

                if (status === 401) {
                    errorMessage = 'Credenciales inválidas';
                } else if (status === 404) {
                    errorMessage = '404 Recurso no encontrado en servidor';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Error ${status}: ${error.response.statusText || 'Error del servidor'}`;
                }
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor';
            } else {
                errorMessage = error.message || 'Error en la petición';
            }
        }

        // Solo mostrar detalles completos del error en modo desarrollo
        if (configService.isDevelopment()) {
            console.error('API Error detallado:', errorMessage, error);
        } else {
            console.error('API Error:', errorMessage);
        }
        
        return { success: false, error: errorMessage };
    }
}

// Exportamos una instancia
export const apiClient = new ApiClient();
export default apiClient;