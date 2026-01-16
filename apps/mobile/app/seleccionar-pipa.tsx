import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '@/stores/sync.store';
import { useCargaStore } from '@/stores/carga.store';

interface Pipa {
  id: string;
  numero: string;
  placa: string;
  capacidadLitros: number;
  activo: boolean;
  lcqiId?: string;
}

export default function SeleccionarPipaScreen() {
  const router = useRouter();
  const [selectedPipa, setSelectedPipa] = useState<string | null>(null);

  const catalogo = useSyncStore((state) => state.catalogo);
  const setPipaSeleccionada = useSyncStore((state) => state.setPipaSeleccionada);

  const pipas = (catalogo?.pipas || []).filter((p: Pipa) => p.activo);

  const handleSeleccionar = () => {
    if (!selectedPipa) {
      Alert.alert('Selecciona una pipa', 'Debes seleccionar la pipa con la que vas a trabajar hoy');
      return;
    }

    setPipaSeleccionada(selectedPipa);
    router.back();
  };

  const renderPipa = ({ item }: { item: Pipa }) => {
    const isSelected = selectedPipa === item.id;
    const hasLCQI = !!item.lcqiId;

    return (
      <TouchableOpacity
        style={[styles.pipaCard, isSelected && styles.pipaCardSelected]}
        onPress={() => setSelectedPipa(item.id)}
      >
        <View style={[styles.pipaIcon, isSelected && styles.pipaIconSelected]}>
          <Ionicons
            name="bus"
            size={32}
            color={isSelected ? '#fff' : '#0ea5e9'}
          />
        </View>
        <View style={styles.pipaInfo}>
          <Text style={[styles.pipaNumero, isSelected && styles.textSelected]}>
            Pipa {item.numero}
          </Text>
          <Text style={[styles.pipaPlaca, isSelected && styles.textSelectedLight]}>
            {item.placa}
          </Text>
          <View style={styles.pipaDetails}>
            <Text style={[styles.pipaCapacidad, isSelected && styles.textSelectedLight]}>
              {item.capacidadLitros.toLocaleString()} L
            </Text>
            {hasLCQI ? (
              <View style={styles.lcqiBadge}>
                <Ionicons name="bluetooth" size={12} color="#22c55e" />
                <Text style={styles.lcqiText}>LCQI</Text>
              </View>
            ) : (
              <View style={[styles.lcqiBadge, styles.lcqiBadgeWarning]}>
                <Ionicons name="warning" size={12} color="#f59e0b" />
                <Text style={[styles.lcqiText, styles.lcqiTextWarning]}>Sin LCQI</Text>
              </View>
            )}
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu pipa</Text>
        <Text style={styles.subtitle}>
          Elige la pipa con la que trabajaras hoy
        </Text>
      </View>

      <FlatList
        data={pipas}
        renderItem={renderPipa}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No hay pipas disponibles</Text>
            <Text style={styles.emptySubtext}>
              Sincroniza el catalogo para ver las pipas
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selectedPipa && styles.buttonDisabled]}
          onPress={handleSeleccionar}
          disabled={!selectedPipa}
        >
          <Text style={styles.buttonText}>Confirmar seleccion</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  },
  list: {
    padding: 16,
  },
  pipaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pipaCardSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0284c7',
  },
  pipaIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipaIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pipaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  pipaNumero: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  pipaPlaca: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  pipaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  pipaCapacidad: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  lcqiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  lcqiBadgeWarning: {
    backgroundColor: '#fef3c7',
  },
  lcqiText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  lcqiTextWarning: {
    color: '#f59e0b',
  },
  textSelected: {
    color: '#fff',
  },
  textSelectedLight: {
    color: 'rgba(255,255,255,0.8)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
