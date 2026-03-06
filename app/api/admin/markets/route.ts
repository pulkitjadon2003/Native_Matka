import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import GameResult from "@/models/GameResult";
import { isAdmin } from "@/lib/auth";
import { getISTDateString } from "@/lib/market";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        // Fetch all games
        const games = await Game.find({}).sort({ createdAt: -1 }).lean();

        // Fetch today's actual results
        const today = getISTDateString();
        const todayResults = await GameResult.find({ date: today }).lean();

        const enhancedGames = games.map((game: any) => {
            const gameTodayResult = todayResults.find(tr => tr.game_id.toString() === game._id.toString());

            // For Admin: DO NOT MASK based on time! Show whatever was declared.
            let currentResult = {
                open_panna: gameTodayResult?.open_panna || '***',
                open_digit: gameTodayResult?.open_digit || '*',
                close_panna: gameTodayResult?.close_panna || '***',
                close_digit: gameTodayResult?.close_digit || '*'
            };

            return {
                ...game,
                result: currentResult,
                // Status for admin can just reflect the simple is_active state
                market_status: game.is_active ? 'open' : 'close'
            };
        });

        return NextResponse.json({ success: true, data: enhancedGames });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
