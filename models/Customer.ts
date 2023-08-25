import { Schema, Document, Types } from 'mongoose';

export interface CustomerDocument extends Document {
    username: string;
    name: string;
    address: string;
    birthday: Date;
    email: string;
    active: boolean;
    accounts: number[];
    tier_and_details: Object[];
}

export const customerSchema = new Schema({
    username: String,
    name: String,
    address: String,
    birthday: Date,
    email: String,
    active: Boolean,
    accounts: [Number],
    tier_and_details: [Object],
})