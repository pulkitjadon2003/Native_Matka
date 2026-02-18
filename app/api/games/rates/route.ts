import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import dbConnect from "@/lib/db";
import AppSetting from "@/models/AppSetting";

const DEFAULT_RATES = [
    { type: "single_digit", name: "Single Digit", rate: "1:10" },
    { type: "jodi_digit", name: "Jodi", rate: "1:90" },
    { type: "single_panna", name: "Single Panna", rate: "1:140" },
    { type: "double_panna", name: "Double Panna", rate: "1:280" },
    { type: "triple_panna", name: "Triple Panna", rate: "1:600" },
    { type: "half_sangam", name: "Half Sangam", rate: "1:1000" },
    { type: "full_sangam", name: "Full Sangam", rate: "1:10000" },
];

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Find existing settings or return defaults if not yet set in DB
        const settings = await AppSetting.findOne({});

        let rates = DEFAULT_RATES;
        if (settings && settings.game_rates && settings.game_rates.length > 0) {
            rates = settings.game_rates;
        }

        return NextResponse.json({ success: true, data: rates });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { rates } = body;

        if (!rates || !Array.isArray(rates)) {
            return NextResponse.json({ success: false, message: "Invalid rates data" }, { status: 400 });
        }

        // Update single AppSetting document
        let settings = await AppSetting.findOne({});
        if (!settings) {
            settings = new AppSetting();
        }

        settings.game_rates = rates;
        await settings.save();

        return NextResponse.json({ success: true, message: "Game rates updated", data: settings.game_rates });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
