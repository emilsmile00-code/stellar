// ==============================================
// AFFILIATE TRACKING INTEGRATION
// Add this file to your project and include it in your HTML
// ==============================================

// Initialize Supabase client
const SUPABASE_URL = 'https://qpwpvehfriedhafjmzij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwd3B2ZWhmcmllZGhhZmptemlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NTI2ODMsImV4cCI6MjA3NjIyODY4M30.R5ITHyu5OGUE_Jw0zMmLzpL7SjPEvJzwSQamwS2iCow';

// Create Supabase client
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================================
// DEVICE FINGERPRINTING
// ==============================================

async function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();
    
    const data = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        canvasData.substring(0, 50)
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
}

// ==============================================
// GET USER INFORMATION
// ==============================================

async function getUserTrafficData() {
    try {
        // Get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Get geolocation info
        let country = 'Unknown';
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const geoData = await geoResponse.json();
            country = geoData.country_name || 'Unknown';
        } catch (e) {
            console.warn('Could not fetch geo data');
        }
        
        // Device detection
        const ua = navigator.userAgent;
        let device = 'Desktop';
        if (/mobile/i.test(ua)) device = 'Mobile';
        else if (/tablet/i.test(ua)) device = 'Tablet';
        
        const fingerprint = await generateFingerprint();
        
        return {
            ip_address: ipData.ip,
            user_agent: ua,
            country: country,
            device: device,
            fingerprint: fingerprint,
            referrer: document.referrer
        };
    } catch (error) {
        console.error('Error getting traffic data:', error);
        return {
            ip_address: 'Unknown',
            user_agent: navigator.userAgent,
            country: 'Unknown',
            device: 'Unknown',
            fingerprint: await generateFingerprint(),
            referrer: document.referrer
        };
    }
}

// ==============================================
// TRACK CONVERSION
// ==============================================

window.trackConversion = async function(offerData, action = 'click') {
    try {
        console.log(`📊 Tracking ${action}:`, offerData);
        
        // Check if user is logged in
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            console.warn('⚠️ User not logged in - conversion not tracked');
            return null;
        }
        
        // Get traffic data
        const trafficData = await getUserTrafficData();
        
        // Generate unique IDs
        const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const subId = session.user.id;
        
        // Prepare conversion data
        const conversionData = {
            offer_id: offerData.offer_id || offerData.id || 'unknown',
            offer_title: offerData.title || offerData.name || 'Unknown Offer',
            network: offerData.network || 'static',
            category: offerData.category || offerData.type || 'general',
            amount: parseFloat(offerData.reward || offerData.payout || 0),
            click_id: clickId,
            sub_id: subId,
            transaction_id: `txn_${Date.now()}`,
            ...trafficData,
            action: action
        };
        
        console.log('📦 Conversion data:', conversionData);
        
        // Call edge function to track
        const { data, error } = await window.supabaseClient.functions.invoke('track-conversion', {
            body: conversionData
        });
        
        if (error) {
            console.error('❌ Tracking error:', error);
            return null;
        }
        
        console.log('✅ Conversion tracked:', data);
        
        // Return the tracking IDs for use in affiliate links
        return {
            click_id: clickId,
            sub_id: subId,
            conversion_id: data.conversion_id
        };
        
    } catch (error) {
        console.error('❌ Track conversion error:', error);
        return null;
    }
};

// ==============================================
// ENHANCED OFFER CLICK FUNCTIONS
// Replace your existing openOGAdsOffer, openAffiliateOffer, etc.
// ==============================================

// Track and open OGAds offer
window.trackAndOpenOGAdsOffer = async function(offerId, offerLink, offerData) {
    console.log('🔵 Opening OGAds offer:', offerId);
    
    // Track the click
    const tracking = await window.trackConversion({
        offer_id: offerId,
        network: 'ogads',
        ...offerData
    }, 'click');
    
    if (tracking) {
        // Replace tracking tokens in URL
        let finalUrl = offerLink;
        if (finalUrl.includes('{aff_sub}')) {
            finalUrl = finalUrl.replace(/{aff_sub}/g, tracking.sub_id);
        }
        if (finalUrl.includes('{aff_click_id}')) {
            finalUrl = finalUrl.replace(/{aff_click_id}/g, tracking.click_id);
        }
        
        console.log('🔗 Opening URL with tracking:', finalUrl);
        window.open(finalUrl, '_blank');
    } else {
        // Fallback - open without tracking
        window.open(offerLink, '_blank');
    }
};

