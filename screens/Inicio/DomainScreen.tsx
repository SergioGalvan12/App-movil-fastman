import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';
import { checkDomain } from '../../services/api';
import axios from 'axios';

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
    setError('Por favor ingresa el dominio');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Verificamos si el dominio existe
    const result = await checkDomain(domain.trim().toLowerCase());
    
    if (result.success) {
      // Si el dominio existe, navegamos a la pantalla de usuario
      navigation.navigate('User', { domain: domain.trim().toLowerCase(), username: '' });
    } else {
      // Mensajes de error más específicos
      if (result.error && axios.isAxiosError(result.error)) {
        if (result.error.code === 'ECONNABORTED') {
          setError('Tiempo de espera agotado. Verifica tu conexión a internet.');
        } else if (result.error.response) {
          if (result.error.response.status === 404) {
            setError('El dominio no existe. Verifica que sea correcto.');
          } else {
            setError(`Error del servidor: ${result.error.response.status}`);
          }
        } else if (result.error.request) {
          setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
        } else {
          setError('Error al verificar el dominio. Inténtalo de nuevo.');
        }
      } else {
        setError('No se pudo conectar con el dominio especificado. Verifica que sea correcto.');
      }
    }
  } catch (err) {
    setError('Ocurrió un error al verificar el dominio. Inténtalo de nuevo.');
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