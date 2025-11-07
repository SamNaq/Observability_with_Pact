import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal } from './metrics';
import { logger } from './logger';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );
    httpRequestTotal.inc({ method, route, status_code: statusCode });

    // Log request
    logger.info('HTTP Request', {
      method,
      route,
      statusCode,
      duration: `${duration.toFixed(3)}s`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Request Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    route: req.path,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};



