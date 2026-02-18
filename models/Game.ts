import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
    name: string; // e.g., "Main Bazar", "Kalyan"
    start_time: string; // "09:00 AM" (New)
    open_time: string; // "10:00 AM"
    close_time: string; // "02:00 PM"
    is_active: boolean; // Is the game currently running?
    days_open: string[]; // ["Mon", "Tue", ...]
    type: 'main' | 'starline' | 'gali_disawar'; // To distinguish between game types
    result?: {
        open_panna?: string;
        close_panna?: string;
        open_digit?: string;
        close_digit?: string;
    };
    market_status: 'open' | 'close'; // Automatically calculated based on time
}

const GameSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        start_time: { type: String, default: '12:00 AM' }, // New field
        open_time: { type: String, required: true },
        close_time: { type: String, required: true },
        is_active: { type: Boolean, default: true },
        days_open: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        type: { type: String, enum: ['main', 'starline', 'gali_disawar'], default: 'main' },
        result: {
            open_panna: { type: String, default: '***' },
            close_panna: { type: String, default: '***' },
            open_digit: { type: String, default: '*' },
            close_digit: { type: String, default: '*' },
        },
        market_status: { type: String, enum: ['open', 'close'], default: 'open' },
    },
    { timestamps: true }
);

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
