import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Game from '@/models/Game';
import { isMarketOpen } from '@/lib/market';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const games = await Game.find({ is_active: true }).sort({ open_time: 1 });

        const updatedGames = games.map(game => {
            const isOpen = isMarketOpen(game.open_time, game.close_time, game.days_open);
            return {
                ...game.toObject(),
                is_market_open: isOpen // Add dynamic status based on IST
            };
        });

        return NextResponse.json({ success: true, games: updatedGames });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
