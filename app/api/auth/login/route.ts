import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { mobile, password, is_admin_login } = await req.json();

        if (!mobile || !password) {
            return NextResponse.json(
                { success: false, message: "Missing credentials" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ mobile }).select("+password");
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (is_admin_login && !user.is_admin) {
            return NextResponse.json(
                { success: false, message: "Access denied. Not an admin." },
                { status: 403 }
            );
        }

        const token = jwt.sign(
            { id: user._id, mobile: user.mobile, is_admin: user.is_admin },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    wallet_balance: user.wallet_balance,
                    is_admin: user.is_admin
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
