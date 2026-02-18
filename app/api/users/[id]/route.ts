
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();

        // Prevent modification of other fields if strictly needed, 
        // but for now we trust admin to send correct payload or filtered payload
        // Ideally we should valid 'is_active' specifically if that's the only goal.

        const updateData: any = {};
        if (typeof body.is_active === 'boolean') {
            updateData.is_active = body.is_active;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: "No valid fields to update" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "User updated successfully", data: user }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
