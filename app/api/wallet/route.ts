import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    await dbConnect();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, wallet_balance: user.wallet_balance });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
