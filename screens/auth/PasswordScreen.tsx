//screens/auth/PasswordScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';
import CustomCheckbox from '../../components/common/CustomCheckbox';
import { login } from '../../services/auth/authService';
import { showToast } from '../../services/notifications/ToastService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentSession, getRememberMe, setRememberMe } from '../../services/auth/authStorage';

type PasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Password'>;
type PasswordScreenRouteProp = RouteProp<AuthStackParamList, 'Password'>;

type Props = {
  navigation: PasswordScreenNavigationProp;
  route: PasswordScreenRouteProp;
};

export default function PasswordScreen({ navigation, route }: Props) {
  const { domain, username, empresaId } = route.params;
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);   // estado para el ojo
  const [rememberMe, setRememberMeState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ← Inicializamos el estado del checkbox según lo guardado
  useEffect(() => {
    (async () => {
      const remembered = await getRememberMe();
      setRememberMeState(remembered);
    })();
  }, []);

  const handleLogin = async () => {
    if (!password.trim()) {
      showToast('error', 'Contraseña requerida', 'Por favor ingresa tu contraseña');
      return;
    }

    setLoading(true);
    try {
      const empresaIdNum = typeof empresaId === 'number' ? empresaId : 1;
      console.log('Datos de login:', { domain, empresaId: empresaIdNum, username, password: '***' });
      showToast('info', 'Datos de login', `Domain: ${domain}\nEmpresaID: ${empresaIdNum}\nUsername: ${username}`);

      const result = await login(domain, empresaIdNum, username, password);
      console.warn('Resultado login:', result);

      if (result.success) {
        // ← GUARDA EL FLAG "Recuérdame" según el estado del checkbox
        await setRememberMe(rememberMe);
        // Leemos la sesión recién guardada en AsyncStorage...
        const session = await getCurrentSession();
        if (session) {
          // la pasamos al Context para que useAuth() la refleje
          signIn(session);
        }
        navigation.navigate('Main');
        showToast('success', 'Login exitoso', 'Has iniciado sesión correctamente');
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Error desconocido al iniciar sesión';
        showToast('error', 'Error de inicio de sesión', errorMessage);
      }
    } catch (err: any) {
      console.error('Error al hacer login:', err);
      const errorMessage = typeof err?.message === 'string' ? err.message : 'Ocurrió un error al iniciar sesión';
      setError(errorMessage);
      Alert.alert('Error inesperado', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    // Si el usuario tenía marcado "Recuérdame", lo desmarcamos:
    if (rememberMe) {
      setRememberMeState(false);  // desmarca en UI
      await setRememberMe(false); // guarda en AsyncStorage
    }
    // Ahora sí navegamos atrás:
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Domain');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />

      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>
        Usuario: {username}@{domain}.fastman.io
      </Text>
      {empresaId && <Text style={styles.subtitle}>Empresa ID: {empresaId}</Text>}

      {/* Campo Contraseña con icono de ojo */}
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={text => {
            setPassword(text);
            setError('');
          }}
          editable={!loading}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(v => !v)}
          style={styles.eyeButton}
        >
          <Icon
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={24}
            color="#5D74A6"
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Checkbox "Recuérdame" */}
      <View style={styles.checkboxContainer}>
        <CustomCheckbox
          label="Recuérdame"
          value={rememberMe}
          onChange={() => setRememberMeState(v => !v)}
        />
      </View>

      {/* Botón Iniciar sesión */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      {/* Botón Regresar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>© Copyright Fastman 2025</Text>

      <View style={styles.linksContainer}>
        <Text style={styles.link}>Aviso de privacidad</Text>
        <Text style={styles.link}>Política de privacidad</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF0FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1B2A56',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#5D74A6',
  },
  label: {
    alignSelf: 'flex-start',
    color: '#1B2A56',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1B2A56',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: '#5D74A6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#5D74A6',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#000',
    marginBottom: 10,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  link: {
    fontSize: 12,
    marginBottom: 10,
    color: '#5D74A6',
    textDecorationLine: 'underline',
  },
});
