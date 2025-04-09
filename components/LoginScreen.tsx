import Reac, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import CustomCheckbox from '../components/CustomCheckbox';


export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => {
        // Aquí puedes manejar la lógica de inicio de sesión
        console.log('Iniciar sesión con:', { username, password, rememberMe });
        alert('Usuario: ${username}\nContraseña: ${password}\nRecordar: ${rememberMe}');
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/fastman.png')} style={styles.logo} />

            <Text style={styles.title}>Iniciar sesión</Text>

            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
                value={username}
                placeholder="Nombre de usuario"
                style={styles.input}
                placeholderTextColor="#999"
                onChangeText={setUsername}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
                placeholder='Contraseña'
                style={styles.input}
                placeholderTextColor='#999'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
                <CustomCheckbox
                    label="Recuérdame"
                    value={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                />
            </View>

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
        marginTop: 150,
        marginBottom: 30,
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
        marginBottom: 130,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#1B2A56',
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


