/**
 * ProCV - Node.js Backend Server
 * Complete working version with correct Jjuma API endpoints
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. JJUMA CONFIGURATION
// ============================================================
// IMPORTANT: These come from .env file
const JJUMA_CONFIG = {
    publicKey: process.env.JJUMA_PUBLIC_KEY,
    secretKey: process.env.JJUMA_SECRET_KEY,
    apiUrl: process.env.JJUMA_API_URL || 'https://api.jjuma.com',
    currency: process.env.JJUMA_CURRENCY || 'RWF'
};

console.log('\n🔐 JJUMA CONFIGURATION:');
console.log('📌 API URL:', JJUMA_CONFIG.apiUrl);
console.log('📌 Public Key set:', !!JJUMA_CONFIG.publicKey);
console.log('📌 Secret Key set:', !!JJUMA_CONFIG.secretKey);

// ============================================================
// 2. FIREBASE ADMIN INITIALIZATION
// ============================================================
let db = null;
let firebaseInitialized = false;

try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        db = admin.firestore();
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
}

// ============================================================
// 3. MIDDLEWARE
// ============================================================
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5500',
    'https://uc-cv-jykq.onrender.com'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// ============================================================
// 4. HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        firebase: firebaseInitialized ? 'connected' : 'demo mode',
        jjuma: JJUMA_CONFIG.publicKey ? 'configured' : 'missing keys',
        jjumaApiUrl: JJUMA_CONFIG.apiUrl
    });
});

// ============================================================
// 5. CREATE PAYMENT (FIXED ENDPOINT)
// ============================================================
app.post('/api/create-payment', async (req, res) => {
    console.log('\n📝 Create Payment Request:');
    console.log('   Body:', req.body);

    const { userId, email, name, amount = 2000, plan = 'pro', phone = '' } = req.body;

    if (!userId || !email) {
        return res.status(400).json({
            success: false,
            error: 'User ID and email are required'
        });
    }

    const txRef = `PROCV-${userId.substring(0, 8)}-${Date.now()}`;

    console.log('   Transaction Reference:', txRef);
    console.log('   Amount:', amount, JJUMA_CONFIG.currency);

    try {
        // ===== CORRECT ENDPOINT =====
        // https://api.jjuma.com/api/v1/payments/create
        const endpoint = `${JJUMA_CONFIG.apiUrl}/api/v1/payments/create`;
        console.log('   Endpoint:', endpoint);

        const requestData = {
            amount: amount,
            currency: JJUMA_CONFIG.currency,
            description: `ProCV Pro Plan - ${plan}`,
            customer_name: name || 'Customer',
            customer_email: email,
            customer_phone: phone || '',
            redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment-callback.html`,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment-callback.html`,
            cancel_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment-callback.html?status=cancelled`,
            webhook_url: `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/webhook/jjuma`,
            metadata: {
                user_id: userId,
                plan: plan
            },
            external_order_id: txRef,
            idempotency_key: txRef,
            provider: 'jjuma'
        };

        console.log('   Request Data:', JSON.stringify(requestData, null, 2));

        // Use the PUBLIC key for creating payments (as per documentation)
        const response = await axios.post(
            endpoint,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${JJUMA_CONFIG.publicKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ Payment created successfully');
        console.log('   Response Status:', response.status);
        console.log('   Response Data:', JSON.stringify(response.data, null, 2));

        // Store payment record in Firestore
        if (db) {
            try {
                await db.collection('payments').doc(txRef).set({
                    userId: userId,
                    email: email,
                    name: name || 'Customer',
                    amount: amount,
                    currency: JJUMA_CONFIG.currency,
                    plan: plan,
                    status: 'pending',
                    txRef: txRef,
                    jjumaTransactionId: response.data.data?.transaction_id || null,
                    paymentUrl: response.data.data?.payment_url || null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('   💾 Payment record saved to Firestore');
            } catch (dbError) {
                console.warn('   ⚠️ Could not save to Firestore:', dbError.message);
            }
        }

        res.json({
            success: true,
            checkout_url: response.data.data?.payment_url,
            transaction_id: txRef,
            jjumaTransactionId: response.data.data?.transaction_id
        });

    } catch (error) {
        console.error('❌ Payment creation error:');
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code === 'ENOTFOUND') {
            console.error('   ❌ DNS Error: Cannot resolve', JJUMA_CONFIG.apiUrl);
            console.error('   Check your internet connection and API URL');
        } else if (error.request) {
            console.error('   No response received from Jjuma API');
        } else {
            console.error('   Error:', error.message);
        }
        
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message,
            details: error.response?.data || null
        });
    }
});

// ============================================================
// 6. JJUMA WEBHOOK
// ============================================================
app.post('/api/webhook/jjuma', async (req, res) => {
    console.log('\n📨 Webhook received at:', new Date().toISOString());
    
    try {
        const payload = req.body;
        console.log('   Payload:', JSON.stringify(payload, null, 2));

        const { event, data } = payload;

        if (event === 'payment.completed') {
            console.log('✅ Payment completed event received');
            
            const userId = data.metadata?.user_id || data.customer?.user_id || '';
            const txRef = data.external_order_id || data.reference || '';
            const transactionId = data.transaction_id || '';
            const amount = data.amount || 0;

            if (!userId) {
                console.warn('⚠️ No user ID found in webhook data');
                res.status(200).json({ received: true });
                return;
            }

            console.log(`   User ID: ${userId}`);
            console.log(`   Transaction: ${transactionId}`);

            if (db) {
                try {
                    await db.collection('payments').doc(txRef).update({
                        status: 'succeeded',
                        jjumaTransactionId: transactionId,
                        amountPaid: amount,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('   💾 Payment record updated');

                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    await db.collection('users').doc(userId).set({
                        plan: 'pro',
                        subscriptionStatus: 'active',
                        subscriptionStart: admin.firestore.FieldValue.serverTimestamp(),
                        subscriptionEnd: expiryDate.toISOString(),
                        lastPayment: {
                            amount: amount,
                            txRef: txRef,
                            date: admin.firestore.FieldValue.serverTimestamp()
                        },
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    console.log(`   ✅ User ${userId} upgraded to Pro!`);

                } catch (dbError) {
                    console.error('   ❌ Error updating Firestore:', dbError.message);
                }
            }
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(200).json({ received: true });
    }
});

// ============================================================
// 7. CHECK PAYMENT STATUS
// ============================================================
app.post('/api/check-payment', async (req, res) => {
    console.log('\n🔍 Check Payment Request:');
    console.log('   Body:', req.body);

    const { transactionId, userId } = req.body;

    if (!transactionId || !userId) {
        return res.status(400).json({
            success: false,
            error: 'Transaction ID and User ID are required'
        });
    }

    try {
        if (!db) {
            return res.json({
                success: true,
                status: 'succeeded',
                plan: 'pro',
                isPro: true,
                demo: true
            });
        }

        const paymentDoc = await db.collection('payments').doc(transactionId).get();

        if (!paymentDoc.exists) {
            return res.json({
                success: false,
                status: 'not_found'
            });
        }

        const payment = paymentDoc.data();

        if (payment.userId !== userId) {
            return res.json({
                success: false,
                status: 'unauthorized'
            });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        const isPro = userData.plan === 'pro' && userData.subscriptionStatus === 'active';

        res.json({
            success: true,
            status: payment.status,
            plan: userData.plan || 'free',
            subscriptionStatus: userData.subscriptionStatus || 'inactive',
            subscriptionEnd: userData.subscriptionEnd || null,
            isPro: isPro
        });

    } catch (error) {
        console.error('❌ Error checking payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// 8. DIRECT UPGRADE (Fallback)
// ============================================================
app.post('/api/upgrade-user', async (req, res) => {
    console.log('\n⬆️ Direct Upgrade Request:');
    console.log('   Body:', req.body);

    const { userId, email, plan = 'pro' } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }

    try {
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Firebase not connected'
            });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await db.collection('users').doc(userId).set({
            plan: 'pro',
            subscriptionStatus: 'active',
            subscriptionStart: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionEnd: expiryDate.toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`   ✅ User ${userId} upgraded to Pro!`);

        res.json({
            success: true,
            message: 'User upgraded to Pro successfully',
            plan: 'pro',
            subscriptionEnd: expiryDate.toISOString()
        });

    } catch (error) {
        console.error('❌ Error upgrading user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================
// 9. START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║    🚀  PROCV BACKEND SERVER STARTED SUCCESSFULLY        ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║   📍 Server URL:    http://localhost:${PORT}              ║`);
    console.log(`║   📌 Health Check:  http://localhost:${PORT}/health       ║`);
    console.log(`║   📌 Jjuma API:     ${JJUMA_CONFIG.apiUrl}/api/v1          ║`);
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║   🔐 Firebase: ${firebaseInitialized ? '✅ Connected' : '⚠️ Demo Mode'}                    ║`);
    console.log(`║   🔐 Jjuma:    ${JJUMA_CONFIG.publicKey ? '✅ Configured' : '❌ Missing Keys'}               ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');
});
