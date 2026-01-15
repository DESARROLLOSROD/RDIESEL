import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCargaStore } from '@/stores/carga.store';

export default function ProcesoScreen() {
  const router = useRouter();
  const [litrosActuales, setLitrosActuales] = useState(0);
  const [estado, setEstado] = useState<'esperando' | 'cargando' | 'finalizado'>('esperando');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const carga = useCargaStore((state) => state.carga);
  const setLecturaInicial = useCargaStore((state) => state.setLecturaInicial);
  const setLecturaFinal = useCargaStore((state) => state.setLecturaFinal);

  // Simulación de lectura LCQI
  // En producción, esto vendría de react-native-ble-plx
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const iniciarCarga = () => {
    // Simular lectura inicial del LCQI
    const lecturaInicial = Math.floor(Math.random() * 10000) + 50000;
    setLecturaInicial(lecturaInicial);
    setEstado('cargando');

    // Simular flujo de diesel
    let litros = 0;
    const maxLitros = Math.floor(Math.random() * 500) + 200; // Entre 200-700 litros

    intervalRef.current = setInterval(() => {
      litros += Math.floor(Math.random() * 20) + 5;
      if (litros >= maxLitros) {
        litros = maxLitros;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Flujo = 0, carga finalizada
        setTimeout(() => {
          setLecturaFinal(lecturaInicial + maxLitros);
          setEstado('finalizado');
        }, 1000);
      }
      setLitrosActuales(litros);
    }, 500);
  };

  const finalizarManualmente = () => {
    Alert.alert(
      'Finalizar carga',
      'Deseas finalizar la carga manualmente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            const lecturaInicial = carga.lecturaInicial || 50000;
            setLecturaFinal(lecturaInicial + litrosActuales);
            setEstado('finalizado');
          },
        },
      ]
    );
  };

  const continuar = () => {
    router.push('/carga/firma');
  };

  return (
    <View style={styles.container}>
      {/* Header con estado */}
      <View style={[styles.header, estado === 'cargando' && styles.headerCargando]}>
        <Ionicons
          name={
            estado === 'esperando'
              ? 'hourglass'
              : estado === 'cargando'
              ? 'water'
              : 'checkmark-circle'
          }
          size={48}
          color="#fff"
        />
        <Text style={styles.estadoText}>
          {estado === 'esperando'
            ? 'Listo para iniciar'
            : estado === 'cargando'
            ? 'Carga en proceso'
            : 'Carga finalizada'}
        </Text>
      </View>

      {/* Display de litros */}
      <View style={styles.displayContainer}>
        <Text style={styles.litrosLabel}>Litros cargados</Text>
        <Text style={styles.litrosValue}>{litrosActuales.toLocaleString()}</Text>
        <Text style={styles.litrosUnit}>L</Text>
      </View>

      {/* Info adicional */}
      <View style={styles.infoContainer}>
        {carga.lecturaInicial && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lectura inicial:</Text>
            <Text style={styles.infoValue}>{carga.lecturaInicial.toLocaleString()} L</Text>
          </View>
        )}
        {carga.lecturaFinal && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lectura final:</Text>
            <Text style={styles.infoValue}>{carga.lecturaFinal.toLocaleString()} L</Text>
          </View>
        )}
        {carga.litrosCargados !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total calculado:</Text>
            <Text style={[styles.infoValue, styles.infoValueHighlight]}>
              {carga.litrosCargados?.toLocaleString()} L
            </Text>
          </View>
        )}
      </View>

      {/* Botones */}
      <View style={styles.footer}>
        {estado === 'esperando' && (
          <TouchableOpacity style={styles.startButton} onPress={iniciarCarga}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Iniciar Carga</Text>
          </TouchableOpacity>
        )}

        {estado === 'cargando' && (
          <TouchableOpacity style={styles.stopButton} onPress={finalizarManualmente}>
            <Ionicons name="stop" size={24} color="#fff" />
            <Text style={styles.stopButtonText}>Finalizar Manualmente</Text>
          </TouchableOpacity>
        )}

        {estado === 'finalizado' && (
          <TouchableOpacity style={styles.continueButton} onPress={continuar}>
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Advertencia de no salir */}
      {estado === 'cargando' && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.warningText}>
            No salgas de esta pantalla durante la carga
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
  header: {
    backgroundColor: '#6b7280',
    padding: 24,
    alignItems: 'center',
  },
  headerCargando: {
    backgroundColor: '#0ea5e9',
  },
  estadoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  displayContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  litrosLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  litrosValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  litrosUnit: {
    fontSize: 24,
    color: '#6b7280',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    color: '#6b7280',
  },
  infoValue: {
    fontWeight: '600',
    color: '#111827',
  },
  infoValueHighlight: {
    color: '#0ea5e9',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  startButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  warningBanner: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: '#fef3c7',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    color: '#92400e',
    flex: 1,
  },
});
