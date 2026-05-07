import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDocumentClient } from '../config/aws.js';
export class DynamoRepository {
    tableName;
    constructor(tableName) {
        this.tableName = tableName;
    }
    async create(item) {
        await dynamoDocumentClient.send(new PutCommand({
            TableName: this.tableName,
            Item: item,
        }));
        return item;
    }
    async list() {
        const result = await dynamoDocumentClient.send(new ScanCommand({
            TableName: this.tableName,
        }));
        return result.Items ?? [];
    }
    async getById(id) {
        const result = await dynamoDocumentClient.send(new GetCommand({
            TableName: this.tableName,
            Key: { id },
        }));
        return result.Item ?? null;
    }
    async update(id, item) {
        await dynamoDocumentClient.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                ...item,
                id,
            },
        }));
        return item;
    }
    async delete(id) {
        await dynamoDocumentClient.send(new DeleteCommand({
            TableName: this.tableName,
            Key: { id },
        }));
    }
}
