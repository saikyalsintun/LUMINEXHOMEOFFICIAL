// --- 1. CONFIGURATION ---
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

let currentUser = null;

// --- 2. AUTH LISTENER ---
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        console.warn("No user detected, redirecting to login...");
        window.location.href = "login.html";
    } else {
        currentUser = user;
        console.log("User authenticated:", user.email);
        await loadCart();
    }
});

// --- 3. LOAD AND DISPLAY CART ---
async function loadCart() {
    const grid = document.getElementById("cartGrid");
    const orderSummary = document.getElementById("orderSummary");
    const totalCount = document.getElementById("totalCount");

    try {
        if (!currentUser) return;
        
        const token = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/cart`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const cartItems = await res.json();
        
        if (!grid) return;
        grid.innerHTML = "";

        if (!cartItems || cartItems.length === 0) {
            grid.innerHTML = `
                <div class="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p class="text-xs font-black uppercase tracking-widest text-gray-400">Your wishlist is empty</p>
                    <a href="home.html" class="text-[10px] underline mt-4 block uppercase font-bold text-black">Start Shopping</a>
                </div>`;
            if (orderSummary) orderSummary.classList.add("hidden");
            if (totalCount) totalCount.innerText = "0";
            return;
        }

        if (orderSummary) orderSummary.classList.remove("hidden");
        if (totalCount) totalCount.innerText = cartItems.length;

        cartItems.forEach(item => {
            const product = item.product || {};
            grid.innerHTML += `
            <div class="group border border-gray-100 p-4 flex gap-6 items-center hover:border-black transition-all bg-white rounded-xl">
                <div class="w-24 h-24 flex-shrink-0 bg-gray-50 overflow-hidden rounded-lg">
                    <img src="${product.image || ''}" class="w-full h-full object-contain mix-blend-multiply" alt="Product">
                </div>
                <div class="flex-grow">
                    <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">${product.category || 'Collection'}</span>
                    <h2 class="font-bold text-sm uppercase mb-1 text-black">${product.product_description || 'No Description'}</h2>
                    <div class="flex gap-4">
                        <p class="text-[9px] uppercase text-gray-400 font-bold">Color: <span class="text-black">${item.color || 'N/A'}</span></p>
                        <p class="text-[9px] uppercase text-gray-400 font-bold">Size: <span class="text-black">${item.size || 'N/A'}</span></p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-black">x${item.quantity}</span>
                    <button onclick="deleteItem('${item._id || item.itemId}')" class="block mt-2 text-[9px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors">
                        [ Remove ]
                    </button>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Load Error:", error);
        if (grid) grid.innerHTML = `<p class="text-red-500 text-center text-xs">Error loading cart. Please try again later.</p>`;
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
        if (response.ok) {
            await loadCart();
        } else {
            alert("Could not remove item.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// --- 5. SUBMIT ORDER ---
async function submitOrder() {
    const btn = document.getElementById("submitOrderBtn");
    
    const customer = {
        name: document.getElementById('custName')?.value.trim() || "",
        phone: document.getElementById('custPhone')?.value.trim() || "",
        address: document.getElementById('custAddress')?.value.trim() || "",
        email: currentUser.email
    };

    if (!customer.name || !customer.address || !customer.phone) {
        alert("Please provide your name, phone number, and delivery address.");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "PROCESSING...";

        const token = await currentUser.getIdToken();
        
        // 1. Get items
        const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cartItems = await cartRes.json();

        if (!cartItems || cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // 2. Format
        const formattedItems = cartItems.map(item => ({
            productId: item.product._id,
            product_description: item.product.product_description,
            image: item.product.image,
            color: item.color || 'N/A',
            size: item.size || 'N/A',
            quantity: item.quantity
        }));

        // 3. Post Order
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
            localStorage.setItem('lastOrderId', orderData.order._id);
            alert("THANK YOU. YOUR ORDER HAS BEEN PLACED.");
            window.location.href = `orderStatus.html?id=${orderData.order._id}`;
        } else {
            throw new Error(orderData.message || "Failed to save order");
        }
    } catch (error) {
        console.error("Submission Error:", error);
        alert("ERROR: " + error.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "SUBMIT ORDER";
        }
    }
}

// Global exposure
window.deleteItem = deleteItem;
window.submitOrder = submitOrder;