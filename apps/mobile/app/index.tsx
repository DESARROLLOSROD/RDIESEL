import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/stores/sync.store';

export default function HomeScreen() {
  const router = useRouter();
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const syncPendingCargas = useSyncStore((state) => state.syncPendingCargas);
  const catalogo = useSyncStore((state) => state.catalogo);
  const pipaSeleccionadaId = useSyncStore((state) => state.pipaSeleccionadaId);
  const getPipaSeleccionada = useSyncStore((state) => state.getPipaSeleccionada);

  const pipaSeleccionada = getPipaSeleccionada();

  // Redirigir a setup si no hay catalogo
  useEffect(() => {
    if (!catalogo || catalogo.vehiculos.length === 0) {
      router.replace('/setup');
    }
  }, [catalogo]);

  const handleIniciarCarga = () => {
    if (!pipaSeleccionadaId) {
      Alert.alert(
        'Selecciona una pipa',
        'Debes seleccionar la pipa con la que vas a trabajar antes de iniciar una carga.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Seleccionar', onPress: () => router.push('/seleccionar-pipa') },
        ]
      );
      return;
    }
    router.push('/carga/scan');
  };

  return (
    <View style={styles.container}>
      {/* Header con config */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => router.push('/configuracion')}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>RDiesel</Text>
        <Text style={styles.subtitle}>Sistema de Cargas</Text>
      </View>

      {/* Pipa seleccionada */}
      <TouchableOpacity
        style={styles.pipaSelector}
        onPress={() => router.push('/seleccionar-pipa')}
      >
        <Ionicons name="bus" size={24} color={pipaSeleccionada ? '#fff' : 'rgba(255,255,255,0.6)'} />
        <View style={styles.pipaSelectorInfo}>
          {pipaSeleccionada ? (
            <>
              <Text style={styles.pipaSelectorLabel}>Pipa seleccionada</Text>
              <Text style={styles.pipaSelectorValue}>
                Pipa {pipaSeleccionada.numero} - {pipaSeleccionada.placa}
              </Text>
            </>
          ) : (
            <Text style={styles.pipaSelectorPlaceholder}>Toca para seleccionar pipa</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mainButton, !pipaSeleccionadaId && styles.mainButtonDisabled]}
        onPress={handleIniciarCarga}
      >
        <Ionicons name="qr-code" size={64} color="#fff" />
        <Text style={styles.mainButtonText}>CARGAS</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.pendingButton}
          onPress={() => router.push('/pendientes')}
        >
          <Ionicons name="cloud-upload" size={24} color="#0ea5e9" />
          <Text style={styles.pendingText}>
            {pendingCount} pendientes
          </Text>
        </TouchableOpacity>

        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={syncPendingCargas}
            disabled={isSyncing}
          >
            <Ionicons
              name={isSyncing ? 'sync' : 'cloud-done'}
              size={20}
              color="#fff"
            />
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarSpacer: {
    width: 40,
  },
  configButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2fe',
    marginTop: 8,
  },
  pipaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  pipaSelectorInfo: {
    flex: 1,
  },
  pipaSelectorLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  pipaSelectorValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  pipaSelectorPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  mainButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  mainButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  pendingText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
