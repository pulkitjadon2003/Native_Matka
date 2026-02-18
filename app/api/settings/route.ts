import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AppSetting from "@/models/AppSetting";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const settings = await AppSetting.findOne({});
        return NextResponse.json({ success: true, data: settings || {} });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        // Verify Admin
        try {
            isAdmin(req); // Or check req user if extracting from middleware
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();

        // Update or Create
        const settings = await AppSetting.findOneAndUpdate({}, body, { new: true, upsert: true });

        return NextResponse.json({ success: true, message: "Settings updated", data: settings }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
