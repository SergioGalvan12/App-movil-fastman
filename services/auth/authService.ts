// services/auth/authService.ts
import apiClient, { ApiResponse } from '../apiClient';
import { saveSession} from './authStorage';

// Interfaces para los datos de autenticación
export interface UserCompany {
    pk_empresa: number;
    nombre_empresa: string;
    // Otras propiedades que vengan en la respuesta
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user?: { id: number; username: string; };
  }

  // Interfaz para personal-me:
export interface PersonalMe {
    id_personal: string;
    id_equipo: number;
    nombre_personal: string;
    apaterno_personal: string;
    amaterno_personal: string;
    // …otros campos si los necesitas
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
// authService.ts

export const checkUser = async (username: string): Promise<CheckUserResponse> => {
    console.log('[checkUser] Ejecutando checkUser con username:', username);

    try {
        const response = await apiClient.post<UserCompany[]>('user-companies-list/', { username });

        console.log('[checkUser] Respuesta recibida:', response);

        if (response.success && response.data && response.data.length > 0) {
            console.log('[checkUser] Usuario válido, empresa encontrada:', response.data[0]);

            return {
                ...response,
                empresaId: response.data[0]?.pk_empresa,
                empresaNombre: response.data[0]?.nombre_empresa
            };
        } else {
            console.warn('[checkUser] Usuario no tiene empresas o respuesta incompleta');
        }

        return response;
    } catch (error) {
        console.error('[checkUser] Error capturado:', error);
        return {
            success: false,
            error: 'Error al verificar usuario'
        };
    }
};


// Iniciar sesión con Login y guardado completo de sesión
export const login = async (
    domain: string,
    empresaId: number,
    username: string,
    password: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      //Petición POST /login/
      const response = await apiClient.post<LoginResponse>('login/', {
        username,
        password,
        id_empresa: empresaId
      });
  
      if (response.success && response.data?.access) {
        const accessToken = response.data.access;
        //  Setear header para futuras peticiones
        apiClient.setAuthToken(accessToken);
  
        //  GET /personal-me/ para obtener tu registro (usuario actual)
        console.log('[authService] Llamando a personal-me/');
        const pmResp = await apiClient.get<PersonalMe[]>('personal-me/');
        console.log('[authService] personal-me/ →', pmResp);
  
        //  Si viene tu personal, guardo TODO en AsyncStorage
        if (pmResp.success && pmResp.data && pmResp.data.length > 0) {
          const personal = pmResp.data[0];
          await saveSession({
            domain,
            username,
            empresaId,
            accessToken,
            personalId: personal.id_equipo,   // aquí tu id_personal
            personalName: `${personal.nombre_personal} ${personal.apaterno_personal} ${personal.amaterno_personal}`
          });
        } else {
          console.warn('[authService] personal-me/ no devolvió usuario');
        }
      }
  
      return response;
    } catch (error) {
      console.error('[authService] Error en login:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };