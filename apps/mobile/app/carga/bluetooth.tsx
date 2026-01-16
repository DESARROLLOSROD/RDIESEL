import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCargaStore } from '@/stores/carga.store';
import { useSyncStore } from '@/stores/sync.store';

// Simulación de BLE - en producción usar react-native-ble-plx
interface LCQIDevice {
  id: string;
  mac: string;
  numeroSerie: string;
  pipaId: string;
  pipaNumero: string;
}

export default function BluetoothScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<LCQIDevice[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const setLCQI = useCargaStore((state) => state.setLCQI);
  const catalogo = useSyncStore((state) => state.catalogo);
  const pipaSeleccionadaId = useSyncStore((state) => state.pipaSeleccionadaId);
  const getPipaSeleccionada = useSyncStore((state) => state.getPipaSeleccionada);

  const pipaSeleccionada = getPipaSeleccionada();

  useEffect(() => {
    // Si ya hay una pipa seleccionada con LCQI, conectar automaticamente
    if (pipaSeleccionada?.lcqiId && catalogo?.lcqis) {
      const lcqi = catalogo.lcqis.find((l: any) => l.id === pipaSeleccionada.lcqiId);
      if (lcqi) {
        setConnecting(lcqi.id);
        setTimeout(() => {
          setLCQI(lcqi.id, lcqi.macBluetooth, pipaSeleccionada.id);
          setConnecting(null);
          router.push('/carga/proceso');
        }, 1500);
        return;
      }
    }
    startScan();
  }, []);

  const startScan = async () => {
    setScanning(true);
    setDevices([]);

    // Simulación: en producción usar BleManager de react-native-ble-plx
    // Mostrar LCQIs del catálogo como dispositivos "encontrados"
    setTimeout(() => {
      if (catalogo?.lcqis && catalogo?.pipas) {
        let lcqiDevices: LCQIDevice[] = catalogo.lcqis
          .filter((lcqi: any) => lcqi.activo)
          .map((lcqi: any) => {
            const pipa = catalogo.pipas.find((p: any) => p.lcqiId === lcqi.id);
            return {
              id: lcqi.id,
              mac: lcqi.macBluetooth,
              numeroSerie: lcqi.numeroSerie,
              pipaId: pipa?.id || '',
              pipaNumero: pipa?.numero || 'Sin pipa',
            };
          })
          .filter((d: LCQIDevice) => d.pipaId);

        // Si hay pipa seleccionada, filtrar solo su LCQI
        if (pipaSeleccionadaId) {
          lcqiDevices = lcqiDevices.filter((d) => d.pipaId === pipaSeleccionadaId);
        }

        setDevices(lcqiDevices);
      }
      setScanning(false);
    }, 2000);
  };

  const connectDevice = async (device: LCQIDevice) => {
    setConnecting(device.id);

    // Simulación de conexión BLE
    setTimeout(() => {
      setLCQI(device.id, device.mac, device.pipaId);
      setConnecting(null);
      router.push('/carga/proceso');
    }, 1500);
  };

  const renderDevice = ({ item }: { item: LCQIDevice }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => connectDevice(item)}
      disabled={connecting !== null}
    >
      <View style={styles.deviceIcon}>
        <Ionicons name="bluetooth" size={32} color="#0ea5e9" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.numeroSerie}</Text>
        <Text style={styles.deviceMac}>{item.mac}</Text>
        <Text style={styles.devicePipa}>Pipa: {item.pipaNumero}</Text>
      </View>
      {connecting === item.id ? (
        <ActivityIndicator color="#0ea5e9" />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bluetooth" size={48} color="#0ea5e9" />
        <Text style={styles.title}>Conexion Bluetooth</Text>
        <Text style={styles.subtitle}>
          Selecciona el cuentalitros LCQI para esta carga
        </Text>
      </View>

      {scanning ? (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.scanningText}>Buscando dispositivos...</Text>
        </View>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bluetooth-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>
                No se encontraron dispositivos
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={startScan}>
                <Ionicons name="refresh" size={20} color="#0ea5e9" />
                <Text style={styles.retryText}>Buscar de nuevo</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {!scanning && devices.length > 0 && (
        <TouchableOpacity style={styles.rescanButton} onPress={startScan}>
          <Ionicons name="refresh" size={20} color="#0ea5e9" />
          <Text style={styles.rescanText}>Buscar de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  scanningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  deviceMac: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  devicePipa: {
    fontSize: 14,
    color: '#0ea5e9',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  retryText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '500',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  rescanText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '500',
  },
});
