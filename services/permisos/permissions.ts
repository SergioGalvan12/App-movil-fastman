// services/permisos/permissions.ts
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

export async function ensureImagePermissions(): Promise<boolean> {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('inicial Camera permission:', cam.status);
    console.log('inicial Media library permission:', lib.status);
    if (cam.status === 'granted' && lib.status === 'granted') {
        console.log('Camera permission:', cam.status);
        console.log('Media library permission:', lib.status);
        return true;
    }
    Alert.alert(
        'Permisos requeridos',
        'Activa los permisos de Cámara y Galería en los Ajustes de tu dispositivo.',
        [
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings(), },
            { text: 'Cancelar', style: 'cancel' },
        ],
        { cancelable: false }
    );
    console.log('Camera permission:', cam.status);
    console.log('Media library permission:', lib.status);
    return false;
}
// Función para solicitar permisos de ubicación
export async function ensureLocationPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      return true;
    }
    Alert.alert(
      'Permiso de ubicación requerido',
      'Activa el permiso de ubicación en los Ajustes de tu dispositivo.',
      [
        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: false }
    );
    return false;
  }