// Track and open CPAlead offer
window.trackAndOpenCPAleadOffer = async function(offerId, offerLink, offerData) {
    console.log('🟣 Opening CPAlead offer:', offerId);
    
    const tracking = await window.trackConversion({
        offer_id: offerId,
        network: 'cpalead',
        ...offerData
    }, 'click');
    
    if (tracking) {
        let finalUrl = offerLink;
        if (finalUrl.includes('{subid}')) {
            finalUrl = finalUrl.replace(/{subid}/g, tracking.sub_id);
        }
        if (finalUrl.includes('{click_id}')) {
            finalUrl = finalUrl.replace(/{click_id}/g, tracking.click_id);
        }
        
        window.open(finalUrl, '_blank');
    } else {
        window.open(offerLink, '_blank');
    }
};

// Track and open affiliate offer (TopOfferzz, etc.)
window.trackAndOpenAffiliateOffer = async function(offerTitle, offerUrl, offerData) {
    console.log('🟡 Opening affiliate offer:', offerTitle);
    
    const tracking = await window.trackConversion({
        offer_id: offerData?.offer_id || offerTitle,
        network: offerData?.network || 'topofferzz',
        title: offerTitle,
        ...offerData
    }, 'click');
    
    if (tracking) {
        let finalUrl = offerUrl;
        // Replace common tracking tokens
        finalUrl = finalUrl.replace(/{replace_it}/g, tracking.click_id);
        finalUrl = finalUrl.replace(/{sub_aff_id}/g, tracking.sub_id);
        finalUrl = finalUrl.replace(/{aff_click_id}/g, tracking.click_id);
        
        window.open(finalUrl, '_blank');
    } else {
        window.open(offerUrl, '_blank');
    }
};

// ==============================================
// PAYOUT REQUEST FUNCTION
// ==============================================

window.requestPayout = async function(amount, payoutMethod, payoutDetails) {
    try {
        console.log('💸 Requesting payout:', amount);
        
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            alert('Please log in to request a payout');
            return;
        }
        
        // Check user balance
        const { data: balance } = await window.supabaseClient
            .from('user_balances')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
        
        if (!balance || parseFloat(balance.available_balance) < amount) {
            alert('Insufficient balance');
            return;
        }
        
        // Create payout request
        const { data, error } = await window.supabaseClient
            .from('payout_requests')
            .insert({
                user_id: session.user.id,
                amount_requested: amount,
                payout_method: payoutMethod,
                payout_details: payoutDetails,
                status: 'pending'
            })
            .select()
            .single();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Payout request created:', data);
        alert('Payout request submitted successfully! It will be reviewed by our team.');
        
        return data;
        
    } catch (error) {
        console.error('❌ Payout request error:', error);
        alert('Error creating payout request. Please try again.');
        return null;
    }
};

// ==============================================
// GET USER STATS
// ==============================================

window.getUserStats = async function() {
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            return null;
        }
        
        // Get balance
        const { data: balance } = await window.supabaseClient
            .from('user_balances')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
        
        // Get conversions
        const { data: conversions } = await window.supabaseClient
            .from('conversions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
        
        // Get payout requests
        const { data: payouts } = await window.supabaseClient
            .from('payout_requests')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
        
        return {
            balance: balance || { available_balance: 0, pending_balance: 0, total_earned: 0 },
            conversions: conversions || [],
            payouts: payouts || []
        };
        
    } catch (error) {
        console.error('Error getting user stats:', error);
        return null;
    }
};

console.log('✅ Tracking system initialized');