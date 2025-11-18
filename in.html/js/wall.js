// ======================================
// WALL TEMPLATE FUNCTIONS - FIXED VERSION
// ======================================
window.currentTemplate = null;
window.surveyOptions = ['Option 1', 'Option 2', 'Option 3'];

// Function to check if affiliateOffers is properly loaded
function checkAffiliateOffers() {
    console.log('🔍 Checking affiliateOffers...');
    console.log(' - Type:', typeof window.affiliateOffers);
    console.log(' - Is array:', Array.isArray(window.affiliateOffers));
    console.log(' - Length:', window.affiliateOffers?.length);
    
    if (window.affiliateOffers && Array.isArray(window.affiliateOffers) && window.affiliateOffers.length > 0) {
        console.log('✅ affiliateOffers loaded successfully');
        return window.affiliateOffers;
    } else {
        console.log('❌ affiliateOffers not properly loaded');
        return [];
    }
}

window.selectTemplate = function(templateId) {
    console.log('📋 Selecting template:', templateId);
    window.currentTemplate = templateId;
    
    // Update active state
    document.querySelectorAll('.template-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Load template content
    loadTemplateContent(templateId);
};

// Add this function to display affiliate offers
function displayAffiliateOffers() {
    // Check affiliate offers
    const offers = checkAffiliateOffers();
    console.log('🔄 Displaying affiliate offers:', offers.length);
    
    // Always show the affiliate section, even if empty
    if (!offers || offers.length === 0) {
        console.log('❌ No affiliate offers to display, showing empty state');
        return `
            <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">
                <div class="icon" style="font-size: 4rem; opacity: 0.3; margin-bottom: 20px;">📭</div>
                <h3 style="color: #888; margin-bottom: 10px;">No affiliate offers available</h3>
                <p style="color: #666;">Check back later for partner offers!</p>
            </div>
        `;
    }
    
    const affiliateHtml = offers.map(offer => `
        <div class="card" style="cursor: pointer; border-left: 4px solid #00ff88; transition: all 0.3s ease;" 
             onclick="openAffiliateOffer('${offer.title}', '${escapeHtml(offer.url)}')">
            <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                <div style="font-size: 2.5rem; flex-shrink: 0;">${offer.icon || '💰'}</div>
                <div style="flex: 1;">
                    <h3 style="color: #00ff88; margin: 0 0 8px 0; font-size: 1.1rem;">${escapeHtml(offer.title)}</h3>
                    <p style="color: #ccc; font-size: 0.9rem; margin: 0 0 10px 0; line-height: 1.5;">
                        ${escapeHtml(offer.description)}
                    </p>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem;">
                        <span style="background: rgba(0,255,136,0.15); color: #00ff88; padding: 6px 12px; border-radius: 16px; font-weight: bold;">
                            💰 ${offer.reward}
                        </span>
                        <span style="background: rgba(255,215,0,0.15); color: #ffd700; padding: 6px 12px; border-radius: 16px;">
                            ⏱️ ${offer.duration}
                        </span>
                        <span style="background: rgba(118,75,162,0.15); color: #764ba2; padding: 6px 12px; border-radius: 16px;">
                            ${offer.type}
                        </span>
                        ${offer.region ? `<span style="background: rgba(255,51,153,0.15); color: #ff3399; padding: 6px 12px; border-radius: 16px;">🌍 ${offer.region}</span>` : ''}
                    </div>
                </div>
            </div>
            
            ${offer.category ? `
                <div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 2px solid #00ff88;">
                    <small style="color: #aaa;">📋 Category: ${escapeHtml(offer.category)}</small>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    return affiliateHtml;
}

// Add this function to handle affiliate offer clicks
window.openAffiliateOffer = function(title, url) {
    console.log('🎯 Opening affiliate offer:', title);
    
    if (url && url !== '#') {
        // Open in new window
        window.open(url, '_blank', 'noopener,noreferrer');
        
        if (typeof showNotification === 'function') {
            showNotification(`Opening: ${title}`, 'success');
        }
    } else {
        console.warn('⚠️ Affiliate offer link not available');
    }
};

// Add this utility function to wall.js if not already present
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadPublicWall() {
    console.log('🔄 Loading public wall with all offers...');
    
    const wallContent = document.getElementById('wall-content');
    
    // Generate HTML for different offer types
    const wallItemsHtml = window.wallItems && window.wallItems.length > 0 
        ? window.wallItems.map((item, index) => `
            <div class="card" style="cursor: pointer;" onclick="openWallItem(${index})">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <span style="font-size: 2rem;">${item.type === 'survey' ? '📊' : '🎁'}</span>
                    <div>
                        <h3 style="color: #00d4ff; margin: 0;">${item.title}</h3>
                        <p style="color: #888; font-size: 0.85rem; margin: 5px 0 0 0;">${item.description}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #888; font-size: 0.85rem;">⏱️ ${item.duration || '2-3 min'}</span>
                    ${item.reward ? `<span style="background: rgba(0,212,255,0.1); color: #00d4ff; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem;">💰 ${item.reward}</span>` : ''}
                </div>
            </div>
        `).join('')
        : '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 20px;"><div class="icon" style="font-size: 2rem; opacity: 0.3; margin-bottom: 10px;">🔭</div><p style="color: #666; margin: 0;">No custom content available yet</p></div>';

    // Generate affiliate offers HTML
    const affiliateOffersHtml = displayAffiliateOffers();
    
    // Create the complete wall content structure
    wallContent.innerHTML = `
        <div id="public-wall">
            <!-- Custom Surveys & Offers -->
            <h2 style="color: #00d4ff; margin-bottom: 30px; font-size: 2rem;">📋 Custom Surveys & Offers</h2>
            <div class="grid grid-2" id="wall-items">${wallItemsHtml}</div>
            
            <!-- Affiliate Offers Section - ALWAYS SHOW THIS -->
            <h2 style="color: #00ff88; margin: 50px 0 30px 0; font-size: 2rem;">🤝 Partner Offers</h2>
            <div class="grid grid-2" id="affiliate-offers">
                ${affiliateOffersHtml}
            </div>
            
            <!-- CPAlead Offers Container -->
            <h2 style="color: #667eea; margin: 50px 0 30px 0; font-size: 2rem;">🎯 Sponsored Offers</h2>
            <div class="grid grid-2" id="cpalead-offers">
                <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 40px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px;">Loading CPAlead offers...</p>
                </div>
            </div>
        </div>
    `;
    
    console.log('✅ [Wall] DOM structure created with all offer sections');
    
    // Load CPAlead offers
    setTimeout(() => {
        const cpaleadContainer = document.getElementById('cpalead-offers');
        if (cpaleadContainer && typeof window.loadCPAleadOffers === 'function') {
            console.log('🚀 [Wall] Calling loadCPAleadOffers...');
            window.loadCPAleadOffers();
        }
    }, 300);
}

// Initialize wallItems if it doesn't exist
if (!window.wallItems) {
    window.wallItems = [];
}

window.openWallItem = function(index) {
    const item = window.wallItems[index];
    const wallContent = document.getElementById('wall-content');
    
    wallContent.innerHTML = `
        <div class="template-preview">
            <button onclick="loadPublicWall()" class="btn" style="margin-bottom: 20px; background: rgba(255,255,255,0.05);">← Back to Offers</button>
            <h3>${item.title}</h3>
            <p style="color: #888; margin-bottom: 30px;">${item.description}</p>
            ${item.content}
        </div>
    `;
};

// Add this function to manually trigger CPAlead offers
window.loadCPAleadOffersManually = function() {
    console.log('🔄 Manually loading CPAlead offers...');
    if (typeof window.loadCPAleadOffers === 'function') {
        window.loadCPAleadOffers();
    } else {
        console.error('loadCPAleadOffers function not available');
    }
};

// Rest of your existing template functions remain the same...
function loadTemplateContent(templateId) {
    const wallContent = document.getElementById('wall-content');
    
    const templates = {
        'survey-basic': `
            <div class="template-preview">
                <h3>📊 Basic Survey</h3>
                <form onsubmit="handleSurveySubmit(event)">
                    <div class="form-group">
                        <label>Survey Title</label>
                        <input type="text" placeholder="Enter your survey title..." required>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <textarea placeholder="Enter your question..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Response Type</label>
                        <select>
                            <option>Short Text</option>
                            <option>Long Text</option>
                            <option>Number</option>
                            <option>Email</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-btn">Create Survey</button>
                </form>
            </div>
        `,
        'survey-multiple': `
            <div class="template-preview">
                <h3>📊 Multiple Choice Survey</h3>
                <form onsubmit="handleSurveySubmit(event)">
                    <div class="form-group">
                        <label>Survey Title</label>
                        <input type="text" placeholder="Enter your survey title..." required>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <textarea placeholder="Enter your question..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Options</label>
                        <div id="survey-options">
                            <div class="survey-option">
                                <input type="text" placeholder="Option 1" value="Option 1">
                                <button type="button" onclick="removeOption(this)">✕</button>
                            </div>
                            <div class="survey-option">
                                <input type="text" placeholder="Option 2" value="Option 2">
                                <button type="button" onclick="removeOption(this)">✕</button>
                            </div>
                        </div>
                        <button type="button" onclick="addOption()" class="add-option-btn">+ Add Option</button>
                    </div>
                    <button type="submit" class="submit-btn">Create Survey</button>
                </form>
            </div>
        `,
        'survey-rating': `
            <div class="template-preview">
                <h3>⭐ Rating Survey</h3>
                <form onsubmit="handleSurveySubmit(event)">
                    <div class="form-group">
                        <label>Survey Title</label>
                        <input type="text" placeholder="Enter your survey title..." required>
                    </div>
                    <div class="form-group">
                        <label>Question</label>
                        <textarea placeholder="How would you rate our service?" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Rating Scale</label>
                        <select>
                            <option>1-5 Stars</option>
                            <option>1-10 Stars</option>
                            <option>Poor to Excellent</option>
                        </select>
                    </div>
                    <button type="submit" class="submit-btn">Create Survey</button>
                </form>
            </div>
        `,
        'survey-feedback': `
            <div class="template-preview">
                <h3>💬 Feedback Form</h3>
                <form onsubmit="handleSurveySubmit(event)">
                    <div class="form-group">
                        <label>Form Title</label>
                        <input type="text" placeholder="Enter form title..." required>
                    </div>
                    <div class="form-group">
                        <label>Instructions</label>
                        <textarea placeholder="Please provide your detailed feedback..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Fields</label>
                        <div style="display: flex; gap: 10px;">
                            <label><input type="checkbox" checked> Name</label>
                            <label><input type="checkbox" checked> Email</label>
                            <label><input type="checkbox"> Rating</label>
                        </div>
                    </div>
                    <button type="submit" class="submit-btn">Create Feedback Form</button>
                </form>
            </div>
        `,
        'offerwall-reward': `
            <div class="template-preview">
                <h3>💰 Reward Offer</h3>
                <form onsubmit="handleOfferwallSubmit(event)">
                    <div class="form-group">
                        <label>Offer Title</label>
                        <input type="text" placeholder="Enter offer title..." required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea placeholder="Describe what users need to do..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Reward Points</label>
                        <input type="number" placeholder="100" required>
                    </div>
                    <div class="form-group">
                        <label>Requirements</label>
                        <textarea placeholder="List the requirements..."></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Create Reward Offer</button>
                </form>
            </div>
        `,
        'offerwall-task': `
            <div class="template-preview">
                <h3>✅ Task Completion</h3>
                <form onsubmit="handleOfferwallSubmit(event)">
                    <div class="form-group">
                        <label>Task Title</label>
                        <input type="text" placeholder="Enter task title..." required>
                    </div>
                    <div class="form-group">
                        <label>Task Description</label>
                        <textarea placeholder="Describe the task..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Steps to Complete</label>
                        <textarea placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Reward</label>
                        <input type="text" placeholder="50 points" required>
                    </div>
                    <button type="submit" class="submit-btn">Create Task</button>
                </form>
            </div>
        `,
        'offerwall-download': `
            <div class="template-preview">
                <h3>📱 App Download</h3>
                <form onsubmit="handleOfferwallSubmit(event)">
                    <div class="form-group">
                        <label>App Name</label>
                        <input type="text" placeholder="Enter app name..." required>
                    </div>
                    <div class="form-group">
                        <label>App Description</label>
                        <textarea placeholder="Describe the app..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Platform</label>
                        <select>
                            <option>Android</option>
                            <option>iOS</option>
                            <option>Both</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Reward Points</label>
                        <input type="number" placeholder="150" required>
                    </div>
                    <button type="submit" class="submit-btn">Create Download Offer</button>
                </form>
            </div>
        `,
        'offerwall-video': `
            <div class="template-preview">
                <h3>🎬 Video Watch</h3>
                <form onsubmit="handleOfferwallSubmit(event)">
                    <div class="form-group">
                        <label>Video Title</label>
                        <input type="text" placeholder="Enter video title..." required>
                    </div>
                    <div class="form-group">
                        <label>Video URL</label>
                        <input type="url" placeholder="https://youtube.com/..." required>
                    </div>
                    <div class="form-group">
                        <label>Video Duration</label>
                        <input type="text" placeholder="2:30" required>
                    </div>
                    <div class="form-group">
                        <label>Reward Points</label>
                        <input type="number" placeholder="25" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea placeholder="Brief description of the video content..."></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Create Video Offer</button>
                </form>
            </div>
        `
    };
    
    wallContent.innerHTML = templates[templateId] || '<div class="empty-state"><div class="icon">❌</div><h3>Template Not Found</h3></div>';
}

window.addOption = function() {
    const optionsContainer = document.getElementById('survey-options');
    const optionCount = optionsContainer.querySelectorAll('.survey-option').length + 1;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'survey-option';
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option ${optionCount}" value="Option ${optionCount}">
        <button type="button" onclick="removeOption(this)">✕</button>
    `;
    
    optionsContainer.appendChild(optionDiv);
};

window.removeOption = function(button) {
    const optionsContainer = document.getElementById('survey-options');
    if (optionsContainer.querySelectorAll('.survey-option').length > 2) {
        button.parentElement.remove();
    } else {
        alert('You must have at least 2 options!');
    }
};

window.handleSurveySubmit = function(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('input[type="text"]').value;
    const description = form.querySelector('textarea')?.value || 'Complete this survey';
    
    // Create survey content based on template
    let content = '';
    if (window.currentTemplate === 'survey-basic') {
        content = '<div><label style="display:block; margin-bottom:10px; color:#888;">Your answer:</label><textarea style="width:100%; padding:12px; background:#16162a; border:1px solid #00d4ff; border-radius:8px; color:white; font-family:inherit;" rows="4"></textarea><button class="btn" style="margin-top:15px;" onclick="alert(\'Thank you for your response!\')">Submit Response</button></div>';
    } else if (window.currentTemplate === 'survey-multiple') {
        const options = window.surveyOptions.map(opt => `<label style="display:block; padding:12px; background:#16162a; border-radius:8px; margin-bottom:8px; cursor:pointer;"><input type="radio" name="survey-option" style="margin-right:10px;"> ${opt}</label>`).join('');
        content = `<div>${options}<button class="btn" style="margin-top:15px;" onclick="alert('Thank you for your response!')">Submit Response</button></div>`;
    } else if (window.currentTemplate === 'survey-rating') {
        content = '<div style="text-align:center;"><div style="font-size:3rem; margin:20px 0;">⭐⭐⭐⭐⭐</div><button class="btn" onclick="alert(\'Thank you for your rating!\')">Submit Rating</button></div>';
    } else {
        content = '<div><label style="display:block; margin-bottom:10px; color:#888;">Your feedback:</label><textarea style="width:100%; padding:12px; background:#16162a; border:1px solid #00d4ff; border-radius:8px; color:white; font-family:inherit;" rows="6"></textarea><button class="btn" style="margin-top:15px;" onclick="alert(\'Thank you for your feedback!\')">Submit Feedback</button></div>';
    }
    
    window.wallItems.push({
        type: 'survey',
        title: title,
        description: description,
        content: content,
        duration: '2-3 min'
    });
    
    alert('Survey "' + title + '" posted successfully!');
    document.querySelectorAll('.template-item').forEach(item => item.classList.remove('active'));
    loadPublicWall(); // Go back to public wall after creating survey
};

window.handleOfferwallSubmit = function(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('input[type="text"]').value;
    const description = form.querySelector('textarea')?.value || 'Complete this offer';
    const rewardInput = form.querySelector('input[type="number"]');
    const reward = rewardInput ? rewardInput.value + ' points' : '100 points';
    
    let content = '';
    if (window.currentTemplate === 'offerwall-reward') {
        content = '<div><p style="color:#888; margin-bottom:20px;">Complete the requirements below to earn your reward!</p><ul style="list-style:none; padding:0;"><li style="padding:15px; background:#16162a; border-radius:8px; margin-bottom:10px;">✅ Sign up for free account</li><li style="padding:15px; background:#16162a; border-radius:8px; margin-bottom:10px;">✅ Verify your email</li><li style="padding:15px; background:#16162a; border-radius:8px; margin-bottom:10px;">✅ Complete profile</li></ul><button class="btn" style="margin-top:20px;" onclick="alert(\'Offer completed! Reward will be credited soon.\')">Claim Reward</button></div>';
    } else if (window.currentTemplate === 'offerwall-download') {
        content = '<div><p style="color:#888; margin-bottom:20px;">Download and try this app to earn rewards!</p><div style="padding:20px; background:#16162a; border-radius:8px; text-align:center;"><div style="font-size:3rem; margin-bottom:15px;">📱</div><p style="margin-bottom:20px;">Download the app and use it for 5 minutes</p><button class="btn" onclick="alert(\'Opening app store...\')">Download Now</button></div></div>';
    } else if (window.currentTemplate === 'offerwall-video') {
        content = '<div><p style="color:#888; margin-bottom:20px;">Watch this video to earn rewards!</p><div style="padding:20px; background:#16162a; border-radius:8px; text-align:center;"><div style="font-size:3rem; margin-bottom:15px;">🎥</div><p style="margin-bottom:20px;">Watch the full video (30 seconds)</p><button class="btn" onclick="alert(\'Playing video...\')">Watch Video</button></div></div>';
    } else {
        content = '<div><p style="color:#888; margin-bottom:20px;">Complete this task to earn rewards!</p><button class="btn" onclick="alert(\'Task completed! Reward will be credited soon.\')">Complete Task</button></div>';
    }
    
    window.wallItems.push({
        type: 'offer',
        title: title,
        description: description,
        content: content,
        reward: reward,
        duration: '5 min'
    });
    
    alert('Offer "' + title + '" posted successfully!');
    document.querySelectorAll('.template-item').forEach(item => item.classList.remove('active'));
    loadPublicWall(); // Go back to public wall after creating offer
};

// Initialize public wall when script loads
console.log('✅ Wall.js loaded - CPAlead integration ready');