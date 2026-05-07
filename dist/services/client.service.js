import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { DynamoRepository } from '../repositories/dynamo.repository.js';
import { AppError } from '../utils/app-error.js';
export class ClientService {
    repository = new DynamoRepository(env.CLIENTS_TABLE);
    async create(payload) {
        const client = {
            id: uuidv4(),
            ...payload,
        };
        return this.repository.create(client);
    }
    async list() {
        return this.repository.list();
    }
    async getById(id) {
        const client = await this.repository.getById(id);
        if (!client) {
            throw new AppError('Client not found', 404);
        }
        return client;
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
