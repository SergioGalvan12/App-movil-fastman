import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';
import { checkUser } from '../../services/authService';
import { showToast } from '../../services/ToastService';


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
    // Validamos que se ingrese el username
    if (!username.trim()) {
          showToast(
            'error',
            'Usuario es requerido',
            'Por favor ingresa tu nombre de usuario'
          );
      return;
    }

    setLoading(true);
    
    try {
      // Llamamos a checkUser pasando únicamente el username, 
      // ya que el dominio fue seteado previamente en DomainScreen.
      const result = await checkUser(username.trim());

      if (result.success && result.data && result.data.length > 0 && result.empresaId) {
        // Guardamos la información de la empresa proveniente de la respuesta
        setEmpresaInfo({
          id: result.empresaId,
          nombre: result.empresaNombre || 'Empresa'
        });
        // Navegamos a PasswordScreen con los parámetros necesarios para el siguiente paso
        navigation.navigate('Password', {
          domain,
          username: username.trim(),
          empresaId: result.empresaId
        });
      } else {
        // En caso de que la respuesta indique un error o no se encuentren datos
        const mensaje = result.error || 'Usuario no encontrado. Verifica que sea correcto.';
        showToast(
          'error',
          'Error de usuario',
          mensaje
        );
      }
    } catch (err: any) {
      console.error('Error al verificar el usuario:', err);
      const mensajeError = err?.message || 'Ocurrió un error al verificar el usuario. Inténtalo de nuevo.';
      showToast(
        'error',
        'Error de verificación',
        mensajeError
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Dominio: {domain}.fastman.io</Text>
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