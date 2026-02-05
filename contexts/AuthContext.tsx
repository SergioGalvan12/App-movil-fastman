// contexts/AuthContext.tsx

import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from 'react';
import { getCurrentSession } from '../services/auth/authStorage';
import apiClient from '../services/apiClient';

/**
 * Shape de la sesión que almacenamos en AsyncStorage tras el login
 */
interface AuthSession {
    domain: string;
    username: string;
    empresaId: number;
    accessToken: string;
    personalId: number;
    personalName: string;
}

/**
 * Lo que exponemos a través del contexto de autenticación
 */
interface AuthContextData extends AuthSession {
    isLoading: boolean;
    signIn: (session: AuthSession) => void;
    signOut: () => void;
}

// Creamos el contexto con valores por defecto que lanzan si no están proveídos
const AuthContext = createContext<AuthContextData | undefined>(undefined);


/**
 * Proveedor de autenticación para envolver la raíz de la app
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Al montar, recuperamos la sesión del AsyncStorage
    // Al montar, leemos la sesión de AsyncStorage
    useEffect(() => {
        (async () => {
            const stored = await getCurrentSession();
            if (stored) {
                // configuramos apiClient con los valores de sesión
                apiClient.setDomain(stored.domain);
                apiClient.setAuthToken(stored.accessToken);
                setSession(stored);
            }
            setIsLoading(false);
        })();
    }, []);

    /**
     * Persiste nueva sesión y actualiza estado/contexto
     */
    // Firmar sesión: guardar en memoria + configurar axios
    const signIn = (newSession: AuthSession) => {
        apiClient.setDomain(newSession.domain);
        apiClient.setAuthToken(newSession.accessToken);
        setSession(newSession);
    };

    /**
     * Limpia sesión de AsyncStorage y de contexto
     */
    // Cerrar sesión: limpiar token + memoria
    const signOut = () => {
        apiClient.clearAuthToken();
        setSession(null);
    };

    // Hasta que no termine de cargar la sesión no renderizamos nada
    if (isLoading) {
        return null; // o un SplashScreen, según prefieras
    }

    const emptySession: AuthSession = {
        domain: '',
        username: '',
        empresaId: 0,
        accessToken: '',
        personalId: 0,
        personalName: '',
    };

    return (
        <AuthContext.Provider
            value={{
                ...(session ?? emptySession),
                isLoading,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};


//
// 5) Hook de conveniencia para usar auth
//
export function useAuth(): AuthContextData {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return ctx;
}
