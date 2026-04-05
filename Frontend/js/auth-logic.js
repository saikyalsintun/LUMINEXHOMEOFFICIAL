// 1. Protection Logic (Immediate Execution)
// --- AUTHENTICATION CONFIGURATION ---

// 1. Initialize Firebase (Ensure this matches your config)
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. Global Auth State Tracker
let currentUser = null;
firebase.auth().onAuthStateChanged(user => {
    currentUser = user || null;
});

// 3. Page Access Guard (Immediate Execution)
(function checkAccess() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const isAuthPage = window.location.pathname.includes("signup.html");

    if (isLoggedIn !== "true" && !isAuthPage) {
        alert("Please log in to view this page.");
        window.location.href = "signup.html";
    }
})();

// 4. Shared Auth Action (Login/Logout toggle)
window.handleAuthAction = function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        if (confirm("Are you sure you want to sign out?")) {
            // Sign out from Firebase
            firebase.auth().signOut().then(() => {
                // Clear Local Storage
                localStorage.removeItem("isLoggedIn");
                // Redirect to Login
                window.location.href = "signup.html";
            }).catch((error) => {
                console.error("Logout Error:", error);
            });
        }
    } else {
        window.location.href = "signup.html";
    }
};


(function() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // 2. Element Selectors
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('search-bar');
    const searchBox = document.getElementById('searchBox');
    const authBtn = document.getElementById('authBtn');
    const zoomModal = document.getElementById('zoomModal');
    
    // 3. Search Toggle Logic
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if(!searchBar.classList.contains('hidden')) {
                searchBox.focus();
            }
        });
    }

    // 4. Logout Logic
    if(authBtn) {
        authBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to sign out?")) {
                localStorage.removeItem("isLoggedIn");
                window.location.href = "login.html";
            }
        });
    }
    
    // 5. Search Execution (Debounce/Input)
    if(searchBox) {
        searchBox.addEventListener('input', (e) => {
            // Your existing doSearch() logic here
            console.log("Searching for:", e.target.value);
        });
    }
});

// Zoom functions (Keep global if called from dynamically generated HTML)
window.closeZoom = function() {
    document.getElementById('zoomModal').classList.add('hidden');
}

window.adjustZoom = function(amount) {
    const img = document.getElementById('zoomedImg');
    // Simple scaling logic
    let currentScale = parseFloat(img.getAttribute('data-scale') || 1);
    currentScale += amount;
    img.style.transform = `scale(${currentScale})`;
    img.setAttribute('data-scale', currentScale);
}