import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import GameResult from "@/models/GameResult";
import Bid from "@/models/Bid";
import mongoose from "mongoose";
import { isAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const params = await props.params;
        const { id } = params;

        // Fetch the game details
        const game = await Game.findById(id).lean();
        if (!game) {
            return NextResponse.json({ success: false, message: "Market not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');
        const skip = (page - 1) * limit;

        // Fetch paginated results
        const results = await GameResult.find({ game_id: id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await GameResult.countDocuments({ game_id: id });

        // Calculate bid volume & payout per date for this market
        const dates = results.map(r => r.date);

        const bidStats = await Bid.aggregate([
            {
                $match: {
                    game_id: new mongoose.Types.ObjectId(id),
                    date: { $in: dates }
                }
            },
            {
                $group: {
                    _id: "$date",
                    total_bets: { $sum: 1 },
                    total_amount: { $sum: "$points" },
                    total_payout: { $sum: "$win_amount" }
                }
            }
        ]);

        // Merge stats into results
        const historyData = results.map(result => {
            const stat = bidStats.find(s => s._id === result.date) || {
                total_bets: 0,
                total_amount: 0,
                total_payout: 0
            };
            return {
                ...result,
                stats: stat
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                game,
                history: historyData
            },
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
