import dbConnect from "@/lib/db";
import AppSetting from "@/models/AppSetting";
import Bid from "@/models/Bid";
import Game from "@/models/Game";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
// import { isAdmin } from "@/lib/auth"; // Uncomment when auth is ready

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Verify Admin (Placeholder)
        // const adminCheck = await isAdmin(req);
        // if (!adminCheck) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });

        const body = await req.json();
        const { game_id, session, panna, digit } = body;

        // 2. Validate Input
        if (!game_id || !session || !panna || !digit) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const game = await Game.findById(game_id);
        if (!game) return NextResponse.json({ success: false, message: "Game not found" }, { status: 404 });

        // 3. Update Game Result
        if (session === 'open') {
            game.result.open_panna = panna;
            game.result.open_digit = digit;
        } else {
            game.result.close_panna = panna;
            game.result.close_digit = digit;
        }
        await game.save();

        // 4. Fetch Rates
        const settings = await AppSetting.findOne();
        const rates = settings?.game_rates || [];

        const getRate = (type: string) => {
            const r = rates.find((r: any) => r.type === type);
            // Rate format examples: "1:9.5", "1:95"
            if (r && r.rate) {
                const parts = r.rate.split(':');
                if (parts.length === 2) {
                    return parseFloat(parts[1]);
                }
            }
            return 0;
        };

        // 5. Process Bids
        const bids = await Bid.find({
            game_id,
            session,
            status: 'pending'
        });

        let winners = 0;
        let totalPayout = 0;

        for (const bid of bids) {
            let isWin = false;
            let winRate = 0;

            // Winner Logic
            switch (bid.bid_type) {
                case 'single_digit':
                    if (bid.digit === digit) {
                        isWin = true;
                        winRate = getRate('single_digit');
                    }
                    break;
                case 'jodi_digit':
                    // Jodi logic: Open Digit + Close Digit. 
                    // This creates a complexity: Jodi is usually declared only after CLOSE session.
                    // If this API is called for OPEN session, we can't process Jodi yet.
                    // If called for CLOSE session, we need previously declared Open Digit.

                    if (session === 'close') {
                        const openDigit = game.result.open_digit;
                        const resultJodi = `${openDigit}${digit}`;
                        if (bid.digit === resultJodi) {
                            isWin = true;
                            winRate = getRate('jodi_digit');
                        }
                    }
                    break;
                case 'single_panna':
                case 'double_panna':
                case 'triple_panna':
                    if (bid.digit === panna) {
                        isWin = true;
                        winRate = getRate(bid.bid_type);
                    }
                    break;
                // Sangam logic skipped for now to keep it simple, can be added later
            }

            if (isWin && winRate > 0) {
                const winAmount = bid.points * winRate;

                // Update Bid
                bid.status = 'win';
                bid.win_amount = winAmount;
                await bid.save();

                // Update User Wallet
                await User.findByIdAndUpdate(bid.user_id, { $inc: { wallet_balance: winAmount } });

                // Log Transaction
                await Transaction.create({
                    user_id: bid.user_id,
                    amount: winAmount,
                    type: 'win', // Ensure 'win' is a valid enum in Transaction model
                    status: 'success',
                    description: `Win: ${game.name} (${session.toUpperCase()}) - ${bid.bid_type} - ${bid.digit}`,
                    transaction_id: `WIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                });

                winners++;
                totalPayout += winAmount;
            } else if (!isWin) {
                // Only mark as loss if we are sure it's a loss. 
                // For Jodi/Sangam during OPEN session, we should NOT mark as loss yet.
                if (bid.bid_type === 'jodi_digit' && session === 'open') {
                    // Do nothing, wait for close
                } else if (bid.bid_type.includes('sangam') && session === 'open') {
                    // Do nothing
                } else {
                    bid.status = 'loss';
                    await bid.save();
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Result declared successfully",
            data: {
                winners,
                totalPayout,
                game_result: game.result
            }
        });

    } catch (error: any) {
        console.error("Result Declaration Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
