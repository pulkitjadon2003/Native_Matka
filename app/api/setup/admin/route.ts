import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await dbConnect();

        const adminMobile = "9876543210";
        const existingAdmin = await User.findOne({ mobile: adminMobile });

        if (existingAdmin) {
            // If exists but not admin, promote them? Or just return info.
            if (!existingAdmin.is_admin) {
                existingAdmin.is_admin = true;
                await existingAdmin.save();
                return NextResponse.json({ success: true, message: "User exists, promoted to Admin.", mobile: adminMobile });
            }
            return NextResponse.json({ success: true, message: "Admin already exists.", mobile: adminMobile });
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await User.create({
            name: "Super Admin",
            mobile: adminMobile,
            password: hashedPassword,
            is_admin: true,
            is_active: true,
            is_verified: true,
            wallet_balance: 100000 // Give some balance for testing
        });

        return NextResponse.json({
            success: true,
            message: "Admin created successfully.",
            credentials: {
                mobile: adminMobile,
                password: "admin123"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
