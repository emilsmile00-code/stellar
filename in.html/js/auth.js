// ======================================
// SUPABASE SETUP & AUTHENTICATION
// ======================================
const ADMIN_EMAIL = 'emilsmile00@gmail.com';

// Use the global client from tracking.js instead of creating a new one
const supabase = window.supabaseClient;

let currentUser = null;
let currentSession = null;

// Expose currentUser globally for payments.js
window.currentUser = null;

// Check auth state on load
supabase.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    currentUser = session?.user ?? null;
    window.currentUser = currentUser; // ✅ ADDED: Expose globally
    updateUIForAuth();
    
    if (event === 'SIGNED_IN') {
        closeAuthModal();
        showAuthMessage('Successfully logged in!', 'success');
    }
});

// Initialize auth check
supabase.auth.getSession().then(({ data: { session } }) => {
    currentSession = session;
    currentUser = session?.user ?? null;
    window.currentUser = currentUser; // ✅ ADDED: Expose globally
    updateUIForAuth();
});

function updateUIForAuth() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const adminSidebar = document.getElementById('admin-sidebar');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'inline-block';
        document.getElementById('user-email-display').textContent = currentUser.email;
        
        // Check if user is admin
        const isAdmin = currentUser.email === ADMIN_EMAIL;
        window.isAdminMode = isAdmin;
        
        if (adminSidebar && isAdmin) {
            adminSidebar.style.display = 'block';
        } else if (adminSidebar) {
            adminSidebar.style.display = 'none';
        }
        
        // Refresh wall if on wall page
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id === 'wall-page') {
            if (isAdmin) {
                document.getElementById('wall-content').innerHTML = '<div class="empty-state"><div class="icon">📝</div><h3>Select a Template</h3><p>Choose a template from the sidebar to start creating your content.</p></div>';
            } else {
                loadOGAdsOffers();
            }
        }
    } else {
        authButtons.style.display = 'block';
        userMenu.style.display = 'none';
        window.isAdminMode = false;
        if (adminSidebar) {
            adminSidebar.style.display = 'none';
        }
    }
}

// Auth Modal Functions
function openAuthModal(tab = 'login') {
    document.getElementById('auth-modal').classList.add('active');
    switchAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
    showAuthMessage('', 'error', true);
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
    showAuthMessage('', 'error', true);
}

function showAuthMessage(message, type, hide = false) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (hide) {
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        return;
    }
    
    if (type === 'error') {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
    } else {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        showAuthMessage('Login successful!', 'success');
    } catch (error) {
        showAuthMessage(error.message || 'Login failed. Please try again.', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        showAuthMessage('Account created! You can now login.', 'success');
        setTimeout(() => switchAuthTab('login'), 2000);
    } catch (error) {
        showAuthMessage(error.message || 'Sign up failed. Please try again.', 'error');
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        closeUserDropdown();
        showPage('home');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('active');
}

function closeUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.remove('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    if (userMenu && !userMenu.contains(event.target)) {
        closeUserDropdown();
    }
});