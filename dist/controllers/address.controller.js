import { AddressService } from '../services/address.service.js';
import { AppError } from '../utils/app-error.js';
const addressService = new AddressService();
const getRequiredId = (request) => {
    const id = request.params.id;
    if (!id) {
        throw new AppError('id param is required', 400);
    }
    return Array.isArray(id) ? id[0] ?? '' : id;
};
export class AddressController {
    async create(request, response) {
        const address = await addressService.create(request.body);
        response.status(201).json(address);
    }
    async list(_request, response) {
        const addresses = await addressService.list();
        response.status(200).json(addresses);
    }
    async getById(request, response) {
        const address = await addressService.getById(getRequiredId(request));
        response.status(200).json(address);
    }
    async update(request, response) {
        const address = await addressService.update(getRequiredId(request), request.body);
        response.status(200).json(address);
    }
    async delete(request, response) {
        await addressService.delete(getRequiredId(request));
        response.status(204).send();
    }
}
