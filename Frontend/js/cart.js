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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let currentUser = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        currentUser = user;
        await loadCart();
    }
});

// --- 3. LOAD AND DISPLAY CART (MOBILE OPTIMIZED) ---
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

        if (!res.ok) throw new Error(`Server error`);
        const cartItems = await res.json();
        
        if (!grid) return;
        grid.innerHTML = "";

        if (!cartItems || cartItems.length === 0) {
            grid.innerHTML = `
                <div class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Wishlist is empty</p>
                    <a href="home.html" class="text-[10px] underline mt-3 block uppercase font-bold text-black">Start Shopping</a>
                </div>`;
            if (orderSummary) orderSummary.classList.add("hidden");
            return;
        }

        if (orderSummary) orderSummary.classList.remove("hidden");
        if (totalCount) totalCount.innerText = cartItems.length;

        cartItems.forEach(item => {
            const product = item.product || {};
            grid.innerHTML += `
            <div class="bg-white border border-gray-100 p-3 flex gap-4 items-center rounded-2xl">
                <div class="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden rounded-xl">
                    <img src="${product.image || ''}" class="w-full h-full object-cover" alt="Product">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-start">
                        <span class="text-[8px] font-bold text-orange-500 uppercase tracking-widest truncate">${product.category || 'FURNITURE'}</span>
                        <button onclick="deleteItem('${item._id || item.itemId}')" class="text-gray-300 hover:text-red-500 p-1">
                            <i class="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                    <h2 class="font-bold text-[13px] uppercase truncate text-black">${product.product_description || 'Item'}</h2>
                    <div class="flex gap-3 mt-1">
                        <p class="text-[9px] uppercase text-gray-400"><span class="text-black font-bold">${item.color || 'N/A'}</span></p>
                        <p class="text-[9px] uppercase text-gray-400"><span class="text-black font-bold">${item.size || 'N/A'}</span></p>
                        <p class="text-[9px] uppercase text-gray-400">Qty: <span class="text-black font-bold">${item.quantity}</span></p>
                    </div>
                </div>
            </div>`;
        });
    } catch (error) {
        grid.innerHTML = `<p class="text-red-500 text-center text-[10px]">Failed to load selection.</p>`;
    }
}

async function deleteItem(id) {
    if (!confirm("Remove item?")) return;
    try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE}/cart/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) await loadCart();
    } catch (error) {
        console.error(error);
    }
}

async function submitOrder() {
    const btn = document.getElementById("submitOrderBtn");
    const customer = {
        name: document.getElementById('custName')?.value.trim() || "",
        phone: document.getElementById('custPhone')?.value.trim() || "",
        address: document.getElementById('custAddress')?.value.trim() || "",
        email: currentUser.email
    };

    if (!customer.name || !customer.address || !customer.phone) {
        alert("Fill in all delivery details.");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "PROCESSING...";

        const token = await currentUser.getIdToken();
        const cartRes = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cartItems = await cartRes.json();

        const formattedItems = cartItems.map(item => ({
            productId: item.product._id,
            product_description: item.product.product_description,
            image: item.product.image,
            color: item.color || 'N/A',
            size: item.size || 'N/A',
            quantity: item.quantity
        }));

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
            window.location.href = `orderStatus.html?id=${orderData.order._id}`;
        } else {
            throw new Error(orderData.message);
        }
    } catch (error) {
        alert("ERROR: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "PLACE ORDER";
    }
}

window.deleteItem = deleteItem;
window.submitOrder = submitOrder;