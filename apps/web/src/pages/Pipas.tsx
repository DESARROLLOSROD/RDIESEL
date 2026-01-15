import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipasApi, lcqiApi, Pipa } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function PipasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPipa, setEditingPipa] = useState<Pipa | null>(null);

  const { data: pipas, isLoading } = useQuery({
    queryKey: ['pipas'],
    queryFn: pipasApi.getAll,
  });

  const { data: lcqisDisponibles } = useQuery({
    queryKey: ['lcqis', 'disponibles'],
    queryFn: lcqiApi.getDisponibles,
  });

  const createMutation = useMutation({
    mutationFn: pipasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipas'] });
      queryClient.invalidateQueries({ queryKey: ['lcqis'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipa> }) =>
      pipasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipas'] });
      queryClient.invalidateQueries({ queryKey: ['lcqis'] });
      setIsModalOpen(false);
      setEditingPipa(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: pipasApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipas'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      numero: formData.get('numero') as string,
      placa: formData.get('placa') as string,
      capacidad: parseFloat(formData.get('capacidad') as string),
      lcqiId: (formData.get('lcqiId') as string) || undefined,
    };

    if (editingPipa) {
      updateMutation.mutate({ id: editingPipa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditModal = (pipa: Pipa) => {
    setEditingPipa(pipa);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPipa(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administracion de pipas de la empresa
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Pipa
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Numero
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Placa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Capacidad (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                LCQI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pipas?.map((pipa) => (
              <tr key={pipa.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {pipa.numero}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {pipa.placa}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {pipa.capacidad.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {pipa.lcqi?.numeroSerie || '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      pipa.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pipa.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => openEditModal(pipa)}
                    className="mr-2 text-primary-600 hover:text-primary-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Desactivar esta pipa?')) {
                        deleteMutation.mutate(pipa.id);
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingPipa ? 'Editar Pipa' : 'Nueva Pipa'}
              </h2>
              <button onClick={closeModal}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Numero
                </label>
                <input
                  type="text"
                  name="numero"
                  defaultValue={editingPipa?.numero}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Placa
                </label>
                <input
                  type="text"
                  name="placa"
                  defaultValue={editingPipa?.placa}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacidad (Litros)
                </label>
                <input
                  type="number"
                  name="capacidad"
                  defaultValue={editingPipa?.capacidad}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  LCQI Asignado
                </label>
                <select
                  name="lcqiId"
                  defaultValue={editingPipa?.lcqiId || ''}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Sin asignar</option>
                  {editingPipa?.lcqi && (
                    <option value={editingPipa.lcqi.id}>
                      {editingPipa.lcqi.numeroSerie} (actual)
                    </option>
                  )}
                  {lcqisDisponibles?.map((lcqi) => (
                    <option key={lcqi.id} value={lcqi.id}>
                      {lcqi.numeroSerie}
                    </option>
                  ))}
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
                  {editingPipa ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
