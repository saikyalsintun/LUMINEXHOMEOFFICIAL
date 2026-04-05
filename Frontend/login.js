// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c"
};

// Initialize Firebase if it hasn't been initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

async function login() {
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passInput = document.getElementById('loginPass').value;
    const adminEmail = "saikyalsintun.mdy@gmail.com"; 

    if (!emailInput || !passInput) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        // 1. Sign in with Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(emailInput, passInput);
        const user = userCredential.user;

        // 2. CRITICAL: Save data to LocalStorage for account.html
        // We use 'token' because account.html looks for this to verify you are logged in
        localStorage.setItem('token', user.uid); 
        localStorage.setItem('userEmail', user.email.toLowerCase());

        // 3. Handle Admin vs User Redirection
        if (user.email.toLowerCase() === adminEmail.toLowerCase()) {
            localStorage.setItem('isAdmin', 'true');
            window.location.href = "index.html";
        } else {
            localStorage.setItem('isAdmin', 'false');
            // Change this to "index.html" or "home.html" based on your project structure
            window.location.href = "index.html"; 
        }

    } catch (error) {
        console.error("Login Error:", error.code);
        
        // Friendly error messages
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            alert("Invalid email or password.");
        } else {
            alert("Login failed: " + error.message);
        }
    }
}

// Make the function available to the button in login.html
window.login = login;