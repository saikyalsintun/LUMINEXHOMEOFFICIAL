/**
 * LUMINEX FURNITURE - GLOBAL AUTH & UI LOGIC
 */

// --- 1. CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

window.API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000/api" 
    : "https://luminexhomeofficial.vercel.app/api";

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// --- 2. ACCESS CONTROL ---
function checkPageAccess(user) {
    const path = window.location.pathname;
    const protectedPages = ["orderHistory.html", "profile.html", "admin.html", "orders-admin.html", "orderStatus.html"];
    const isProtected = protectedPages.some(page => path.includes(page));

    // Only redirect if Firebase has finished loading (user is null) AND no login found in storage
    if (isProtected && !user && localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
}

// --- 3. AUTH STATE OBSERVER ---
auth.onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userToken", user.uid);
        
        // ADD YOUR EMAIL HERE:
        const adminEmails = ["luminexhomeofficial@gmail.com", "saikyalsintun.mdy@gmail.com"];
        const isAdmin = adminEmails.includes(user.email);
        
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
    } else {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("isAdmin", "false");
        localStorage.removeItem("userEmail");
    }

    checkPageAccess(user);
    updateAuthUI(user);
});

// --- 4. UI SYNCHRONIZATION ---
function updateAuthUI(user) {
    const loggedIn = user || localStorage.getItem("isLoggedIn") === "true";
    const email = user ? user.email : localStorage.getItem("userEmail");
    
    // Check if the current email is in the admin list
    const adminEmails = ["luminexhomeofficial@gmail.com", "saikyalsintun.mdy@gmail.com"];
    const isAdmin = adminEmails.includes(email);

    // Update Sign In/Out Buttons
    document.querySelectorAll('.auth-toggle-link').forEach(link => {
        if (loggedIn) {
            link.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> SIGN OUT`;
        } else {
            link.innerHTML = `<i class="fa-solid fa-right-to-bracket mr-2"></i> LOGIN`;
        }
    });

    // --- ADMIN SECTION VISIBILITY ---
    const adminSection = document.getElementById('admin-section');
    const mobileAdminSection = document.getElementById('mobile-admin-section');

    if (isAdmin && loggedIn) {
        if (adminSection) adminSection.style.setProperty('display', 'block', 'important');
        if (mobileAdminSection) mobileAdminSection.style.setProperty('display', 'block', 'important');
        console.log("Admin UI unlocked for: " + email);
    } else {
        if (adminSection) adminSection.style.display = 'none';
        if (mobileAdminSection) mobileAdminSection.style.display = 'none';
    }
}
// --- 5. LOGOUT ACTION ---
window.handleAuthAction = function() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        if (confirm("Are you sure you want to sign out?")) {
            auth.signOut().then(() => {
                localStorage.clear();
                window.location.href = "index.html";
            });
        }
    } else {
        window.location.href = "login.html";
    }
};

// --- 6. INITIALIZE UI ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    // Run UI update immediately using LocalStorage so Admin doesn't "disappear" while waiting for Firebase
    updateAuthUI(null);

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (icon) {
                mobileMenu.classList.contains('active') 
                    ? icon.classList.replace('fa-bars', 'fa-xmark') 
                    : icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }
});