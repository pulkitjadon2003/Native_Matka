import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    user_id: mongoose.Types.ObjectId;
    amount: number;
    type: 'deposit' | 'withdraw' | 'bonus' | 'bid' | 'win' | 'admin_credit' | 'admin_debit';
    status: 'pending' | 'success' | 'failed' | 'rejected';
    payment_method?: string; // e.g., "UPI", "Bank"
    transaction_id?: string; // External transaction ID (e.g., from UTR)
    admin_note?: string;
    description?: string; // e.g., "Won bid on Main Bazar"
}

const TransactionSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['deposit', 'withdraw', 'bonus', 'bid', 'win', 'admin_credit', 'admin_debit'], required: true },
        status: { type: String, enum: ['pending', 'success', 'failed', 'rejected'], default: 'pending' },
        payment_method: { type: String },
        transaction_id: { type: String },
        admin_note: { type: String },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
