import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
const controller = new ProductController();
const router = Router();
const productSchema = z.object({
    nombre: z.string().min(1, 'nombre es requerido'),
    unidad_medida: z.string().min(1, 'unidad_medida es requerida'),
    precio_base: z.number().positive('precio_base debe ser mayor a 0'),
});
const productUpdateSchema = productSchema.partial().refine((value) => Object.keys(value).length > 0, 'Debe enviar al menos un campo para actualizar');
router.post('/', validate(productSchema), asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', validate(productUpdateSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));
export { router as productRoutes };
