// config.js
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app/"; // Your new Backend URL

export const API_BASE = `${API_BASE_URL}/api`;

const form = document.getElementById('productForm');
const submitBtn = document.getElementById('submitBtn');

// --- 1. Live Preview Logic ---
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
            if (id === 'image' && val) {
                const imgPrev = document.getElementById('prevImage');
                if (imgPrev) imgPrev.src = val;
            }
        });
    }
});

// Category Radio Preview Logic
document.querySelectorAll('input[name="category_radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.getElementById('prevCategory').innerText = e.target.value;
    });
});

// --- 2. Form Submission Logic ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the value of the selected Radio Button
    const selectedCategory = document.querySelector('input[name="category_radio"]:checked').value;

    const productData = {
        itemNo: document.getElementById('itemNo').value,
        product_description: document.getElementById('product_description').value, // NEW
        category: selectedCategory, // FROM RADIOS
        material: document.getElementById('material').value,
        productSize: document.getElementById('productSize').value,
        productColor: document.getElementById('productColor').value,
        image: document.getElementById('image').value,
        productStatus: document.getElementById('productStatus').value,
        remark: document.getElementById('remark').value
    };

    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Processing...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert(`✨ Success! ${productData.product_description} added.`);
            form.reset();
            document.getElementById('prevImage').src = 'https://placehold.co/400x400?text=Image+Preview';
        } else {
            const result = await response.json();
            alert("❌ Error: " + (result.message || "Failed to add product"));
        }
    } catch (error) {
        alert("❌ Connection Failed. Check your backend server.");
    } finally {
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
    }
});