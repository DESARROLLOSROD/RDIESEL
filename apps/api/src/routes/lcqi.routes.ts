import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';

export const lcqiRouter = Router();

const createLCQISchema = z.object({
  numeroSerie: z.string().min(1, 'Número de serie requerido'),
  macBluetooth: z.string().regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, 'MAC inválida'),
  modelo: z.string().optional(),
});

const updateLCQISchema = createLCQISchema.partial();

// GET /api/lcqis - Listar todos los LCQI
lcqiRouter.get('/', async (req, res, next) => {
  try {
    const lcqis = await prisma.lCQI.findMany({
      include: { pipa: true },
      orderBy: { numeroSerie: 'asc' },
    });
    res.json(lcqis);
  } catch (error) {
    next(error);
  }
});

// GET /api/lcqis/disponibles - Listar LCQI sin pipa asignada
lcqiRouter.get('/disponibles', async (req, res, next) => {
  try {
    const lcqis = await prisma.lCQI.findMany({
      where: { pipa: null, activo: true },
      orderBy: { numeroSerie: 'asc' },
    });
    res.json(lcqis);
  } catch (error) {
    next(error);
  }
});

// GET /api/lcqis/:id - Obtener LCQI por ID
lcqiRouter.get('/:id', async (req, res, next) => {
  try {
    const lcqi = await prisma.lCQI.findUnique({
      where: { id: req.params.id },
      include: { pipa: true },
    });

    if (!lcqi) {
      throw new AppError(404, 'LCQI no encontrado');
    }

    res.json(lcqi);
  } catch (error) {
    next(error);
  }
});

// POST /api/lcqis - Crear LCQI
lcqiRouter.post('/', async (req, res, next) => {
  try {
    const data = createLCQISchema.parse(req.body);
    const lcqi = await prisma.lCQI.create({ data });
    res.status(201).json(lcqi);
  } catch (error) {
    next(error);
  }
});

// PUT /api/lcqis/:id - Actualizar LCQI
lcqiRouter.put('/:id', async (req, res, next) => {
  try {
    const data = updateLCQISchema.parse(req.body);
    const lcqi = await prisma.lCQI.update({
      where: { id: req.params.id },
      data,
    });
    res.json(lcqi);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/lcqis/:id - Desactivar LCQI
lcqiRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.lCQI.update({
      where: { id: req.params.id },
      data: { activo: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
