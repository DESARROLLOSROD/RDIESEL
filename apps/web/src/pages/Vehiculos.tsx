import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculosApi, clientesApi, VehiculoCliente } from '@/lib/api';
import { Plus, Pencil, Trash2, X, QrCode, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';

export default function VehiculosPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const clienteIdFilter = searchParams.get('clienteId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<VehiculoCliente | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoCliente | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const { data: vehiculos, isLoading } = useQuery({
    queryKey: ['vehiculos', clienteIdFilter],
    queryFn: () => vehiculosApi.getAll(clienteIdFilter || undefined),
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: vehiculosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VehiculoCliente> }) =>
      vehiculosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      setIsModalOpen(false);
      setEditingVehiculo(null);
    },
  });

  const regenerarQRMutation = useMutation({
    mutationFn: vehiculosApi.regenerarQR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehiculosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      clienteId: formData.get('clienteId') as string,
      identificador: formData.get('identificador') as string,
      tipo: formData.get('tipo') as 'MAQUINARIA' | 'CAMION' | 'OTRO',
      marca: (formData.get('marca') as string) || undefined,
      modelo: (formData.get('modelo') as string) || undefined,
      placa: (formData.get('placa') as string) || undefined,
      usaHorometro: formData.get('usaHorometro') === 'true',
    };

    if (editingVehiculo) {
      updateMutation.mutate({ id: editingVehiculo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditModal = (vehiculo: VehiculoCliente) => {
    setEditingVehiculo(vehiculo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehiculo(null);
  };

  const showQR = async (vehiculo: VehiculoCliente) => {
    setSelectedVehiculo(vehiculo);
    const dataUrl = await QRCode.toDataURL(vehiculo.qrCode, { width: 300 });
    setQrDataUrl(dataUrl);
    setQrModalOpen(true);
  };

  const downloadQR = () => {
    if (!selectedVehiculo || !qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-${selectedVehiculo.identificador}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehiculos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vehiculos de clientes para carga de diesel
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Vehiculo
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Identificador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Marca/Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Captura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                QR
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {vehiculos?.map((vehiculo) => (
              <tr key={vehiculo.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {vehiculo.identificador}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {vehiculo.cliente?.nombre}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {vehiculo.tipo}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {vehiculo.marca} {vehiculo.modelo}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {vehiculo.usaHorometro ? 'Horometro' : 'Odometro'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => showQR(vehiculo)}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-800"
                  >
                    <QrCode className="h-4 w-4" />
                    Ver QR
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => openEditModal(vehiculo)}
                    className="mr-2 text-primary-600 hover:text-primary-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Desactivar este vehiculo?')) {
                        deleteMutation.mutate(vehiculo.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingVehiculo ? 'Editar Vehiculo' : 'Nuevo Vehiculo'}
              </h2>
              <button onClick={closeModal}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <select
                  name="clienteId"
                  defaultValue={editingVehiculo?.clienteId || clienteIdFilter || ''}
                  required
                  disabled={!!editingVehiculo}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes?.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Identificador
                </label>
                <input
                  type="text"
                  name="identificador"
                  defaultValue={editingVehiculo?.identificador}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue={editingVehiculo?.tipo || 'MAQUINARIA'}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="MAQUINARIA">Maquinaria</option>
                  <option value="CAMION">Camion</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="marca"
                    defaultValue={editingVehiculo?.marca || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    defaultValue={editingVehiculo?.modelo || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Placa
                </label>
                <input
                  type="text"
                  name="placa"
                  defaultValue={editingVehiculo?.placa || ''}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de captura
                </label>
                <select
                  name="usaHorometro"
                  defaultValue={editingVehiculo?.usaHorometro ? 'true' : 'false'}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="true">Horometro</option>
                  <option value="false">Odometro</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  {editingVehiculo ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrModalOpen && selectedVehiculo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Codigo QR</h2>
              <button onClick={() => setQrModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
              <p className="mt-2 text-sm text-gray-600">
                {selectedVehiculo.cliente?.nombre}
              </p>
              <p className="font-medium">{selectedVehiculo.identificador}</p>
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={downloadQR}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Descargar
              </button>
              <button
                onClick={() => {
                  if (confirm('Regenerar el codigo QR? El anterior dejara de funcionar.')) {
                    regenerarQRMutation.mutate(selectedVehiculo.id);
                    setQrModalOpen(false);
                  }
                }}
                className="flex items-center gap-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
