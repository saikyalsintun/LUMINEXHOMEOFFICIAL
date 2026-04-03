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

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const adminEmail = "saikyalsintun.mdy@gmail.com"; 

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        if (user.email.toLowerCase() === adminEmail.toLowerCase()) {
            // Set a "Signal" in the browser memory
            localStorage.setItem('isAdmin', 'true');
            window.location.href = "admin.html";
        } else {
            localStorage.setItem('isAdmin', 'false');
            window.location.href = "home.html";
        }
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}
// Attach to window so the button can see it
window.login = login;