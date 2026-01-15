import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cargasApi, clientesApi } from '@/lib/api';
import { format } from 'date-fns';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CargasPage() {
  const [filters, setFilters] = useState({
    clienteId: '',
    estado: '',
    desde: '',
    hasta: '',
    page: 1,
    limit: 20,
  });
  const [selectedCargaId, setSelectedCargaId] = useState<string | null>(null);

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesApi.getAll,
  });

  const { data: cargasData, isLoading } = useQuery({
    queryKey: ['cargas', filters],
    queryFn: () =>
      cargasApi.getAll({
        clienteId: filters.clienteId || undefined,
        estado: filters.estado || undefined,
        desde: filters.desde || undefined,
        hasta: filters.hasta || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
  });

  const { data: cargaDetalle } = useQuery({
    queryKey: ['carga', selectedCargaId],
    queryFn: () => cargasApi.getById(selectedCargaId!),
    enabled: !!selectedCargaId,
  });

  const estadoColors = {
    OK: 'bg-green-100 text-green-800',
    OBSERVACION: 'bg-yellow-100 text-yellow-800',
    ANOMALO: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cargas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Historial de cargas de diesel
        </p>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            value={filters.clienteId}
            onChange={(e) =>
              setFilters({ ...filters, clienteId: e.target.value, page: 1 })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Todos</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) =>
              setFilters({ ...filters, estado: e.target.value, page: 1 })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Todos</option>
            <option value="OK">OK</option>
            <option value="OBSERVACION">Observacion</option>
            <option value="ANOMALO">Anomalo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desde
          </label>
          <input
            type="date"
            value={filters.desde}
            onChange={(e) =>
              setFilters({ ...filters, desde: e.target.value, page: 1 })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hasta
          </label>
          <input
            type="date"
            value={filters.hasta}
            onChange={(e) =>
              setFilters({ ...filters, hasta: e.target.value, page: 1 })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vehiculo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Pipa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Litros
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
            {cargasData?.data.map((carga) => (
              <tr key={carga.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {format(new Date(carga.fechaInicio), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {carga.vehiculoCliente?.cliente.nombre}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {carga.vehiculoCliente?.identificador}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {carga.pipa?.numero}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {carga.litrosCargados.toLocaleString()} L
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${estadoColors[carga.estado]}`}
                  >
                    {carga.estado}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button
                    onClick={() => setSelectedCargaId(carga.id)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginacion */}
        {cargasData && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">
                {(filters.page - 1) * filters.limit + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(filters.page * filters.limit, cargasData.pagination.total)}
              </span>{' '}
              de{' '}
              <span className="font-medium">{cargasData.pagination.total}</span>{' '}
              resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= cargasData.pagination.totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      {selectedCargaId && cargaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalle de Carga</h2>
              <button onClick={() => setSelectedCargaId(null)}>
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">
                    {cargaDetalle.vehiculoCliente?.cliente?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehiculo</p>
                  <p className="font-medium">
                    {cargaDetalle.vehiculoCliente?.identificador}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pipa</p>
                  <p className="font-medium">{cargaDetalle.pipa?.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">LCQI</p>
                  <p className="font-medium">{cargaDetalle.lcqi?.numeroSerie}</p>
                </div>
              </div>

              <hr />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Lectura Inicial</p>
                  <p className="font-medium">{cargaDetalle.lecturaInicial} L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lectura Final</p>
                  <p className="font-medium">{cargaDetalle.lecturaFinal} L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Cargado</p>
                  <p className="text-xl font-bold text-primary-600">
                    {cargaDetalle.litrosCargados} L
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {cargaDetalle.vehiculoCliente?.usaHorometro
                      ? 'Horometro'
                      : 'Odometro'}
                  </p>
                  <p className="font-medium">{cargaDetalle.horometroOdometro}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${estadoColors[cargaDetalle.estado]}`}
                  >
                    {cargaDetalle.estado}
                  </span>
                </div>
              </div>

              {cargaDetalle.observaciones && (
                <div>
                  <p className="text-sm text-gray-500">Observaciones</p>
                  <p className="rounded bg-gray-50 p-2">
                    {cargaDetalle.observaciones}
                  </p>
                </div>
              )}

              <hr />

              {/* Evidencias */}
              {cargaDetalle.evidencias && cargaDetalle.evidencias.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Evidencias
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {cargaDetalle.evidencias.map((ev) => (
                      <a
                        key={ev.id}
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded border"
                      >
                        <img
                          src={ev.url}
                          alt={ev.tipo}
                          className="h-24 w-full object-cover"
                        />
                        <p className="bg-gray-50 p-1 text-center text-xs">
                          {ev.tipo}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Firma */}
              {cargaDetalle.firma && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Firma</p>
                  <div className="rounded border p-2">
                    <img
                      src={cargaDetalle.firma.url}
                      alt="Firma"
                      className="mx-auto h-20"
                    />
                    <p className="mt-1 text-center text-sm">
                      {cargaDetalle.firma.nombreFirmante}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
