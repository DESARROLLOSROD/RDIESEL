import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/stores/sync.store';
import { format } from 'date-fns';

export default function ConfiguracionScreen() {
  const [syncingCatalogo, setSyncingCatalogo] = useState(false);

  const catalogo = useSyncStore((state) => state.catalogo);
  const lastSync = useSyncStore((state) => state.lastSync);
  const syncCatalogo = useSyncStore((state) => state.syncCatalogo);
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const syncPendingCargas = useSyncStore((state) => state.syncPendingCargas);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const pipaSeleccionadaId = useSyncStore((state) => state.pipaSeleccionadaId);
  const setPipaSeleccionada = useSyncStore((state) => state.setPipaSeleccionada);
  const getPipaSeleccionada = useSyncStore((state) => state.getPipaSeleccionada);

  const pipaSeleccionada = getPipaSeleccionada();

  const handleSyncCatalogo = async () => {
    setSyncingCatalogo(true);
    try {
      await syncCatalogo();
      Alert.alert('Exito', 'Catalogo sincronizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo sincronizar el catalogo');
    } finally {
      setSyncingCatalogo(false);
    }
  };

  const handleSyncCargas = async () => {
    if (pendingCount === 0) {
      Alert.alert('Info', 'No hay cargas pendientes de sincronizar');
      return;
    }
    await syncPendingCargas();
    Alert.alert('Exito', 'Cargas sincronizadas correctamente');
  };

  const handleCambiarPipa = () => {
    if (pipaSeleccionadaId) {
      Alert.alert(
        'Cambiar pipa',
        'Si cambias de pipa, se perdera la seleccion actual.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cambiar',
            onPress: () => setPipaSeleccionada(null),
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Info de sincronizacion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sincronizacion</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Ultima sincronizacion</Text>
              <Text style={styles.cardRowValue}>
                {lastSync ? format(new Date(lastSync), 'dd/MM/yyyy HH:mm') : 'Nunca'}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="car-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Vehiculos en catalogo</Text>
              <Text style={styles.cardRowValue}>{catalogo?.vehiculos.length || 0}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="people-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Clientes</Text>
              <Text style={styles.cardRowValue}>{catalogo?.clientes.length || 0}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="bus-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Pipas</Text>
              <Text style={styles.cardRowValue}>{catalogo?.pipas.length || 0}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, syncingCatalogo && styles.actionButtonDisabled]}
          onPress={handleSyncCatalogo}
          disabled={syncingCatalogo}
        >
          {syncingCatalogo ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="refresh" size={20} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {syncingCatalogo ? 'Sincronizando...' : 'Actualizar catalogo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cargas pendientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cargas pendientes</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="cloud-upload-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Cargas por sincronizar</Text>
              <Text style={[styles.cardRowValue, pendingCount > 0 && styles.pendingValue]}>
                {pendingCount}
              </Text>
            </View>
          </View>
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonGreen, isSyncing && styles.actionButtonDisabled]}
            onPress={handleSyncCargas}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="cloud-upload" size={20} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>
              {isSyncing ? 'Sincronizando...' : 'Sincronizar cargas'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pipa seleccionada */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pipa actual</Text>

        <View style={styles.card}>
          {pipaSeleccionada ? (
            <View style={styles.cardRow}>
              <View style={[styles.cardRowIcon, styles.pipaIcon]}>
                <Ionicons name="bus" size={20} color="#0ea5e9" />
              </View>
              <View style={styles.cardRowContent}>
                <Text style={styles.cardRowLabel}>Pipa {pipaSeleccionada.numero}</Text>
                <Text style={styles.cardRowValue}>{pipaSeleccionada.placa}</Text>
              </View>
              <TouchableOpacity onPress={handleCambiarPipa}>
                <Text style={styles.changeLink}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardRow}>
              <View style={styles.cardRowIcon}>
                <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
              </View>
              <View style={styles.cardRowContent}>
                <Text style={styles.cardRowLabel}>Sin pipa seleccionada</Text>
                <Text style={styles.cardRowValueMuted}>
                  Selecciona una pipa desde la pantalla principal
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Info de la app */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardRowIcon}>
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowLabel}>Version</Text>
              <Text style={styles.cardRowValue}>1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pipaIcon: {
    backgroundColor: '#e0f2fe',
  },
  cardRowContent: {
    flex: 1,
  },
  cardRowLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  cardRowValueMuted: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  pendingValue: {
    color: '#f59e0b',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 64,
  },
  changeLink: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  actionButtonGreen: {
    backgroundColor: '#22c55e',
  },
  actionButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
