import mongoose, { Schema, Document } from 'mongoose';

export interface IAppSetting extends Document {
    min_deposit: number;
    max_deposit: number;
    min_withdraw: number;
    max_withdraw: number;
    app_link?: string;
    contact_details: {
        whatsapp_no?: string;
        mobile_1?: string;
        email_1?: string;
        telegram?: string;
    };
    app_version: string;
    is_maintenance: boolean;
    welcome_bonus: number;
    game_rates: {
        type: string;
        name: string;
        rate: string;
    }[];
}

const AppSettingSchema: Schema = new Schema(
    {
        min_deposit: { type: Number, default: 500 },
        max_deposit: { type: Number, default: 50000 },
        min_withdraw: { type: Number, default: 1000 },
        max_withdraw: { type: Number, default: 50000 },
        app_link: { type: String },
        contact_details: {
            whatsapp_no: { type: String },
            mobile_1: { type: String },
            email_1: { type: String },
            telegram: { type: String },
        },
        app_version: { type: String, default: '1.0.0' },
        is_maintenance: { type: Boolean, default: false },
        welcome_bonus: { type: Number, default: 0 },
        game_rates: [{
            type: { type: String },
            name: { type: String },
            rate: { type: String }
        }],
    },
    { timestamps: true }
);

export default mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);
