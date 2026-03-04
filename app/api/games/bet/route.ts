import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Bid from "@/models/Bid";
import Game from "@/models/Game";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { game_id, game_type, bid_type, digit, points, session, date } = await req.json();

        if (!game_id || !bid_type || !digit || !points || !session || !date) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // 1. Check User Balance
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (user.wallet_balance < points) {
            return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
        }

        // 2. Check Game Status & Time
        const game = await Game.findById(game_id);
        if (!game) {
            return NextResponse.json({ success: false, message: "Game not found" }, { status: 404 });
        }

        if (!game.is_active) {
            return NextResponse.json({ success: false, message: "Game is closed or inactive" }, { status: 400 });
        }

        // Time-based betting restriction
        const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const openTimeVal = parseTime(game.open_time);
        const closeTimeVal = parseTime(game.close_time);

        if (session === 'open' && currentTime >= openTimeVal) {
            return NextResponse.json({ success: false, message: `Betting closed for Open session. Market open time was ${game.open_time}` }, { status: 400 });
        }
        if (session === 'close' && currentTime >= closeTimeVal) {
            return NextResponse.json({ success: false, message: `Betting closed for Close session. Market close time was ${game.close_time}` }, { status: 400 });
        }

        // 3. Create Bid & Deduct Balance Transaction
        const sessionForTransaction = await mongoose.startSession();
        sessionForTransaction.startTransaction();

        try {
            // Deduct balance
            user.wallet_balance -= points;
            await user.save({ session: sessionForTransaction });

            // Create Bid
            const newBid = await Bid.create([{
                user_id: user._id,
                game_id: game._id,
                game_type, // 'main'
                bid_type,
                digit,
                points,
                session,
                date,
                status: 'pending'
            }], { session: sessionForTransaction });

            await sessionForTransaction.commitTransaction();
            sessionForTransaction.endSession();

            return NextResponse.json({ success: true, message: "Bid placed successfully", data: newBid[0], new_balance: user.wallet_balance }, { status: 201 });

        } catch (txError: any) {
            await sessionForTransaction.abortTransaction();
            sessionForTransaction.endSession();
            throw txError;
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
