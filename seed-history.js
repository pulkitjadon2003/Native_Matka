import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

// Ensure we connect to MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

// Define Schema manually for script since we can't easily import from nextjs without transpilation issues sometimes
const GameResultSchema = new mongoose.Schema({
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    date: { type: String, required: true },
    open_panna: { type: String, default: '***' },
    open_digit: { type: String, default: '*' },
    close_panna: { type: String, default: '***' },
    close_digit: { type: String, default: '*' },
}, { timestamps: true });

const GameSchema = new mongoose.Schema({
    name: String,
});

const GameResult = mongoose.models.GameResult || mongoose.model('GameResult', GameResultSchema);
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema);

async function seedData() {
    try {
        await mongoose.connect(uri as string);
        console.log("Connected to MongoDB.");

        const games = await Game.find();
        if (games.length === 0) {
            console.log("No games found to seed related data.");
            process.exit(0);
        }

        console.log(`Found ${games.length} games. Seeding last 5 days of data...`);

        // Seed 5 days of history for each game
        for (const game of games) {
            for (let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // Random Pannas and Digits
                const op = `${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}`;
                const cp = `${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}`;
                const od = Math.floor(Math.random()*10).toString();
                const cd = Math.floor(Math.random()*10).toString();

                await GameResult.findOneAndUpdate(
                    { game_id: game._id, date: dateStr },
                    { 
                        open_panna: op, 
                        open_digit: od, 
                        close_panna: cp, 
                        close_digit: cd 
                    },
                    { upsert: true, new: true }
                );
            }
            console.log(`Seeded history for game ${game.name}`);
        }

        console.log("Seeding complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seedData();
