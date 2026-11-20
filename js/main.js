/**
 * ProCV - Main JavaScript
 * Global functionality for all pages
 * Syncs Firestore + LocalStorage
 */

console.log('📁 main.js loading...');

// ============================================================
// DEBOUNCE FUNCTION (FIXED - was missing)
// ============================================================
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ============================================================
// GET URL PARAMS
// ============================================================
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// ============================================================
// MY CVs STORAGE FUNCTIONS
// ============================================================
function getUserCvs(userId) {
    const key = `${APP_CONFIG.cvsKey}${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveUserCvs(userId, cvs) {
    const key = `${APP_CONFIG.cvsKey}${userId}`;
    localStorage.setItem(key, JSON.stringify(cvs));
}

function saveCvToUser(userId, cvData) {
    const cvs = getUserCvs(userId);
    cvData.id = cvData.id || Date.now().toString();
    cvData.createdAt = cvData.createdAt || new Date().toISOString();
    cvData.updatedAt = new Date().toISOString();
    
    const existingIndex = cvs.findIndex(c => c.id === cvData.id);
    if (existingIndex !== -1) {
        cvs[existingIndex] = cvData;
    } else {
        cvs.push(cvData);
    }
    
    saveUserCvs(userId, cvs);
    
    // Also try to save to Firestore
    if (typeof saveCVToFirestore !== 'undefined') {
        saveCVToFirestore(cvData.data, cvData.templateId, cvData.isPortfolio);
    }
    
    return cvData;
}

function deleteUserCv(userId, cvId) {
    const cvs = getUserCvs(userId);
    const filtered = cvs.filter(c => c.id !== cvId);
    saveUserCvs(userId, filtered);
    
    // Also delete from Firestore
    try {
        const db = getDB();
        if (db) {
            db.collection('cvs').where('userId', '==', userId).where('id', '==', cvId).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        doc.ref.delete();
                        console.log('🗑️ Deleted CV from Firestore:', doc.id);
                    });
                })
                .catch(err => console.warn('Firestore delete failed:', err.message));
        }
    } catch (e) {}
    
    return filtered;
}

function getUserCv(userId, cvId) {
    const cvs = getUserCvs(userId);
    return cvs.find(c => c.id === cvId) || null;
}

// ============================================================
// LOAD CVS FROM FIRESTORE
// ============================================================
async function loadCVsFromFirestore(userId) {
    try {
        const db = getDB();
        if (db) {
            const snapshot = await db.collection('cvs')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const cvs = [];
            snapshot.forEach(doc => {
                cvs.push({ id: doc.id, ...doc.data(), _firestoreId: doc.id });
            });
            
            console.log('✅ Loaded', cvs.length, 'CVs from Firestore');
            
            // Update LocalStorage cache
            saveUserCvs(userId, cvs);
            
            return cvs;
        }
    } catch (error) {
        console.warn('⚠️ Firestore CV load failed:', error.message);
    }
    
    // Fallback to LocalStorage
    return getUserCvs(userId);
}

async function syncUserCvsFromFirestore(userId) {
    try {
        const cvs = await loadCVsFromFirestore(userId);
        if (cvs && cvs.length > 0) {
            saveUserCvs(userId, cvs);
            console.log('✅ Synced CVs from Firestore to LocalStorage');
        }
        return cvs;
    } catch (e) {
        console.warn('Sync failed:', e.message);
        return getUserCvs(userId);
    }
}

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('userDropdown');
        const profileBtn = document.querySelector('.user-profile-btn');
        if (dropdown && profileBtn && !profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});

// ============================================================
// TOAST SYSTEM
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
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' :
                 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// LIVE LINK FUNCTIONS
// ============================================================
function generateLiveLinkUrl() {
    const user = typeof getCurrentUser !== 'undefined' ? getCurrentUser() : null;
    if (!user) return null;
    
    const templateId = localStorage.getItem('procv_selected_template') || 'classic';
    const baseUrl = window.location.origin;
    return `${baseUrl}/cv.html?userId=${user.uid}&cvId=${Date.now()}`;
}

function showLiveLinkModal() {
    const liveUrl = generateLiveLinkUrl();
    if (!liveUrl) {
        showToast('Please login first', 'error');
        return;
    }
    
    let modal = document.getElementById('liveLinkModal');
    if (modal) {
        const input = document.getElementById('liveLinkInput');
        if (input) input.value = liveUrl;
        modal.classList.add('active');
    }
}

function closeLiveLinkModal() {
    const modal = document.getElementById('liveLinkModal');
    if (modal) modal.classList.remove('active');
}

function copyLiveLink() {
    const input = document.getElementById('liveLinkInput');
    if (input) {
        input.select();
        document.execCommand('copy');
        showToast('✅ Link copied to clipboard!');
    }
}

function openLiveLink() {
    const input = document.getElementById('liveLinkInput');
    if (input) {
        window.open(input.value, '_blank');
    }
}

// ============================================================
// EXPOSE GLOBALLY
// ============================================================
window.showToast = showToast;
window.debounce = debounce;
window.getUrlParams = getUrlParams;
window.generateLiveLinkUrl = generateLiveLinkUrl;
window.showLiveLinkModal = showLiveLinkModal;
window.closeLiveLinkModal = closeLiveLinkModal;
window.copyLiveLink = copyLiveLink;
window.openLiveLink = openLiveLink;
window.getUserCvs = getUserCvs;
window.saveUserCvs = saveUserCvs;
window.saveCvToUser = saveCvToUser;
window.deleteUserCv = deleteUserCv;
window.getUserCv = getUserCv;
window.syncUserCvsFromFirestore = syncUserCvsFromFirestore;
window.loadCVsFromFirestore = loadCVsFromFirestore;

console.log('✅ main.js loaded');