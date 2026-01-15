import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';

export const clienteRouter = Router();

const createClienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  rfc: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
});

const updateClienteSchema = createClienteSchema.partial();

// GET /api/clientes - Listar todos los clientes
clienteRouter.get('/', async (req, res, next) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { _count: { select: { vehiculos: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json(clientes);
  } catch (error) {
    next(error);
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
clienteRouter.get('/:id', async (req, res, next) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id },
      include: { vehiculos: true },
    });

    if (!cliente) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

// POST /api/clientes - Crear cliente
clienteRouter.post('/', async (req, res, next) => {
  try {
    const data = createClienteSchema.parse(req.body);
    const cliente = await prisma.cliente.create({ data });
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
});

// PUT /api/clientes/:id - Actualizar cliente
clienteRouter.put('/:id', async (req, res, next) => {
  try {
    const data = updateClienteSchema.parse(req.body);
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data,
    });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clientes/:id - Desactivar cliente
clienteRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.cliente.update({
      where: { id: req.params.id },
      data: { activo: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
