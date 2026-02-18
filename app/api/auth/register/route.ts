import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { name, mobile, password, is_admin } = await req.json();

        if (!name || !mobile || !password) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            mobile,
            password: hashedPassword,
            is_admin: is_admin || false,
            wallet_balance: 0,
            is_active: true,
            is_verified: true, // Auto-verify for now
        });

        return NextResponse.json(
            { success: true, message: "User created successfully", user: { id: user._id, name: user.name, mobile: user.mobile } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
