import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { DynamoRepository } from '../repositories/dynamo.repository.js';
import { AppError } from '../utils/app-error.js';
export class ProductService {
    repository = new DynamoRepository(env.PRODUCTS_TABLE);
    async create(payload) {
        const product = {
            id: uuidv4(),
            ...payload,
        };
        return this.repository.create(product);
    }
    async list() {
        return this.repository.list();
    }
    async getById(id) {
        const product = await this.repository.getById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }
    async update(id, payload) {
        const existing = await this.getById(id);
        const updated = {
            ...existing,
            ...payload,
            id,
        };
        return this.repository.update(id, updated);
    }
    async delete(id) {
        await this.getById(id);
        await this.repository.delete(id);
    }
}
