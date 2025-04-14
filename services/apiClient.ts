// services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// tipos para las respuestas de la API
export interface ApiResponse<T> {
    success: boolean; // indica si la solicitud fue exitosa
    data?: T; // datos devueltos por la API (opcional)
    error?: string; // mensaje de error (opcional)
}

//Definición de la case apiClient
class ApiClient {
    private client: AxiosInstance;
    private domain: string | null = null; // dominio actual

    // Constructor de la clase ApiClient
    constructor() {
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json',
            }
        });

        //interceptor para manejar errores de forma centralizada
        this.client.interceptors.response.use( // interceptor = midleware
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
        this.domain = domain.trim().toLowerCase(); // establece el dominio actual
    }

    //esta lecer el token de la autenticación
    setAuthToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`; // establece el token de autenticación
    }

    // limpiar el token de autenticación
    clearAuthToken(): void {
        delete this.client.defaults.headers.common['Authorization']; // elimina el token de autenticación
    }

    // Método para hacer una solicitud GET a la API
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint); // construye la URL completa
            console.log(`solicitud Get a ${url}`); // imprime la URL en la consola

            const response: AxiosResponse<T> = await this.client.get(url, config); // realiza la solicitud GET
            return { success: true, data: response.data }; // devuelve la respuesta
        } catch (error) {
            return this.handleError(error); // maneja el error
        }
    } //fin método get

    //solicitud POST a la API
    async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(endpoint);
            console.log(`solicitud POST a: ${url}`, data);

            const response: AxiosResponse<T> = await this.client.post(url, data, config);
            return { success: true, data: response.data };
        } catch (error: any) {
            return this.handleError(error);
        }
    }

    //Metodos auxiliares privados
    // constuir la URL completa con el dominio
    private buildUrl(endpoint: string): string {
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        if (this.domain) {
            return `https://${this.domain}.fastman.io/api${endpoint}`; // construye la URL completa
        }

        return `/api${endpoint}`; // URL por defecto
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
                    errorMessage = 'Recurso no encontrado';
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

        console.error('API Error:', errorMessage, error);
        return { success: false, error: errorMessage };
    }
}

// Exportamos una isntancia
export const apiClient = new ApiClient(); // exporta una instancia de ApiClient
export default apiClient; // exporta la instancia por defecto