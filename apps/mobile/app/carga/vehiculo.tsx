import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCargaStore } from '@/stores/carga.store';

export default function VehiculoScreen() {
  const router = useRouter();
  const carga = useCargaStore((state) => state.carga);
  const setHorometroOdometro = useCargaStore((state) => state.setHorometroOdometro);

  const [valor, setValor] = useState('');

  const vehiculo = carga.vehiculo;

  if (!vehiculo) {
    router.replace('/carga/scan');
    return null;
  }

  const handleContinue = () => {
    const numValue = parseFloat(valor);
    if (isNaN(numValue) || numValue < 0) {
      alert('Ingresa un valor valido');
      return;
    }
    setHorometroOdometro(numValue);
    router.push('/carga/fotos');
  };

  const tipoCaptura = vehiculo.usaHorometro ? 'Horometro' : 'Odometro';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info del vehículo */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={vehiculo.tipo === 'CAMION' ? 'bus' : 'construct'}
              size={48}
              color="#0ea5e9"
            />
          </View>
          <Text style={styles.clienteNombre}>{vehiculo.clienteNombre}</Text>
          <Text style={styles.vehiculoId}>{vehiculo.identificador}</Text>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{vehiculo.tipo}</Text>
            </View>
            {vehiculo.marca && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marca:</Text>
                <Text style={styles.detailValue}>{vehiculo.marca}</Text>
              </View>
            )}
            {vehiculo.modelo && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Modelo:</Text>
                <Text style={styles.detailValue}>{vehiculo.modelo}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Input horómetro/odómetro */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{tipoCaptura}</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
            placeholder={`Ingresa el ${tipoCaptura.toLowerCase()}`}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !valor && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!valor}
        >
          <Text style={styles.buttonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  clienteNombre: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  vehiculoId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  details: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    color: '#111827',
    fontWeight: '500',
  },
  inputSection: {
    marginTop: 24,
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
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
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
