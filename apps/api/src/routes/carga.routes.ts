import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';

export const cargaRouter = Router();

// GET /api/cargas - Listar cargas con filtros
cargaRouter.get('/', async (req, res, next) => {
  try {
    const {
      clienteId,
      vehiculoId,
      pipaId,
      estado,
      desde,
      hasta,
      page = '1',
      limit = '20',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (clienteId) {
      where.vehiculoCliente = { clienteId: clienteId as string };
    }
    if (vehiculoId) {
      where.vehiculoClienteId = vehiculoId as string;
    }
    if (pipaId) {
      where.pipaId = pipaId as string;
    }
    if (estado) {
      where.estado = estado as string;
    }
    if (desde || hasta) {
      where.fechaInicio = {};
      if (desde) where.fechaInicio.gte = new Date(desde as string);
      if (hasta) where.fechaInicio.lte = new Date(hasta as string);
    }

    const [cargas, total] = await Promise.all([
      prisma.carga.findMany({
        where,
        include: {
          pipa: { select: { id: true, numero: true } },
          vehiculoCliente: {
            select: {
              id: true,
              identificador: true,
              tipo: true,
              cliente: { select: { id: true, nombre: true } },
            },
          },
          lcqi: { select: { id: true, numeroSerie: true } },
          evidencias: true,
          firma: true,
        },
        orderBy: { fechaInicio: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.carga.count({ where }),
    ]);

    res.json({
      data: cargas,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cargas/:id - Obtener carga por ID
cargaRouter.get('/:id', async (req, res, next) => {
  try {
    const carga = await prisma.carga.findUnique({
      where: { id: req.params.id },
      include: {
        pipa: true,
        vehiculoCliente: { include: { cliente: true } },
        lcqi: true,
        evidencias: true,
        firma: true,
      },
    });

    if (!carga) {
      throw new AppError(404, 'Carga no encontrada');
    }

    res.json(carga);
  } catch (error) {
    next(error);
  }
});

// GET /api/cargas/reportes/resumen - Resumen de cargas
cargaRouter.get('/reportes/resumen', async (req, res, next) => {
  try {
    const { desde, hasta, clienteId } = req.query;

    const where: any = {};

    if (clienteId) {
      where.vehiculoCliente = { clienteId: clienteId as string };
    }
    if (desde || hasta) {
      where.fechaInicio = {};
      if (desde) where.fechaInicio.gte = new Date(desde as string);
      if (hasta) where.fechaInicio.lte = new Date(hasta as string);
    }

    const [totalCargas, litrosTotales, estadoCounts] = await Promise.all([
      prisma.carga.count({ where }),
      prisma.carga.aggregate({
        where,
        _sum: { litrosCargados: true },
      }),
      prisma.carga.groupBy({
        by: ['estado'],
        where,
        _count: true,
      }),
    ]);

    res.json({
      totalCargas,
      litrosTotales: litrosTotales._sum.litrosCargados || 0,
      porEstado: estadoCounts.reduce(
        (acc, item) => ({ ...acc, [item.estado]: item._count }),
        {}
      ),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cargas/reportes/por-cliente - Cargas agrupadas por cliente
cargaRouter.get('/reportes/por-cliente', async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;

    const where: any = {};
    if (desde || hasta) {
      where.fechaInicio = {};
      if (desde) where.fechaInicio.gte = new Date(desde as string);
      if (hasta) where.fechaInicio.lte = new Date(hasta as string);
    }

    const cargas = await prisma.carga.findMany({
      where,
      include: {
        vehiculoCliente: {
          include: { cliente: { select: { id: true, nombre: true } } },
        },
      },
    });

    // Agrupar por cliente
    const porCliente = cargas.reduce((acc: any, carga) => {
      const clienteId = carga.vehiculoCliente.cliente.id;
      const clienteNombre = carga.vehiculoCliente.cliente.nombre;

      if (!acc[clienteId]) {
        acc[clienteId] = {
          clienteId,
          clienteNombre,
          totalCargas: 0,
          litrosTotales: 0,
        };
      }

      acc[clienteId].totalCargas++;
      acc[clienteId].litrosTotales += carga.litrosCargados;

      return acc;
    }, {});

    res.json(Object.values(porCliente));
  } catch (error) {
    next(error);
  }
});
