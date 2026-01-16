import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { useSyncStore } from '@/stores/sync.store';

export default function SetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'no-network' | 'syncing' | 'error' | 'ready'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  const catalogo = useSyncStore((state) => state.catalogo);
  const syncCatalogo = useSyncStore((state) => state.syncCatalogo);
  const lastSync = useSyncStore((state) => state.lastSync);

  useEffect(() => {
    checkAndSync();
  }, []);

  const checkAndSync = async () => {
    setStatus('checking');
    setErrorMessage('');

    try {
      // Verificar conectividad
      const networkState = await Network.getNetworkStateAsync();

      if (!networkState.isConnected || !networkState.isInternetReachable) {
        // Sin conexion - verificar si hay catalogo local
        if (catalogo && catalogo.vehiculos.length > 0) {
          setStatus('ready');
        } else {
          setStatus('no-network');
        }
        return;
      }

      // Hay conexion - sincronizar catalogo
      setStatus('syncing');
      await syncCatalogo();
      setStatus('ready');
    } catch (error: any) {
      console.error('Error in setup:', error);
      if (catalogo && catalogo.vehiculos.length > 0) {
        // Hay catalogo local, podemos continuar
        setStatus('ready');
      } else {
        setStatus('error');
        setErrorMessage(error.message || 'Error al sincronizar');
      }
    }
  };

  const handleContinue = () => {
    router.replace('/');
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.statusText}>Verificando conexion...</Text>
          </>
        );

      case 'no-network':
        return (
          <>
            <Ionicons name="cloud-offline" size={80} color="#f59e0b" />
            <Text style={styles.statusTitle}>Sin conexion</Text>
            <Text style={styles.statusText}>
              No hay conexion a internet y no hay datos locales.
              {'\n'}Conecta a internet para descargar el catalogo.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkAndSync}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </>
        );

      case 'syncing':
        return (
          <>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.statusTitle}>Sincronizando</Text>
            <Text style={styles.statusText}>
              Descargando catalogo de vehiculos, pipas y clientes...
            </Text>
          </>
        );

      case 'error':
        return (
          <>
            <Ionicons name="alert-circle" size={80} color="#ef4444" />
            <Text style={styles.statusTitle}>Error</Text>
            <Text style={styles.statusText}>
              {errorMessage || 'No se pudo sincronizar el catalogo'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkAndSync}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </>
        );

      case 'ready':
        return (
          <>
            <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            <Text style={styles.statusTitle}>Listo</Text>
            <Text style={styles.statusText}>
              Catalogo sincronizado correctamente.
              {'\n'}{catalogo?.vehiculos.length || 0} vehiculos disponibles.
            </Text>
            {lastSync && (
              <Text style={styles.syncInfo}>
                Ultima sincronizacion: {new Date(lastSync).toLocaleString()}
              </Text>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>RDiesel</Text>
        <Text style={styles.subtitle}>Sistema de Cargas</Text>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
  },
  header: {
    paddingTop: 80,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2fe',
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  syncInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  version: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
