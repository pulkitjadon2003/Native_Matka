import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
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

        const { searchParams } = new URL(req.url);
        const typeFilter = searchParams.get('type');
        const statusFilter = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');

        // Only fetch deposits and withdrawals
        const query: any = {
            type: { $in: ['deposit', 'withdraw'] }
        };

        if (typeFilter) {
            query.type = typeFilter;
        }

        if (statusFilter) {
            query.status = statusFilter;
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user_id', select: 'name mobile' })
            .lean();

        const totalCount = await Transaction.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: transactions,
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
