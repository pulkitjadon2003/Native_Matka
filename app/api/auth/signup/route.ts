import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AppSetting from '@/models/AppSetting';
import Transaction from '@/models/Transaction';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { name, mobile, password, pin } = await req.json();

        if (!name || !mobile || !password || !pin) {
            return NextResponse.json({ success: false, msg: 'Please provide all fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return NextResponse.json({ success: false, msg: 'Mobile number already registered' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Get welcome bonus
        const settings = await AppSetting.findOne();
        const welcomeBonus = settings?.welcome_bonus || 0;

        const user = await User.create({
            name,
            mobile,
            password: hashedPassword,
            pin,
            wallet_balance: welcomeBonus,
            is_active: true,
            is_verified: true, // Auto-verify for now, can implement OTP later
        });

        if (welcomeBonus > 0) {
            await Transaction.create({
                user_id: user._id,
                amount: welcomeBonus,
                type: 'bonus',
                status: 'success',
                description: 'Welcome Bonus',
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

        return NextResponse.json({ success: true, msg: 'Registration successful', token, user: { name: user.name, mobile: user.mobile, wallet_balance: user.wallet_balance } });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, msg: 'Internal Server Error' }, { status: 500 });
    }
}
