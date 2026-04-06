/**
 * LUMINEX FURNITURE - GLOBAL AUTH & UI LOGIC
 * This file handles Firebase Auth, Admin checks, and UI toggles.
 */

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// --- 2. GLOBAL SECURITY & ACCESS ---

(function checkPageAccess() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const path = window.location.pathname;

    // List of pages that GUESTS cannot see
    const protectedPages = ["orderHistory.html", "profile.html", "admin.html", "orders-admin.html"];
    const isProtected = protectedPages.some(page => path.includes(page));

    if (isProtected && !isLoggedIn) {
        alert("Please log in to access this page.");
        window.location.href = "login.html";
    }
})();

// Helper function for wishlist/cart buttons
window.requireAuth = function(actionCallback) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
        alert("Please log in to continue.");
        window.location.href = "login.html";
        return false;
    }
    if (actionCallback) actionCallback();
    return true;
};

// --- 3. THE SHARED AUTH ACTION (LOGIN/LOGOUT TOGGLE) ---

window.handleAuthAction = function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        // LOGOUT LOGIC
        if (confirm("Are you sure you want to sign out?")) {
            firebase.auth().signOut().then(() => {
                localStorage.clear(); // Wipe everything
                window.location.href = "index.html"; // Go home
            }).catch(err => {
                console.error("Logout Error:", err);
                window.location.href = "index.html";
            });
        }
    } else {
        // LOGIN LOGIC
        window.location.href = "login.html";
    }
};

// --- 4. UI SYNCHRONIZATION ---
// --- 4. UI SYNCHRONIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // A. Update Login/Logout Buttons Automatically
    const authLinks = document.querySelectorAll('.auth-toggle-link');
    authLinks.forEach(link => {
        if (isLoggedIn) {
            link.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> SIGN OUT`;
            link.classList.add('text-orange-600');
        } else {
            link.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> LOGIN`;
            link.classList.remove('text-orange-600');
        }
    });

    // B. Handle Admin Section Visibility & Styling
    const adminSection = document.getElementById('admin-section');
    const mobileAdminSection = document.getElementById('mobile-admin-section');

    if (isAdmin) {
        // Show sections
        if (adminSection) adminSection.style.display = 'block';
        if (mobileAdminSection) mobileAdminSection.style.display = 'block';

        // Apply specific colors to Admin Links (Desktop & Mobile)
        [adminSection, mobileAdminSection].forEach(section => {
            if (!section) return;
            const links = section.querySelectorAll('a');
            
            // First Link: Admin Dashboard (Orange)
            if (links[0]) {
                links[0].style.color = '#fb923c'; 
                links[0].style.fontWeight = '700';
            }
            // Second Link: Check Orders (Blue)
            if (links[1]) {
                links[1].style.color = '#3b82f6';
                links[1].style.fontWeight = '700';
            }
        });
    } else {
        // Hide if not admin
        if (adminSection) adminSection.style.display = 'none';
        if (mobileAdminSection) mobileAdminSection.style.display = 'none';
    }

    // C. Mobile Menu Toggle Logic
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
        });
    }
});

// --- 5. FIREBASE AUTH OBSERVER ---
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem("isLoggedIn", "true");
    } else {
        localStorage.setItem("isLoggedIn", "false");
    }
});