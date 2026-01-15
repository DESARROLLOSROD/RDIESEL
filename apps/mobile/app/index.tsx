import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/stores/sync.store';

export default function HomeScreen() {
  const router = useRouter();
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const syncPendingCargas = useSyncStore((state) => state.syncPendingCargas);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RDiesel</Text>
        <Text style={styles.subtitle}>Sistema de Cargas</Text>
      </View>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => router.push('/carga/scan')}
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
  header: {
    alignItems: 'center',
    marginBottom: 60,
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
