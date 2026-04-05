import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exporting for use in other files

const ADMIN_EMAIL = "saikyalsintun.mdy@gmail.com"; 

window.login = async () => {
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passInput = document.getElementById('loginPass').value;

    if (!emailInput || !passInput) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passInput);
        const user = userCredential.user;

        // Force reload to check if user verified their email after signing up
        await user.reload();

        if (user.emailVerified) {
            // Store session info
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', user.email.toLowerCase());
            localStorage.setItem('token', user.uid);

            // Admin Logic
            if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                localStorage.setItem('isAdmin', 'true');
                alert("Welcome, Admin!");
                window.location.href = "admin/admin.html";
            } else {
                localStorage.setItem('isAdmin', 'false');
                alert("Welcome back!");
                window.location.href = "index.html";
            }
        } else {
            alert("Please verify your email first. Check your inbox.");
            await signOut(auth);
        }
    } catch (error) {
        alert("Login failed: " + error.message);
    }
};