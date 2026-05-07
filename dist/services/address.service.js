import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { DynamoRepository } from '../repositories/dynamo.repository.js';
import { AppError } from '../utils/app-error.js';
export class AddressService {
    repository = new DynamoRepository(env.CLIENT_ADDRESSES_TABLE);
    async create(payload) {
        const address = {
            id: uuidv4(),
            ...payload,
        };
        return this.repository.create(address);
    }
    async list() {
        return this.repository.list();
    }
    async getById(id) {
        const address = await this.repository.getById(id);
        if (!address) {
            throw new AppError('Address not found', 404);
        }
        return address;
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
