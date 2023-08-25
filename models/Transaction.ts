import { Schema, Document, Types } from 'mongoose';

interface Transaction {
    data: Date;
    amount: number;
    transaction_code: string;
    symbol: string;
    price: number;
    total: number;
} 

export interface TransactionDocument extends Document {
    account_id: number;
    bucket_start_data: Date;
    bucket_end_date: Date;
    transaction_count: number;
    transactions: Transaction[];
}

export const transactionSchema = new Schema({
    account_id: Number,
    bucket_start_data: Date,
    bucket_end_date: Date,
    transaction_count: Number,
    transactions: [{
        data: Date,
        amount: Number,
        transaction_code: String,
        symbol: String,
        price: Number,
        total: Number,
    }]
})