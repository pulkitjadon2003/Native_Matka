import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Game from "@/models/Game";
import { isAdmin } from "@/lib/auth";
import { processGameResult } from "@/lib/game-logic";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { id } = params;

        const game = await Game.findByIdAndUpdate(id, body, { new: true });

        if (!game) {
            return NextResponse.json({ success: false, message: "Market not found" }, { status: 404 });
        }

        // Trigger Result Processing if result fields are present
        if (body.result) {
            console.log("Processing Market Update for:", id, body.result);
            const { open_panna, open_digit, close_panna, close_digit } = body.result;

            // Check if Open Result was declared (simple check: open digit/panna is not default)
            // Ideally we should track what specifically changed, but for now checking existence
            // Process Open Session Bids (Single, Panna)
            if (open_digit !== '*' || open_panna !== '***') {
                console.log("Triggering processGameResult for OPEN session");
                await processGameResult(id, body.result, 'open');
            }

            // Process Close Session Bids (Single, Panna) & Jodi (which needs both)
            // We pass 'close' session, but inside logic we handle Jodi
            if (close_digit !== '*' || close_panna !== '***') {
                await processGameResult(id, body.result, 'close');
                // Also re-run open session to check for Jodi if it wasn't caught? 
                // Actually `processGameResult` finds bids by session. 
                // Jodi bids are usually stored with session='open' (start of game) or 'close'?
                // Standard Matka: Jodi is played before Open. So session='open'?
                // Helper needs to know which bids to check. 

                // Let's call a simplified version that checks 'pending' bids regardless of session
                // or handles specific types.
                // For safety/MVP: checking both sessions when Close is declared might be safer for Jodi.
                await processGameResult(id, body.result, 'open'); // Re-check open for Jodi completion
            }
        }

        return NextResponse.json({ success: true, message: "Market updated", data: game });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        // Verify Admin
        try {
            isAdmin(req);
        } catch (authError) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        const game = await Game.findByIdAndDelete(id);

        if (!game) {
            return NextResponse.json({ success: false, message: "Market not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Market deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
