import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { pipaRouter } from './routes/pipa.routes.js';
import { lcqiRouter } from './routes/lcqi.routes.js';
import { clienteRouter } from './routes/cliente.routes.js';
import { vehiculoRouter } from './routes/vehiculo.routes.js';
import { cargaRouter } from './routes/carga.routes.js';
import { syncRouter } from './routes/sync.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

console.log('Starting server initialization...');
const app: express.Express = express();
const PORT = Number(process.env.PORT) || 3000;
console.log(`Configured PORT: ${PORT}`);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/pipas', pipaRouter);
app.use('/api/lcqis', lcqiRouter);
app.use('/api/clientes', clienteRouter);
app.use('/api/vehiculos', vehiculoRouter);
app.use('/api/cargas', cargaRouter);
app.use('/api/sync', syncRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

console.log('Attempting to start listener...');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server fully started and listening on 0.0.0.0:${PORT}`);
});

export default app;
