const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hardcoded URI from .env.local for script usage
const MONGODB_URI = "mongodb+srv://ironbeastopop_db_user:nomorepassword@tms.d5n6kxd.mongodb.net/native_matka";

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema(
    {
        mobile: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true, select: false },
        is_admin: { type: Boolean, default: false },
        wallet_balance: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verifyAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        console.log("Checking for admin user...");
        // Check for any admin
        const admin = await User.findOne({ is_admin: true }).select('+password');

        if (admin) {
            console.log(`Admin found: ${admin.mobile}`);
            console.log("Resetting password to '123456'...");
            const hashedPassword = await bcrypt.hash("123456", 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log("Password reset successful. Login with mobile: " + admin.mobile + " and password: 123456");
        } else {
            console.log("No admin found. Creating one...");
            const hashedPassword = await bcrypt.hash("123456", 10);
            const newAdmin = new User({
                mobile: "9876543210",
                name: "Admin",
                password: hashedPassword,
                is_admin: true,
                wallet_balance: 10000
            });
            await newAdmin.save();
            console.log("Admin created via script. Mobile: 9876543210, Password: 123456");
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        mongoose.disconnect();
        process.exit(1);
    }
}

verifyAdmin();
