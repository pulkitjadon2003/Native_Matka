import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    mobile: string;
    name: string;
    password?: string; // Optional because it might not be selected by default
    pin?: string;
    wallet_balance: number;
    is_active: boolean;
    is_verified: boolean;
    is_admin: boolean;
    unique_token?: string; // For legacy compatibility/session management
    device_id?: string;
    payment_methods?: {
        upi?: string;
        bank?: {
            account_number: string;
            ifsc: string;
            holder_name: string;
            bank_name: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        mobile: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true, select: false },
        pin: { type: String, select: false },
        wallet_balance: { type: Number, default: 0 },
        is_active: { type: Boolean, default: true },
        is_verified: { type: Boolean, default: false },
        is_admin: { type: Boolean, default: false },
        unique_token: { type: String },
        device_id: { type: String },
        payment_methods: {
            upi: { type: String },
            bank: {
                account_number: { type: String },
                ifsc: { type: String },
                holder_name: { type: String },
                bank_name: { type: String },
            },
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
