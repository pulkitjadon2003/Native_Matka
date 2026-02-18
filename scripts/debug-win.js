const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const MOBILE = '9876543210';
const PASSWORD = '123456';

async function main() {
    try {
        // ... Login ...
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            mobile: MOBILE,
            password: PASSWORD,
            is_admin_login: true
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Logged in.');

        // ... Create Market ...
        console.log('Creating Market...');
        const marketRes = await axios.post(`${BASE_URL}/markets`, {
            name: "Debug Win Market " + Date.now(),
            open_time: "10:00 AM",
            close_time: "10:00 PM",
            type: "main",
            days_open: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }, { headers });
        const marketId = marketRes.data.data._id;
        console.log('Market ID:', marketId);

        // ... Place Bid ...
        console.log('Placing Bid...');
        const bidRes = await axios.post(`${BASE_URL}/bids/place`, {
            game_id: marketId,
            bid_type: "single_digit",
            digit: "5",
            points: 100,
            session: "open",
            game_type: "main"
        }, { headers });
        console.log('Bid Placed. Balance:', bidRes.data.balance);

        // ... Declare Result ...
        console.log('Declaring Result...');
        await axios.patch(`${BASE_URL}/markets/${marketId}`, {
            result: {
                open_panna: "122",
                open_digit: "5",
                close_panna: "***",
                close_digit: "*"
            }
        }, { headers });
        console.log('Result Declared.');

        // 5. Check Bid Status
        console.log('Waiting 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('Fetching Bids...');
        const bidsRes = await axios.get(`${BASE_URL}/bids/history`, { headers });
        console.log('Bids Response Keys:', Object.keys(bidsRes.data));
        
        // Handle different response structures
        const bidsData = bidsRes.data.data || bidsRes.data.bids || bidsRes.data;
        if (!Array.isArray(bidsData)) {
            console.error('Unexpected bids response format:', bidsData);
            return;
        }

        const myBid = bidsData.find(b => (b.game_id && b.game_id.toString() === marketId) || (b.game_id && b.game_id._id && b.game_id._id.toString() === marketId));
        
        if (myBid) {
            console.log('Bid Status:', myBid.status);
            console.log('Win Amount:', myBid.win_amount);
        } else {
            console.log('Bid not found in history!');
        }

        // 6. Cleanup
        console.log('Deleting Market...');
        await axios.delete(`${BASE_URL}/markets/${marketId}`, { headers });
        console.log('Done.');

    } catch (e) {
        console.error('Error Details:', e.response ? e.response.data : e.message);
    }
}

main();
