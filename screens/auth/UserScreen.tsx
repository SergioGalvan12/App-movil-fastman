// src/screens/auth/UserScreen.tsx
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../src/navigation/types';
import { checkUser } from '../../services/auth/authService';
import { showToast } from '../../services/notifications/ToastService';
import { ScreenContainer } from '../../src/ui/ScreenContainer/ScreenContainer';
import { AppInput } from '../../src/ui/AppInput/AppInput';
import { AppButton } from '../../src/ui/AppButton/AppButton';
import { AuthLayout } from '../../src/ui/AuthLayout/AuthLayout';
import { colors, spacing } from '../../src/theme';

type UserScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'User'>;
type UserScreenRouteProp = RouteProp<AuthStackParamList, 'User'>;

type Props = {
  navigation: UserScreenNavigationProp;
  route: UserScreenRouteProp;
};

export default function UserScreen({ navigation, route }: Props) {
  const { domain } = route.params;
  // para desarrollo   
  // const [username, setUsername] = useState('jlcd_demo');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState<{ id: number, nombre: string } | null>(null);

  const handleNext = async () => {
    const trimmedUsername = username.trim();
    // console.log('[UserScreen] Iniciando verificación de usuario:', trimmedUsername);

    if (!trimmedUsername) {
      showToast('error', 'Usuario requerido', 'Por favor ingresa tu nombre de usuario');
      return;
    }

    setLoading(true);

    try {
      const result = await checkUser(trimmedUsername);
      // console.log('[UserScreen] Resultado de checkUser:', result);

      if (result.success && result.data && result.data.length > 0 && result.empresaId) {
        setEmpresaInfo({
          id: result.empresaId,
          nombre: result.empresaNombre || 'Empresa'
        });

        showToast('success', 'Usuario correcto', `Bienvenido ${trimmedUsername}`);

        navigation.navigate('Password', {
          domain,
          username: trimmedUsername,
          empresaId: result.empresaId
        });
      } else {
        const mensaje = result.error?.toLowerCase() || '';
        let mensajeFinal = 'Usuario no encontrado. Verifica que sea correcto.';

        if (mensaje.includes('404') || mensaje.includes('no encontrado')) {
          mensajeFinal = `Usuario "${trimmedUsername}" no está registrado en Fastman.io`;
        } else if (mensaje.includes('400')) {
          mensajeFinal = 'La solicitud no es válida. Verifica el nombre de usuario.';
        }

        showToast('error', 'Usuario no registrado', mensajeFinal);
      }
    } catch (err: any) {
      console.error('[UserScreen] Error de red o inesperado:', err);

      const mensajeError =
        typeof err?.message === 'string'
          ? err.message
          : 'No se pudo verificar el usuario. Intenta de nuevo más tarde.';

      showToast('error', 'Error de red', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AuthLayout title="Iniciar sesión" subtitle={`${domain}.fastman.io`}>
        {empresaInfo ? (
          <Text style={styles.empresaText}>Empresa: {empresaInfo.nombre}</Text>
        ) : null}

        <AppInput
          label="Nombre de usuario"
          value={username}
          placeholder="Nombre de usuario"
          onChangeText={(text) => {
            setUsername(text);
            if (error) setError('');
          }}
          autoCapitalize="none"
          editable={!loading}
          error={error}
        />

        <AppButton
          title="Siguiente"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
        />

        <AppButton
          title="Regresar"
          onPress={() => navigation.goBack()}
          disabled={loading}
          variant="ghost"
        />
      </AuthLayout>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empresaText: {
    fontSize: 16,
    marginBottom: spacing.md,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});