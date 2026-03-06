import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import Bid from "@/models/Bid";
import User from "@/models/User";
import Game from "@/models/Game"; // Need this registered if path is populated
import { isAdmin } from "@/lib/auth";

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

        // Fetch recent transactions (deposits and withdrawals)
        const recentTransactions = await Transaction.find({
            type: { $in: ['deposit', 'withdraw'] }
        })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate({ path: 'user_id', select: 'name mobile' })
            .lean();

        // Fetch recent bids
        const recentBids = await Bid.find({})
            .sort({ createdAt: -1 })
            .limit(30)
            .populate({ path: 'user_id', select: 'name mobile' })
            .populate({ path: 'game_id', select: 'name' })
            .lean();

        // Normalize data into a single timeline array
        const activityFeed: any[] = [];

        recentTransactions.forEach((t: any) => {
            activityFeed.push({
                _id: t._id,
                type: t.type === 'deposit' ? 'deposit_request' : 'withdrawal_request',
                entity: 'transaction',
                user: t.user_id,
                amount: t.amount,
                status: t.status,
                payment_method: t.payment_method,
                timestamp: t.createdAt
            });
        });

        recentBids.forEach((b: any) => {
            activityFeed.push({
                _id: b._id,
                type: 'bid_placed',
                entity: 'bid',
                user: b.user_id,
                amount: b.points,
                market_name: b.game_id?.name || 'Unknown Market',
                game_type: b.game_type,
                bid_type: b.bid_type,
                digit: b.digit,
                session: b.session,
                status: b.status,
                timestamp: b.createdAt
            });
        });

        // Sort combined feed by timestamp descending
        activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Return top 50 recent events overall
        return NextResponse.json({
            success: true,
            data: activityFeed.slice(0, 50)
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
