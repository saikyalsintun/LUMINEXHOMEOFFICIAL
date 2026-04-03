// --- 1. CONFIGURATION & HYBRID URL LOGIC ---
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app"; 

const API_BASE = `${API_BASE_URL}/api`;

// --- 2. UI ELEMENTS ---
const form = document.getElementById('productForm');
const submitBtn = document.getElementById('submitBtn');

// --- 3. LIVE PREVIEW LOGIC ---
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

// Category Radio Preview Logic
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

        // 🛡️ AUTH CHECK: Get the current user
        const user = firebase.auth().currentUser;
        if (!user || user.email !== "saikyalsintun.mdy@gmail.com") {
            alert("⛔ Unauthorized: You must be logged in as admin to add products.");
            return;
        }

        // Get the value of the selected Radio Button safely
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

        // UI Feedback
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Syncing to MongoDB...';
        submitBtn.disabled = true;

        try {
            // Get fresh token from Firebase to prove identity to the backend
            const idToken = await user.getIdToken();

            const response = await fetch(`${API_BASE}/admin/products`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send token to backend
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert(`✨ Success! ${productData.product_description} is now live.`);
                form.reset();
                
                // Reset Previews to default values
                document.getElementById('prevProdDesc').innerText = 'PRODUCT NAME';
                document.getElementById('prevCategory').innerText = 'SOFA';
                document.getElementById('prevImage').src = 'https://placehold.co/400x400?text=Luminex+Preview';
            } else {
                const result = await response.json();
                alert("❌ Server Error: " + (result.message || "Failed to add product"));
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("❌ Connection Failed. Check if your backend server is online.");
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    });
}