import { ClientService } from '../services/client.service.js';
import { AppError } from '../utils/app-error.js';
const clientService = new ClientService();
const getRequiredId = (request) => {
    const id = request.params.id;
    if (!id) {
        throw new AppError('id param is required', 400);
    }
    return Array.isArray(id) ? id[0] ?? '' : id;
};
export class ClientController {
    async create(request, response) {
        const client = await clientService.create(request.body);
        response.status(201).json(client);
    }
    async list(_request, response) {
        const clients = await clientService.list();
        response.status(200).json(clients);
    }
    async getById(request, response) {
        const client = await clientService.getById(getRequiredId(request));
        response.status(200).json(client);
    }
    async update(request, response) {
        const client = await clientService.update(getRequiredId(request), request.body);
        response.status(200).json(client);
    }
    async delete(request, response) {
        await clientService.delete(getRequiredId(request));
        response.status(204).send();
    }
}
