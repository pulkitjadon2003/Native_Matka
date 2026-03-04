import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);

        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(decoded.id).select("-password -pin");

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);

        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, payment_methods } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (payment_methods) updateData.payment_methods = payment_methods;

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updateData },
            { new: true }
        ).select("-password -pin");

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
