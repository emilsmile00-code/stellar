// ======================================
// CPALEAD API INTEGRATION - FIXED
// ======================================

const CPALEAD_CONFIG = {
    publisherId: '3242188',
    endpoint: 'https://www.cpalead.com/api/offers',
    country: 'user',
    device: 'user',
    limit: 50
};

// Global storage - USING OGADS PATTERN
window.cpaLeadOffers = null;
window.cpaLeadLoaded = false;
window.cpaLeadLoading = false; // Add loading state

// ======================================
// FETCH CPALEAD OFFERS
// ======================================

async function fetchCPAleadOffers() {
    console.log('🔵 [CPAlead] Fetching offers...');
    
    try {
        const params = new URLSearchParams({
            id: CPALEAD_CONFIG.publisherId,
            format: 'json',
            country: CPALEAD_CONFIG.country,
            device: CPALEAD_CONFIG.device,
            limit: CPALEAD_CONFIG.limit.toString()
        });
        
        const url = `${CPALEAD_CONFIG.endpoint}?${params}`;
        console.log('🔗 [CPAlead] Request URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📊 [CPAlead] Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('📦 [CPAlead] Response preview:', text.substring(0, 300));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ [CPAlead] JSON parse error:', parseError);
            return [];
        }
        
        console.log('📋 [CPAlead] Response structure:', Object.keys(data));
        
        const offers = parseCPAleadResponse(data);
        
        if (offers.length > 0) {
            console.log(`✅ [CPAlead] Successfully fetched ${offers.length} offers`);
            return offers;
        } else {
            console.warn('⚠️ [CPAlead] No offers found in response');
            return [];
        }
        
    } catch (error) {
        console.error('❌ [CPAlead] Fetch error:', error);
        return [];
    }
}

// ======================================
// MOCK OFFERS REMOVED - Only real offers are displayed
// ======================================

// ======================================
// PARSE CPALEAD RESPONSE
// ======================================

function parseCPAleadResponse(data) {
    let offersArray = [];
    
    if (data.status === 'success' && Array.isArray(data.offers)) {
        offersArray = data.offers;
    } else if (Array.isArray(data.offers)) {
        offersArray = data.offers;
    } else if (Array.isArray(data)) {
        offersArray = data;
    } else {
        console.warn('⚠️ [CPAlead] Unexpected response format');
        return [];
    }
    
    console.log(`📊 [CPAlead] Parsing ${offersArray.length} offers...`);
    
    return offersArray.map(offer => {
        const offerType = offer.payout_type || offer.type || 'CPI';
        
        return {
            id: `cpalead-${offer.id}`,
            source: 'cpalead',
            name: offer.title || offer.name || 'Complete this offer',
            description: offer.description || 'Complete this offer to earn rewards',
            payout: parseFloat(offer.amount || offer.payout || '0.50').toFixed(2),
            currency: offer.payout_currency || 'USD',
            type: offerType,
            link: offer.link || '#',
            country: offer.countries ? offer.countries.join(', ') : 'All',
            device: offer.device || 'All',
            icon: getOfferIcon(offerType),
            duration: estimateDuration(offerType),
            requirements: offer.conversion || offer.description || 'Complete the offer requirements'
        };
    });
}

// ======================================
// DISPLAY CPALEAD OFFERS - USING OGADS PATTERN
// ======================================

