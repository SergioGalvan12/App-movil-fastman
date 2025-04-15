// screens/Inicio/DomainScreen.tsx
// Este archivo contiene la pantalla de inicio de sesión donde el usuario ingresa el dominio de su empresa.
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { checkDomain } from '../../services/authService';
import { showToast } from '../../services/ToastService';

type DomainScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Domain'>;

type Props = {
  navigation: DomainScreenNavigationProp;
};

export default function DomainScreen({ navigation }: Props) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

// En la función handleNext de DomainScreen.tsx
const handleNext = async () => {
  if (!domain.trim()) {
    showToast(
      'error',
      'Dominio requerido',
      'Por favor ingresa el dominio de tu empresa'
    );
    return;
  }

  setLoading(true);
  // setError('');

  try {
    // Verificamos si el dominio existe
    const result = await checkDomain(domain.trim().toLowerCase());
    
    if (result.success) {
      // Si el dominio existe, navegamos a la pantalla de usuario
      navigation.navigate('User', { domain: domain.trim().toLowerCase(), username: '' });
    } else {
      const errorMessage = 'Dominio no encontrado';
      // Mostrar el mensaje de error con Toast
      showToast('error', 'Error', errorMessage);
    }
  } catch (err) {
      // En caso de error en la petición, mostramos Toast
      showToast('error', 'Error', 'Ocurrió un error al verificar el dominio. Inténtalo de nuevo.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />

      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Dominio de la empresa</Text>
      <TextInput
        value={domain}
        placeholder="Ingresa el dominio (ej: gpp)"
        style={styles.input}
        placeholderTextColor="#999"
        onChangeText={(text) => {
          setDomain(text);
          setError('');
        }}
        autoCapitalize='none'
        keyboardType='url'
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
    marginBottom: 20,
    color: '#1B2A56',
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
    marginBottom: 20,
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
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  domainHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
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