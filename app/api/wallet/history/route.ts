import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const userId = decoded.id;

        const transactions = await Transaction.find({ user_id: userId })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, transactions });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
