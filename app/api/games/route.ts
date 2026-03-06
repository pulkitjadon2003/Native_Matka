import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Game from '@/models/Game';
import { isMarketOpen, isTimePassed } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const games = await Game.find({ is_active: true }).sort({ open_time: 1 });

        const updatedGames = games.map(game => {
            const isOpen = isMarketOpen(game.start_time, game.close_time, game.days_open);
            const openPassed = isTimePassed(game.open_time);
            const closePassed = isTimePassed(game.close_time);

            const gameObject = game.toObject();
            return {
                ...gameObject,
                result: {
                    open_panna: openPassed ? (gameObject.result?.open_panna || '***') : '***',
                    open_digit: openPassed ? (gameObject.result?.open_digit || '*') : '*',
                    close_panna: closePassed ? (gameObject.result?.close_panna || '***') : '***',
                    close_digit: closePassed ? (gameObject.result?.close_digit || '*') : '*'
                },
                is_market_open: isOpen // Add dynamic status based on IST
            };
        });

        return NextResponse.json({ success: true, games: updatedGames });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
