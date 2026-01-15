import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCargaStore, Evidencia } from '@/stores/carga.store';

type TipoEvidencia = 'VEHICULO' | 'HOROMETRO' | 'LCQI' | 'OTRO';

const TIPOS_FOTO: { tipo: TipoEvidencia; label: string; icon: string }[] = [
  { tipo: 'VEHICULO', label: 'Vehiculo', icon: 'car' },
  { tipo: 'HOROMETRO', label: 'Horometro', icon: 'speedometer' },
  { tipo: 'LCQI', label: 'LCQI', icon: 'hardware-chip' },
];

export default function FotosScreen() {
  const router = useRouter();
  const [permission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentTipo, setCurrentTipo] = useState<TipoEvidencia>('VEHICULO');

  const carga = useCargaStore((state) => state.carga);
  const addEvidencia = useCargaStore((state) => state.addEvidencia);
  const removeEvidencia = useCargaStore((state) => state.removeEvidencia);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) return;

      // Comprimir imagen
      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const evidencia: Evidencia = {
        tipo: currentTipo,
        uri: compressed.uri,
      };

      addEvidencia(evidencia);
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const openCamera = (tipo: TipoEvidencia) => {
    setCurrentTipo(tipo);
    setShowCamera(true);
  };

  const handleContinue = () => {
    if (carga.evidencias.length === 0) {
      Alert.alert('Evidencia requerida', 'Debes tomar al menos una foto');
      return;
    }
    router.push('/carga/bluetooth');
  };

  const getEvidenciasPorTipo = (tipo: TipoEvidencia) => {
    return carga.evidencias.filter((e) => e.tipo === tipo);
  };

  if (showCamera && permission?.granted) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.cameraBottom}>
              <Text style={styles.cameraHint}>
                Tomando foto: {TIPOS_FOTO.find((t) => t.tipo === currentTipo)?.label}
              </Text>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Evidencia Fotografica</Text>
        <Text style={styles.subtitle}>
          Toma fotos del vehiculo, horometro y LCQI
        </Text>

        {TIPOS_FOTO.map(({ tipo, label, icon }) => {
          const fotos = getEvidenciasPorTipo(tipo);
          return (
            <View key={tipo} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={icon as any} size={24} color="#0ea5e9" />
                <Text style={styles.sectionTitle}>{label}</Text>
                <Text style={styles.sectionCount}>{fotos.length}</Text>
              </View>

              <View style={styles.photosGrid}>
                {fotos.map((foto, index) => {
                  const globalIndex = carga.evidencias.findIndex(
                    (e) => e.uri === foto.uri
                  );
                  return (
                    <View key={foto.uri} style={styles.photoContainer}>
                      <Image source={{ uri: foto.uri }} style={styles.photo} />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeEvidencia(globalIndex)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={() => openCamera(tipo)}
                >
                  <Ionicons name="camera" size={32} color="#9ca3af" />
                  <Text style={styles.addPhotoText}>Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {carga.evidencias.length} foto(s) tomada(s)
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            carga.evidencias.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={carga.evidencias.length === 0}
        >
          <Text style={styles.buttonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  sectionCount: {
    backgroundColor: '#0ea5e9',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  cameraBottom: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  cameraHint: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
});
