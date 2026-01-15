import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Pipa {
  id: string;
  numero: string;
  placa: string;
  capacidad: number;
  activo: boolean;
  lcqiId: string | null;
  lcqi?: LCQI;
  createdAt: string;
  updatedAt: string;
}

export interface LCQI {
  id: string;
  numeroSerie: string;
  macBluetooth: string;
  modelo: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  rfc: string | null;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  vehiculos?: VehiculoCliente[];
  _count?: { vehiculos: number };
  createdAt: string;
  updatedAt: string;
}

export interface VehiculoCliente {
  id: string;
  clienteId: string;
  cliente?: { id: string; nombre: string };
  identificador: string;
  tipo: 'MAQUINARIA' | 'CAMION' | 'OTRO';
  marca: string | null;
  modelo: string | null;
  placa: string | null;
  usaHorometro: boolean;
  qrCode: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Carga {
  id: string;
  pipaId: string;
  pipa?: { id: string; numero: string };
  lcqiId: string;
  lcqi?: { id: string; numeroSerie: string };
  vehiculoClienteId: string;
  vehiculoCliente?: VehiculoCliente & { cliente: { id: string; nombre: string } };
  lecturaInicial: number;
  lecturaFinal: number;
  litrosCargados: number;
  horometroOdometro: number;
  estado: 'OK' | 'OBSERVACION' | 'ANOMALO';
  observaciones: string | null;
  deviceId: string;
  fechaInicio: string;
  fechaFin: string;
  sincronizado: boolean;
  evidencias?: Evidencia[];
  firma?: Firma;
  createdAt: string;
  updatedAt: string;
}

export interface Evidencia {
  id: string;
  cargaId: string;
  tipo: 'VEHICULO' | 'HOROMETRO' | 'LCQI' | 'OTRO';
  url: string;
  createdAt: string;
}

export interface Firma {
  id: string;
  cargaId: string;
  nombreFirmante: string;
  url: string;
  createdAt: string;
}

// API functions
export const pipasApi = {
  getAll: () => api.get<Pipa[]>('/pipas').then((r) => r.data),
  getById: (id: string) => api.get<Pipa>(`/pipas/${id}`).then((r) => r.data),
  create: (data: Partial<Pipa>) => api.post<Pipa>('/pipas', data).then((r) => r.data),
  update: (id: string, data: Partial<Pipa>) =>
    api.put<Pipa>(`/pipas/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/pipas/${id}`),
};

export const lcqiApi = {
  getAll: () => api.get<LCQI[]>('/lcqis').then((r) => r.data),
  getDisponibles: () => api.get<LCQI[]>('/lcqis/disponibles').then((r) => r.data),
  getById: (id: string) => api.get<LCQI>(`/lcqis/${id}`).then((r) => r.data),
  create: (data: Partial<LCQI>) => api.post<LCQI>('/lcqis', data).then((r) => r.data),
  update: (id: string, data: Partial<LCQI>) =>
    api.put<LCQI>(`/lcqis/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/lcqis/${id}`),
};

export const clientesApi = {
  getAll: () => api.get<Cliente[]>('/clientes').then((r) => r.data),
  getById: (id: string) => api.get<Cliente>(`/clientes/${id}`).then((r) => r.data),
  create: (data: Partial<Cliente>) =>
    api.post<Cliente>('/clientes', data).then((r) => r.data),
  update: (id: string, data: Partial<Cliente>) =>
    api.put<Cliente>(`/clientes/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/clientes/${id}`),
};

export const vehiculosApi = {
  getAll: (clienteId?: string) =>
    api
      .get<VehiculoCliente[]>('/vehiculos', { params: { clienteId } })
      .then((r) => r.data),
  getById: (id: string) =>
    api.get<VehiculoCliente>(`/vehiculos/${id}`).then((r) => r.data),
  getByQR: (qrCode: string) =>
    api.get<VehiculoCliente>(`/vehiculos/qr/${qrCode}`).then((r) => r.data),
  create: (data: Partial<VehiculoCliente>) =>
    api.post<VehiculoCliente>('/vehiculos', data).then((r) => r.data),
  update: (id: string, data: Partial<VehiculoCliente>) =>
    api.put<VehiculoCliente>(`/vehiculos/${id}`, data).then((r) => r.data),
  regenerarQR: (id: string) =>
    api.post<{ qrCode: string }>(`/vehiculos/${id}/regenerar-qr`).then((r) => r.data),
  delete: (id: string) => api.delete(`/vehiculos/${id}`),
};

export const cargasApi = {
  getAll: (params?: {
    clienteId?: string;
    vehiculoId?: string;
    pipaId?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    limit?: number;
  }) =>
    api
      .get<{
        data: Carga[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>('/cargas', { params })
      .then((r) => r.data),
  getById: (id: string) => api.get<Carga>(`/cargas/${id}`).then((r) => r.data),
  getResumen: (params?: { desde?: string; hasta?: string; clienteId?: string }) =>
    api
      .get<{
        totalCargas: number;
        litrosTotales: number;
        porEstado: Record<string, number>;
      }>('/cargas/reportes/resumen', { params })
      .then((r) => r.data),
  getPorCliente: (params?: { desde?: string; hasta?: string }) =>
    api
      .get<
        { clienteId: string; clienteNombre: string; totalCargas: number; litrosTotales: number }[]
      >('/cargas/reportes/por-cliente', { params })
      .then((r) => r.data),
};
