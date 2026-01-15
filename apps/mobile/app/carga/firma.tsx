import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SignatureScreen from 'react-native-signature-canvas';
import { useCargaStore } from '@/stores/carga.store';

export default function FirmaScreen() {
  const router = useRouter();
  const signatureRef = useRef<any>(null);
  const [nombre, setNombre] = useState('');
  const [firmaData, setFirmaData] = useState<string | null>(null);

  const setFirma = useCargaStore((state) => state.setFirma);

  const handleSignature = (signature: string) => {
    // signature viene como data URL: "data:image/png;base64,..."
    const base64 = signature.replace('data:image/png;base64,', '');
    setFirmaData(base64);
  };

  const clearSignature = () => {
    signatureRef.current?.clearSignature();
    setFirmaData(null);
  };

  const handleContinue = () => {
    if (!nombre.trim()) {
      alert('Ingresa el nombre del responsable');
      return;
    }
    if (!firmaData) {
      alert('Se requiere la firma');
      return;
    }

    setFirma(nombre.trim(), firmaData);
    router.push('/carga/resumen');
  };

  const webStyle = `.m-signature-pad {
    box-shadow: none;
    border: none;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body, html {
    background-color: #f9fafb;
  }
  canvas {
    background-color: #fff;
    border-radius: 12px;
  }`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Firma del responsable</Text>
        <Text style={styles.subtitle}>
          Ingresa el nombre y firma de quien recibe la carga
        </Text>

        {/* Input nombre */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del responsable"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Área de firma */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureHeader}>
            <Text style={styles.inputLabel}>Firma</Text>
            <TouchableOpacity onPress={clearSignature}>
              <Text style={styles.clearButton}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureContainer}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() => setFirmaData(null)}
              autoClear={false}
              descriptionText=""
              webStyle={webStyle}
              backgroundColor="#fff"
              penColor="#111827"
            />
          </View>
          <Text style={styles.signatureHint}>
            Dibuja la firma en el recuadro
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!nombre || !firmaData) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!nombre || !firmaData}
        >
          <Text style={styles.buttonText}>Ver Resumen</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  signatureSection: {
    flex: 1,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    minHeight: 200,
  },
  signatureHint: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
});
