// --- 1. CONFIGURATION ---
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app";

const API_BASE = `${API_BASE_URL}/api`;

// --- 2. FIREBASE INIT ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

let currentUser = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        currentUser = user;
        await loadCart();
        setupPhoneLookup(); // New: Auto-fill for returning customers
    }
});

// --- 3. AUTO-FILL RETURNING CUSTOMERS ---
function setupPhoneLookup() {
    const phoneInput = document.getElementById('custPhone');
    phoneInput?.addEventListener('blur', async () => {
        const phone = phoneInput.value.trim();
        if (phone.length < 9) return;

        try {
            const res = await fetch(`${API_BASE}/user_data/${phone}`);
            if (res.ok) {
                const data = await res.json();
                // Auto-fill form if customer exists
                if(document.getElementById('custName')) document.getElementById('custName').value = data.fullName;
                if(document.getElementById('custLine')) document.getElementById('custLine').value = data.lineId;
                if(document.getElementById('custAddress')) document.getElementById('custAddress').value = data.address;
                if(document.getElementById('custEmail')) document.getElementById('custEmail').value = data.email || "";
            }
        } catch (err) { console.log("New customer detection."); }
    });
}

// --- 4. LOAD CART ---
async function loadCart() {
    const grid = document.getElementById("cartGrid");
    const orderSummary = document.getElementById("orderSummary");
    const totalCount = document.getElementById("totalCount");

    try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const cartItems = await res.json();
        if (!grid) return;
        grid.innerHTML = "";

        if (!cartItems || cartItems.length === 0) {
            grid.innerHTML = `<div class="text-center py-16 uppercase font-bold text-gray-400">Wishlist is empty</div>`;
            if (orderSummary) orderSummary.classList.add("hidden");
            return;
        }

        if (orderSummary) orderSummary.classList.remove("hidden");
        if (totalCount) totalCount.innerText = cartItems.length;

        cartItems.forEach(item => {
            const product = item.product || {};
            grid.innerHTML += `
            <div class="bg-white border border-gray-100 p-3 flex gap-4 items-center rounded-2xl shadow-sm">
                <div class="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden rounded-xl">
                    <img src="${product.image || ''}" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between">
                        <span class="text-[8px] font-black text-blue-500 uppercase tracking-widest">${product.category || 'ITEM'}</span>
                        <button onclick="deleteItem('${item._id}')" class="text-gray-300 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <h2 class="font-bold text-[13px] uppercase truncate">${product.product_description || 'Product'}</h2>
                    <p class="text-[9px] text-gray-400 uppercase font-bold">${item.color} / ${item.size} / Qty: ${item.quantity}</p>
                </div>
            </div>`;
        });
    } catch (error) { console.error(error); }
}

// --- 5. SUBMIT ORDER (UPDATED FLOW) ---
async function submitOrder() {
    const btn = document.getElementById("submitOrderBtn");
    
    // 1. Collect Data from UI
    const customerData = {
        name: document.getElementById('custName')?.value.trim(),
        phone: document.getElementById('custPhone')?.value.trim(),
        lineId: document.getElementById('custLine')?.value.trim(),
        address: document.getElementById('custAddress')?.value.trim(),
        email: document.getElementById('custEmail')?.value.trim() || currentUser.email,
        deliveryInstructions: document.getElementById('orderNotes')?.value.trim() || "None"
    };

    // Validation
    if (!customerData.name || !customerData.phone || !customerData.lineId || !customerData.address) {
        alert("Please fill in all required fields (Name, Phone, Line ID, Address).");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "SYNCING PROFILE...";

        const token = await currentUser.getIdToken();

        // STEP 1: Sync User Data first (upsert)
        await fetch(`${API_BASE}/user_data/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                phone: customerData.phone,
                fullName: customerData.name,
                lineId: customerData.lineId,
                address: customerData.address,
                email: customerData.email
            })
        });

        btn.innerText = "PLACING ORDER...";

        // STEP 2: Get Cart Items
        const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cartItems = await cartRes.json();

        const formattedItems = cartItems.map(item => ({
            productId: item.product._id,
            product_description: item.product.product_description,
            image: item.product.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity
        }));

        // STEP 3: Create Order
        const orderRes = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                customer: customerData, // Includes lineId and instructions
                items: formattedItems,
                status: "Pending"
            })
        });

        const result = await orderRes.json();
        if (orderRes.ok) {
            window.location.href = `orderStatus.html?id=${result.order._id}`;
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        alert("Order Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "CONFIRM ORDER";
    }
}

// Global exposure
// Global exposure
window.deleteItem = async (id) => {
    if (!confirm("Remove item?")) return;

    try {
        const token = await currentUser.getIdToken();
        
        // 1. You MUST 'await' the fetch so the database finishes deleting first
        const response = await fetch(`${API_BASE}/cart/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${token}` } 
        });

        if (response.ok) {
            // 2. Only reload the list AFTER the server confirms it's gone
            await loadCart(); 
        } else {
            alert("Server error: Could not remove item.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Check your connection.");
    }
};
window.submitOrder = submitOrder; 