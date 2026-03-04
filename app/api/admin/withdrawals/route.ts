import { isAdmin } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        isAdmin(req);

        const withdrawals = await Transaction.find({ type: 'withdraw', status: 'pending' })
            .populate({ path: 'user_id', model: User, select: 'name mobile payment_methods' })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: withdrawals });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Forbidden: Admin access only" || error.message === "Unauthorized" ? 403 : 500 });
    }
}
