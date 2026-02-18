import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import { isAdmin } from "@/lib/auth";
import { isMarketOpen } from "@/lib/market";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        // Fetch all games, lean() for better performance and modification
        const games = await Game.find({}).sort({ createdAt: -1 }).lean();

        const enhancedGames = games.map((game: any) => {
            const isOpen = isMarketOpen(game.open_time, game.close_time, game.days_open);
            return {
                ...game,
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
