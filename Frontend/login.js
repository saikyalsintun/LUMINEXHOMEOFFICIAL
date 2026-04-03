// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// --- 2. LOGIN FUNCTION ---
async function login() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const adminEmail = "saikyalsintun.mdy@gmail.com"; // Updated to .com

    if (!email || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        console.log("Login successful:", user.email);

        // --- 3. ADMIN REDIRECT LOGIC ---
        if (user.email.toLowerCase() === adminEmail.toLowerCase()) {
            alert("Welcome back, Administrator.");
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: " + error.message);
    }
}

// Attach to window so the button can see it
window.login = login;