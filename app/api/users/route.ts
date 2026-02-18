import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        isAdmin(req); // Enforce Admin Access

        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("query") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const searchCriteria = query
            ? {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { mobile: { $regex: query, $options: "i" } },
                ],
                is_admin: false, // Don't list admins here usually
            }
            : { is_admin: false };

        const users = await User.find(searchCriteria)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-password -pin"); // Exclude sensitive data

        const total = await User.countDocuments(searchCriteria);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("User Fetch API Error:", error);
        const status = error.message === "Unauthorized" ? 401 : error.message.includes("Forbidden") ? 403 : 500;
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch users" },
            { status }
        );
    }
}
