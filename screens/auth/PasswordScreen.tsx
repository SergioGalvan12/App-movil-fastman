//screens/auth/PasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';
import CustomCheckbox from '../../components/common/CustomCheckbox';
import { login } from '../../services/authService';
import { showToast } from '../../services/ToastService';

type PasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Password'>;
type PasswordScreenRouteProp = RouteProp<AuthStackParamList, 'Password'>;

type Props = {
  navigation: PasswordScreenNavigationProp;
  route: PasswordScreenRouteProp;
};

export default function PasswordScreen({ navigation, route }: Props) {
  const { domain, username, empresaId } = route.params;
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!password.trim()) {
      showToast(
        'error',
        'Contraseña requerida',
        'Por favor ingresa tu contraseña'
      );
      return;
    }

    setLoading(true);

    try {
      // Asegúrate de que empresaId sea un número
      const empresaIdNum = typeof empresaId === 'number' ? empresaId : 1;

      // Mostrar los datos que se van a enviar
      console.log('Datos de login:', {
        domain,
        empresaId: empresaIdNum,
        username,
        password: '***' // No mostrar la contraseña real en los logs
      });

      // Mostrar alerta con los datos de la petición (excepto la contraseña)
      showToast(
        'info',
        'Datos de login',
        `Domain: ${domain}\nEmpresaID: ${empresaIdNum}\nUsername: ${username}`
      );


      // Llamamos a la función login de authService
      const result = await login(domain, empresaIdNum, username, password);
      console.warn('Resultado login:', result);

      if (result.success) {
        navigation.navigate('Main')
        showToast(
          'success',
          'Login exitoso',
          'Has iniciado sesión correctamente'
        )
      } else {
        // Asegúrate de que error sea una cadena de texto
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : 'Error desconocido al iniciar sesión';

        showToast(
          'error',
          'Error de inicio de sesión',
          errorMessage)
      }
    } catch (err: any) {
      console.error('Error al hacer login:', err);

      // Asegúrate de que el mensaje de error sea una cadena de texto
      const errorMessage = typeof err?.message === 'string'
        ? err.message
        : 'Ocurrió un error al iniciar sesión';

      setError(errorMessage);

      Alert.alert(
        'Error inesperado',
        errorMessage,
        [{ text: 'OK', onPress: () => console.log('Error OK Pressed') }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />

      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Usuario: {username}@{domain}.fastman.io</Text>
      {empresaId && <Text style={styles.subtitle}>Empresa ID: {empresaId}</Text>}

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        placeholder='Contraseña'
        style={styles.input}
        placeholderTextColor='#999'
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError('');
        }}
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.checkboxContainer}>
        <CustomCheckbox
          label="Recuérdame"
          value={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
      </View>

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
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