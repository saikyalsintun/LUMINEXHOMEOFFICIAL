/**
 * LUMINEX FURNITURE - GLOBAL AUTH & UI LOGIC
 */

const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// --- ACCESS CONTROL ---
(function checkPageAccess() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const path = window.location.pathname;
    const protectedPages = ["orderHistory.html", "profile.html", "admin.html", "orders-admin.html"];
    const isProtected = protectedPages.some(page => path.includes(page));

    if (isProtected && !isLoggedIn) {
        alert("Please log in to access this page.");
        window.location.href = "login.html";
    }
})();

window.handleAuthAction = function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
        if (confirm("Are you sure you want to sign out?")) {
            firebase.auth().signOut().then(() => {
                localStorage.clear();
                window.location.href = "index.html";
            });
        }
    } else {
        window.location.href = "login.html";
    }
};

// --- UI SYNCHRONIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // Update Sign In/Out Links
    document.querySelectorAll('.auth-toggle-link').forEach(link => {
        link.innerHTML = isLoggedIn 
            ? `<i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> SIGN OUT` 
            : `<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> LOGIN`;
    });

    // Admin Display
    const adminSection = document.getElementById('admin-section');
    const mobileAdminSection = document.getElementById('mobile-admin-section');

    if (isAdmin) {
        if (adminSection) adminSection.style.display = 'block';
        if (mobileAdminSection) {
            mobileAdminSection.style.display = 'flex';
            mobileAdminSection.style.flexDirection = 'column';
        }

        [adminSection, mobileAdminSection].forEach(section => {
            if (!section) return;
            const links = section.querySelectorAll('a');
            links.forEach(link => {
                link.style.display = 'block';
                link.style.width = '100%';
                link.style.paddingTop = '8px';
                link.style.paddingBottom = '8px';
            });
            if (links[0]) { links[0].style.color = '#fb923c'; links[0].style.fontWeight = '700'; }
            if (links[1]) { links[1].style.color = '#3b82f6'; links[1].style.fontWeight = '700'; }
        });
    }

    // --- MOBILE MENU TOGGLE FIX ---
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            mobileMenu.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
    }

    // Close on outside click
    document.addEventListener('click', (event) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!menuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if(icon) icon.classList.replace('fa-xmark', 'fa-bars');
            }
        }
    });
});

firebase.auth().onAuthStateChanged((user) => {
    localStorage.setItem("isLoggedIn", user ? "true" : "false");
});