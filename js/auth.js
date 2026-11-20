/**
 * ProCV - Authentication Module
 * Firebase Authentication with Google and Email/Password
 * Syncs user data between Firestore and LocalStorage
 */

// ===== FIREBASE INITIALIZATION =====
firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let authRedirectCallback = null;

// ===== AUTH STATE OBSERVER =====
firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
        currentUser = user;
        updateUIForUser(user);
        
        // Load user data from Firestore or LocalStorage
        await loadUserDataSync(user.uid);
        
        // Check pro status
        await checkProStatusSync(user.uid);
        
        if (authRedirectCallback) {
            authRedirectCallback(user);
            authRedirectCallback = null;
        }
    } else {
        currentUser = null;
        updateUIForLoggedOut();
    }
});

// ===== SIGN IN WITH GOOGLE =====
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            saveUserToFirestore(user);
            closeLoginModal();
            showToast('Welcome to ProCV! 🎉');
            
            const redirect = sessionStorage.getItem('auth_redirect') || 'builder.html';
            sessionStorage.removeItem('auth_redirect');
            if (window.location.pathname.includes('builder.html')) {
                window.location.reload();
            } else {
                window.location.href = redirect;
            }
        })
        .catch((error) => {
            console.error('Google sign-in error:', error);
            if (error.code === 'auth/popup-blocked') {
                showToast('Please allow popups for this site', 'error');
            } else {
                showToast(error.message, 'error');
            }
        });
}

// ===== SIGN IN WITH EMAIL =====
function signInWithEmail() {
    const emailForm = document.getElementById('emailAuthForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (emailForm.style.display === 'none') {
        emailForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        emailForm.style.display = 'none';
        signUpForm.style.display = 'none';
    }
}

// ===== SIGN IN WITH EMAIL/PASSWORD =====
function signInWithEmailPassword() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((result) => {
            const user = result.user;
            saveUserToFirestore(user);
            closeLoginModal();
            showToast('Welcome back! 🎉');
            
            const redirect = sessionStorage.getItem('auth_redirect') || 'builder.html';
            sessionStorage.removeItem('auth_redirect');
            window.location.href = redirect;
        })
        .catch((error) => {
            console.error('Email sign-in error:', error);
            if (error.code === 'auth/user-not-found') {
                showToast('No account found with this email', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showToast('Incorrect password', 'error');
            } else {
                showToast(error.message, 'error');
            }
        });
}

// ===== SIGN UP WITH EMAIL =====
function signUpWithEmail() {
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    
    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((result) => {
            const user = result.user;
            user.updateProfile({
                displayName: name
            }).then(() => {
                saveUserToFirestore(user);
                closeLoginModal();
                showToast('Account created successfully! 🎉');
                
                const redirect = sessionStorage.getItem('auth_redirect') || 'builder.html';
                sessionStorage.removeItem('auth_redirect');
                window.location.href = redirect;
            });
        })
        .catch((error) => {
            console.error('Sign-up error:', error);
            if (error.code === 'auth/email-already-in-use') {
                showToast('Email already in use', 'error');
            } else {
                showToast(error.message, 'error');
            }
        });
}

// ===== SAVE USER TO FIRESTORE + LOCALSTORAGE =====
async function saveUserToFirestore(user) {
    const userData = {
        uid: user.uid,
        name: user.displayName || user.email || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        plan: 'free',
        subscriptionStatus: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    try {
        await db.collection('users').doc(user.uid).set(userData, { merge: true });
        console.log('✅ User saved to Firestore');
    } catch (error) {
        console.error('Error saving user to Firestore:', error);
    }
    
    // Save to LocalStorage
    try {
        localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(userData));
        console.log('✅ User saved to LocalStorage');
    } catch (error) {
        console.error('Error saving user to LocalStorage:', error);
    }
}

