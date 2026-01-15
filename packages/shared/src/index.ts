// Tipos compartidos entre API, Web y Mobile

export type TipoVehiculo = 'MAQUINARIA' | 'CAMION' | 'OTRO';
export type EstadoCarga = 'OK' | 'OBSERVACION' | 'ANOMALO';
export type TipoEvidencia = 'VEHICULO' | 'HOROMETRO' | 'LCQI' | 'OTRO';

export interface Pipa {
  id: string;
  numero: string;
  placa: string;
  capacidad: number;
  activo: boolean;
  lcqiId: string | null;
}

export interface LCQI {
  id: string;
  numeroSerie: string;
  macBluetooth: string;
  modelo: string | null;
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  rfc: string | null;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export interface VehiculoCliente {
  id: string;
  clienteId: string;
  identificador: string;
  tipo: TipoVehiculo;
  marca: string | null;
  modelo: string | null;
  placa: string | null;
  usaHorometro: boolean;
  qrCode: string;
  activo: boolean;
}

export interface Carga {
  id: string;
  pipaId: string;
  lcqiId: string;
  vehiculoClienteId: string;
  lecturaInicial: number;
  lecturaFinal: number;
  litrosCargados: number;
  horometroOdometro: number;
  estado: EstadoCarga;
  observaciones: string | null;
  deviceId: string;
  fechaInicio: string;
  fechaFin: string;
  sincronizado: boolean;
}

export interface Evidencia {
  id: string;
  cargaId: string;
  tipo: TipoEvidencia;
  url: string;
}

export interface Firma {
  id: string;
  cargaId: string;
  nombreFirmante: string;
  url: string;
}

// Constantes
export const TOLERANCIA_LITROS_DEFAULT = 5; // Litros de tolerancia por defecto
export const MAX_FOTOS_POR_TIPO = 3;
export const MIN_FOTOS_TOTAL = 1;
