//screens/auth/PasswordScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import type { AuthStackParamList } from '../../src/navigation/types';
import CustomCheckbox from '../../components/common/CustomCheckbox';
import { login } from '../../services/auth/authService';
import { showToast } from '../../services/notifications/ToastService';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentSession, getRememberMe, setRememberMe } from '../../services/auth/authStorage';

import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { AppButton } from '../../src/ui/AppButton/AppButton';
import { AppInput } from '../../src/ui/AppInput/AppInput';
import { AuthLayout } from '../../src/ui/AuthLayout/AuthLayout';
import { spacing } from '../../src/theme';

type PasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Password'>;
type PasswordScreenRouteProp = RouteProp<AuthStackParamList, 'Password'>;

type Props = {
  navigation: PasswordScreenNavigationProp;
  route: PasswordScreenRouteProp;
};

export default function PasswordScreen({ navigation, route }: Props) {
  const { domain, username, empresaId } = route.params;
  const { signIn } = useAuth();
  // para desarrollo   
  // const [password, setPassword] = useState('jlcddemo2@24');
  const [password, setPassword] = useState('');
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

      const result = await login(domain, empresaIdNum, username, password);

      console.warn('Resultado login:', result);

      if (result.success) {
        await setRememberMe(rememberMe); // guarda el checkbox
        const session = await getCurrentSession();
        if (session) {
          signIn(session);
        }

        showToast('success', 'Login exitoso', `Bienvenido ${username}`);
        navigation.navigate('Main');
      } else {
        // Analizamos mensaje de error recibido
        const rawMessage = typeof result.error === 'string' ? result.error.toLowerCase() : '';
        let mensaje = 'Error desconocido al iniciar sesión';

        if (rawMessage.includes('401') || rawMessage.includes('credenciales')) {
          mensaje = 'Contraseña incorrecta. Verifica e inténtalo de nuevo.';
        } else if (rawMessage.includes('bloqueado')) {
          mensaje = 'Tu cuenta está bloqueada. Contacta al administrador.';
        } else if (rawMessage.includes('403')) {
          mensaje = 'Acceso no autorizado.';
        } else if (result.error) {
          mensaje = result.error;
        }

        showToast('error', 'Error de autenticación', mensaje);
      }
    } catch (err: any) {
      console.error('Error al hacer login:', err);
      const mensaje = typeof err?.message === 'string'
        ? err.message
        : 'No se pudo establecer conexión. Intenta más tarde.';
      showToast('error', 'Error de red', mensaje);
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
    <ScreenContainer>
      <AuthLayout title="Iniciar sesión" subtitle={`Usuario: ${username}`}>
        <AppInput
          label="Contraseña"
          value={password}
          placeholder="Contraseña"
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError('');
          }}
          editable={!loading}
          error={error}
          secureToggle
        />

        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            label="Recuérdame"
            value={rememberMe}
            onChange={() => setRememberMeState((prev) => !prev)}
          />
        </View>

        <AppButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        />

        <AppButton
          title="Regresar"
          onPress={handleGoBack}
          disabled={loading}
          variant="ghost"
        />
      </AuthLayout>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
});