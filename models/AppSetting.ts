import mongoose, { Document, Schema } from 'mongoose';

export interface IAppSetting extends Document {
    min_deposit: number;
    max_deposit: number;
    min_withdraw: number;
    max_withdraw: number;
    app_link?: string;
    app_name?: string;
    privacy_policy_url?: string;
    terms_conditions_url?: string;
    withdraw_open_time?: string;
    withdraw_close_time?: string;
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
    payment_settings?: {
        upi_id?: string;
        upi_number?: string;
        qr_code?: string;
        bank_details?: {
            bank_name?: string;
            account_number?: string;
            ifsc_code?: string;
            account_holder_name?: string;
        };
    };
}

const AppSettingSchema: Schema = new Schema(
    {
        min_deposit: { type: Number, default: 500 },
        max_deposit: { type: Number, default: 50000 },
        min_withdraw: { type: Number, default: 1000 },
        max_withdraw: { type: Number, default: 50000 },
        app_link: { type: String },
        app_name: { type: String, default: 'Native Matka' },
        privacy_policy_url: { type: String },
        terms_conditions_url: { type: String },
        withdraw_open_time: { type: String, default: '10:00' },
        withdraw_close_time: { type: String, default: '18:00' },
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
        payment_settings: {
            upi_id: { type: String },
            upi_number: { type: String },
            qr_code: { type: String },
            bank_details: {
                bank_name: { type: String },
                account_number: { type: String },
                ifsc_code: { type: String },
                account_holder_name: { type: String },
            }
        },
    },
    { timestamps: true }
);

export default mongoose.models.AppSetting || mongoose.model<IAppSetting>('AppSetting', AppSettingSchema);
