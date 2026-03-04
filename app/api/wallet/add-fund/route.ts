import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.id || decoded.userId;

        const { amount, payment_method, transaction_id, receipt_img } = await req.json();

        if (!amount || !payment_method || !receipt_img) {
            return NextResponse.json({ success: false, msg: 'Missing required fields (amount, payment_method, receipt_img)' }, { status: 400 });
        }

        // Create Transaction Request
        const transaction = await Transaction.create({
            user_id: userId,
            amount,
            type: 'deposit',
            status: 'pending', // Pending admin approval
            payment_method,
            ...(transaction_id ? { transaction_id } : {}),
            description: 'Fund Request',
            receipt_img
        });

        return NextResponse.json({ success: true, msg: 'Fund request submitted successfully', transaction });

    } catch (error: any) {
        console.error('Add Fund Error:', error);
        return NextResponse.json({ success: false, msg: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
