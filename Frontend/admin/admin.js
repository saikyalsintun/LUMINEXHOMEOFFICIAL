// --- 1. CONFIGURATION & HYBRID URL LOGIC ---
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app"; 

const API_BASE = `${API_BASE_URL}/api`;

const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// --- 2. AUTH STATE LISTENER ---
const authStatus = document.getElementById('authStatus');
const submitBtn = document.getElementById('submitBtn');

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        if (user.email === "saikyalsintun.mdy@gmail.com") {
            authStatus.innerText = "✅ Logged in as Admin";
            authStatus.className = "bg-green-100 text-green-800 text-[10px] py-1 text-center font-bold uppercase tracking-widest border-b border-green-200";
            submitBtn.disabled = false;
        } else {
            authStatus.innerText = "❌ Unauthorized: Admin access only";
            authStatus.className = "bg-red-100 text-red-800 text-[10px] py-1 text-center font-bold uppercase tracking-widest border-b border-red-200";
            submitBtn.disabled = true;
        }
    } else {
        authStatus.innerText = "⚠️ Not Logged In: Redirecting...";
        authStatus.className = "bg-yellow-100 text-yellow-800 text-[10px] py-1 text-center font-bold uppercase tracking-widest border-b border-yellow-200";
        submitBtn.disabled = true;
        // Optionally redirect to login page here: window.location.href = "login.html";
    }
});

// --- 3. UI ELEMENTS & PREVIEW LOGIC ---
const form = document.getElementById('productForm');

const inputIds = ['itemNo', 'product_description', 'material', 'productSize', 'productColor', 'image', 'productStatus'];
 
inputIds.forEach(id => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
        inputElement.addEventListener('input', (e) => {
            const val = e.target.value;
            const updatePreview = (prevId, content) => {
                const el = document.getElementById(prevId);
                if (el) el.innerText = content;
            };
 
            if (id === 'product_description') updatePreview('prevProdDesc', val || 'PRODUCT NAME');
            if (id === 'material') updatePreview('prevMaterial', val || 'Material details...');
            
            if (id === 'productColor') {
                const firstColor = val.split(',')[0].trim();
                updatePreview('prevColor', firstColor || 'Color Name');
            }
            if (id === 'image') {
                const imgPrev = document.getElementById('prevImage');
                if (imgPrev) imgPrev.src = val || 'https://placehold.co/400x400?text=Luminex+Preview';
            }
        });
    }
});

document.querySelectorAll('input[name="category_radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const prevCat = document.getElementById('prevCategory');
        if (prevCat) prevCat.innerText = e.target.value.toUpperCase();
    });
});

// --- 4. FORM SUBMISSION LOGIC ---
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = firebase.auth().currentUser;
        if (!user || user.email !== "saikyalsintun.mdy@gmail.com") {
            alert("⛔ Unauthorized access.");
            return;
        }

        const checkedRadio = document.querySelector('input[name="category_radio"]:checked');
        const selectedCategory = checkedRadio ? checkedRadio.value : "sofa";

        const productData = {
            itemNo: document.getElementById('itemNo').value,
            product_description: document.getElementById('product_description').value,
            category: selectedCategory,
            material: document.getElementById('material').value,
            productSize: document.getElementById('productSize').value,
            productColor: document.getElementById('productColor').value,
            image: document.getElementById('image').value,
            productStatus: document.getElementById('productStatus').value,
            remark: document.getElementById('remark').value
        };

        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Syncing to MongoDB...';
        submitBtn.disabled = true;

        try {
            // Get fresh token from Firebase
            const idToken = await user.getIdToken(true);

            const response = await fetch(`${API_BASE}/admin/products`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` 
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert(`✨ Success! ${productData.product_description} is now live.`);
                form.reset();
                // Reset Preview
                document.getElementById('prevProdDesc').innerText = 'PRODUCT NAME';
                document.getElementById('prevImage').src = 'https://placehold.co/400x400?text=Luminex+Preview';
            } else {
                const result = await response.json();
                alert("❌ Server Error: " + (result.message || "Failed to add product"));
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("❌ Connection Failed. Check your internet or backend status.");
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    });
}
// --- CLOUDINARY UPLOAD LOGIC ---
const cloudName = "dq8rbpfis"; // Replace with yours
const uploadPreset = "ml_default"; // Replace with yours

const myWidget = cloudinary.createUploadWidget(
    {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ["local", "url", "camera"], // Allow files, URLs, or camera
        multiple: false, // Only one image per product
        cropping: true, // Optional: allows admin to crop to square
        styles: {
            palette: {
                window: "#FFFFFF",
                sourceBg: "#F4F4F5",
                windowBorder: "#90A0B3",
                tabIcon: "#000000",
                inactiveTabIcon: "#6E7075",
                menuIcons: "#000000",
                link: "#2563EB",
                action: "#000000",
                inProgress: "#2563EB",
                complete: "#22C55E",
                error: "#EF4444",
                textDark: "#000000",
                textLight: "#FFFFFF"
            }
        }
    },
    (error, result) => {
        if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            const imageUrl = result.info.secure_url;
            
            // 1. Update the input field
            document.getElementById("image").value = imageUrl;
            
            // 2. Update the preview card
            const imgPrev = document.getElementById('prevImage');
            if (imgPrev) imgPrev.src = imageUrl;
            
            alert("✅ Image uploaded successfully!");
        }
    }
);

document.getElementById("upload_widget").addEventListener("click", () => {
    myWidget.open();
}, false);
