// src/screens/reports/CargarImagen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  fetchBacklogImages,
  uploadBacklogImage,
  BacklogImageInterface,
} from '../../services/reports/averias/backlogImagenService';
import { showToast } from '../../services/notifications/ToastService';

// Definimos los params que esperamos de la navegación
type CargarImagenRouteProp = RouteProp<
  { CargarImagen: { backlogId: number; empresaId: number } },
  'CargarImagen'
>;

export default function CargarImagen() {
  const navigation = useNavigation();
  const { params } = useRoute<CargarImagenRouteProp>();
  const { backlogId, empresaId } = params;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<BacklogImageInterface[]>([]);

  // 1) Al montar, cargamos imágenes ya existentes para este backlog
  useEffect(() => {
    (async () => {
      try {
        console.log('[CargarImagen] fetchBacklogImages backlogId→', backlogId);
        const resp = await fetchBacklogImages(backlogId);
        if (resp.success && resp.data) {
          setExistingImages(resp.data);
          console.log('[CargarImagen] imágenes existentes →', resp.data);
        }
      } catch (e) {
        console.error('[CargarImagen] Error cargando imágenes', e);
      }
    })();
  }, [backlogId]);

  // 2) (Opcional) Verificamos permisos de ubicación
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        console.log('Ubicación actual:', {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
        });
      }
    })();
  }, []);

  // 3) Funciones para elegir o tomar foto
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // 4) Subir la imagen seleccionada
  const handleUpload = async () => {
    if (!imageUri) return;
    setUploading(true);
    try {
      console.log('[CargarImagen] uploadBacklogImage payload →', { backlogId, empresaId, imageUri });
      const resp = await uploadBacklogImage(backlogId, empresaId, imageUri);
      console.log('[CargarImagen] upload response →', resp);
      if (resp.success && resp.data) {
        showToast('success', 'Imagen subida con éxito');
        // refrescamos la lista:
        const list = await fetchBacklogImages(backlogId);
        if (list.success && list.data) setExistingImages(list.data);
        // limpiar preview para permitir nuevas subidas
        setImageUri(null);
      } else {
        throw new Error(resp.error || 'Error al subir imagen');
      }
    } catch (e: any) {
      console.error('[CargarImagen] Error uploading →', e);
      showToast('error', 'No se pudo subir la imagen', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Cargar Imagen</Text>

          {/* Previsualización de la nueva imagen seleccionada */}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          )}

          {/* Botones para elegir o tomar foto */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Galería</Text>
            </TouchableOpacity>
          </View>

          {/* Botón para subir */}
          {imageUri && (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && { opacity: 0.6 }]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.buttonText}>Subir Imagen</Text>}
            </TouchableOpacity>
          )}

          {/* Lista simple de imágenes ya cargadas (URL) */}
          {existingImages.length > 0 && (
            <View style={{ marginTop: 16, width: '100%' }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Imágenes existentes:</Text>
              {existingImages.map((img) => (
                <Image
                  key={img.id_imagen}
                  source={{ uri: img.imagen_url }}
                  style={{ width: 80, height: 80, marginRight: 8, marginBottom: 8 }}
                />
              ))}
            </View>
          )}

          {/* Cancelar / Cerrar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '85%', backgroundColor: 'white', borderRadius: 10,
    padding: 20, alignItems: 'center'
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#1E3A8A'
  },
  imagePreview: {
    width: 200, height: 200, borderRadius: 8, marginBottom: 12
  },
  buttonContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginVertical: 8
  },
  actionButton: {
    flex: 1, backgroundColor: '#28A745', padding: 12,
    borderRadius: 8, marginHorizontal: 4
  },
  uploadButton: {
    width: '100%', backgroundColor: '#2563EB',
    padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8
  },
  cancelButton: {
    flex: 1, backgroundColor: '#DC3545', padding: 12,
    borderRadius: 8, marginHorizontal: 4
  },
  buttonText: {
    color: 'white', textAlign: 'center', fontSize: 16
  },
});
