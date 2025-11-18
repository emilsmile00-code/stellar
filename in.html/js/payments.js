// payments.js - Pending Balance System with Gift Card Support
class PaymentSystem {
    constructor() {
        this.userBalance = 0;
        this.pendingBalance = 0;
        this.initializePayments();
    }

    async initializePayments() {
        console.log('💰 Payment system initializing...');
        
        // Load user balance when authenticated
        if (window.currentUser) {
            await this.loadUserBalance();
        }
        
        // Listen for auth state changes
        window.supabaseClient?.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.loadUserBalance();
            } else if (event === 'SIGNED_OUT') {
                this.userBalance = 0;
                this.pendingBalance = 0;
                this.updateBalanceDisplay();
            }
        });
    }

    async loadUserBalance() {
        if (!window.currentUser) return;
        
        try {
            console.log('💳 Loading user balance...');
            
            const { data, error } = await supabase
                .from('user_balances')
                .select('*')
                .eq('user_id', window.currentUser.id)
                .single();

            if (!error && data) {
                this.userBalance = parseFloat(data.available_balance) || 0;
                this.pendingBalance = parseFloat(data.pending_balance) || 0;
            } else {
                // Create initial balance record if doesn't exist
                await this.createInitialBalance();
            }
            
            this.updateBalanceDisplay();
            console.log('✅ Balance loaded - Available:', this.userBalance, 'Pending:', this.pendingBalance);
            
        } catch (error) {
            console.error('❌ Error loading balance:', error);
            this.userBalance = 0;
            this.pendingBalance = 0;
            this.updateBalanceDisplay();
        }
    }

    async createInitialBalance() {
        if (!window.currentUser) return;
        
        try {
            const { error } = await supabase
                .from('user_balances')
                .insert({
                    user_id: window.currentUser.id,
                    available_balance: 0,
                    pending_balance: 0,
                    total_earned: 0
                });

            if (!error) {
                console.log('✅ Initial balance record created');
            }
        } catch (error) {
            console.error('❌ Error creating balance record:', error);
        }
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('user-balance');
        const pendingElement = document.getElementById('user-pending');
        
        if (balanceElement) {
            balanceElement.textContent = `$${this.userBalance.toFixed(2)}`;
        }
        
        if (pendingElement) {
            pendingElement.textContent = `$${this.pendingBalance.toFixed(2)}`;
        }

        const userEmailDisplay = document.getElementById('user-email-display');
        if (userEmailDisplay) {
            userEmailDisplay.textContent = `${window.currentUser?.email || 'User'} ($${this.userBalance.toFixed(2)})`;
        }
    }

    // Add earnings to PENDING balance (when user completes offers)
    async addPendingEarnings(amount, source = 'offer') {
        if (amount <= 0) return;

        try {
            console.log(`💰 Adding pending earnings: $${amount} from ${source}`);
            
            const newPendingBalance = this.pendingBalance + amount;
            
            // Update database - only pending balance
            const { error } = await supabase
                .from('user_balances')
                .update({
                    pending_balance: newPendingBalance
                })
                .eq('user_id', window.currentUser.id);

            if (error) throw error;

            this.pendingBalance = newPendingBalance;
            this.updateBalanceDisplay();
            
            // Show pending notification
            this.showPendingNotification(amount, source);
            
        } catch (error) {
            console.error('❌ Failed to add pending earnings:', error);
        }
    }

    // Move funds from PENDING to AVAILABLE (when network confirms payment)
    async confirmPayment(amount, source = 'network') {
        if (amount <= 0 || amount > this.pendingBalance) {
            throw new Error('Invalid confirmation amount');
        }

        try {
            console.log(`✅ Confirming payment: $${amount} from ${source}`);
            
            const newAvailableBalance = this.userBalance + amount;
            const newPendingBalance = this.pendingBalance - amount;
            
            // Update database - move from pending to available
            const { error } = await supabase
                .from('user_balances')
                .update({
                    available_balance: newAvailableBalance,
                    pending_balance: newPendingBalance,
                    total_earned: supabase.rpc('increment', { x: amount })
                })
                .eq('user_id', window.currentUser.id);

            if (error) throw error;

            this.userBalance = newAvailableBalance;
            this.pendingBalance = newPendingBalance;
            this.updateBalanceDisplay();
            
            // Show confirmation notification
            this.showConfirmedNotification(amount, source);
            
            return { success: true, newAvailableBalance, newPendingBalance };
            
        } catch (error) {
            console.error('❌ Failed to confirm payment:', error);
            throw error;
        }
    }

    // Manual confirmation function (for testing/admin use)
    async confirmAllPending() {
        if (this.pendingBalance <= 0) {
            throw new Error('No pending balance to confirm');
        }

        try {
            const amount = this.pendingBalance;
            return await this.confirmPayment(amount, 'manual_batch');
        } catch (error) {
            console.error('❌ Failed to confirm all pending:', error);
            throw error;
        }
    }

    // Notification functions
    showPendingNotification(amount, source) {
        this.showNotification(
            `⏳ $${amount.toFixed(2)} pending from ${source}`,
            '#ffd700', // Yellow for pending
            'Pending funds will be available after network confirmation'
        );
    }

    showConfirmedNotification(amount, source) {
        this.showNotification(
            `✅ $${amount.toFixed(2)} confirmed from ${source}`,
            '#00ff88', // Green for confirmed
            'Funds are now available for withdrawal'
        );
    }

    showNotification(message, color, subtitle = '') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #16162a;
            color: ${color};
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid ${color};
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">${message.includes('pending') ? '⏳' : '💰'}</span>
                <div>
                    <div style="font-weight: bold;">${message}</div>
                    ${subtitle ? `<div style="font-size: 0.8rem; color: #aaa; margin-top: 4px;">${subtitle}</div>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ======================================
    // PAYOUT SETTINGS METHODS WITH GIFT CARD
    // ======================================

    async savePayoutSettings(payoutMethod, payoutAddress) {
        try {
            // Validation based on payment method
            if (payoutMethod === 'crypto') {
                if (!payoutAddress || payoutAddress.trim().length < 10) {
                    throw new Error('Please enter a valid wallet address (minimum 10 characters)');
                }
            } else if (payoutMethod === 'giftcard') {
                if (!payoutAddress || payoutAddress.trim().length < 5) {
                    throw new Error('Please enter a valid email address for gift card delivery');
                }
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(payoutAddress.trim())) {
                    throw new Error('Please enter a valid email address');
                }
            }

            const { error } = await supabase
                .from('user_balances')
                .update({ 
                    payout_method: payoutMethod,
                    payout_address: payoutAddress.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', window.currentUser.id);

            if (error) throw error;
            
            console.log('✅ Payout settings saved:', { payoutMethod, payoutAddress });
            this.showNotification('✅ Payout settings saved successfully!', '#00ff88');
            closePayoutSettings();
            
        } catch (error) {
            console.error('❌ Error saving payout settings:', error);
            this.showNotification('Error: ' + error.message, '#ff4444');
        }
    }

    async loadPayoutSettings() {
        try {
            const { data, error } = await supabase
                .from('user_balances')
                .select('payout_method, payout_address')
                .eq('user_id', window.currentUser.id)
                .single();

            if (error) throw error;
            
            return data || { payout_method: 'crypto', payout_address: '' };
            
        } catch (error) {
            console.error('❌ Error loading payout settings:', error);
            return { payout_method: 'crypto', payout_address: '' };
        }
    }

    // ======================================
    // CHECK PAYOUT ELIGIBILITY
    // ======================================

    async checkPayoutEligibility() {
        try {
            const { data, error } = await supabase
                .from('user_balances')
                .select('available_balance, first_activity_date, payout_address, payout_method')
                .eq('user_id', window.currentUser.id)
                .single();

            if (error) throw error;

            const now = new Date();
            const firstActivity = new Date(data.first_activity_date);
            const daysSinceJoin = Math.floor((now - firstActivity) / (1000 * 60 * 60 * 24));
            
            return {
                hasMinBalance: parseFloat(data.available_balance) >= 5.00,
                hasMinActivity: daysSinceJoin >= 7,
                hasWallet: !!data.payout_address,
                currentBalance: parseFloat(data.available_balance),
                daysActive: daysSinceJoin,
                payoutMethod: data.payout_method || 'crypto'
            };
            
        } catch (error) {
            console.error('❌ Error checking payout eligibility:', error);
            return { hasMinBalance: false, hasMinActivity: false, hasWallet: false, currentBalance: 0, daysActive: 0, payoutMethod: 'crypto' };
        }
    }
}

// Initialize payment system
window.paymentSystem = new PaymentSystem();

// ======================================
// GLOBAL PAYOUT FUNCTIONS
// ======================================

// Show payout settings modal
function showPayoutSettings() {
    if (window.currentUser) {
        closeUserDropdown(); // Close any open dropdowns
        document.getElementById('payout-settings-modal').style.display = 'block';
        loadPayoutSettingsUI();
    } else {
        openAuthModal('login');
    }
}

// Close payout settings modal
function closePayoutSettings() {
    document.getElementById('payout-settings-modal').style.display = 'none';
}

// Load settings into the modal
async function loadPayoutSettingsUI() {
    if (window.paymentSystem && window.currentUser) {
        const settings = await window.paymentSystem.loadPayoutSettings();
        const eligibility = await window.paymentSystem.checkPayoutEligibility();
        
        // Fill form fields
        document.getElementById('payout-method').value = settings.payout_method || 'crypto';
        document.getElementById('payout-address').value = settings.payout_address || '';
        
        // Update placeholder based on selected method
        updatePayoutAddressPlaceholder(settings.payout_method || 'crypto');
        
        // Update eligibility display
        updateEligibilityDisplay(eligibility);
    }
}

// Update placeholder text when payment method changes
function updatePayoutAddressPlaceholder(method) {
    const addressInput = document.getElementById('payout-address');
    if (!addressInput) return;
    
    switch(method) {
        case 'crypto':
            addressInput.placeholder = 'Enter your USDT, BTC, or ETH wallet address';
            addressInput.type = 'text';
            break;
        case 'giftcard':
            addressInput.placeholder = 'Enter your email address for gift card delivery';
            addressInput.type = 'email';
            break;
        case 'bank':
            addressInput.placeholder = 'Bank transfer (Coming Soon)';
            addressInput.type = 'text';
            break;
    }
}

// Update eligibility status in modal
function updateEligibilityDisplay(eligibility) {
    const eligibilityElement = document.getElementById('payout-eligibility');
    if (!eligibilityElement) return;

    const requirements = [
        { met: eligibility.hasMinBalance, text: `Minimum $5.00 balance (Current: $${eligibility.currentBalance.toFixed(2)})` },
        { met: eligibility.hasMinActivity, text: `7 days activity (You: ${eligibility.daysActive} days)` },
        { met: eligibility.hasWallet, text: `Payment details set (${eligibility.payoutMethod})` }
    ];

    const allMet = requirements.every(req => req.met);
    
    let html = `<h4 style="color: ${allMet ? '#00ff88' : '#ffd700'}; margin: 0 0 10px 0;">
        ${allMet ? '✅ Eligible for Payout' : '📋 Payout Requirements'}
    </h4><ul style="color: #ccc; font-size: 0.9rem; margin: 0; padding-left: 20px;">`;
    
    requirements.forEach(req => {
        html += `<li style="color: ${req.met ? '#00ff88' : '#ff8888'};">${req.met ? '✅' : '❌'} ${req.text}</li>`;
    });
    
    html += `</ul>`;
    
    if (allMet) {
        html += `<p style="color: #00ff88; margin: 10px 0 0 0; font-weight: bold;">
            🎉 You're eligible for Friday payouts!
        </p>`;
    }
    
    eligibilityElement.innerHTML = html;
}

// Save payout settings from modal
async function savePayoutSettings() {
    const payoutMethod = document.getElementById('payout-method').value;
    const payoutAddress = document.getElementById('payout-address').value.trim();
    
    if (window.paymentSystem) {
        await window.paymentSystem.savePayoutSettings(payoutMethod, payoutAddress);
        // Reload eligibility after saving
        setTimeout(loadPayoutSettingsUI, 500);
    }
}

// Add event listener for payment method changes
document.addEventListener('DOMContentLoaded', function() {
    const payoutMethodSelect = document.getElementById('payout-method');
    if (payoutMethodSelect) {
        payoutMethodSelect.addEventListener('change', function() {
            updatePayoutAddressPlaceholder(this.value);
        });
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('payout-settings-modal');
    if (event.target === modal) {
        closePayoutSettings();
    }
});