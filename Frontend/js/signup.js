import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

window.createAccount = async () => {
    const email = document.getElementById('suEmail').value.trim();
    const password = document.getElementById('suPass').value;
    const confirm = document.getElementById('suConfirm').value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert("Verification link sent! Please check your inbox before logging in.");
        window.location.href = "login.html";
    } catch (error) {
        alert("Signup Error: " + error.message);
    }
};