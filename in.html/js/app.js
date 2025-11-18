// ======================================
// GLOBAL VARIABLES AND INITIALIZATION
// ======================================
window.currentNews = { tech: [], finance: [], gambling: [], fashion: [], lifestyle: [] };
window.isAdminMode = false;
window.wallItems = [];

// ======================================
// MOBILE MENU FUNCTIONS
// ======================================

window.toggleMobileMenu = function() {
    console.log('📱 Toggling mobile menu...');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    }
};

window.closeMobileMenu = function() {
    console.log('📱 Closing mobile menu...');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) hamburger.classList.remove('active');
    if (navLinks) navLinks.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// ======================================
// NAVIGATION FUNCTIONS WITH AUTH CHECK
// ======================================
window.showPage = function(pageName) {
    console.log('📄 Navigating to:', pageName);
    
    // ⭐ CHECK AUTHENTICATION FOR WALL PAGE
    if (pageName === 'wall') {
        if (!window.currentUser) {
            console.log('🔒 Wall page requires authentication');
            // Show login modal instead
            openAuthModal('login');
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification('Please login to access the Offer Wall', 'error');
            }
            return; // Stop navigation
        }
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeNav = document.getElementById('nav-' + pageName);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Load wall page content
    if (pageName === 'wall') {
        console.log('🎯 Loading Wall page...');
        
        // ⭐ CHECK IF USER HAS SEEN GUIDELINES (First-time check)
        checkFirstWallVisit();
        
        if (window.isAdminMode) {
            // Admin sees templates
            const wallContent = document.getElementById('wall-content');
            if (wallContent) {
                wallContent.innerHTML = '<div class="empty-state"><div class="icon">📝</div><h3>Select a Template</h3><p>Choose a template from the sidebar to start creating your content.</p></div>';
            }
        } else {
            // Regular users see offers
            console.log('💰 User mode - loading offers');
            
            // Clear any existing content first
            const wallContent = document.getElementById('wall-content');
            if (wallContent) {
                wallContent.innerHTML = `
                    <div id="public-wall">
                        <h2 style="color: #00d4ff; margin-bottom: 30px; font-size: 2rem;">💸 Available Offers</h2>
                        <div class="grid grid-2" id="wall-items">
                            <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 60px 20px;">
                                <div class="loading-spinner"></div>
                                <p style="margin-top: 20px; font-size: 1.1rem;">Preparing offers...</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                if (typeof loadPublicWall === 'function') {
                    loadPublicWall();
                }
            }, 100);
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
};

// ======================================
// POST CARD CREATION
// ======================================
function createPostCard(post, section) {
    const date = new Date(post.published_at).toLocaleDateString();
    const excerpt = post.excerpt || (post.content ? post.content.substring(0, 120) + '...' : '');
    const imageUrl = post.image_url;
    
    // Get section-specific icon for placeholder
    const getPlaceholderIcon = (category) => {
        switch(category) {
            case 'tech': return '💻';
            case 'finance': return '💰';
            case 'gambling': return '🎰';
            case 'fashion': return '👗';
            case 'lifestyle': return '🌟';
            default: return '📰';
        }
    };
    
    const placeholderIcon = getPlaceholderIcon(section);
    
    return `
        <div class="post-card ${section}">
            <div class="image-preview">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${post.title}" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span>${placeholderIcon}</span><p>Featured Image</p></div>'">` :
                    `<div class="image-placeholder"><span>${placeholderIcon}</span><p>Featured Image</p></div>`
                }
            </div>
            <h3>${post.title}</h3>
            <div class="meta">${date} • ${section}</div>
            <p>${excerpt}</p>
            <a class="read-more" href="${post.external_url || '#'}" target="_blank" rel="noopener noreferrer">Read More →</a>
        </div>
    `;
}

function loadPostsForPage(pageName) {
    console.log('📄 Loading posts for page:', pageName);
    
    if (window.currentNews[pageName] && window.currentNews[pageName].length > 0) {
        const postsContainer = document.getElementById(`${pageName}-posts`);
        if (postsContainer) {
            postsContainer.innerHTML = window.currentNews[pageName]
                .map(post => createPostCard(post, pageName))
                .join('');
        }
    }
}

// ======================================
// INITIALIZATION
// ======================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Stellar...');
    
    // Display placeholder content immediately
    displayPlaceholderContent();
    
    // Fetch fresh news in background
    setTimeout(() => {
        fetchLatestNews();
    }, 500);
    
    console.log('✅ Stellar initialized successfully!');
});