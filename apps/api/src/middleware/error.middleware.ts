import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Errores de validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
  }

  // Errores personalizados
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Ya existe un registro con esos datos únicos',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro no encontrado',
      });
    }
  }

  // Error genérico
  return res.status(500).json({
    error: 'Error interno del servidor',
  });
}
