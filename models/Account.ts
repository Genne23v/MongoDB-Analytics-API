import { Schema, Document } from 'mongoose';

export interface AccountDocument extends Document {
    account_id: number;
    limit: number;
    products: string[];
}

export const accountSchema = new Schema({
    account_id: Number,
    limit: Number,
    products: [String],
})