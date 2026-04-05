import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Attached to window so the HTML button can find it
window.forgotPassword = async () => {
    // Make sure this ID matches your HTML input
    const emailInput = document.getElementById('resetEmail');
    const email = emailInput ? emailInput.value : null;

    if (!email) {
        alert("Please enter your email address first.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Check your inbox.");
    } catch (error) {
        // Friendly error handling
        if (error.code === 'auth/user-not-found') {
            alert("No account found with this email.");
        } else {
            alert("Error: " + error.message);
        }
    }
};

// This stays the same for your actual reset page
window.updatePassword = async () => {
    const newPass = document.getElementById("newPass").value;
    const params = new URLSearchParams(window.location.search);
    const oobCode = params.get("oobCode");

    if(!oobCode) {
        alert("Invalid or expired reset link.");
        return;
    }

    try {
        await confirmPasswordReset(auth, oobCode, newPass);
        alert("Password updated!");
        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
    }
};