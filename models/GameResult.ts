import mongoose, { Document, Schema } from 'mongoose';

export interface IGameResult extends Document {
    game_id: mongoose.Types.ObjectId;
    date: string; // "YYYY-MM-DD"
    open_panna: string;
    open_digit: string;
    close_panna: string;
    close_digit: string;
}

const GameResultSchema: Schema = new Schema(
    {
        game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
        date: { type: String, required: true },
        open_panna: { type: String, default: '***' },
        open_digit: { type: String, default: '*' },
        close_panna: { type: String, default: '***' },
        close_digit: { type: String, default: '*' },
    },
    { timestamps: true }
);

// Compound index to ensure one result per game per day
GameResultSchema.index({ game_id: 1, date: 1 }, { unique: true });

export default mongoose.models.GameResult || mongoose.model<IGameResult>('GameResult', GameResultSchema);
