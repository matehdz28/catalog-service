import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    DYNAMODB_ENDPOINT: z.string().url().optional().or(z.literal('')),
    CLIENTS_TABLE: z.string().min(1),
    CLIENT_ADDRESSES_TABLE: z.string().min(1),
    PRODUCTS_TABLE: z.string().min(1),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}
export const env = parsed.data;
