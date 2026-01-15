import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';

export const vehiculoRouter = Router();

const createVehiculoSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  identificador: z.string().min(1, 'Identificador requerido'),
  tipo: z.enum(['MAQUINARIA', 'CAMION', 'OTRO']),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  placa: z.string().optional(),
  usaHorometro: z.boolean().default(true),
});

const updateVehiculoSchema = createVehiculoSchema.partial().omit({ clienteId: true });

// GET /api/vehiculos - Listar todos los vehículos
vehiculoRouter.get('/', async (req, res, next) => {
  try {
    const { clienteId } = req.query;

    const vehiculos = await prisma.vehiculoCliente.findMany({
      where: clienteId ? { clienteId: clienteId as string } : undefined,
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { identificador: 'asc' },
    });
    res.json(vehiculos);
  } catch (error) {
    next(error);
  }
});

// GET /api/vehiculos/qr/:qrCode - Obtener vehículo por QR
vehiculoRouter.get('/qr/:qrCode', async (req, res, next) => {
  try {
    const vehiculo = await prisma.vehiculoCliente.findUnique({
      where: { qrCode: req.params.qrCode },
      include: { cliente: { select: { id: true, nombre: true } } },
    });

    if (!vehiculo) {
      throw new AppError(404, 'Vehículo no encontrado');
    }

    if (!vehiculo.activo) {
      throw new AppError(400, 'Vehículo inactivo');
    }

    res.json(vehiculo);
  } catch (error) {
    next(error);
  }
});

// GET /api/vehiculos/:id - Obtener vehículo por ID
vehiculoRouter.get('/:id', async (req, res, next) => {
  try {
    const vehiculo = await prisma.vehiculoCliente.findUnique({
      where: { id: req.params.id },
      include: { cliente: true },
    });

    if (!vehiculo) {
      throw new AppError(404, 'Vehículo no encontrado');
    }

    res.json(vehiculo);
  } catch (error) {
    next(error);
  }
});

// POST /api/vehiculos - Crear vehículo
vehiculoRouter.post('/', async (req, res, next) => {
  try {
    const data = createVehiculoSchema.parse(req.body);

    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: data.clienteId },
    });

    if (!cliente) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    const vehiculo = await prisma.vehiculoCliente.create({
      data,
      include: { cliente: { select: { id: true, nombre: true } } },
    });

    res.status(201).json(vehiculo);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vehiculos/:id - Actualizar vehículo
vehiculoRouter.put('/:id', async (req, res, next) => {
  try {
    const data = updateVehiculoSchema.parse(req.body);
    const vehiculo = await prisma.vehiculoCliente.update({
      where: { id: req.params.id },
      data,
      include: { cliente: { select: { id: true, nombre: true } } },
    });
    res.json(vehiculo);
  } catch (error) {
    next(error);
  }
});

// POST /api/vehiculos/:id/regenerar-qr - Regenerar código QR
vehiculoRouter.post('/:id/regenerar-qr', async (req, res, next) => {
  try {
    const vehiculo = await prisma.vehiculoCliente.update({
      where: { id: req.params.id },
      data: { qrCode: crypto.randomUUID() },
    });
    res.json({ qrCode: vehiculo.qrCode });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vehiculos/:id - Desactivar vehículo
vehiculoRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.vehiculoCliente.update({
      where: { id: req.params.id },
      data: { activo: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
