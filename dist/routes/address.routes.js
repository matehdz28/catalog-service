import { Router } from 'express';
import { z } from 'zod';
import { AddressController } from '../controllers/address.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
const controller = new AddressController();
const router = Router();
const addressSchema = z.object({
    client_id: z.string().min(1, 'client_id es requerido'),
    domicilio: z.string().min(1, 'domicilio es requerido'),
    colonia: z.string().min(1, 'colonia es requerida'),
    municipio: z.string().min(1, 'municipio es requerido'),
    estado: z.string().min(1, 'estado es requerido'),
    tipo_direccion: z.enum(['FACTURACION', 'ENVIO'], {
        errorMap: () => ({
            message: 'tipo_direccion debe ser FACTURACION o ENVIO',
        }),
    }),
});
const addressUpdateSchema = addressSchema.partial().refine((value) => Object.keys(value).length > 0, 'Debe enviar al menos un campo para actualizar');
router.post('/', validate(addressSchema), asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', validate(addressUpdateSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));
export { router as addressRoutes };
