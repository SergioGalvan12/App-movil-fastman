import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../App';

type DomainScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Domain'>;

type Props = {
  navigation: DomainScreenNavigationProp;
};

export default function DomainScreen({ navigation }: Props) {
  const [domain, setDomain] = useState('');

  const handleNext = () => {
    if (domain.trim()) {
      navigation.navigate('User', { domain });
    } else {
      alert('Por favor ingresa el dominio');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />

      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Dominio de la empresa</Text>
      <TextInput
        value={domain}
        placeholder="Ingresa el dominio"
        style={styles.input}
        placeholderTextColor="#999"
        onChangeText={setDomain}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
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
  button: {
    width: '100%',
    backgroundColor: '#5D74A6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFF',
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