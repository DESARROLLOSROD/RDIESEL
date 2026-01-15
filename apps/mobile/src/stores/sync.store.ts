import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { CargaEnProceso } from './carga.store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface CatalogItem {
  id: string;
  [key: string]: any;
}

interface Catalogo {
  pipas: CatalogItem[];
  lcqis: CatalogItem[];
  clientes: CatalogItem[];
  vehiculos: CatalogItem[];
  configuraciones: Record<string, string>;
  timestamp: string;
}

interface SyncStore {
  db: SQLite.SQLiteDatabase | null;
  catalogo: Catalogo | null;
  pendingCount: number;
  isSyncing: boolean;
  lastSync: string | null;
  initDatabase: () => Promise<void>;
  loadCatalogo: () => Promise<void>;
  syncCatalogo: () => Promise<void>;
  saveCarga: (carga: CargaEnProceso) => Promise<void>;
  getPendingCargas: () => Promise<any[]>;
  syncPendingCargas: () => Promise<void>;
  updatePendingCount: () => Promise<void>;
  getVehiculoByQR: (qrCode: string) => CatalogItem | undefined;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  db: null,
  catalogo: null,
  pendingCount: 0,
  isSyncing: false,
  lastSync: null,

  initDatabase: async () => {
    try {
      const db = await SQLite.openDatabaseAsync('rdiesel.db');

      // Crear tablas
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS catalogo (
          id INTEGER PRIMARY KEY,
          data TEXT NOT NULL,
          timestamp TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cargas_pendientes (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      set({ db });

      // Cargar catálogo local
      await get().loadCatalogo();
      await get().updatePendingCount();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  },

  loadCatalogo: async () => {
    const { db } = get();
    if (!db) return;

    try {
      const result = await db.getFirstAsync<{ data: string; timestamp: string }>(
        'SELECT data, timestamp FROM catalogo ORDER BY id DESC LIMIT 1'
      );

      if (result) {
        const catalogo = JSON.parse(result.data);
        set({ catalogo, lastSync: result.timestamp });
      }
    } catch (error) {
      console.error('Error loading catalogo:', error);
    }
  },

  syncCatalogo: async () => {
    const { db } = get();
    if (!db) return;

    try {
      set({ isSyncing: true });

      const response = await fetch(`${API_URL}/api/sync/catalogo`);
      if (!response.ok) throw new Error('Error fetching catalogo');

      const catalogo = await response.json();

      // Guardar en SQLite
      await db.runAsync(
        'INSERT INTO catalogo (data, timestamp) VALUES (?, ?)',
        JSON.stringify(catalogo),
        catalogo.timestamp
      );

      set({ catalogo, lastSync: catalogo.timestamp });
    } catch (error) {
      console.error('Error syncing catalogo:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  saveCarga: async (carga: CargaEnProceso) => {
    const { db } = get();
    if (!db) throw new Error('Database not initialized');

    try {
      await db.runAsync(
        'INSERT INTO cargas_pendientes (id, data, created_at) VALUES (?, ?, ?)',
        carga.id,
        JSON.stringify(carga),
        new Date().toISOString()
      );

      await get().updatePendingCount();
    } catch (error) {
      console.error('Error saving carga:', error);
      throw error;
    }
  },

  getPendingCargas: async () => {
    const { db } = get();
    if (!db) return [];

    try {
      const results = await db.getAllAsync<{ id: string; data: string; created_at: string }>(
        'SELECT * FROM cargas_pendientes ORDER BY created_at ASC'
      );

      return results.map((r) => ({
        id: r.id,
        ...JSON.parse(r.data),
        createdAt: r.created_at,
      }));
    } catch (error) {
      console.error('Error getting pending cargas:', error);
      return [];
    }
  },

  syncPendingCargas: async () => {
    const { db } = get();
    if (!db) return;

    try {
      set({ isSyncing: true });

      const pendingCargas = await get().getPendingCargas();

      for (const carga of pendingCargas) {
        try {
          // Preparar evidencias en base64
          const evidencias = await Promise.all(
            carga.evidencias.map(async (ev: any) => {
              let base64 = ev.base64;
              if (!base64 && ev.uri) {
                base64 = await FileSystem.readAsStringAsync(ev.uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
              }
              return {
                tipo: ev.tipo,
                base64,
                mimeType: 'image/jpeg',
              };
            })
          );

          const payload = {
            id: carga.id,
            pipaId: carga.pipaId,
            lcqiId: carga.lcqiId,
            vehiculoClienteId: carga.vehiculo?.id,
            lecturaInicial: carga.lecturaInicial,
            lecturaFinal: carga.lecturaFinal,
            litrosCargados: carga.litrosCargados,
            horometroOdometro: carga.horometroOdometro,
            estado: carga.estado,
            observaciones: carga.observaciones,
            deviceId: 'mobile-device', // TODO: Get actual device ID
            fechaInicio: carga.fechaInicio,
            fechaFin: carga.fechaFin,
            evidencias,
            firma: {
              nombreFirmante: carga.firmaNombre,
              base64: carga.firmaBase64,
            },
          };

          const response = await fetch(`${API_URL}/api/sync/cargas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            // Eliminar de pendientes
            await db.runAsync('DELETE FROM cargas_pendientes WHERE id = ?', carga.id);

            // Limpiar archivos locales
            for (const ev of carga.evidencias) {
              if (ev.uri) {
                try {
                  await FileSystem.deleteAsync(ev.uri, { idempotent: true });
                } catch {}
              }
            }
          }
        } catch (error) {
          console.error(`Error syncing carga ${carga.id}:`, error);
        }
      }

      await get().updatePendingCount();
    } catch (error) {
      console.error('Error syncing pending cargas:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  updatePendingCount: async () => {
    const { db } = get();
    if (!db) return;

    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM cargas_pendientes'
      );
      set({ pendingCount: result?.count || 0 });
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  },

  getVehiculoByQR: (qrCode: string) => {
    const { catalogo } = get();
    return catalogo?.vehiculos.find((v) => v.qrCode === qrCode);
  },
}));
