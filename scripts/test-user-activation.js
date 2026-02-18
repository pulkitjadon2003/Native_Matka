const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const MONGODB_URI = "mongodb+srv://ironbeastopop_db_user:nomorepassword@tms.d5n6kxd.mongodb.net/native_matka";

async function testUserActivation() {
    try {
        console.log("1. Connecting to DB to prepare test data...");
        await mongoose.connect(MONGODB_URI);
        
        // precise definition to avoid issues
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Find Admin
        const admin = await User.findOne({ is_admin: true, mobile: "9876543210" });
        if (!admin) throw new Error("Admin not found. Run verify-admin.js first.");
        
        // Find or Create Test User
        let testUser = await User.findOne({ mobile: "1111111111" });
        if (!testUser) {
            console.log("Creating test user...");
            testUser = await User.create({
                mobile: "1111111111",
                name: "Test User",
                password: "password",
                is_active: true
            });
        }
        console.log(`Test User ID: ${testUser._id}, Current Status: ${testUser.is_active}`);

        console.log("2. Logging in as Admin...");
        // We need to use the real login endpoint
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            mobile: "9876543210",
            password: "123456",
            is_admin_login: true
        });

        const token = loginRes.data.token;
        console.log("Logged in. Token received.");

        console.log("3. Testing Toggle API (Deactivate)...");
        try {
            const toggleRes = await axios.patch(`${BASE_URL}/users/${testUser._id}`, 
                { is_active: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("API Response:", toggleRes.data);
        } catch (e) {
            console.error("API Error:", e.response ? e.response.data : e.message);
        }

        // Verify in DB
        const updatedUser = await User.findById(testUser._id);
        console.log(`Updated User Status in DB: ${updatedUser.is_active}`);

        if (updatedUser.is_active === false) {
            console.log("SUCCESS: User was de-activated.");
        } else {
            console.error("FAILURE: User status did not change.");
        }

         console.log("4. Testing Toggle API (Activate)...");
        try {
            const toggleRes = await axios.patch(`${BASE_URL}/users/${testUser._id}`, 
                { is_active: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
             console.log("API Response:", toggleRes.data);
        } catch (e) {
            console.error("API Error:", e.response ? e.response.data : e.message);
        }
        
         // Verify in DB
        const reUpdatedUser = await User.findById(testUser._id);
        console.log(`Updated User Status in DB: ${reUpdatedUser.is_active}`);
        
         if (reUpdatedUser.is_active === true) {
            console.log("SUCCESS: User was re-activated.");
        } else {
            console.error("FAILURE: User status did not change.");
        }


    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

testUserActivation();
