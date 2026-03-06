import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bid from '@/models/Bid';
import User from '@/models/User';
import Game from '@/models/Game';
import Transaction from '@/models/Transaction';
import { getISTDate, getISTDateString } from '@/lib/market';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.id;

        const { game_id, bid_type, digit, points, session, game_type } = await req.json();

        if (!game_id || !bid_type || !digit || points === undefined || !session) {
            console.log("Missing fields:", { game_id, bid_type, digit, points, session });
            return NextResponse.json({ success: false, msg: 'Missing required fields' }, { status: 400 });
        }

        // Check game existence and time constraints
        const game = await Game.findById(game_id);
        if (!game) {
            return NextResponse.json({ success: false, msg: 'Game not found' }, { status: 404 });
        }
        if (!game.is_active) {
            return NextResponse.json({ success: false, msg: 'Game is currently inactive' }, { status: 400 });
        }

        // Time-based betting restriction
        const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const now = getISTDate();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const openTimeVal = parseTime(game.open_time);
        const closeTimeVal = parseTime(game.close_time);

        if (session === 'open' && currentTime >= openTimeVal) {
            return NextResponse.json({ success: false, msg: `Betting closed for Open session. Market open time was ${game.open_time}` }, { status: 400 });
        }
        if (session === 'close' && currentTime >= closeTimeVal) {
            return NextResponse.json({ success: false, msg: `Betting closed for Close session. Market close time was ${game.close_time}` }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found:", userId);
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        if (user.wallet_balance < points) {
            return NextResponse.json({ success: false, msg: 'Insufficient balance' }, { status: 400 });
        }

        // Deduct balance
        user.wallet_balance -= points;
        await user.save();

        // Create Bid
        const bid = await Bid.create({
            user_id: userId,
            game_id,
            game_type,
            bid_type,
            digit,
            points,
            session,
            date: getISTDateString(),
            status: 'pending'
        });

        // Create Transaction Log
        await Transaction.create({
            user_id: userId,
            amount: points,
            type: 'bid',
            status: 'success',
            description: `Bid placed on ${bid_type} - ${digit}`,
        });

        return NextResponse.json({ success: true, msg: 'Bid placed successfully', balance: user.wallet_balance });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
