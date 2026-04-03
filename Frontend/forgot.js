// Add signInWithEmailAndPassword to the { } list below
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    confirmPasswordReset 
    // <--- MAKE SURE THIS IS HERE
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
  authDomain: "luminex-7ba90.firebaseapp.com",
  projectId: "luminex-7ba90",
  storageBucket: "luminex-7ba90.firebasestorage.app",
  messagingSenderId: "977344382421",
  appId: "1:977344382421:web:6fa2461522856b4563295c",
  measurementId: "G-TB90F73ZGX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- LOGIN FUNCTION ---
window.login = async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        await user.reload(); 

        if (user.emailVerified) {
            // SUCCESS: Set the Access Key
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", email);
            
            alert("Welcome back!");
            window.location.href = "index.html"; // Ensure this matches your home filename
        } else {
            alert("Please verify your email first.");
            await auth.signOut();
        }
    } catch (error) {
        alert("Login failed: " + error.message);
    }
};

// --- SIGNUP FUNCTION ---
window.createAccount = async () => {
    const email = document.getElementById('suEmail').value;
    const password = document.getElementById('suPass').value;
    const confirm = document.getElementById('suConfirm').value;

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; 
        await sendEmailVerification(user);

        // Note: We DON'T set isLoggedIn here because they need to verify email first
        alert("Verification link sent! Please verify before logging in.");
        window.location.href = "login.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
};



// --- FORGOT PASSWORD FUNCTION ---
window.forgotPassword = async () => {
    const email = document.getElementById('loginEmail').value;

    if (!email) {
        alert("Please enter your email first.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
        alert("Error: " + error.message);
    }
};


// STEP 1: SEND RESET EMAIL
window.sendReset = async () => {
  const email = document.getElementById("resetEmail").value;

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent! Check your email.");
  } catch (error) {
    alert(error.message);
  }
};

// STEP 2: UPDATE PASSWORD
window.updatePassword = async () => {
  const newPass = document.getElementById("newPass").value;
  const confirmPass = document.getElementById("confirmPass").value;

  if (newPass !== confirmPass) {
    alert("Passwords do not match");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get("oobCode");

  try {
    await confirmPasswordReset(auth, oobCode, newPass);
    alert("Password updated successfully!");
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message);
  }
};




// Function to handle the login
async function login() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    if (!email || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // 1. Your Firebase login logic goes here
        // Example: await signInWithEmailAndPassword(auth, email, pass);
        
        // 2. SUCCESS: Set the "Access Key" in LocalStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email); // Optional: store email to show in profile

        // 3. Redirect to the homepage
        alert("Login successful!");
        window.location.href = "index.html"; 
        
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}