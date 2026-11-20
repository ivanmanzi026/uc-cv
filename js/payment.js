/**
 * ProCV - Payment Module
 * Handles Jjuma payment integration with proper status checking
 */

console.log('💳 payment.js loading...');

// ============================================================
// API CONFIGURATION
// ============================================================
const API_BASE_URL = 'http://localhost:3000';

// ============================================================
// INITIATE PAYMENT
// ============================================================
function initiatePayment(plan = 'pro') {
    console.log('💰 Initiating payment...');
    
    if (typeof isUserLoggedIn !== 'undefined' && !isUserLoggedIn()) {
        if (typeof openLoginModal !== 'undefined') {
            openLoginModal();
        }
        return;
    }

    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!user) {
        showToast('Please login first', 'error');
        return;
    }

    const paymentData = {
        userId: user.uid,
        email: user.email || '',
        name: user.displayName || user.email || 'Customer',
        amount: 2000,
        plan: plan,
        phone: ''
    };

    showPaymentModal(paymentData);
}

// ============================================================
// SHOW PAYMENT MODAL
// ============================================================
function showPaymentModal(paymentData) {
    console.log('📋 Showing payment modal');
    
    let modal = document.getElementById('paymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-crown" style="color:#F59E0B;"></i> Upgrade to Pro</h3>
                    <button class="modal-close" onclick="closePaymentModal()">×</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:48px;">👑</div>
                        <h4 style="margin-top:8px;">ProCV Pro</h4>
                        <p style="color:var(--gray-600);">Unlock all premium features</p>
                        <div style="font-size:28px;font-weight:800;color:var(--primary);margin:12px 0;">
                            RWF 2,000
                        </div>
                        <p style="font-size:13px;color:var(--gray-500);">One-time payment • Lifetime access</p>
                    </div>
                    
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <div class="payment-option" onclick="payWithCard()" style="cursor:pointer;padding:16px;border:2px solid var(--gray-200);border-radius:8px;display:flex;align-items:center;gap:12px;transition:all 0.3s;">
                            <i class="fas fa-credit-card" style="font-size:24px;color:var(--primary);"></i>
                            <div>
                                <div style="font-weight:600;">Pay with Card</div>
                                <div style="font-size:13px;color:var(--gray-500);">Visa / Mastercard</div>
                            </div>
                            <i class="fas fa-chevron-right" style="margin-left:auto;color:var(--gray-400);"></i>
                        </div>
                        
                        <div class="payment-option" onclick="payWithMobileMoney('mtn')" style="cursor:pointer;padding:16px;border:2px solid var(--gray-200);border-radius:8px;display:flex;align-items:center;gap:12px;transition:all 0.3s;">
                            <i class="fas fa-mobile-alt" style="font-size:24px;color:#FFB300;"></i>
                            <div>
                                <div style="font-weight:600;">MTN Mobile Money</div>
                                <div style="font-size:13px;color:var(--gray-500);">Pay with MTN MoMo</div>
                            </div>
                            <i class="fas fa-chevron-right" style="margin-left:auto;color:var(--gray-400);"></i>
                        </div>
                        
                        <div class="payment-option" onclick="payWithMobileMoney('airtel')" style="cursor:pointer;padding:16px;border:2px solid var(--gray-200);border-radius:8px;display:flex;align-items:center;gap:12px;transition:all 0.3s;">
                            <i class="fas fa-mobile-alt" style="font-size:24px;color:#E74C3C;"></i>
                            <div>
                                <div style="font-weight:600;">Airtel Money</div>
                                <div style="font-size:13px;color:var(--gray-500);">Pay with Airtel Money</div>
                            </div>
                            <i class="fas fa-chevron-right" style="margin-left:auto;color:var(--gray-400);"></i>
                        </div>
                    </div>
                    
                    <div style="margin-top:16px;padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;font-size:12px;color:#92400e;">
                        <i class="fas fa-lock"></i> 
                        Secure payment powered by Flutterwave
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.dataset.paymentData = JSON.stringify(paymentData);
    modal.classList.add('active');
}

// ============================================================
// CLOSE PAYMENT MODAL
// ============================================================
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================
// PAY WITH CARD
// ============================================================
function payWithCard() {
    const modal = document.getElementById('paymentModal');
    const paymentData = JSON.parse(modal.dataset.paymentData || '{}');
    initializeFlutterwavePayment(paymentData, 'card');
}

// ============================================================
// PAY WITH MOBILE MONEY
// ============================================================
function payWithMobileMoney(network) {
    const modal = document.getElementById('paymentModal');
    const paymentData = JSON.parse(modal.dataset.paymentData || '{}');
    initializeFlutterwavePayment(paymentData, network);
}

// ============================================================
// INITIALIZE FLUTTERWAVE PAYMENT
// ============================================================
function initializeFlutterwavePayment(paymentData, paymentType) {
    console.log('💳 Initializing payment...');
    closePaymentModal();
    showToast('Processing payment...', 'info');

    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    
    // Create payment on backend
    fetch(`${API_BASE_URL}/api/create-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: user?.uid || paymentData.userId,
            email: user?.email || paymentData.email,
            name: user?.displayName || paymentData.name,
            amount: paymentData.amount || 2000,
            plan: paymentData.plan || 'pro',
            phone: paymentData.phone || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('📊 Payment response:', data);
        
        if (data.success && data.checkout_url) {
            // Store transaction ID for checking status later
            localStorage.setItem('current_transaction', data.transaction_id);
            
            console.log('🔗 Redirecting to:', data.checkout_url);
            // Redirect to Jjuma checkout
            window.location.href = data.checkout_url;
        } else {
            console.error('❌ Payment creation failed:', data);
            showToast('Payment creation failed: ' + (data.error || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('❌ Payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    });
}

// ============================================================
// CHECK PAYMENT STATUS
// ============================================================
async function checkPaymentStatus(transactionId) {
    console.log('🔍 Checking payment status:', transactionId);
    
    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!user) {
        showToast('Please login to check payment status', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/check-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transactionId: transactionId,
                userId: user.uid
            })
        });

        const data = await response.json();
        console.log('📊 Payment status:', data);

        if (data.success) {
            if (data.status === 'succeeded' && data.isPro) {
                showToast('🎉 Payment successful! You are now a Pro user!');
                localStorage.setItem('procv_is_pro', 'true');
                updateUserProfileUI();
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else if (data.status === 'pending') {
                showToast('⏳ Payment is still processing. Please wait...', 'info');
                // Check again after 5 seconds
                setTimeout(() => {
                    checkPaymentStatus(transactionId);
                }, 5000);
            } else if (data.status === 'failed') {
                showToast('❌ Payment failed. Please try again.', 'error');
            } else {
                showToast('Payment status: ' + data.status, 'info');
            }
        } else {
            showToast('Error checking payment status: ' + (data.error || 'Unknown error'), 'error');
        }

        return data;
    } catch (error) {
        console.error('❌ Error checking payment:', error);
        showToast('Error checking payment status', 'error');
        return null;
    }
}

// ============================================================
// UPDATE USER PROFILE UI
// ============================================================
function updateUserProfileUI() {
    const planBadge = document.querySelector('.plan-badge');
    if (planBadge) {
        planBadge.textContent = '⭐ PRO';
        planBadge.className = 'plan-badge pro';
    }
}

// ============================================================
// HANDLE PAYMENT CALLBACK
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Checking for payment callback...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const txRef = urlParams.get('tx_ref');
    const transactionId = urlParams.get('transaction_id');
    
    if (status === 'successful' && (txRef || transactionId)) {
        const id = txRef || transactionId;
        console.log('📨 Payment callback detected:', id);
        setTimeout(() => {
            checkPaymentStatus(id);
        }, 2000);
    }
    
    const pendingTx = localStorage.getItem('current_transaction');
    if (pendingTx && !status) {
        setTimeout(() => {
            checkPaymentStatus(pendingTx);
        }, 3000);
    }
});

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.className = 'toast-container';
        document.body.appendChild(newContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.textContent = message;
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.initiatePayment = initiatePayment;
window.payWithCard = payWithCard;
window.payWithMobileMoney = payWithMobileMoney;
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.checkPaymentStatus = checkPaymentStatus;

console.log('✅ payment.js loaded');