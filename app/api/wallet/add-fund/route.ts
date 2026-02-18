import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
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

        const { amount, payment_method, transaction_id } = await req.json();

        if (!amount || !payment_method || !transaction_id) {
            return NextResponse.json({ success: false, msg: 'Missing required fields' }, { status: 400 });
        }

        // Create Transaction Request
        const transaction = await Transaction.create({
            user_id: userId,
            amount,
            type: 'deposit',
            status: 'pending', // Pending admin approval
            payment_method,
            transaction_id, // UTR number
            description: 'Fund Request'
        });

        return NextResponse.json({ success: true, msg: 'Fund request submitted successfully', transaction });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
