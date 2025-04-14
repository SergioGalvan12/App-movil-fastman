//services/api.ts
// Este archivo contiene las funciones para interactuar con la API de Fastman
import axios from 'axios';

// Creamos una instancia de axios que podemos configurar
// Investigar como hacer una función personalizada de axios para manejar peticiones
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});


// Función para verificar si el dominio existe
export const checkDomain = async (domain: string) => {
  try {
    // Verificamos si el dominio existe intentando acceder a la página de login
    const response = await axios.get(`https://${domain}.fastman.io/api`, {
    });
    console.log('Respuesta checkDomain:', response.data.status);
    if (response.data.status === 'OK') {
      return { success: true, data: response.data };
    }
    console.log('Error al verificar dominio:');
    return { success: false, error: 'Dominio no encontrado' };
  } catch (error) {
    console.error('Error al verificar dominio:', error);
    return { success: false, error: 'Dominio no encontrado' };
  }
};

// Función para verificar si el usuario existe
export const checkUser = async (domain: string, username: string) => {
  try {
    // La ruta correcta según las capturas es /api/user-companies-list/
    const url = `https://${domain}.fastman.io/api/user-companies-list/`;
    console.log('Verificando usuario en URL:', url);
    console.log('Payload:', { username });

    const response = await axios.post(url, {
      username
    });

    console.log('Respuesta checkUser:', response.data);

    // Si la respuesta contiene datos de empresa, el usuario existe
    if (response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data,
        empresaId: response.data[0]?.pk_empresa,
        empresaNombre: response.data[0]?.nombre_empresa
      };
    }

    return { success: false, error: 'Usuario no encontrado' };
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return { success: false, error: 'Error al verificar usuario' };
  }
};

// Función para autenticar con usuario y contraseña
export const login = async (domain: string, empresaId: number, username: string, password: string) => {
  try {
    // La ruta correcta según las capturas es /api/login/
    const url = `https://${domain}.fastman.io/api/login/`;

    // Crear el payload exactamente como se muestra en las capturas
    const payload = {
      username,
      password,
      id_empresa: empresaId
    };

    console.log('Intentando login en URL:', url);
    console.log('Payload de login:', payload);

    // Mostrar alerta con los datos que se enviarán
    alert(`Enviando petición a: ${url}\nPayload: ${JSON.stringify(payload, null, 2)}`);

    const response = await axios.post(url, payload);

    console.log('Respuesta login:', response.data);

    // Guardamos el token si la autenticación es exitosa
    if (response.data && response.data.access) {
      // Configuramos el token para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      alert(`Login exitoso! Access: ${response.data.access.substring(0, 10)}...`);
      return { success: true, data: response.data };

    }

    return { success: false, error: 'Credenciales inválidas' };
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);

    // Extraer un mensaje de error más amigable y mostrar detalles para depuración
    let errorMessage = 'Error al iniciar sesión';
    let errorDetails = '';

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      errorDetails = `Status: ${error.response.status}\n`;

      if (error.response.data) {
        errorDetails += `Data: ${JSON.stringify(error.response.data)}\n`;
      }

      if (error.response.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Error del servidor'}`;
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorMessage = 'No se recibió respuesta del servidor';
      errorDetails = 'La petición se realizó pero no hubo respuesta';
    } else {
      // Algo ocurrió al configurar la petición
      errorMessage = error.message || 'Error desconocido';
    }

    // Mostrar alerta con detalles del error para depuración
    alert(`Error de login: ${errorMessage}\n\nDetalles: ${errorDetails}`);

    return { success: false, error: errorMessage };
  }
};

export default api;