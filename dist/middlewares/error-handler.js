import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';
export const errorHandler = (error, _request, response, _next) => {
    if (error instanceof ZodError) {
        response.status(400).json({
            message: 'Validation error',
            details: error.flatten(),
        });
        return;
    }
    if (error instanceof AppError) {
        response.status(error.statusCode).json({
            message: error.message,
            details: error.details,
        });
        return;
    }
    logger.error('Unhandled error', error);
    response.status(500).json({
        message: 'Internal server error',
    });
};
