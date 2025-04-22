// services/authService.ts
import apiClient, { ApiResponse } from './apiClient';
import configService from './configService';

// Interfaces para los datos de autenticación
export interface UserCompany {
    pk_empresa: number;
    nombre_empresa: string;
    // Otras propiedades que vengan en la respuesta
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user?: {
        id: number;
        username: string;
        // Otros datos del usuario
    };
}

// Definimos una interfaz extendida para la respuesta de checkUser
export type CheckUserResponse = ApiResponse<UserCompany[]> & {
  empresaId?: number;
  empresaNombre?: string;
};

// Verificar si el dominio existe
export const checkDomain = async (domain: string) => {
    apiClient.setDomain(domain);
    return await apiClient.get<{ status: string }>('');
};

// Verificar si el usuario existe y obtener sus empresas
export const checkUser = async (username: string): Promise<CheckUserResponse> => {
    try {
        const response = await apiClient.post<UserCompany[]>('user-companies-list/', { username });
        
        if (response.success && response.data && response.data.length > 0) {
            return {
                ...response,
                empresaId: response.data[0]?.pk_empresa,
                empresaNombre: response.data[0]?.nombre_empresa
            };
        }
        return response;
    } catch (error) {
        console.error('Error en checkUser:', error);
        return { 
            success: false, 
            error: 'Error al verificar usuario'
        };
    }
};

// Iniciar sesión con usuario y contraseña
export const login = async (empresaId: number, username: string, password: string) => {
    try {
        const response = await apiClient.post<LoginResponse>('login/', {
            username,
            password,
            id_empresa: empresaId
        });
        
        if (response.success && response.data?.access) {
            // Guardamos el token para futuras peticiones
            apiClient.setAuthToken(response.data.access);
        }
        
        return response;
    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            error: 'Error al iniciar sesión'
        };
    }
};

// Cerrar sesión
export const logout = () => {
    apiClient.clearAuthToken();
};