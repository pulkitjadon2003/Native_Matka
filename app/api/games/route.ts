import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Game from '@/models/Game';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const games = await Game.find({ is_active: true }).sort({ open_time: 1 });

        // Logic to determine market status (open/close) based on current time
        const currentTime = new Date();
        const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'short' });

        const updatedGames = games.map(game => {
            // Simple time parsing logic (assuming HH:MM AM/PM format)
            // This is a placeholder; needs robust time parsing
            const isOpen = game.days_open.includes(currentDay);
            return {
                ...game.toObject(),
                is_market_open: isOpen // Add dynamic status
            }
        });

        return NextResponse.json({ success: true, games: updatedGames });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
