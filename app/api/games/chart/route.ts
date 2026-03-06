import dbConnect from "@/lib/db";
import GameResult from "@/models/GameResult";
import Game from "@/models/Game";
import { getISTDateString, isTimePassed } from "@/lib/market";
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

        const game = await Game.findById(game_id);
        const today = getISTDateString();

        let processedResults = results;
        if (game) {
            const openPassed = isTimePassed(game.open_time);
            const closePassed = isTimePassed(game.close_time);

            processedResults = results.map(r => {
                if (r.date === today) {
                    return {
                        ...r.toObject(),
                        open_panna: openPassed ? r.open_panna : '***',
                        open_digit: openPassed ? r.open_digit : '*',
                        close_panna: closePassed ? r.close_panna : '***',
                        close_digit: closePassed ? r.close_digit : '*'
                    };
                }
                return r;
            });
        }

        return NextResponse.json({
            success: true,
            data: processedResults
        });
    } catch (error: any) {
        console.error("Fetch Chart Data Error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch chart data" }, { status: 500 });
    }
}
