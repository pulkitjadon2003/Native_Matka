import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    await dbConnect();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, msg: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
        }

        if (!user.is_active) {
            return NextResponse.json({ success: false, msg: 'Account is blocked' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                mobile: user.mobile,
                wallet_balance: user.wallet_balance,
                is_active: user.is_active
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, msg: 'Invalid token' }, { status: 401 });
    }
}
