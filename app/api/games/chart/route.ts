import dbConnect from "@/lib/db";
import GameResult from "@/models/GameResult";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const game_id = searchParams.get('game_id');

        if (!game_id) {
            return NextResponse.json({ success: false, message: "Missing game_id parameter" }, { status: 400 });
        }

        const results = await GameResult.find({ game_id }).sort({ date: -1 });

        return NextResponse.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        console.error("Fetch Chart Data Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch chart data" }, { status: 500 });
    }
}
