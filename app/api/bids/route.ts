import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Bid from "@/models/Bid";
import Game from "@/models/Game";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Authentication
        const decoded = verifyToken(req);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { game_id, bid_type, digit, points, session, date } = body;

        // 2. Validate Inputs
        if (!game_id || !bid_type || !digit || points <= 0 || !session || !date) {
            return NextResponse.json({ success: false, message: "Invalid input data" }, { status: 400 });
        }

        // 3. Game Validation & Time Check (Do this FIRST to avoid unnecessary DB locks/writes if game is invalid)
        const game = await Game.findById(game_id);
        if (!game) {
            return NextResponse.json({ success: false, message: "Game not found" }, { status: 404 });
        }

        if (!game.is_active) {
            return NextResponse.json({ success: false, message: "Game is currently inactive" }, { status: 400 });
        }

        // Parse Game Times
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

        // Check if betting is allowed for the session
        // Assuming "open" session means betting before Open Result declaration (Open Time)
        // Assuming "close" session means betting before Close Result declaration (Close Time)
        // Note: Usually betting closes 5-10 mins before result, but exact logic can be refined.
        // For now, simple checks:

        if (session === 'open') {
            if (currentTime >= openTimeVal) {
                return NextResponse.json({
                    success: false,
                    message: `Betting closed for Open session. (Closed: ${game.open_time}, Now: ${now.toLocaleTimeString()})`
                }, { status: 400 });
            }
        } else if (session === 'close') {
            if (currentTime >= closeTimeVal) {
                return NextResponse.json({
                    success: false,
                    message: `Betting closed for Close session. (Closed: ${game.close_time}, Now: ${now.toLocaleTimeString()})`
                }, { status: 400 });
            }
        }

        // 4. Atomic Balance Deduction
        const user = await User.findOneAndUpdate(
            { _id: decoded.id, wallet_balance: { $gte: points } },
            { $inc: { wallet_balance: -points } },
            { new: true }
        );

        if (!user) {
            // Check if user exists but just has low balance
            const userExists = await User.exists({ _id: decoded.id });
            if (!userExists) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }
            return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
        }

        // 5. Create Transaction & Bid Records
        const transaction = await Transaction.create({
            user_id: user._id,
            amount: points,
            type: 'bid',
            status: 'success',
            description: `Bid on ${game.name} (${session.toUpperCase()}) - ${bid_type} - ${digit}`,
        });

        const bid = await Bid.create({
            user_id: user._id,
            game_id: game._id,
            game_type: game.type,
            bid_type,
            digit,
            points,
            session,
            status: 'pending',
            date,
        });

        return NextResponse.json({ success: true, message: "Bid placed successfully", data: { bid, wallet_balance: user.wallet_balance } });

    } catch (error: any) {
        console.error("Bid Placement Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
