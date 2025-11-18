// ======================================
// OGADS API INTEGRATION - NO NOTIFICATION VERSION
// ======================================

// Global variable to store offers
window.ogadsOffers = null;
window.offersLoaded = false;

const OGADS_API_CONFIG = {
    endpoint: 'https://redirectapps.org/api/v2',
    apiKey: '36398|T5sjygpEKgxEC0kVZzYThJCJaWRhDYpl85J1JQY66df32902',
    etype: 12, // PIN + VID offers (4 + 8)
    max: 50
};

// ======================================
// UTILITY FUNCTIONS
// ======================================

// Get visitor IP
async function getVisitorIP() {
    try {
        console.log('🌐 Fetching visitor IP...');
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log('✅ Visitor IP:', data.ip);
        return data.ip;
    } catch (error) {
        console.warn('⚠️ Could not fetch IP, using fallback');
        return '8.8.8.8';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#16162a' : type === 'error' ? '#ff4444' : '#1a1a2e'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        border-left: 4px solid ${type === 'success' ? '#00d4ff' : type === 'error' ? '#ff0000' : '#00d4ff'};
        z-index: 10000;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ======================================
// FETCH OGADS OFFERS
// ======================================

async function fetchOGAdsOffers() {
    console.log('🔄 Fetching OGAds offers...');
    
    try {
        // Get visitor information
        const visitorIP = await getVisitorIP();
        const userAgent = navigator.userAgent;
        
        console.log('🔍 Request Details:');
        console.log('  - API Key:', OGADS_API_CONFIG.apiKey.substring(0, 20) + '...');
        console.log('  - Visitor IP:', visitorIP);
        console.log('  - User Agent:', userAgent.substring(0, 50) + '...');
        
        // Build URL with query parameters
        const params = new URLSearchParams({
            ip: visitorIP,
            user_agent: userAgent,
            etype: OGADS_API_CONFIG.etype.toString(),
            max: OGADS_API_CONFIG.max.toString()
             
        });
        
        const apiUrl = `${OGADS_API_CONFIG.endpoint}?${params}`;
        console.log('🔗 Full API URL:', apiUrl);
        
        // Make API request
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OGADS_API_CONFIG.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        // Parse the response
        if (data.success === true && data.offers && Array.isArray(data.offers) && data.offers.length > 0) {
            console.log('✅ Real offers fetched:', data.offers.length);
            
            // Transform OGAds offers to our format
            const formattedOffers = data.offers.map(offer => ({
                id: offer.id || offer.offer_id,
                name: offer.name || offer.title,
                description: offer.description || offer.desc || 'Complete this offer to earn rewards',
                payout: offer.payout || offer.amount || '0.00',
                type: offer.offer_type || offer.type || 'Offer',
                link: offer.link || offer.url || '#',
                icon: getOfferIcon(offer.offer_type || offer.type),
                duration: estimateDuration(offer.offer_type || offer.type),
                requirements: offer.requirements || 'Varies by offer'
            }));
            
            return formattedOffers;
        } else if (data.offers && Array.isArray(data.offers) && data.offers.length > 0) {
            console.log('✅ Offers found (no success flag):', data.offers.length);
            
            const formattedOffers = data.offers.map(offer => ({
                id: offer.id || offer.offer_id,
                name: offer.name || offer.title,
                description: offer.description || offer.desc || 'Complete this offer to earn rewards',
                payout: offer.payout || offer.amount || '0.00',
                type: offer.offer_type || offer.type || 'Offer',
                link: offer.link || offer.url || '#',
                icon: getOfferIcon(offer.offer_type || offer.type),
                duration: estimateDuration(offer.offer_type || offer.type),
                requirements: offer.requirements || 'Varies by offer'
            }));
            
            return formattedOffers;
        } else {
            console.warn('⚠️ No offers in response');
            return [];
        }
        
    } catch (error) {
        console.error('❌ OGAds API Error:', error);
        showNotification('Unable to load offers at this time. Please try again later.', 'error');
        return [];
    }
}

// Helper function to get icon based on offer type
function getOfferIcon(offerType) {
    const type = (offerType || '').toLowerCase();
    if (type.includes('survey') || type.includes('pin')) return '📊';
    if (type.includes('video') || type.includes('vid')) return '🎬';
    if (type.includes('app') || type.includes('install')) return '📱';
    if (type.includes('game')) return '🎮';
    if (type.includes('quiz') || type.includes('question')) return '📝';
    return '💰';
}

// Helper function to estimate duration
function estimateDuration(offerType) {
    const type = (offerType || '').toLowerCase();
    if (type.includes('survey')) return '3-5 min';
    if (type.includes('video')) return '1-2 min';
    if (type.includes('app') || type.includes('install')) return '2-3 min';
    if (type.includes('game')) return '10-15 min';
    if (type.includes('quiz')) return '1 min';
    return '2-5 min';
}

// ======================================
// DISPLAY OFFERS
// ======================================

function displayOGAdsOffers(offers) {
    console.log('🎨 Displaying offers:', offers.length);
    
    const wallItemsContainer = document.getElementById('wall-items');
    
    if (!wallItemsContainer) {
        console.error('❌ wall-items container not found');
        return;
    }
    
    // Add a slight fade-out effect before updating
    wallItemsContainer.style.opacity = '0.7';
    
    setTimeout(() => {
        if (!offers || offers.length === 0) {
            wallItemsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">
                    <div style="font-size: 4rem; opacity: 0.3; margin-bottom: 20px;">💸</div>
                    <h3 style="color: #888; margin-bottom: 10px;">No Offers Available</h3>
                    <p style="color: #666;">Check back later for new earning opportunities!</p>
                </div>
            `;
        } else {
            const offersHtml = offers.map(offer => {
                const offerJson = JSON.stringify({
                    id: offer.id,
                    name: offer.name,
                    description: offer.description,
                    payout: offer.payout,
                    type: offer.type,
                    category: offer.category,
                    network: 'ogads',
                    amount: parseFloat(offer.payout) * 0.80
                }).replace(/"/g, '&quot;');
                
                return `
                <div class="card" style="cursor: pointer; border-left: 4px solid #00d4ff; transition: all 0.3s ease;" onclick="trackAndOpenOGAdsOffer('${offer.id}', '${escapeHtml(offer.link)}', JSON.parse('${offerJson}'))">
                    <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 2.5rem; flex-shrink: 0;">${offer.icon}</div>
                        <div style="flex: 1;">
                            <h3 style="color: #00d4ff; margin: 0 0 8px 0; font-size: 1.1rem;">${escapeHtml(offer.name)}</h3>
                            <p style="color: #ccc; font-size: 0.9rem; margin: 0 0 10px 0; line-height: 1.5;">${escapeHtml(offer.description)}</p>
                            
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem;">
                                <span style="background: rgba(0,212,255,0.15); color: #00d4ff; padding: 6px 12px; border-radius: 16px; font-weight: bold;">
                                    💰 $${(parseFloat(offer.payout) * 0.80).toFixed(2)}
                                </span>
                                <span style="background: rgba(255,215,0,0.15); color: #ffd700; padding: 6px 12px; border-radius: 16px;">
                                    ⏱️ ${offer.duration}
                                </span>
                                <span style="background: rgba(255,51,153,0.15); color: #ff3399; padding: 6px 12px; border-radius: 16px;">
                                    ${offer.type}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    ${offer.requirements ? `
                        <div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 2px solid #00d4ff;">
                            <small style="color: #aaa;">📋 ${escapeHtml(offer.requirements)}</small>
                        </div>
                    ` : ''}
                </div>
            `;
            }).join('');
            
            wallItemsContainer.innerHTML = offersHtml;
        }
        
        // Fade back in
        setTimeout(() => {
            wallItemsContainer.style.opacity = '1';
        }, 50);
        
    }, 150);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ======================================
// LOAD OFFERS - NO SUCCESS NOTIFICATION
// ======================================

async function loadOGAdsOffers() {
    console.log('🚀 Loading OGAds offers...');
    
    const wallItemsContainer = document.getElementById('wall-items');
    
    if (!wallItemsContainer) {
        console.error('❌ wall-items container not found');
        return;
    }
    
    // Show loading state
    wallItemsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 60px 20px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 20px; font-size: 1.1rem;">Loading offers...</p>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">This may take a few seconds</p>
        </div>
    `;
    
    try {
        // Fetch offers (will use cache if available and recent)
        if (!window.ogadsOffers) {
            console.log('📡 Fetching fresh offers...');
            window.ogadsOffers = await fetchOGAdsOffers();
            window.offersLoadedAt = Date.now();
        } else {
            console.log('💾 Using cached offers');
            // Refresh cache if older than 5 minutes
            const cacheAge = Date.now() - (window.offersLoadedAt || 0);
            if (cacheAge > 5 * 60 * 1000) {
                console.log('🔄 Cache expired, refreshing...');
                window.ogadsOffers = await fetchOGAdsOffers();
                window.offersLoadedAt = Date.now();
            }
        }
        
        // Display offers
        console.log('🎨 Displaying', window.ogadsOffers.length, 'offers in wall-items');
        displayOGAdsOffers(window.ogadsOffers);
        
        // ⭐ REMOVED THE SUCCESS NOTIFICATION - Silent loading
        console.log('✅ Offers loaded successfully:', window.ogadsOffers.length);
        
    } catch (error) {
        console.error('💥 Failed to load offers:', error);
        
        wallItemsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #ff4444; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #ff4444; margin-bottom: 15px;">Unable to Load Offers</h3>
                <p style="color: #ff8888; margin-bottom: 20px;">${error.message}</p>
                <button onclick="loadOGAdsOffers()" class="btn" style="background: #00d4ff; color: #000;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// ======================================
// OPEN OFFER
// ======================================

function creditUserForOffer(offerId, amount) {
    if (!window.currentUser) return;
    
    // Add to PENDING balance (not available balance)
    window.paymentSystem.addPendingEarnings(amount, 'OGAds Offer', offerId);
}

// DEPRECATED: Old function kept for backwards compatibility
window.openOGAdsOffer = function(offerId, offerLink) {
    console.warn('⚠️ DEPRECATED: Use trackAndOpenOGAdsOffer instead for proper tracking');
    console.log('🎯 Opening offer:', offerId);
    
    const offer = window.ogadsOffers?.find(o => o.id === offerId);
    const payout = offer ? parseFloat(offer.payout) * 0.80 : 0.50;
    
    if (offerLink && offerLink !== '#') {
        // Add user tracking to the offer URL
        let trackingUrl = offerLink;
        if (window.currentUser) {
            const separator = offerLink.includes('?') ? '&' : '?';
            trackingUrl = `${offerLink}${separator}subid=${window.currentUser.id}`;
            console.log('🔍 Tracking URL with user ID:', trackingUrl);
        }
        
        // Open in new window with tracking
        const newWindow = window.open(trackingUrl, '_blank', 'noopener,noreferrer');
        
        showNotification('Offer opened! Complete it to earn rewards.', 'success');
        console.log(`📝 Offer clicked: ${offerId}, User: ${window.currentUser?.id}`);
        
    } else {
        console.warn('⚠️ Offer link not available');
    }
};

// ======================================
// DEBUG FUNCTION
// ======================================

window.debugOGAdsAPI = async function() {
    console.log('🧪 Testing OGAds API Connection...');
    
    try {
        const visitorIP = await getVisitorIP();
        const userAgent = navigator.userAgent;
        
        console.log('📋 Test Configuration:');
        console.log('  - Endpoint:', OGADS_API_CONFIG.endpoint);
        console.log('  - API Key:', OGADS_API_CONFIG.apiKey.substring(0, 20) + '...');
        console.log('  - IP:', visitorIP);
        console.log('  - User Agent:', userAgent.substring(0, 60) + '...');
        console.log('  - E-Type:', OGADS_API_CONFIG.etype);
        console.log('  - Max Offers:', OGADS_API_CONFIG.max);
        
        const params = new URLSearchParams({
            ip: visitorIP,
            user_agent: userAgent,
            etype: OGADS_API_CONFIG.etype.toString(),
            max: '5'
        });
        
        const testUrl = `${OGADS_API_CONFIG.endpoint}?${params}`;
        console.log('🔗 Test URL:', testUrl);
        
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OGADS_API_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers));
        
        const data = await response.json();
        console.log('📦 Response Data:', data);
        
        if (data.success === true && data.offers) {
            console.log('✅ API TEST PASSED!', data.offers.length, 'offers found');
            alert('API Test PASSED! Check console for details.');
        } else if (data.offers) {
            console.log('⚠️ Offers found but success flag missing');
            alert('API responded with offers but format may be unexpected. Check console.');
        } else {
            console.log('❌ No offers in response');
            alert('API responded but no offers found. Check console for details.');
        }
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        alert('API Test FAILED: ' + error.message);
    }
};

// ======================================
// CLEAN WALL PAGE LOADER
// ======================================

(function() {
    console.log('🔧 Installing clean wall page loader...');
    
    let isCurrentlyLoading = false;
    let offersLoaded = false;
    
    // Single function to handle wall page loading
    function handleWallPageLoad() {
        const wallPage = document.getElementById('wall-page');
        const isWallActive = wallPage?.classList.contains('active');
        
        // Only proceed if wall page is active, user is not admin, and not already loading
        if (!isWallActive || window.isAdminMode || isCurrentlyLoading || offersLoaded) {
            return;
        }
        
        console.log('🎯 Loading offers for wall page...');
        isCurrentlyLoading = true;
        
        // Show loading state
        const wallItemsContainer = document.getElementById('wall-items');
        if (wallItemsContainer) {
            wallItemsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 60px 20px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px; font-size: 1.1rem;">Loading offers...</p>
                </div>
            `;
        }
        
        // Load offers with a slight delay
        setTimeout(() => {
            if (typeof loadOGAdsOffers === 'function') {
                loadOGAdsOffers().then(() => {
                    isCurrentlyLoading = false;
                    offersLoaded = true;
                }).catch(error => {
                    console.error('❌ Failed to load offers:', error);
                    isCurrentlyLoading = false;
                });
            } else {
                console.error('❌ loadOGAdsOffers function not found');
                isCurrentlyLoading = false;
            }
        }, 200);
    }
    
    // Listen for page changes
    let currentPage = '';
    
    function checkPageChange() {
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const newPage = activePage.id;
        
        // Reset offers loaded flag when leaving wall page
        if (currentPage === 'wall-page' && newPage !== 'wall-page') {
            offersLoaded = false;
        }
        
        // Load offers when entering wall page
        if (newPage === 'wall-page' && currentPage !== 'wall-page') {
            setTimeout(handleWallPageLoad, 100);
        }
        
        currentPage = newPage;
    }
    
    // Check for page changes
    setInterval(checkPageChange, 500);
    
    // Also handle direct wall nav clicks
    document.addEventListener('click', function(event) {
        if (event.target.closest('#nav-wall')) {
            setTimeout(() => {
                offersLoaded = false;
                setTimeout(handleWallPageLoad, 300);
            }, 100);
        }
    });
    
    console.log('✅ Clean wall loader installed');
})();