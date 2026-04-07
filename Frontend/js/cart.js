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

/**
 * UPDATED: SECURITY GUARD & FORM VISIBILITY
 */
firebase.auth().onAuthStateChanged(async (user) => {
    const grid = document.getElementById("cartGrid");
    const checkoutForm = document.getElementById("checkoutForm");
    const actionButtons = document.getElementById("actionButtons");

    if (!user) {
        // --- LOGGED OUT STATE ---
        currentUser = null;
        
        // Hide the input form and checkout button
        if (checkoutForm) checkoutForm.classList.add("hidden");
        if (actionButtons) actionButtons.classList.add("hidden");
        
        renderLoginRequired();
    } else {
        // --- LOGGED IN STATE ---
        currentUser = user;
        localStorage.setItem("isLoggedIn", "true");
        
        // Show the form and buttons
        if (checkoutForm) checkoutForm.classList.remove("hidden");
        if (actionButtons) actionButtons.classList.remove("hidden");
        
        await loadCart();
        setupPhoneLookup(); 
    }
});

function renderLoginRequired() {
    const grid = document.getElementById("cartGrid");
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-span-full py-20 text-center animate-fade-in">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fa-solid fa-lock text-gray-300 text-3xl"></i>
            </div>
            <h2 class="text-sm font-black uppercase tracking-widest mb-2">Access Restricted</h2>
            <p class="text-gray-400 mb-8 text-[10px] uppercase tracking-wider leading-relaxed">
                You must be logged in to view items in your wishlist <br> and provide shipping information.
            </p>
            <a href="signup.html" class="inline-block bg-black text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                Sign In to Continue
            </a>
        </div>`;
}
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
        
        if (grid) grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-400"><i class="fas fa-spinner fa-spin text-xl"></i></div>`;

        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const cartItems = await res.json();
        
        if (!grid) return;
        grid.innerHTML = ""; 

        if (!cartItems || cartItems.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-16 uppercase font-bold text-gray-400 tracking-widest">Wishlist is empty</div>`;
            if (orderSummary) orderSummary.classList.add("hidden");
            if (totalCount) totalCount.innerText = "0";
            return;
        }

        if (orderSummary) orderSummary.classList.remove("hidden");
        if (totalCount) totalCount.innerText = cartItems.length;

        cartItems.forEach(item => {
            const product = item.product || {};
            const cartId = item.itemId || item._id; 

            grid.innerHTML += `
            <div class="bg-white border border-gray-100 p-3 flex gap-4 items-center rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div class="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden rounded-xl">
                    <img src="${product.image || ''}" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between">
                        <span class="text-[8px] font-black text-blue-500 uppercase tracking-widest">${product.category || 'ITEM'}</span>
                        <button onclick="window.deleteItem('${cartId}')" class="text-red-300 hover:text-red-600 transition-colors p-1">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                    <h2 class="font-bold text-[13px] uppercase truncate text-gray-800">${product.product_description || 'Product'}</h2>
                    <p class="text-[9px] text-gray-400 uppercase font-bold mt-1">${item.color} / ${item.size} / Qty: ${item.quantity}</p>
                </div>
            </div>`;
        });
    } catch (error) { 
        console.error("Cart Load Error:", error);
        if (grid) grid.innerHTML = `<div class="col-span-full text-center py-16 text-red-500 text-[10px] uppercase font-bold">Failed to load items</div>`;
    }
}


// --- 5. SUBMIT ORDER ---
async function submitOrder() {
    const btn = document.getElementById("submitOrderBtn");
    
    // 1. Auth Check
    if (!currentUser) {
        alert("Please log in to place an order.");
        window.location.href = "signup.html";
        return;
    }

    // 2. Collect Customer Data
    const customerData = {
        name: document.getElementById('custName')?.value.trim(),
        phone: document.getElementById('custPhone')?.value.trim(),
        lineId: document.getElementById('custLine')?.value.trim(),
        address: document.getElementById('custAddress')?.value.trim(),
        email: document.getElementById('custEmail')?.value.trim() || currentUser?.email,
        deliveryInstructions: document.getElementById('orderNotes')?.value.trim() || "None"
    };

    // Validation Guard
    if (!customerData.name || !customerData.phone || !customerData.lineId || !customerData.address) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "SYNCING PROFILE...";

        const token = await currentUser.getIdToken();

        // Step A: Sync User Profile (Optional but good for UX)
        await fetch(`${API_BASE}/user_data/sync`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
                phone: customerData.phone,
                fullName: customerData.name,
                lineId: customerData.lineId,
                address: customerData.address,
                email: customerData.email
            })
        });

        btn.innerText = "PLACING ORDER...";

        // Step B: Get Cart Items
        const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!cartRes.ok) throw new Error("Could not retrieve cart items.");
        const cartItems = await cartRes.json();

        if (!cartItems || cartItems.length === 0) {
            throw new Error("Your cart is empty.");
        }

        // Calculate Total Amount (Required by our new Schema)
        let totalAmount = 0;

        const formattedItems = cartItems.map(item => {
            const price = item.product?.price || 0;
            totalAmount += price * (item.quantity || 1);

            return {
                productId: item.product?._id || item.productId, 
                product_description: item.product?.product_description || item.product_description || "Product",
                image: item.product?.image || item.image || "",
                color: item.color || "Default",
                size: item.size || "Standard",
                quantity: item.quantity || 1
            };
        });

        // Step C: Create the Order Record
        // UPDATED: Now points to /api/orders (the unified route)
        const orderRes = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
                customer: customerData,
                items: formattedItems,
                totalAmount: totalAmount, // Added this
                status: "Pending"
            })
        });

        const result = await orderRes.json();
        
        if (orderRes.ok) {
            // SUCCESS
            localStorage.removeItem('cart_total'); 
            
            // CLEAN REDIRECT
            // orderStatus.html will now fetch /api/orders/latest/:userId
            window.location.href = "orderStatus.html";
        } else {
            throw new Error(result.message || "Failed to save order.");
        }

    } catch (error) {
        console.error("Order Error:", error);
        alert("Order Error: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "CONFIRM ORDER";
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById("submitOrderBtn");
    if (submitBtn) {
        submitBtn.addEventListener('click', submitOrder);
    }
});
 
// --- 6. DELETE ITEM ---
window.deleteItem = async (id) => {
    if (!id || id === "undefined" || id === "null") {
        alert("Error: Item ID is missing. Please refresh.");
        return;
    }

    if (!confirm("Remove this item from your wishlist?")) return;

    try {
        const token = await firebase.auth().currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/cart/${id}`, { 
            method: "DELETE", 
            headers: { "Authorization": `Bearer ${token}` } 
        });

        if (res.ok) {
            await loadCart();
        } else {
            const errData = await res.json();
            alert("Error: " + errData.message);
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
};




window.submitOrder = submitOrder;