import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cargasApi } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

export default function ReportesPage() {
  const [dateRange, setDateRange] = useState({
    desde: '',
    hasta: '',
  });

  const { data: resumen } = useQuery({
    queryKey: ['cargas', 'resumen', dateRange],
    queryFn: () =>
      cargasApi.getResumen({
        desde: dateRange.desde || undefined,
        hasta: dateRange.hasta || undefined,
      }),
  });

  const { data: porCliente } = useQuery({
    queryKey: ['cargas', 'por-cliente', dateRange],
    queryFn: () =>
      cargasApi.getPorCliente({
        desde: dateRange.desde || undefined,
        hasta: dateRange.hasta || undefined,
      }),
  });

  const estadoData = resumen?.porEstado
    ? Object.entries(resumen.porEstado).map(([name, value]) => ({
      name,
      value,
    }))
    : [];

  const exportCSV = () => {
    if (!porCliente) return;

    const headers = ['Cliente', 'Total Cargas', 'Litros Totales'];
    const rows = porCliente.map((c) => [
      c.clienteNombre,
      c.totalCargas,
      c.litrosTotales,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-cargas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analisis y estadisticas de cargas
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros de fecha */}
      <div className="mt-6 flex gap-4 rounded-lg bg-white p-4 shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desde
          </label>
          <input
            type="date"
            value={dateRange.desde}
            onChange={(e) =>
              setDateRange({ ...dateRange, desde: e.target.value })
            }
            className="mt-1 rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hasta
          </label>
          <input
            type="date"
            value={dateRange.hasta}
            onChange={(e) =>
              setDateRange({ ...dateRange, hasta: e.target.value })
            }
            className="mt-1 rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Totales */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Resumen General</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-600">Total Cargas</p>
              <p className="text-3xl font-bold text-blue-700">
                {resumen?.totalCargas || 0}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-600">Litros Totales</p>
              <p className="text-3xl font-bold text-green-700">
                {resumen?.litrosTotales?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de cargas (Pie) */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Distribucion por Estado
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {estadoData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cargas por cliente (Bar) */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">
          Litros por Cliente
        </h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={porCliente}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="clienteNombre"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="litrosTotales" fill="#0ea5e9" name="Litros" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Cargas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Litros Totales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Promedio por Carga
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {porCliente?.map((cliente) => (
              <tr key={cliente.clienteId}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {cliente.clienteNombre}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {cliente.totalCargas}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {cliente.litrosTotales.toLocaleString()} L
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {cliente.totalCargas > 0
                    ? Math.round(cliente.litrosTotales / cliente.totalCargas).toLocaleString()
                    : 0}{' '}
                  L
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
