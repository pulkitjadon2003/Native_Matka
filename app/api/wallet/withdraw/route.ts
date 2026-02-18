import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import AppSetting from '@/models/AppSetting';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.userId;

        const { amount, payment_method } = await req.json();

        if (!amount || !payment_method) {
            return NextResponse.json({ success: false, msg: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        // Check min withdraw limit
        const settings = await AppSetting.findOne();
        const minWithdraw = settings?.min_withdraw || 1000;

        if (amount < minWithdraw) {
            return NextResponse.json({ success: false, msg: `Minimum withdrawal amount is ${minWithdraw}` }, { status: 400 });
        }

        if (user.wallet_balance < amount) {
            return NextResponse.json({ success: false, msg: 'Insufficient wallet balance' }, { status: 400 });
        }

        // Create Withdrawal Request
        // Note: Use a transaction session in production to ensure atomicity
        await Transaction.create({
            user_id: userId,
            amount,
            type: 'withdraw',
            status: 'pending',
            payment_method,
            description: 'Withdrawal Request'
        });

        // Deduct balance immediately or hold it?
        // For now, let's hold it by marking it as pending in transaction.
        // In a real app, you might move it to a 'frozen' balance.
        user.wallet_balance -= amount;
        await user.save();

        return NextResponse.json({ success: true, msg: 'Withdrawal request submitted successfully' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
