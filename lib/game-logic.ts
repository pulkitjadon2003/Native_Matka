import dbConnect from "@/lib/db";
import Bid from "@/models/Bid";
import AppSetting from "@/models/AppSetting";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

/**
 * Calculates and processes valid bids for a specific game result.
 * @param gameId The ID of the game/market
 * @param result The result object { open_panna, open_digit, close_panna, close_digit }
 * @param session 'open' or 'close' - which session result was just declared
 */
export async function processGameResult(gameId: string, result: any, session: 'open' | 'close') {
    console.log(`Starting processGameResult for game ${gameId}, session ${session}`);
    try {
        await dbConnect();

        // 1. Fetch Rates
        const settings = await AppSetting.findOne({});
        const rates = settings?.game_rates || [];

        const getRate = (type: string) => {
            const rateObj = rates.find((r: any) => r.type === type);
            if (!rateObj) return 10; // Default fallback
            // Rate format "1:10" -> parse 10
            return parseFloat(rateObj.rate.split(':')[1]);
        };

        // 2. Fetch Pending Bids for this Game & Session
        // We only process 'pending' bids.
        const bids = await Bid.find({
            game_id: gameId,
            status: 'pending',
            session: session // Only process bids for the declared session (or relevant ones)
        });

        console.log(`Processing ${bids.length} bids for game ${gameId} session ${session}`);

        const resultsToUpdate = [];

        // 3. Iterate and Check Win/Loss
        for (const bid of bids) {
            let isWin = false;
            let winAmount = 0;
            const rate = getRate(bid.bid_type);

            // --- Logic Board ---
            // Single Digit
            if (bid.bid_type === 'single_digit') {
                const resultDigit = session === 'open' ? result.open_digit : result.close_digit;
                if (resultDigit !== '*' && bid.digit === resultDigit) {
                    isWin = true;
                }
            }

            // Jodi Digit (Requires both Open and Close digits)
            // Jodi bets are usually marked as 'open' session but require full result
            // We might need to check if we are in 'close' session declaration to process Jodi bets
            else if (bid.bid_type === 'jodi_digit') {
                // Jodi requires both open and close digits to be declared.
                // Usually processed when Close result is declared.
                if (result.open_digit !== '*' && result.close_digit !== '*') {
                    const resultJodi = `${result.open_digit}${result.close_digit}`;
                    if (bid.digit === resultJodi) {
                        isWin = true;
                    }
                } else {
                    continue; // Cannot determine yet
                }
            }

            // Single/Double/Triple Panna
            else if (['single_panna', 'double_panna', 'triple_panna'].includes(bid.bid_type)) {
                const resultPanna = session === 'open' ? result.open_panna : result.close_panna;
                if (resultPanna !== '***' && bid.digit === resultPanna) {
                    isWin = true;
                }
            }

            // Half Sangam: 
            // 1. Open Panna + Close Digit
            // 2. Open Digit + Close Panna
            // Needs both results ideally, or structured specific matching. 
            // For simplicity assuming standard format: "123-4" (Panna-Digit) or "1-234" (Digit-Panna)
            // This complexity might be skipped for MVP unless strictly required, but basic matching:
            else if (bid.bid_type === 'half_sangam') {
                if (result.open_panna !== '***' && result.close_digit !== '*' && result.open_digit !== '*' && result.close_panna !== '***') {
                    // Format check logic needed based on how user enters Half Sangam
                    // Assuming bid.digit format is validated elsewhere
                }
            }

            // Full Sangam: Open Panna + Close Panna
            else if (bid.bid_type === 'full_sangam') {
                if (result.open_panna !== '***' && result.close_panna !== '***') {
                    const resultSangam = `${result.open_panna}-${result.close_panna}`; // Example format
                    // Need standardized format for Sangam input
                }
            }

            // --- End Logic ---

            if (isWin) {
                winAmount = bid.points * rate;

                // Update Bid Status
                bid.status = 'win';
                bid.win_amount = winAmount;
                await bid.save();

                // Credit User Wallet
                await User.findByIdAndUpdate(bid.user_id, {
                    $inc: { wallet_balance: winAmount }
                });

                // Create Transaction
                await Transaction.create({
                    user_id: bid.user_id,
                    amount: winAmount,
                    type: 'win',
                    status: 'success',
                    description: `Won bid on ${bid.game_type} (${bid.bid_type}) - Number: ${bid.digit}`,
                    transaction_id: `WIN-${bid._id}`
                });

            } else {
                // If result is fully declared for this bid type and it didn't win
                // Mark as loss. 
                // Note: For Jodi, only mark loss if BOTH results are out.
                const isJodi = bid.bid_type === 'jodi_digit';
                const resultFullyDeclared = isJodi ? (result.open_digit !== '*' && result.close_digit !== '*') : true;

                if (resultFullyDeclared) {
                    bid.status = 'loss';
                    bid.win_amount = 0;
                    await bid.save();
                }
            }
        }
    } catch (error) {
        console.error("Error in processGameResult:", error);
    }
}
