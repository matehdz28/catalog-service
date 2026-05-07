import { ProductService } from '../services/product.service.js';
import { AppError } from '../utils/app-error.js';
const productService = new ProductService();
const getRequiredId = (request) => {
    const id = request.params.id;
    if (!id) {
        throw new AppError('id param is required', 400);
    }
    return Array.isArray(id) ? id[0] ?? '' : id;
};
export class ProductController {
    async create(request, response) {
        const product = await productService.create(request.body);
        response.status(201).json(product);
    }
    async list(_request, response) {
        const products = await productService.list();
        response.status(200).json(products);
    }
    async getById(request, response) {
        const product = await productService.getById(getRequiredId(request));
        response.status(200).json(product);
    }
    async update(request, response) {
        const product = await productService.update(getRequiredId(request), request.body);
        response.status(200).json(product);
    }
    async delete(request, response) {
        await productService.delete(getRequiredId(request));
        response.status(204).send();
    }
}
