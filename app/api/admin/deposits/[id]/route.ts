import { isAdmin } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        isAdmin(req);

        const { id } = await params;
        const { status, admin_note } = await req.json(); // status can be 'success' or 'rejected'

        if (!['success', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
        }

        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        if (transaction.status !== 'pending') {
            return NextResponse.json({ success: false, message: "Transaction is already processed" }, { status: 400 });
        }

        transaction.status = status;
        if (admin_note) {
            transaction.admin_note = admin_note;
        }

        if (status === 'success') {
            // Apply credit to the user's wallet
            const user = await User.findById(transaction.user_id);
            if (!user) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }
            user.wallet_balance = (user.wallet_balance || 0) + transaction.amount;
            await user.save();
        }

        await transaction.save();

        return NextResponse.json({ success: true, message: `Deposit marked as ${status}`, data: transaction });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.message === "Forbidden: Admin access only" || error.message === "Unauthorized" ? 403 : 500 });
    }
}
