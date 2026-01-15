import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadFile, STORAGE_BUCKETS } from '../lib/supabase.js';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware.js';
import { v4 as uuidv4 } from 'uuid';

export const syncRouter: Router = Router();

// Schema para sincronización de carga desde móvil
const syncCargaSchema = z.object({
  id: z.string().uuid(),
  pipaId: z.string().uuid(),
  lcqiId: z.string().uuid(),
  vehiculoClienteId: z.string().uuid(),
  lecturaInicial: z.number(),
  lecturaFinal: z.number(),
  litrosCargados: z.number(),
  horometroOdometro: z.number(),
  estado: z.enum(['OK', 'OBSERVACION', 'ANOMALO']),
  observaciones: z.string().optional(),
  deviceId: z.string(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  evidencias: z.array(
    z.object({
      tipo: z.enum(['VEHICULO', 'HOROMETRO', 'LCQI', 'OTRO']),
      base64: z.string(),
      mimeType: z.string(),
    })
  ),
  firma: z.object({
    nombreFirmante: z.string(),
    base64: z.string(),
  }),
});

// POST /api/sync/cargas - Sincronizar cargas desde móvil
syncRouter.post('/cargas', async (req, res, next) => {
  try {
    const data = syncCargaSchema.parse(req.body);

    // Verificar que no existe ya esta carga
    const existente = await prisma.carga.findUnique({
      where: { id: data.id },
    });

    if (existente) {
      return res.json({
        success: true,
        message: 'Carga ya sincronizada previamente',
        cargaId: existente.id,
      });
    }

    // Validar relaciones
    const [pipa, lcqi, vehiculo] = await Promise.all([
      prisma.pipa.findUnique({ where: { id: data.pipaId } }),
      prisma.lCQI.findUnique({ where: { id: data.lcqiId } }),
      prisma.vehiculoCliente.findUnique({ where: { id: data.vehiculoClienteId } }),
    ]);

    if (!pipa) throw new AppError(400, 'Pipa no encontrada');
    if (!lcqi) throw new AppError(400, 'LCQI no encontrado');
    if (!vehiculo) throw new AppError(400, 'Vehículo no encontrado');

    // Subir evidencias a Supabase Storage
    const evidenciasUrls: { tipo: string; url: string }[] = [];

    for (const evidencia of data.evidencias) {
      const buffer = Buffer.from(evidencia.base64, 'base64');
      const extension = evidencia.mimeType.split('/')[1] || 'jpg';
      const path = `${data.id}/${uuidv4()}.${extension}`;

      const url = await uploadFile(
        STORAGE_BUCKETS.EVIDENCIAS,
        path,
        buffer,
        evidencia.mimeType
      );

      evidenciasUrls.push({ tipo: evidencia.tipo, url });
    }

    // Subir firma a Supabase Storage
    const firmaBuffer = Buffer.from(data.firma.base64, 'base64');
    const firmaPath = `${data.id}/firma.png`;
    const firmaUrl = await uploadFile(
      STORAGE_BUCKETS.FIRMAS,
      firmaPath,
      firmaBuffer,
      'image/png'
    );

    // Crear la carga con evidencias y firma
    const carga = await prisma.carga.create({
      data: {
        id: data.id,
        pipaId: data.pipaId,
        lcqiId: data.lcqiId,
        vehiculoClienteId: data.vehiculoClienteId,
        lecturaInicial: data.lecturaInicial,
        lecturaFinal: data.lecturaFinal,
        litrosCargados: data.litrosCargados,
        horometroOdometro: data.horometroOdometro,
        estado: data.estado,
        observaciones: data.observaciones,
        deviceId: data.deviceId,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        sincronizado: true,
        fechaSincronizacion: new Date(),
        evidencias: {
          create: evidenciasUrls.map((e) => ({
            tipo: e.tipo as any,
            url: e.url,
          })),
        },
        firma: {
          create: {
            nombreFirmante: data.firma.nombreFirmante,
            url: firmaUrl,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      cargaId: carga.id,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sync/cargas/batch - Sincronizar múltiples cargas
syncRouter.post('/cargas/batch', async (req, res, next) => {
  try {
    const cargas = z.array(syncCargaSchema).parse(req.body);
    const resultados: { id: string; success: boolean; error?: string }[] = [];

    for (const cargaData of cargas) {
      try {
        // Procesar cada carga individualmente
        const existente = await prisma.carga.findUnique({
          where: { id: cargaData.id },
        });

        if (existente) {
          resultados.push({
            id: cargaData.id,
            success: true,
          });
          continue;
        }

        // Subir evidencias
        const evidenciasUrls: { tipo: string; url: string }[] = [];
        for (const evidencia of cargaData.evidencias) {
          const buffer = Buffer.from(evidencia.base64, 'base64');
          const extension = evidencia.mimeType.split('/')[1] || 'jpg';
          const path = `${cargaData.id}/${uuidv4()}.${extension}`;
          const url = await uploadFile(
            STORAGE_BUCKETS.EVIDENCIAS,
            path,
            buffer,
            evidencia.mimeType
          );
          evidenciasUrls.push({ tipo: evidencia.tipo, url });
        }

        // Subir firma
        const firmaBuffer = Buffer.from(cargaData.firma.base64, 'base64');
        const firmaPath = `${cargaData.id}/firma.png`;
        const firmaUrl = await uploadFile(
          STORAGE_BUCKETS.FIRMAS,
          firmaPath,
          firmaBuffer,
          'image/png'
        );

        // Crear carga
        await prisma.carga.create({
          data: {
            id: cargaData.id,
            pipaId: cargaData.pipaId,
            lcqiId: cargaData.lcqiId,
            vehiculoClienteId: cargaData.vehiculoClienteId,
            lecturaInicial: cargaData.lecturaInicial,
            lecturaFinal: cargaData.lecturaFinal,
            litrosCargados: cargaData.litrosCargados,
            horometroOdometro: cargaData.horometroOdometro,
            estado: cargaData.estado,
            observaciones: cargaData.observaciones,
            deviceId: cargaData.deviceId,
            fechaInicio: new Date(cargaData.fechaInicio),
            fechaFin: new Date(cargaData.fechaFin),
            sincronizado: true,
            fechaSincronizacion: new Date(),
            evidencias: {
              create: evidenciasUrls.map((e) => ({
                tipo: e.tipo as any,
                url: e.url,
              })),
            },
            firma: {
              create: {
                nombreFirmante: cargaData.firma.nombreFirmante,
                url: firmaUrl,
              },
            },
          },
        });

        resultados.push({ id: cargaData.id, success: true });
      } catch (error: any) {
        resultados.push({
          id: cargaData.id,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      total: cargas.length,
      exitosos: resultados.filter((r) => r.success).length,
      fallidos: resultados.filter((r) => !r.success).length,
      resultados,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sync/catalogo - Obtener catálogo completo para app móvil
syncRouter.get('/catalogo', async (req, res, next) => {
  try {
    const [pipas, lcqis, clientes, vehiculos, configuraciones] = await Promise.all([
      prisma.pipa.findMany({
        where: { activo: true },
        include: { lcqi: true },
      }),
      prisma.lCQI.findMany({ where: { activo: true } }),
      prisma.cliente.findMany({ where: { activo: true } }),
      prisma.vehiculoCliente.findMany({
        where: { activo: true },
        include: { cliente: { select: { id: true, nombre: true } } },
      }),
      prisma.configuracion.findMany(),
    ]);

    res.json({
      pipas,
      lcqis,
      clientes,
      vehiculos,
      configuraciones: configuraciones.reduce(
        (acc, c) => ({ ...acc, [c.clave]: c.valor }),
        {}
      ),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
