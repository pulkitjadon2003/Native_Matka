import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import GameResult from "@/models/GameResult";
import { isAdmin } from "@/lib/auth";
import { isMarketOpen, getISTDateString } from "@/lib/market";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Fetch all games
        const games = await Game.find({}).sort({ createdAt: -1 }).lean();

        // Fetch today's actual results
        const today = getISTDateString();
        const todayResults = await GameResult.find({ date: today }).lean();

        const enhancedGames = games.map((game: any) => {
            const isOpen = isMarketOpen(game.open_time, game.close_time, game.days_open);

            // Daily Reset Logic: Overlay today's result, otherwise reset to empty indicators for a fresh day
            const gameTodayResult = todayResults.find(tr => tr.game_id.toString() === game._id.toString());
            let currentResult = {
                open_panna: '***',
                open_digit: '*',
                close_panna: '***',
                close_digit: '*'
            };

            if (gameTodayResult) {
                currentResult = {
                    open_panna: gameTodayResult.open_panna || '***',
                    open_digit: gameTodayResult.open_digit || '*',
                    close_panna: gameTodayResult.close_panna || '***',
                    close_digit: gameTodayResult.close_digit || '*'
                };
            }

            return {
                ...game,
                result: currentResult,
                is_market_open: isOpen,
                market_status: isOpen ? 'open' : 'close'
            };
        });

        return NextResponse.json({ success: true, data: enhancedGames });
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
        const game = await Game.create(body);

        return NextResponse.json({ success: true, message: "Market created", data: game }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
