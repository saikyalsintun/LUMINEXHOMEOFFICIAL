// config.js
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app"; // Your new Backend URL

export const API_BASE = `${API_BASE_URL}/api`;

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

firebase.initializeApp(firebaseConfig);
let currentUser = null;
const API_BASE = `${API_BASE_URL}/api`;

// --- 2. AUTH LISTENER ---
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        currentUser = user;
        loadCart();
    }
});

// --- 3. LOAD AND DISPLAY WISHLIST/CART ---
async function loadCart() {
    try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const cartItems = await res.json();
        const grid = document.getElementById("cartGrid");
        const orderSummary = document.getElementById("orderSummary");
        const totalCount = document.getElementById("totalCount");
        
        if (!grid) return;
        grid.innerHTML = "";

        if (!cartItems || cartItems.length === 0) {
            grid.innerHTML = `
                <div class="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p class="text-xs font-black uppercase tracking-widest text-gray-400">Your wishlist is empty</p>
                    <a href="home.html" class="text-[10px] underline mt-4 block uppercase font-bold text-black">Start Shopping</a>
                </div>`;
            if(orderSummary) orderSummary.classList.add("hidden");
            return;
        }

        if(orderSummary) orderSummary.classList.remove("hidden");
        if(totalCount) totalCount.innerText = cartItems.length;

        cartItems.forEach(item => {
            grid.innerHTML += `
            <div class="group border border-gray-100 p-4 flex gap-6 items-center hover:border-black transition-all bg-white rounded-xl">
                <div class="w-24 h-24 flex-shrink-0 bg-gray-50 overflow-hidden rounded-lg">
                    <img src="${item.product.image}" class="w-full h-full object-contain mix-blend-multiply">
                </div>
                <div class="flex-grow">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${item.product.category || 'Collection'}</span>
                    <h2 class="font-bold text-sm uppercase mb-1 text-black">${item.product.product_description}</h2>
                    <div class="flex gap-4">
                        <p class="text-[9px] uppercase text-gray-400 font-bold">Color: <span class="text-black">${item.color || 'N/A'}</span></p>
                        <p class="text-[9px] uppercase text-gray-400 font-bold">Size: <span class="text-black">${item.size || 'N/A'}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-black">x${item.quantity}</span>
                    <button onclick="deleteItem('${item.itemId}')" class="block mt-2 text-[9px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors">
                        [ Remove ]
                    </button>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Load Error:", error);
    }
}

// --- 4. DELETE ITEM ---
async function deleteItem(id) {
    if (!confirm("Remove this item from your selection?")) return;
    try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE}/cart/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) loadCart();
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// --- 5. SUBMIT ORDER & REDIRECT ---
async function submitOrder() {
    const btn = document.getElementById("submitOrderBtn");
    
    // Capture user inputs from the checkout form
    const customer = {
        name: document.getElementById('custName')?.value.trim() || "",
        phone: document.getElementById('custPhone')?.value.trim() || "",
        address: document.getElementById('custAddress')?.value.trim() || "",
        email: currentUser.email
    };

    // Form Validation
    if (!customer.name || !customer.address || !customer.phone) {
        alert("Please provide your name, phone number, and delivery address.");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "VERIFYING WISHLIST...";

        const token = await currentUser.getIdToken();
        
        // Fetch current cart items
        const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cartItems = await cartRes.json();

        if (!cartItems || cartItems.length === 0) {
            btn.disabled = false;
            btn.innerText = "SUBMIT ORDER";
            return alert("Your cart is empty.");
        }

        btn.innerText = "CREATING ORDER...";

        // Format items for the Order Model
        const formattedItems = cartItems.map(item => ({
            productId: item.product._id,
            product_description: item.product.product_description,
            image: item.product.image,
            color: item.color || 'N/A',
            size: item.size || 'N/A',
            quantity: item.quantity
        }));

        // POST to the Orders API
        const orderRes = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                customer: customer,
                items: formattedItems,
                status: "Pending"
            })
        });

        const orderData = await orderRes.json();

        if (orderRes.ok) {
            const newOrderId = orderData.order._id;

            // --- PERSISTENCE: Save ID so it doesn't disappear on refresh ---
            localStorage.setItem('lastOrderId', newOrderId);

            alert("THANK YOU. YOUR ORDER HAS BEEN PLACED.");
            
            // DYNAMIC REDIRECT: Send user to tracking page with their new ID
            window.location.href = `orderStatus.html?id=${newOrderId}`;
        } else {
            throw new Error(orderData.message || "Failed to save order");
        }
    } catch (error) {
        console.error("Submission Error:", error);
        alert("ERROR: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "SUBMIT ORDER";
    }
}

// Global exposure for HTML buttons
window.deleteItem = deleteItem;
window.submitOrder = submitOrder;