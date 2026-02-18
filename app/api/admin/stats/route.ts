import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Bid from "@/models/Bid";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const totalUsers = await User.countDocuments({ is_admin: false });
        const activeUsers = await User.countDocuments({ is_active: true, is_admin: false });

        // Mocking some financial stats for now as Transaction model isn't fully utilized yet
        const totalBets = await Bid.countDocuments({});
        const totalRevenue = 0; // Replace with actual revenue calc

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
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
