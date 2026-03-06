import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bid from "@/models/Bid";
import Game from "@/models/Game";
import { isAdmin } from "@/lib/auth";
import mongoose from "mongoose";

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

        const { searchParams } = new URL(req.url);
        const dateFilter = searchParams.get('date');
        const marketFilter = searchParams.get('market_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const matchStage: any = {};

        if (dateFilter) {
            matchStage.date = dateFilter;
        }

        if (marketFilter && marketFilter !== 'all') {
            matchStage.game_id = new mongoose.Types.ObjectId(marketFilter);
        }

        const skip = (page - 1) * limit;

        // We want to group by date AND market
        const pipeline: any[] = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: "$date",
                        game_id: "$game_id"
                    },
                    total_bets: { $sum: 1 },
                    total_amount: { $sum: "$points" },
                    total_winning_amount: { $sum: "$win_amount" }
                }
            },
            { $sort: { "_id.date": -1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'games',
                                localField: '_id.game_id',
                                foreignField: '_id',
                                as: 'game'
                            }
                        },
                        { $unwind: "$game" },
                        {
                            $project: {
                                _id: 0,
                                date: "$_id.date",
                                game_id: "$_id.game_id",
                                game_name: "$game.name",
                                total_bets: 1,
                                total_amount: 1,
                                total_winning_amount: 1,
                                profit_loss: { $subtract: ["$total_amount", "$total_winning_amount"] }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await Bid.aggregate(pipeline);

        const data = result[0].data;
        const totalCount = result[0].metadata[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data,
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
