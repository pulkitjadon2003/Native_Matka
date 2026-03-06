import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Bid from "@/models/Bid";
import Transaction from "@/models/Transaction";
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

        const [totalUsers, activeUsers, totalBets, revenueData] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', is_active: true }),
            Bid.countDocuments(),
            Transaction.aggregate([
                { $match: { type: 'deposit', status: 'approved' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalBets,
                totalRevenue
            }
        });

    } catch (error: any) {
        console.error("Stats Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
