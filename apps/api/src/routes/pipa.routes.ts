import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';

export const pipaRouter = Router();

const createPipaSchema = z.object({
  numero: z.string().min(1, 'Número requerido'),
  placa: z.string().min(1, 'Placa requerida'),
  capacidad: z.number().positive('Capacidad debe ser positiva'),
  lcqiId: z.string().uuid().optional(),
});

const updatePipaSchema = createPipaSchema.partial();

// GET /api/pipas - Listar todas las pipas
pipaRouter.get('/', async (req, res, next) => {
  try {
    const pipas = await prisma.pipa.findMany({
      include: { lcqi: true },
      orderBy: { numero: 'asc' },
    });
    res.json(pipas);
  } catch (error) {
    next(error);
  }
});

// GET /api/pipas/:id - Obtener pipa por ID
pipaRouter.get('/:id', async (req, res, next) => {
  try {
    const pipa = await prisma.pipa.findUnique({
      where: { id: req.params.id },
      include: { lcqi: true, cargas: { take: 10, orderBy: { createdAt: 'desc' } } },
    });

    if (!pipa) {
      throw new AppError(404, 'Pipa no encontrada');
    }

    res.json(pipa);
  } catch (error) {
    next(error);
  }
});

// POST /api/pipas - Crear pipa
pipaRouter.post('/', async (req, res, next) => {
  try {
    const data = createPipaSchema.parse(req.body);
    const pipa = await prisma.pipa.create({
      data,
      include: { lcqi: true },
    });
    res.status(201).json(pipa);
  } catch (error) {
    next(error);
  }
});

// PUT /api/pipas/:id - Actualizar pipa
pipaRouter.put('/:id', async (req, res, next) => {
  try {
    const data = updatePipaSchema.parse(req.body);
    const pipa = await prisma.pipa.update({
      where: { id: req.params.id },
      data,
      include: { lcqi: true },
    });
    res.json(pipa);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/pipas/:id - Desactivar pipa
pipaRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.pipa.update({
      where: { id: req.params.id },
      data: { activo: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
