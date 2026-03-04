import { isAdmin } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        isAdmin(req);

        // Fetch pending deposits with user details populated
        const deposits = await Transaction.find({ type: 'deposit', status: 'pending' })
            .populate({ path: 'user_id', model: User, select: 'name mobile' })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: deposits });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Forbidden: Admin access only" || error.message === "Unauthorized" ? 403 : 500 });
    }
}
