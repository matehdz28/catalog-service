import { logger } from '../utils/logger.js';
export const requestLogger = (request, response, next) => {
    const startedAt = Date.now();
    response.on('finish', () => {
        logger.info('HTTP request', {
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
};
