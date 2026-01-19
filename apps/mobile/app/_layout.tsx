import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSyncStore } from '@/stores/sync.store';
import { View } from 'react-native';

// Mantener el splash screen visible mientras cargamos recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const initDatabase = useSyncStore((state) => state.initDatabase);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0ea5e9' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'RDiesel', headerShown: false }}
        />
        <Stack.Screen name="setup" options={{ title: 'Configuracion Inicial', headerShown: false }} />
        <Stack.Screen name="seleccionar-pipa" options={{ title: 'Seleccionar Pipa' }} />
        <Stack.Screen name="carga/scan" options={{ title: 'Escanear QR' }} />
        <Stack.Screen name="carga/vehiculo" options={{ title: 'Datos del Vehiculo' }} />
        <Stack.Screen name="carga/fotos" options={{ title: 'Evidencia Fotografica' }} />
        <Stack.Screen name="carga/bluetooth" options={{ title: 'Conexion LCQI' }} />
        <Stack.Screen name="carga/proceso" options={{ title: 'Carga en Proceso' }} />
        <Stack.Screen name="carga/firma" options={{ title: 'Firma' }} />
        <Stack.Screen name="carga/resumen" options={{ title: 'Resumen' }} />
        <Stack.Screen name="pendientes" options={{ title: 'Pendientes de Sincronizar' }} />
        <Stack.Screen name="configuracion" options={{ title: 'Configuracion' }} />
      </Stack>
    </View>
  );
}
