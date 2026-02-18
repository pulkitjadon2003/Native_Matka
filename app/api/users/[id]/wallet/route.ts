import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { isAdmin } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await dbConnect();

        // Verify Admin Access
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();
        const { amount, type, description } = body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
        }

        if (!['credit', 'debit'].includes(type)) {
            return NextResponse.json({ success: false, message: "Invalid transaction type" }, { status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const numAmount = Number(amount);

        // Calculate new balance
        let newBalance = user.wallet_balance;
        let transactionType = '';

        if (type === 'credit') {
            newBalance += numAmount;
            transactionType = 'admin_credit';
        } else {
            if (user.wallet_balance < numAmount) {
                return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
            }
            newBalance -= numAmount;
            transactionType = 'admin_debit';
        }

        // Update User Wallet
        user.wallet_balance = newBalance;
        await user.save();

        // Create Transaction Record
        const transaction = await Transaction.create({
            user_id: user._id,
            amount: numAmount,
            type: transactionType,
            status: 'success',
            description: description || `Admin ${type} adjustment`,
            admin_note: `Adjusted by admin`,
            transaction_id: `ADM${Date.now()}`
        });

        return NextResponse.json({
            success: true,
            message: "Wallet updated successfully",
            data: {
                new_balance: newBalance,
                transaction
            }
        });

    } catch (error: any) {
        console.error("Wallet Update Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Failed to update wallet" }, { status: 500 });
    }
}
