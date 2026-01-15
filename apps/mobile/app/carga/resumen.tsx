import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCargaStore } from '@/stores/carga.store';
import { useSyncStore } from '@/stores/sync.store';

type EstadoCarga = 'OK' | 'OBSERVACION' | 'ANOMALO';

export default function ResumenScreen() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoCarga>('OK');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  const carga = useCargaStore((state) => state.carga);
  const setEstadoCarga = useCargaStore((state) => state.setEstado);
  const finalizarCarga = useCargaStore((state) => state.finalizarCarga);
  const resetCarga = useCargaStore((state) => state.resetCarga);
  const saveCarga = useSyncStore((state) => state.saveCarga);

  const handleGuardar = async () => {
    if (estado !== 'OK' && !observaciones.trim()) {
      Alert.alert('Observacion requerida', 'Debes ingresar una observacion para este estado');
      return;
    }

    setGuardando(true);

    try {
      setEstadoCarga(estado, observaciones);
      finalizarCarga();

      // Obtener la carga actualizada
      const cargaFinal = useCargaStore.getState().carga;

      // Guardar en SQLite local
      await saveCarga(cargaFinal);

      Alert.alert(
        'Carga guardada',
        'La carga se guardo correctamente y se sincronizara cuando haya conexion.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetCarga();
              router.replace('/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving carga:', error);
      Alert.alert('Error', 'No se pudo guardar la carga. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const estadoOptions: { value: EstadoCarga; label: string; color: string; icon: string }[] = [
    { value: 'OK', label: 'OK', color: '#22c55e', icon: 'checkmark-circle' },
    { value: 'OBSERVACION', label: 'Observacion', color: '#f59e0b', icon: 'alert-circle' },
    { value: 'ANOMALO', label: 'Anomalo', color: '#ef4444', icon: 'close-circle' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Resumen de Carga</Text>

        {/* Info del vehículo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehiculo</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Cliente:</Text>
            <Text style={styles.cardValue}>{carga.vehiculo?.clienteNombre}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Identificador:</Text>
            <Text style={styles.cardValue}>{carga.vehiculo?.identificador}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>
              {carga.vehiculo?.usaHorometro ? 'Horometro' : 'Odometro'}:
            </Text>
            <Text style={styles.cardValue}>{carga.horometroOdometro}</Text>
          </View>
        </View>

        {/* Info de la carga */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Carga</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Lectura inicial:</Text>
            <Text style={styles.cardValue}>{carga.lecturaInicial?.toLocaleString()} L</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Lectura final:</Text>
            <Text style={styles.cardValue}>{carga.lecturaFinal?.toLocaleString()} L</Text>
          </View>
          <View style={[styles.cardRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total cargado:</Text>
            <Text style={styles.totalValue}>{carga.litrosCargados?.toLocaleString()} L</Text>
          </View>
        </View>

        {/* Evidencias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evidencias ({carga.evidencias.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.evidenciasRow}>
              {carga.evidencias.map((ev, index) => (
                <Image key={index} source={{ uri: ev.uri }} style={styles.evidenciaThumb} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Firma */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Firma</Text>
          <Text style={styles.firmaName}>{carga.firmaNombre}</Text>
          {carga.firmaBase64 && (
            <Image
              source={{ uri: `data:image/png;base64,${carga.firmaBase64}` }}
              style={styles.firmaImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Estado de la carga */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de la carga</Text>
          <View style={styles.estadoOptions}>
            {estadoOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.estadoOption,
                  estado === opt.value && { borderColor: opt.color, backgroundColor: `${opt.color}10` },
                ]}
                onPress={() => setEstado(opt.value)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={24}
                  color={estado === opt.value ? opt.color : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.estadoLabel,
                    estado === opt.value && { color: opt.color },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {estado !== 'OK' && (
            <View style={styles.observacionesSection}>
              <Text style={styles.observacionesLabel}>Observaciones *</Text>
              <TextInput
                style={styles.observacionesInput}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Describe la observacion o anomalia..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, guardando && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {guardando ? 'Guardando...' : 'Guardar Carga'}
          </Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  cardLabel: {
    color: '#6b7280',
  },
  cardValue: {
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  evidenciasRow: {
    flexDirection: 'row',
    gap: 8,
  },
  evidenciaThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  firmaName: {
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  firmaImage: {
    height: 80,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  estadoOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  estadoOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  estadoLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  observacionesSection: {
    marginTop: 16,
  },
  observacionesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  observacionesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#22c55e',
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