// ===== LOAD USER DATA SYNC =====
async function loadUserDataSync(uid) {
    try {
        // Try Firestore first
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(data));
            return data;
        }
    } catch (error) {
        console.warn('Firestore load failed, using LocalStorage:', error.message);
    }
    
    // Fallback to LocalStorage
    try {
        const cached = localStorage.getItem(APP_CONFIG.userKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error('Error loading user from LocalStorage:', error);
    }
    
    return null;
}

// ===== CHECK PRO STATUS SYNC =====
async function checkProStatusSync(uid) {
    try {
        // Try Firestore first
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            const isPro = data.plan === 'pro' && data.subscriptionStatus === 'active';
            localStorage.setItem(APP_CONFIG.isProKey, isPro ? 'true' : 'false');
            return isPro;
        }
    } catch (error) {
        console.warn('Firestore pro check failed, using LocalStorage:', error.message);
    }
    
    // Fallback to LocalStorage
    return localStorage.getItem(APP_CONFIG.isProKey) === 'true';
}

// ===== UPDATE UI FOR USER =====
function updateUIForUser(user) {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (authButtons) authButtons.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    if (userName) userName.textContent = user.displayName || user.email || 'User';
    if (userAvatar) {
        const name = user.displayName || 'User';
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=32`;
    }
}

// ===== UPDATE UI FOR LOGGED OUT =====
function updateUIForLoggedOut() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (authButtons) authButtons.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
}

// ===== TOGGLE USER MENU =====
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// ===== LOGOUT =====
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut()
            .then(() => {
                localStorage.removeItem(APP_CONFIG.userKey);
                localStorage.removeItem(APP_CONFIG.isProKey);
                showToast('Logged out successfully');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Logout error:', error);
                showToast('Error logging out', 'error');
            });
    }
}

// ===== SHOW SIGN UP =====
function showSignUp() {
    document.getElementById('emailAuthForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
}

// ===== SHOW SIGN IN =====
function showSignIn() {
    document.getElementById('emailAuthForm').style.display = 'block';
    document.getElementById('signUpForm').style.display = 'none';
}

// ===== OPEN LOGIN MODAL =====
function openLoginModal(redirectTo) {
    const modal = document.getElementById('loginModal');
    if (modal) {
        if (redirectTo) {
            sessionStorage.setItem('auth_redirect', redirectTo);
        }
        modal.classList.add('active');
        document.getElementById('emailAuthForm').style.display = 'none';
        document.getElementById('signUpForm').style.display = 'none';
    }
}

// ===== CLOSE LOGIN MODAL =====
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== IS USER LOGGED IN =====
function isUserLoggedIn() {
    return currentUser !== null;
}

// ===== GET CURRENT USER =====
function getCurrentUser() {
    return currentUser;
}

// ===== GET USER PLAN =====
function getUserPlan() {
    const userData = localStorage.getItem(APP_CONFIG.userKey);
    if (userData) {
        try {
            const data = JSON.parse(userData);
            return data.plan || 'free';
        } catch (e) {
            return 'free';
        }
    }
    return 'free';
}

// ===== IS PRO USER =====
function isProUser() {
    return localStorage.getItem(APP_CONFIG.isProKey) === 'true';
}

// ===== SHOW USER PROFILE =====
function showUserProfile() {
    const user = getCurrentUser();
    if (user) {
        const plan = getUserPlan();
        const isPro = isProUser();
        alert(`👤 Profile\n\nName: ${user.displayName || 'User'}\nEmail: ${user.email}\nPlan: ${isPro ? '⭐ Pro' : 'Free'}\n${isPro ? '✅ Pro features unlocked' : '💡 Upgrade to Pro for more features'}`);
    }
}

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        signInWithGoogle,
        signInWithEmail,
        signInWithEmailPassword,
        signUpWithEmail,
        logoutUser,
        isUserLoggedIn,
        getCurrentUser,
        getUserPlan,
        isProUser,
        openLoginModal,
        closeLoginModal,
        showUserProfile
    };
}

console.log('✅ Auth module loaded');