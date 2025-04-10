import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../App';
import CustomCheckbox from '../../components/CustomCheckbox';

type PasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Password'>;
type PasswordScreenRouteProp = RouteProp<AuthStackParamList, 'Password'>;

type Props = {
  navigation: PasswordScreenNavigationProp;
  route: PasswordScreenRouteProp;
};

export default function PasswordScreen({ navigation, route }: Props) {
  const { domain, username } = route.params;
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Navegar a la pantalla de Reportes después del login
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fastman.png')} style={styles.logo} />

      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Usuario: {username}@{domain}</Text>

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        placeholder='Contraseña'
        style={styles.input}
        placeholderTextColor='#999'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.checkboxContainer}>
        <CustomCheckbox
          label="Recuérdame"
          value={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
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
    marginBottom: 20,
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
    marginBottom: 10,
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