function displayCPAleadOffers(offers) {
    console.log('🎨 [CPAlead] Displaying', offers.length, 'offers');
    
    const container = document.getElementById('cpalead-offers');
    
    if (!container) {
        console.error('❌ [CPAlead] Container #cpalead-offers not found');
        return;
    }
    
    console.log('✅ [CPAlead] Container found');
    
    if (!offers || offers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                <h3 style="color: #888; margin-bottom: 10px;">No CPAlead Offers Available</h3>
                <p style="color: #666;">Check back later for new offers.</p>
            </div>
        `;
        return;
    }
    
    // Add fade effect like OGAds
    container.style.opacity = '0.7';
    
    setTimeout(() => {
        try {
            const offersHtml = offers.map(offer => {
                const offerJson = JSON.stringify({
                    id: offer.id,
                    name: offer.name,
                    description: offer.description,
                    payout: offer.payout,
                    type: offer.type,
                    category: offer.category,
                    network: 'cpalead',
                    amount: parseFloat(offer.payout) * 0.80
                }).replace(/"/g, '&quot;');
                
                return `
    <div class="card" style="cursor: pointer; border-left: 4px solid #667eea; transition: all 0.3s ease;" 
         onclick="trackAndOpenCPAleadOffer('${offer.id}', '${escapeHtml(offer.link)}', JSON.parse('${offerJson}'))">
        <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
            <div style="font-size: 2.5rem; flex-shrink: 0;">${offer.icon}</div>
            <div style="flex: 1;">
                <h3 style="color: #667eea; margin: 0 0 8px 0; font-size: 1.1rem;">${escapeHtml(offer.name)}</h3>
                <p style="color: #ccc; font-size: 0.9rem; margin: 0 0 10px 0; line-height: 1.5;">
                    ${escapeHtml(offer.description)}
                </p>
                
                <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem;">
                    <span style="background: rgba(102,126,234,0.15); color: #667eea; padding: 6px 12px; border-radius: 16px; font-weight: bold;">
                        💰 $${(parseFloat(offer.payout) * 0.80).toFixed(2)}
                    </span>
                    <span style="background: rgba(255,215,0,0.15); color: #ffd700; padding: 6px 12px; border-radius: 16px;">
                        ⏱️ ${offer.duration}
                    </span>
                    <span style="background: rgba(118,75,162,0.15); color: #764ba2; padding: 6px 12px; border-radius: 16px;">
                        ${offer.type}
                    </span>
                </div>
            </div>
        </div>
        
        ${offer.requirements ? `
            <div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 2px solid #667eea;">
                <small style="color: #aaa;">📋 ${escapeHtml(offer.requirements)}</small>
            </div>
        ` : ''}
    </div>
`;
            }).join('');
            
            container.innerHTML = offersHtml;
            
            // Fade back in
            setTimeout(() => {
                container.style.opacity = '1';
            }, 50);
            
            console.log('✅ [CPAlead] Display complete!');
            
        } catch (error) {
            console.error('❌ [CPAlead] Error building HTML:', error);
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #ff4444; padding: 40px;">
                    <h3>Error displaying offers</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }, 150);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ======================================
// LOAD CPALEAD OFFERS - PROPER LAZY LOADING
// ======================================

window.loadCPAleadOffers = async function() {
    // Check if already loading
    if (window.cpaLeadLoading) {
        console.log('⏳ [CPAlead] Already loading, skipping...');
        return;
    }
    
    console.log('🚀 [CPAlead] Lazy loading offers...');
    
    const container = document.getElementById('cpalead-offers');
    
    if (!container) {
        console.log('⏳ [CPAlead] Container not found - wall page not active or not ready');
        return;
    }
    
    console.log('✅ [CPAlead] Container found, loading offers...');
    
    // Set loading state
    window.cpaLeadLoading = true;
    
    // Show loading
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 20px;">Loading CPAlead offers...</p>
        </div>
    `;
    
    try {
        // Check cache
        if (!window.cpaLeadOffers) {
            console.log('📡 [CPAlead] Fetching fresh offers...');
            window.cpaLeadOffers = await fetchCPAleadOffers();
            window.cpaLeadLoadedAt = Date.now();
        } else {
            console.log('💾 [CPAlead] Using cached offers');
            const cacheAge = Date.now() - (window.cpaLeadLoadedAt || 0);
            if (cacheAge > 10 * 60 * 1000) {
                console.log('🔄 [CPAlead] Cache expired, refreshing...');
                window.cpaLeadOffers = await fetchCPAleadOffers();
                window.cpaLeadLoadedAt = Date.now();
            }
        }
        
        console.log('📊 [CPAlead] Offers to display:', window.cpaLeadOffers.length);
        displayCPAleadOffers(window.cpaLeadOffers);
        
    } catch (error) {
        console.error('💥 [CPAlead] Failed to load offers:', error);
        
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #ff4444; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                    <h3 style="color: #ff4444; margin-bottom: 10px;">Failed to Load CPAlead Offers</h3>
                    <p style="color: #ff8888; font-size: 0.9rem;">${error.message}</p>
                    <button onclick="window.loadCPAleadOffers()" class="btn" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px;">
                        Try Again
                    </button>
                </div>
            `;
        }
    } finally {
        // Reset loading state
        window.cpaLeadLoading = false;
    }
};

// ======================================
// OPEN CPALEAD OFFER - DEPRECATED (Use trackAndOpenCPAleadOffer from tracking.js)
// ======================================

// DEPRECATED: Old function kept for backwards compatibility
// Use trackAndOpenCPAleadOffer from tracking.js instead
window.openCPAleadOffer = function(offerId, offerLink) {
    console.warn('⚠️ DEPRECATED: Use trackAndOpenCPAleadOffer instead for proper tracking');
    console.log('🎯 [CPAlead] Opening offer:', offerId);
    
    if (offerLink && offerLink !== '#') {
        let trackingUrl = offerLink;
        
        if (window.currentUser) {
            const separator = offerLink.includes('?') ? '&' : '?';
            trackingUrl = `${offerLink}${separator}subid=${window.currentUser.id}`;
        }
        
        window.open(trackingUrl, '_blank', 'noopener,noreferrer');
        
        if (typeof showNotification === 'function') {
            showNotification('CPAlead offer opened! Complete it to earn rewards.', 'success');
        }
        
    } else {
        console.warn('⚠️ CPAlead offer link not available');
    }
};

// ======================================
// HELPER FUNCTIONS
// ======================================

function getOfferIcon(type) {
    const typeStr = (type || '').toLowerCase();
    
    if (typeStr.includes('cpi') || typeStr.includes('install')) return '📱';
    if (typeStr.includes('cpe') || typeStr.includes('engage')) return '🎮';
    if (typeStr.includes('cpa') || typeStr.includes('action')) return '✏️';
    if (typeStr.includes('survey')) return '📊';
    if (typeStr.includes('video')) return '🎬';
    if (typeStr.includes('quiz')) return '❓';
    
    return '🎯';
}

function estimateDuration(type) {
    const typeStr = (type || '').toLowerCase();
    
    if (typeStr.includes('install')) return '2-5 min';
    if (typeStr.includes('engage')) return '5-10 min';
    if (typeStr.includes('survey')) return '3-7 min';
    if (typeStr.includes('video')) return '1-2 min';
    if (typeStr.includes('quiz')) return '1-2 min';
    
    return '3-5 min';
}

// ======================================
// DEBUG FUNCTION
// ======================================

window.debugCPAlead = async function() {
    console.log('🧪 CPAlead Debug Test');
    
    console.log('📋 Configuration:');
    console.log('  - Publisher ID:', CPALEAD_CONFIG.publisherId);
    console.log('  - Endpoint:', CPALEAD_CONFIG.endpoint);
    
    console.log('\n🔍 Testing API...');
    
    const offers = await fetchCPAleadOffers();
    
    console.log('\n📊 Results:');
    console.log('  - Offers found:', offers.length);
    
    if (offers.length > 0) {
        console.log('  - Sample offer:', offers[0]);
        
        window.cpaLeadOffers = offers;
        
        console.log('\n🎨 Attempting to display offers...');
        const container = document.getElementById('cpalead-offers');
        
        if (container) {
            console.log('✅ Container found');
            displayCPAleadOffers(offers);
            alert(`✅ CPAlead Test Passed!\n\nFound ${offers.length} offers.`);
        } else {
            console.error('❌ Container #cpalead-offers NOT FOUND');
            alert('Container not found. Make sure you are on the Wall page.');
        }
    } else {
        alert('⚠️ CPAlead Test: No offers found.\nCheck console for details.');
    }
};

console.log('✅ CPAlead integration loaded - LAZY LOADING ENABLED');

// REMOVE ANY AUTO-LOADING CODE - NO AUTOMATIC CALLS!