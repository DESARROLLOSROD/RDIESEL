import { useQuery } from '@tanstack/react-query';
import { cargasApi, pipasApi, clientesApi } from '@/lib/api';
import { Fuel, Truck, Users, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data: resumen } = useQuery({
    queryKey: ['cargas', 'resumen'],
    queryFn: () => cargasApi.getResumen(),
  });

  const { data: pipas } = useQuery({
    queryKey: ['pipas'],
    queryFn: pipasApi.getAll,
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesApi.getAll,
  });

  const stats = [
    {
      name: 'Total Cargas',
      value: resumen?.totalCargas || 0,
      icon: Fuel,
      color: 'bg-blue-500',
    },
    {
      name: 'Litros Cargados',
      value: resumen?.litrosTotales?.toLocaleString() || 0,
      icon: Fuel,
      color: 'bg-green-500',
    },
    {
      name: 'Pipas Activas',
      value: Array.isArray(pipas) ? pipas.filter((p) => p.activo).length : 0,
      icon: Truck,
      color: 'bg-purple-500',
    },
    {
      name: 'Clientes',
      value: Array.isArray(clientes) ? clientes.filter((c) => c.activo).length : 0,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Resumen general del sistema de cargas
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado de cargas */}
      {resumen?.porEstado && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Estado de Cargas
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2">
                  <Fuel className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-600">OK</p>
                  <p className="text-xl font-semibold text-green-700">
                    {resumen.porEstado.OK || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-600">Con Observacion</p>
                  <p className="text-xl font-semibold text-yellow-700">
                    {resumen.porEstado.OBSERVACION || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">Anomalas</p>
                  <p className="text-xl font-semibold text-red-700">
                    {resumen.porEstado.ANOMALO || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
