import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bid from "@/models/Bid";
import Game from "@/models/Game";
import { isAdmin } from "@/lib/auth";
import { getISTDateString } from "@/lib/market";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date") || getISTDateString();
        const gameId = searchParams.get("game_id");

        const query: any = { date };
        if (gameId) {
            query.game_id = gameId;
        }

        // Aggregate bids by game, then type, then digit
        const aggregationResult = await Bid.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "games",
                    localField: "game_id",
                    foreignField: "_id",
                    as: "game_info"
                }
            },
            { $unwind: "$game_info" },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },
            {
                $group: {
                    _id: {
                        game_id: "$game_id",
                        game_name: "$game_info.name",
                        bid_type: "$bid_type",
                        digit: "$digit",
                        session: "$session"
                    },
                    total_points: { $sum: "$points" },
                    bids: {
                        $push: {
                            user_id: "$user_id",
                            user_name: "$user_info.name",
                            user_phone: "$user_info.phone",
                            points: "$points",
                            status: "$status",
                            created_at: "$createdAt"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        game_id: "$_id.game_id",
                        game_name: "$_id.game_name"
                    },
                    types: {
                        $push: {
                            bid_type: "$_id.bid_type",
                            digit: "$_id.digit",
                            session: "$_id.session",
                            total_points: "$total_points",
                            bids: "$bids"
                        }
                    },
                    market_total: { $sum: "$total_points" }
                }
            },
            {
                $project: {
                    _id: 0,
                    game_id: "$_id.game_id",
                    game_name: "$_id.game_name",
                    market_total: 1,
                    types: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: aggregationResult
        });
    } catch (error: any) {
        console.error("Betting Status API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
