import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCargaStore, VehiculoLocal } from '@/stores/carga.store';
import { useSyncStore } from '@/stores/sync.store';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const initCarga = useCargaStore((state) => state.initCarga);
  const setVehiculo = useCargaStore((state) => state.setVehiculo);
  const getVehiculoByQR = useSyncStore((state) => state.getVehiculoByQR);
  const catalogo = useSyncStore((state) => state.catalogo);

  useEffect(() => {
    initCarga();
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Buscar vehículo en catálogo local
    const vehiculo = getVehiculoByQR(data);

    if (!vehiculo) {
      Alert.alert(
        'QR no reconocido',
        'Este codigo QR no corresponde a ningun vehiculo registrado.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    if (!vehiculo.activo) {
      Alert.alert(
        'Vehiculo inactivo',
        'Este vehiculo esta marcado como inactivo.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    // Buscar nombre del cliente
    const cliente = catalogo?.clientes.find((c) => c.id === vehiculo.clienteId);

    const vehiculoLocal: VehiculoLocal = {
      id: vehiculo.id,
      clienteId: vehiculo.clienteId,
      clienteNombre: cliente?.nombre || 'Cliente desconocido',
      identificador: vehiculo.identificador,
      tipo: vehiculo.tipo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      usaHorometro: vehiculo.usaHorometro,
      qrCode: vehiculo.qrCode,
    };

    setVehiculo(vehiculoLocal);
    router.push('/carga/vehiculo');
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Se necesita permiso para acceder a la camara
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.hint}>
            Escanea el codigo QR del vehiculo
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#0ea5e9',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
