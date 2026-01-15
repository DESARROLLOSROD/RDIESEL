import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PipasPage from './pages/Pipas';
import LCQIPage from './pages/LCQI';
import ClientesPage from './pages/Clientes';
import VehiculosPage from './pages/Vehiculos';
import CargasPage from './pages/Cargas';
import ReportesPage from './pages/Reportes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pipas" element={<PipasPage />} />
        <Route path="lcqi" element={<LCQIPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="vehiculos" element={<VehiculosPage />} />
        <Route path="cargas" element={<CargasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
