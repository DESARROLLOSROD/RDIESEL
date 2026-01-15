import { create } from 'zustand';
import * as Crypto from 'expo-crypto';

export interface VehiculoLocal {
  id: string;
  clienteId: string;
  clienteNombre: string;
  identificador: string;
  tipo: 'MAQUINARIA' | 'CAMION' | 'OTRO';
  marca?: string;
  modelo?: string;
  usaHorometro: boolean;
  qrCode: string;
}

export interface Evidencia {
  tipo: 'VEHICULO' | 'HOROMETRO' | 'LCQI' | 'OTRO';
  uri: string;
  base64?: string;
}

export interface CargaEnProceso {
  id: string;
  vehiculo: VehiculoLocal | null;
  horometroOdometro: number | null;
  evidencias: Evidencia[];
  lcqiId: string | null;
  lcqiMAC: string | null;
  pipaId: string | null;
  lecturaInicial: number | null;
  lecturaFinal: number | null;
  litrosCargados: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  firmaNombre: string | null;
  firmaBase64: string | null;
  estado: 'OK' | 'OBSERVACION' | 'ANOMALO';
  observaciones: string | null;
}

interface CargaStore {
  carga: CargaEnProceso;
  initCarga: () => void;
  setVehiculo: (vehiculo: VehiculoLocal) => void;
  setHorometroOdometro: (value: number) => void;
  addEvidencia: (evidencia: Evidencia) => void;
  removeEvidencia: (index: number) => void;
  setLCQI: (lcqiId: string, mac: string, pipaId: string) => void;
  setLecturaInicial: (valor: number) => void;
  setLecturaFinal: (valor: number) => void;
  setFirma: (nombre: string, base64: string) => void;
  setEstado: (estado: 'OK' | 'OBSERVACION' | 'ANOMALO', observaciones?: string) => void;
  finalizarCarga: () => void;
  resetCarga: () => void;
}

const initialCarga: CargaEnProceso = {
  id: '',
  vehiculo: null,
  horometroOdometro: null,
  evidencias: [],
  lcqiId: null,
  lcqiMAC: null,
  pipaId: null,
  lecturaInicial: null,
  lecturaFinal: null,
  litrosCargados: null,
  fechaInicio: null,
  fechaFin: null,
  firmaNombre: null,
  firmaBase64: null,
  estado: 'OK',
  observaciones: null,
};

export const useCargaStore = create<CargaStore>((set, get) => ({
  carga: { ...initialCarga },

  initCarga: () => {
    set({
      carga: {
        ...initialCarga,
        id: Crypto.randomUUID(),
      },
    });
  },

  setVehiculo: (vehiculo) => {
    set((state) => ({
      carga: { ...state.carga, vehiculo },
    }));
  },

  setHorometroOdometro: (value) => {
    set((state) => ({
      carga: { ...state.carga, horometroOdometro: value },
    }));
  },

  addEvidencia: (evidencia) => {
    set((state) => ({
      carga: {
        ...state.carga,
        evidencias: [...state.carga.evidencias, evidencia],
      },
    }));
  },

  removeEvidencia: (index) => {
    set((state) => ({
      carga: {
        ...state.carga,
        evidencias: state.carga.evidencias.filter((_, i) => i !== index),
      },
    }));
  },

  setLCQI: (lcqiId, mac, pipaId) => {
    set((state) => ({
      carga: { ...state.carga, lcqiId, lcqiMAC: mac, pipaId },
    }));
  },

  setLecturaInicial: (valor) => {
    set((state) => ({
      carga: {
        ...state.carga,
        lecturaInicial: valor,
        fechaInicio: new Date().toISOString(),
      },
    }));
  },

  setLecturaFinal: (valor) => {
    const { carga } = get();
    const litros = valor - (carga.lecturaInicial || 0);
    set((state) => ({
      carga: {
        ...state.carga,
        lecturaFinal: valor,
        litrosCargados: litros,
        fechaFin: new Date().toISOString(),
      },
    }));
  },

  setFirma: (nombre, base64) => {
    set((state) => ({
      carga: { ...state.carga, firmaNombre: nombre, firmaBase64: base64 },
    }));
  },

  setEstado: (estado, observaciones) => {
    set((state) => ({
      carga: { ...state.carga, estado, observaciones: observaciones || null },
    }));
  },

  finalizarCarga: () => {
    const { carga } = get();
    if (!carga.fechaFin) {
      set((state) => ({
        carga: { ...state.carga, fechaFin: new Date().toISOString() },
      }));
    }
  },

  resetCarga: () => {
    set({ carga: { ...initialCarga } });
  },
}));
