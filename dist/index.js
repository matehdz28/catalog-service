import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
dotenv.config();
const app = express();
app.use(express.json());
const port = Number(process.env.PORT ?? 3001);
const region = process.env.AWS_REGION ?? 'us-east-1';
const dynamoEndpoint = process.env.DYNAMODB_ENDPOINT || undefined;
const clientsTable = process.env.CLIENTS_TABLE ?? 'clients';
const addressesTable = process.env.CLIENT_ADDRESSES_TABLE ?? 'client_addresses';
const productsTable = process.env.PRODUCTS_TABLE ?? 'products';
const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    }
    : undefined;
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({
    region,
    credentials,
    endpoint: dynamoEndpoint,
}), {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});
const clientSchema = z.object({
    razon_social: z.string().min(1, 'razon_social es requerido'),
    nombre_comercial: z.string().default(''),
    rfc: z.string().default(''),
    email: z.string().email().or(z.literal('')).default(''),
    telefono: z.string().default(''),
});
const addressSchema = z.object({
    client_id: z.string().min(1, 'client_id es requerido'),
    domicilio: z.string().min(1, 'domicilio es requerido'),
    colonia: z.string().min(1, 'colonia es requerida'),
    municipio: z.string().min(1, 'municipio es requerido'),
    estado: z.string().min(1, 'estado es requerido'),
    tipo_direccion: z.enum(['FACTURACION', 'ENVIO'], {
        errorMap: () => ({ message: 'tipo_direccion debe ser FACTURACION o ENVIO' }),
    }),
});
const productSchema = z.object({
    nombre: z.string().min(1, 'nombre es requerido'),
    unidad_medida: z.string().min(1, 'unidad_medida es requerida'),
    precio_base: z.number().positive('precio_base debe ser mayor a 0'),
});
const parseUpdateSchema = (schema, body) => {
    return schema
        .partial()
        .refine((value) => Object.keys(value).length > 0, 'Debes enviar al menos un campo')
        .parse(body);
};
const sendError = (response, error) => {
    if (error instanceof z.ZodError) {
        response.status(400).json({
            message: 'Validation error',
            details: error.flatten(),
        });
        return;
    }
    console.error(error);
    response.status(500).json({ message: 'Internal server error' });
};
const getId = (request) => {
    const id = request.params.id;
    return Array.isArray(id) ? id[0] ?? '' : id ?? '';
};
async function listItems(tableName) {
    const result = await dynamo.send(new ScanCommand({ TableName: tableName }));
    return result.Items ?? [];
}
async function getItem(tableName, id) {
    const result = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id } }));
    return result.Item ?? null;
}
async function saveItem(tableName, item) {
    await dynamo.send(new PutCommand({ TableName: tableName, Item: item }));
    return item;
}
async function deleteItem(tableName, id) {
    await dynamo.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
}
app.get('/health', (_request, response) => {
    response.json({
        status: 'ok',
        service: 'catalog-service',
        timestamp: new Date().toISOString(),
    });
});
app.post('/clients', async (request, response) => {
    try {
        const payload = clientSchema.parse(request.body);
        const client = { id: uuidv4(), ...payload };
        response.status(201).json(await saveItem(clientsTable, client));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/clients', async (_request, response) => {
    try {
        response.json(await listItems(clientsTable));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/clients/:id', async (request, response) => {
    try {
        const client = await getItem(clientsTable, getId(request));
        if (!client) {
            response.status(404).json({ message: 'Client not found' });
            return;
        }
        response.json(client);
    }
    catch (error) {
        sendError(response, error);
    }
});
app.put('/clients/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(clientsTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Client not found' });
            return;
        }
        const payload = parseUpdateSchema(clientSchema, request.body);
        response.json(await saveItem(clientsTable, { ...existing, ...payload, id }));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.delete('/clients/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(clientsTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Client not found' });
            return;
        }
        await deleteItem(clientsTable, id);
        response.status(204).send();
    }
    catch (error) {
        sendError(response, error);
    }
});
app.post('/addresses', async (request, response) => {
    try {
        const payload = addressSchema.parse(request.body);
        const address = { id: uuidv4(), ...payload };
        response.status(201).json(await saveItem(addressesTable, address));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/addresses', async (_request, response) => {
    try {
        response.json(await listItems(addressesTable));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/addresses/:id', async (request, response) => {
    try {
        const address = await getItem(addressesTable, getId(request));
        if (!address) {
            response.status(404).json({ message: 'Address not found' });
            return;
        }
        response.json(address);
    }
    catch (error) {
        sendError(response, error);
    }
});
app.put('/addresses/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(addressesTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Address not found' });
            return;
        }
        const payload = parseUpdateSchema(addressSchema, request.body);
        response.json(await saveItem(addressesTable, { ...existing, ...payload, id }));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.delete('/addresses/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(addressesTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Address not found' });
            return;
        }
        await deleteItem(addressesTable, id);
        response.status(204).send();
    }
    catch (error) {
        sendError(response, error);
    }
});
app.post('/products', async (request, response) => {
    try {
        const payload = productSchema.parse(request.body);
        const product = { id: uuidv4(), ...payload };
        response.status(201).json(await saveItem(productsTable, product));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/products', async (_request, response) => {
    try {
        response.json(await listItems(productsTable));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.get('/products/:id', async (request, response) => {
    try {
        const product = await getItem(productsTable, getId(request));
        if (!product) {
            response.status(404).json({ message: 'Product not found' });
            return;
        }
        response.json(product);
    }
    catch (error) {
        sendError(response, error);
    }
});
app.put('/products/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(productsTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Product not found' });
            return;
        }
        const payload = parseUpdateSchema(productSchema, request.body);
        response.json(await saveItem(productsTable, { ...existing, ...payload, id }));
    }
    catch (error) {
        sendError(response, error);
    }
});
app.delete('/products/:id', async (request, response) => {
    try {
        const id = getId(request);
        const existing = await getItem(productsTable, id);
        if (!existing) {
            response.status(404).json({ message: 'Product not found' });
            return;
        }
        await deleteItem(productsTable, id);
        response.status(204).send();
    }
    catch (error) {
        sendError(response, error);
    }
});
app.listen(port, () => {
    console.log(`catalog-service listening on port ${port}`);
});
