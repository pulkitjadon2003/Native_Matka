import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import GameResult from "@/models/GameResult";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();

        const games = await Game.find();
        let seeded = 0;

        for (const game of games) {
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const op = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
                const cp = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
                const od = Math.floor(Math.random() * 10).toString();
                const cd = Math.floor(Math.random() * 10).toString();

                await GameResult.findOneAndUpdate(
                    { game_id: game._id, date: dateStr },
                    {
                        open_panna: op,
                        open_digit: od,
                        close_panna: cp,
                        close_digit: cd
                    },
                    { upsert: true, new: true }
                );
                seeded++;
            }
        }

        return NextResponse.json({ success: true, message: `Seeded ${seeded} records.` });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message });
    }
}
