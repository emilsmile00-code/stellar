// server.js - OGAds Postback Server
const express = require('express');
const app = express();

app.use(express.json());

// OGAds Postback Endpoint
app.get('/api/ogads-postback', (req, res) => {
    console.log('📨 OGAds Postback Received:', req.query);
    
    const { offer_id, amount, transaction_id, user_id, status } = req.query;
    
    // Log the postback data (you'll see this in your server logs)
    console.log('Offer ID:', offer_id);
    console.log('Amount:', amount);
    console.log('Transaction ID:', transaction_id);
    console.log('User ID:', user_id);
    console.log('Status:', status);
    
    // Always return success to OGAds
    res.status(200).send('OK');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Postback server running on port ${PORT}`);
    console.log(`📍 OGAds Postback URL: http://yourdomain.com/api/ogads-postback`);
});