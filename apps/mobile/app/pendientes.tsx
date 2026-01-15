import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/stores/sync.store';
import { format } from 'date-fns';

interface CargaPendiente {
  id: string;
  vehiculo?: { clienteNombre: string; identificador: string };
  litrosCargados: number;
  createdAt: string;
}

export default function PendientesScreen() {
  const [cargas, setCargas] = useState<CargaPendiente[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getPendingCargas = useSyncStore((state) => state.getPendingCargas);
  const syncPendingCargas = useSyncStore((state) => state.syncPendingCargas);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const pendingCount = useSyncStore((state) => state.pendingCount);

  const loadCargas = async () => {
    const pending = await getPendingCargas();
    setCargas(pending);
  };

  useEffect(() => {
    loadCargas();
  }, [pendingCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCargas();
    setRefreshing(false);
  };

  const handleSync = async () => {
    await syncPendingCargas();
    await loadCargas();
  };

  const renderItem = ({ item }: { item: CargaPendiente }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusDot} />
        <Text style={styles.cardTitle}>
          {item.vehiculo?.clienteNombre || 'Sin cliente'}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Vehiculo:</Text>
          <Text style={styles.cardValue}>
            {item.vehiculo?.identificador || 'N/A'}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Litros:</Text>
          <Text style={styles.cardValueHighlight}>
            {item.litrosCargados?.toLocaleString()} L
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Fecha:</Text>
          <Text style={styles.cardValue}>
            {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cargas.length > 0 ? (
        <>
          <FlatList
            data={cargas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              <Ionicons
                name={isSyncing ? 'sync' : 'cloud-upload'}
                size={24}
                color="#fff"
              />
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Sincronizando...' : `Sincronizar ${cargas.length} cargas`}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
          <Text style={styles.emptyTitle}>Todo sincronizado</Text>
          <Text style={styles.emptySubtitle}>
            No hay cargas pendientes de sincronizar
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardBody: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardLabel: {
    color: '#6b7280',
  },
  cardValue: {
    color: '#111827',
  },
  cardValueHighlight: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  syncButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
