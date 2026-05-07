import { Router } from 'express';
import { z } from 'zod';
import { ClientController } from '../controllers/client.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { validate } from '../middlewares/validate.js';
const controller = new ClientController();
const router = Router();
const clientSchema = z.object({
    razon_social: z.string().min(1, 'razon_social es requerido'),
    nombre_comercial: z.string().default(''),
    rfc: z.string().default(''),
    email: z.string().email().or(z.literal('')).default(''),
    telefono: z.string().default(''),
});
const clientUpdateSchema = clientSchema.partial().refine((value) => Object.keys(value).length > 0, 'Debe enviar al menos un campo para actualizar');
router.post('/', validate(clientSchema), asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', validate(clientUpdateSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));
export { router as clientRoutes };
