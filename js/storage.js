/**
 * ProCV - Storage Module
 * Handles localStorage for now with Firebase integration points
 */

// ===== LOCAL STORAGE =====
const STORAGE_KEY = 'procv_data';
const TEMPLATE_KEY = 'procv_template';

/**
 * Save CV data to localStorage
 */
function saveToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Load CV data from localStorage
 */
function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

/**
 * Save selected template to localStorage
 */
function saveTemplateToStorage(template) {
    try {
        localStorage.setItem(TEMPLATE_KEY, template);
        return true;
    } catch (error) {
        console.error('Error saving template:', error);
        return false;
    }
}

/**
 * Load selected template from localStorage
 */
function loadTemplateFromStorage() {
    try {
        return localStorage.getItem(TEMPLATE_KEY) || 'classic';
    } catch (error) {
        console.error('Error loading template:', error);
        return 'classic';
    }
}

/**
 * Clear all CV data from localStorage
 */
function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TEMPLATE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}

/**
 * Check if there's saved data
 */
function hasSavedData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

// ===== FIREBASE STORAGE INTEGRATION POINT =====
/**
 * ===== FIREBASE SAVE FUNCTION =====
 * To save CV data to Firebase:
 * 
 * async function saveToFirebase(userId, cvData) {
 *     try {
 *         const docRef = doc(db, 'cvs', userId);
 *         await setDoc(docRef, {
 *             ...cvData,
 *             updatedAt: new Date().toISOString(),
 *             template: loadTemplateFromStorage()
 *         });
 *         return true;
 *     } catch (error) {
 *         console.error('Error saving to Firebase:', error);
 *         return false;
 *     }
 * }
 */

/**
 * ===== FIREBASE LOAD FUNCTION =====
 * To load CV data from Firebase:
 * 
 * async function loadFromFirebase(userId) {
 *     try {
 *         const docRef = doc(db, 'cvs', userId);
 *         const docSnap = await getDoc(docRef);
 *         if (docSnap.exists()) {
 *             return docSnap.data();
 *         }
 *         return null;
 *     } catch (error) {
 *         console.error('Error loading from Firebase:', error);
 *         return null;
 *     }
 * }
 */

/**
 * ===== FIREBASE AUTO-SAVE =====
 * To auto-save to Firebase when user makes changes:
 * 
 * function autoSaveToFirebase(userId, cvData) {
 *     // Debounce the save to avoid too many writes
 *     clearTimeout(window._saveTimeout);
 *     window._saveTimeout = setTimeout(() => {
 *         saveToFirebase(userId, cvData);
 *     }, 1000);
 * }
 */

// ===== ADMIN DASHBOARD INTEGRATION =====
/**
 * ===== ADMIN DATA ACCESS =====
 * For the admin dashboard to access user CVs:
 * 
 * async function getAllUserCVs() {
 *     try {
 *         const q = query(collection(db, 'cvs'));
 *         const querySnapshot = await getDocs(q);
 *         const cvs = [];
 *         querySnapshot.forEach((doc) => {
 *             cvs.push({
 *                 id: doc.id,
 *                 ...doc.data()
 *             });
 *         });
 *         return cvs;
 *     } catch (error) {
 *         console.error('Error fetching all CVs:', error);
 *         return [];
 *     }
 * }
 */

// ===== EXPORT =====
// For use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToStorage,
        loadFromStorage,
        saveTemplateToStorage,
        loadTemplateFromStorage,
        clearStorage,
        hasSavedData
    };
}

















































































































































































































































































































































































































