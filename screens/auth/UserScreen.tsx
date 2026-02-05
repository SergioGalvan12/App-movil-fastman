// src/screens/auth/UserScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';
import { checkUser } from '../../services/auth/authService';
import { showToast } from '../../services/notifications/ToastService';



type UserScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'User'>;
type UserScreenRouteProp = RouteProp<AuthStackParamList, 'User'>;

type Props = {
  navigation: UserScreenNavigationProp;
  route: UserScreenRouteProp;
};

export default function UserScreen({ navigation, route }: Props) {
  const { domain } = route.params;
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState<{ id: number, nombre: string } | null>(null);

  const handleNext = async () => {
    const trimmedUsername = username.trim();
    console.log('[UserScreen] Iniciando verificación de usuario:', trimmedUsername);

    if (!trimmedUsername) {
      showToast('error', 'Usuario requerido', 'Por favor ingresa tu nombre de usuario');
      return;
    }

    setLoading(true);

    try {
      const result = await checkUser(trimmedUsername);
      console.log('[UserScreen] Resultado de checkUser:', result);

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
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>
        {domain ? `${domain}.fastman.io` : 'fastman.io'}
      </Text>
      {empresaInfo && (
        <Text style={styles.empresaText}>Empresa: {empresaInfo.nombre}</Text>
      )}
      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput
        value={username}
        placeholder="Nombre de usuario"
        style={styles.input}
        placeholderTextColor="#999"
        onChangeText={(text) => {
          setUsername(text);
          setError('');
        }}
        autoCapitalize="none"
        editable={!loading}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Siguiente</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
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
  empresaText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#3260B2',
    fontWeight: '500',
  },
  label: {
    alignSelf: 'flex-start',
    color: '#1B2A56',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
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