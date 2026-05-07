import express from 'express';
import { addressRoutes } from './routes/address.routes.js';
import { clientRoutes } from './routes/client.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { requestLogger } from './middlewares/request-logger.js';
export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(requestLogger);
    app.get('/health', (_request, response) => {
        response.status(200).json({
            status: 'ok',
            service: 'catalog-service',
            timestamp: new Date().toISOString(),
        });
    });
    app.use('/clients', clientRoutes);
    app.use('/addresses', addressRoutes);
    app.use('/products', productRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
};
