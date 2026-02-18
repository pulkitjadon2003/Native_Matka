import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
    user_id: mongoose.Types.ObjectId;
    game_id: mongoose.Types.ObjectId;
    game_type: 'main' | 'starline' | 'gali_disawar';
    bid_type: 'single_digit' | 'jodi_digit' | 'single_panna' | 'double_panna' | 'triple_panna' | 'half_sangam' | 'full_sangam';
    digit: string; // The number bet on
    points: number; // Amount bet
    session: 'open' | 'close'; // For main games
    status: 'pending' | 'win' | 'loss' | 'refund';
    win_amount?: number;
    date: string; // YYYY-MM-DD
}

const BidSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        game_id: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
        game_type: { type: String, required: true },
        bid_type: { type: String, required: true },
        digit: { type: String, required: true },
        points: { type: Number, required: true },
        session: { type: String, enum: ['open', 'close'], required: true },
        status: { type: String, enum: ['pending', 'win', 'loss', 'refund'], default: 'pending' },
        win_amount: { type: Number, default: 0 },
        date: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);
