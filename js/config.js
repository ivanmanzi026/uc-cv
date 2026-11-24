/**
 * ProCV - Configuration File
 * ==============================
 * IMPORTANT: Update this file with your actual values
 * 
 * 1. Firebase Config: Get from Firebase Console
 * 2. Backend URL: http://localhost:3000 (local development)
 */

// ============================================================
// 1. FIREBASE CONFIGURATION
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAbJ7moAGaFXvuAkE6KLnVAPGOy4gvur0g",
    authDomain: "yourcv-1.firebaseapp.com",
    projectId: "yourcv-1",
    storageBucket: "yourcv-1.firebasestorage.app",
    messagingSenderId: "148589960500",
    appId: "1:148589960500:web:4d230f9470ef4bb4b99961",
    measurementId: "G-7H2M2WD45R"
};

// ============================================================
// 2. BACKEND API CONFIGURATION
// ============================================================

const API_CONFIG = {
    baseUrl: "https://uc-cv.onrender.com",
    endpoints: {
        createPayment: "/api/create-payment",
        checkPayment: "/api/check-payment",
        userPlan: "/api/user-plan",
        webhook: "/api/webhook/jjuma"
    }
};

// ============================================================
// 3. APP CONFIGURATION
// ============================================================

const APP_CONFIG = {
    appName: 'ProCV',
    version: '1.0.0',
    storageKey: 'procv_data',
    templateKey: 'procv_template',
    userKey: 'procv_user',
    isProKey: 'procv_is_pro',
    proPrice: 2000,
    currency: 'RWF',
    cvsKey: 'procv_user_cvs_',
    templatesCacheKey: 'procv_firestore_templates'
};

// ============================================================
// 4. FIRESTORE HELPERS
// ============================================================

// Get Firestore instance
function getDB() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        return firebase.firestore();
    }
    return null;
}

// ============================================================
// 5. SYNC HELPERS - Firestore + LocalStorage
// ============================================================

/**
 * Save data to both Firestore and LocalStorage
 */
async function syncSave(collection, docId, data, localKey) {
    const results = { firestore: false, local: false };
    
    // Save to Firestore
    try {
        const db = getDB();
        if (db) {
            await db.collection(collection).doc(docId).set(data, { merge: true });
            results.firestore = true;
            console.log('✅ Saved to Firestore:', collection, docId);
        }
    } catch (error) {
        console.warn('⚠️ Firestore save failed:', error.message);
    }
    
    // Save to LocalStorage
    try {
        if (localKey) {
            localStorage.setItem(localKey, JSON.stringify(data));
            results.local = true;
            console.log('✅ Saved to LocalStorage:', localKey);
        }
    } catch (error) {
        console.warn('⚠️ LocalStorage save failed:', error.message);
    }
    
    return results;
}

/**
 * Load data from Firestore, fallback to LocalStorage
 */
async function syncLoad(collection, docId, localKey, defaultValue = null) {
    // Try Firestore first
    try {
        const db = getDB();
        if (db) {
            const doc = await db.collection(collection).doc(docId).get();
            if (doc.exists) {
                const data = { id: doc.id, ...doc.data() };
                // Update cache
                if (localKey) {
                    localStorage.setItem(localKey, JSON.stringify(data));
                }
                console.log('✅ Loaded from Firestore:', collection, docId);
                return data;
            }
        }
    } catch (error) {
        console.warn('⚠️ Firestore load failed:', error.message);
    }
    
    // Fallback to LocalStorage
    try {
        if (localKey) {
            const cached = localStorage.getItem(localKey);
            if (cached) {
                console.log('✅ Loaded from LocalStorage:', localKey);
                return JSON.parse(cached);
            }
        }
    } catch (error) {
        console.warn('⚠️ LocalStorage load failed:', error.message);
    }
    
    return defaultValue;
}

/**
 * Load collection from Firestore with cache
 */
async function syncLoadCollection(collection, localKey, filters = [], orderBy = null) {
    // Try Firestore first
    try {
        const db = getDB();
        if (db) {
            let query = db.collection(collection);
            
            filters.forEach(filter => {
                query = query.where(filter.field, filter.operator || '==', filter.value);
            });
            
            if (orderBy) {
                query = query.orderBy(orderBy.field, orderBy.direction || 'desc');
            }
            
            const snapshot = await query.get();
            const results = [];
            snapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            // Update cache
            if (localKey) {
                localStorage.setItem(localKey, JSON.stringify(results));
            }
            
            console.log('✅ Loaded collection from Firestore:', collection, results.length);
            return results;
        }
    } catch (error) {
        console.warn('⚠️ Firestore collection load failed:', error.message);
    }
    
    // Fallback to LocalStorage
    try {
        if (localKey) {
            const cached = localStorage.getItem(localKey);
            if (cached) {
                console.log('✅ Loaded from LocalStorage cache:', localKey);
                return JSON.parse(cached);
            }
        }
    } catch (error) {
        console.warn('⚠️ LocalStorage load failed:', error.message);
    }
    
    return [];
}

// ============================================================
// 6. EXPORTS
// ============================================================

// For browser
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
    window.API_CONFIG = API_CONFIG;
    window.APP_CONFIG = APP_CONFIG;
    window.getDB = getDB;
    window.syncSave = syncSave;
    window.syncLoad = syncLoad;
    window.syncLoadCollection = syncLoadCollection;
}

// For Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        FIREBASE_CONFIG, 
        API_CONFIG, 
        APP_CONFIG,
        getDB,
        syncSave,
        syncLoad,
        syncLoadCollection
    };
}

console.log('✅ ProCV Config loaded');
console.log('📌 Firebase Project:', FIREBASE_CONFIG.projectId);
console.log('📌 Backend URL:', API_CONFIG.baseUrl);
console.log('📌 Currency:', APP_CONFIG.currency);
