import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Bid from "@/models/Bid";
import AppSetting from "@/models/AppSetting";
import User from "@/models/User";
import Game from "@/models/Game";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const { game_id, result } = await req.json();

        if (!game_id || !result) {
            return NextResponse.json({ success: false, message: 'Missing game_id or result' }, { status: 400 });
        }

        const game = await Game.findById(game_id);
        if (!game) {
            return NextResponse.json({ success: false, message: 'Game not found' }, { status: 404 });
        }

        // 1. Fetch Rates
        const settings = await AppSetting.findOne({});
        const rates = settings?.game_rates || [];

        const getRate = (type: string) => {
            const rateObj = rates.find((r: any) => r.type === type);
            if (!rateObj) return 10; // Default fallback
            return parseFloat(rateObj.rate.split(':')[1]);
        };

        // Determine session based on what digits are being declared.
        // If close digit is being provided, we process the 'close' session bids and jodi.
        // If only open digit/panna is provided, we process 'open' session bids.
        const isCloseSession = result.close_digit !== '*' || result.close_panna !== '***';
        const sessionToProcess = isCloseSession ? 'close' : 'open';

        // 2. Fetch Pending Bids for this Game (TODAY ONLY)
        const today = new Date().toISOString().split('T')[0];
        const bids = await Bid.find({
            game_id: game_id,
            status: 'pending',
            date: today // Only consider today's bids
        }).populate({
            path: 'user_id',
            select: 'name mobile',
            model: User
        });

        const winningBids = [];
        let totalPayout = 0;

        // 3. Iterate and Check Win
        for (const bid of bids) {
            let isWin = false;
            let winAmount = 0;
            const rate = getRate(bid.bid_type);
            const user = bid.user_id as any; // Populated user object

            // --- Logic Board (Replicated from game-logic.ts) ---

            if (bid.bid_type === 'single_digit') {
                // If it's a single digit, we need to know if the bid was for 'open' or 'close' session
                // and compare against the provided result.
                const resultDigit = bid.session === 'open' ? result.open_digit : result.close_digit;
                if (resultDigit && resultDigit !== '*' && bid.digit === resultDigit) {
                    isWin = true;
                }
            }
            else if (bid.bid_type === 'jodi_digit') {
                if (result.open_digit !== '*' && result.close_digit !== '*') {
                    const resultJodi = `${result.open_digit}${result.close_digit}`;
                    if (bid.digit === resultJodi) {
                        isWin = true;
                    }
                }
            }
            else if (['single_panna', 'double_panna', 'triple_panna'].includes(bid.bid_type)) {
                const resultPanna = bid.session === 'open' ? result.open_panna : result.close_panna;
                if (resultPanna && resultPanna !== '***' && bid.digit === resultPanna) {
                    isWin = true;
                }
            }
            // Add Half Sangam / Full Sangam logic here if fully supported by frontend later

            if (isWin) {
                winAmount = bid.points * rate;
                totalPayout += winAmount;

                winningBids.push({
                    _id: bid._id,
                    user_name: user?.name || 'Unknown',
                    user_mobile: user?.mobile || 'Unknown',
                    bid_type: bid.bid_type,
                    digit: bid.digit,
                    points: bid.points,
                    win_amount: winAmount,
                    session: bid.session
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                total_winners: winningBids.length,
                total_payout: totalPayout,
                winners: winningBids
            }
        });

    } catch (error: any) {
        console.error("Preview Winners Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
