import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. CONFIGURATION ---
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

const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app";

const API_BASE = `${API_BASE_URL}/api`;
let allOrders = []; 

// --- 2. AUTH OBSERVER (Fixed the TypeError) ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchOrders();
    } else {
        console.warn("No admin session found.");
    }
});

/**
 * 3. FETCH ALL ORDERS
 */
async function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    try {
        const user = auth.currentUser; 
        if (!user) return;
        const token = await user.getIdToken();

        const response = await fetch(`${API_BASE}/orders?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        allOrders = await response.json();
        renderOrders(allOrders);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

/**
 * 4. RENDER UI (Price Removed + Delete Button Added)
 */
function renderOrders(ordersToDisplay) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (!Array.isArray(ordersToDisplay) || ordersToDisplay.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-gray-400 font-bold uppercase text-[10px]">No orders found.</div>`;
        return;
    }

    const statusColors = {
        'Pending': 'bg-blue-100 text-blue-700',
        'Approved': 'bg-emerald-100 text-emerald-700',
        'Transporting': 'bg-black text-white',
        'Received': 'bg-gray-100 text-gray-400', 
        'Cancelled': 'bg-red-100 text-red-700'
    };

    container.innerHTML = ordersToDisplay.map(order => {
        const colorClass = statusColors[order.status] || 'bg-gray-100 text-gray-700';
        const isRemovable = order.status === 'Received' || order.status === 'Cancelled';
        
        // Line ID Handling
        const lineId = order.customer?.lineId || order.customer?.line || '';
        const lineLink = lineId.replace('@', '');

        // FIX: Prioritize 'deliveryInstructions' as defined in your cart.js
        const instructions = order.deliveryInstructions || 
                             order.customer?.deliveryInstructions || 
                             order.customer?.notes || 
                             order.notes || 
                             'No special instructions';

        return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 p-6 order-card">
            
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h3 class="font-black uppercase italic text-xl leading-none text-black">${order.customer?.name || 'Guest User'}</h3>
                    <p class="text-[9px] font-mono text-gray-400 mt-1 tracking-widest uppercase italic">Order ID: ${order._id}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 ${colorClass} rounded-full text-[9px] font-black uppercase tracking-widest border border-black/5">
                        ${order.status || 'Pending'}
                    </span>
                    ${isRemovable ? `
                        <button onclick="deleteOrder('${order._id}')" class="text-red-400 hover:text-red-600 p-1 transition-colors" title="Delete from History">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>` : ''}
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div class="space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                    <p class="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Checkout Information</p>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1">
                            <label class="text-[8px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                            <p class="text-[11px] font-bold text-black">${order.customer?.phone || 'N/A'}</p>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[8px] font-black uppercase tracking-widest text-gray-400">Line Account ID</label>
                            ${lineId ? `<a href="https://line.me/ti/p/~${lineLink}" target="_blank" class="text-[11px] font-bold text-emerald-600 hover:underline uppercase italic">
                                <i class="fa-brands fa-line mr-1"></i>${lineId}
                            </a>` : '<p class="text-[11px] font-bold text-gray-300">N/A</p>'}
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-[8px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                        <p class="text-[11px] font-bold text-black lowercase">${order.customer?.email || 'Not provided'}</p>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-[8px] font-black uppercase tracking-widest text-gray-400">Full Shipping Address</label>
                        <p class="text-[10px] font-bold leading-relaxed uppercase text-gray-700">${order.customer?.address || 'No address provided'}</p>
                    </div>

                    <div class="pt-3 border-t border-gray-200">
                        <label class="text-[8px] font-black uppercase tracking-widest text-orange-500 italic">Delivery Instructions</label>
                        <p class="text-[10px] font-black text-black uppercase mt-1">
                            ${instructions}
                        </p>
                    </div>
                </div>

                <div class="space-y-4">
                    <p class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Ordered Items</p>
                    ${order.items.map(item => {
                        const itemImg = item.image || item.product_image || '../image/logo.png';
                        const productDesc = item.product_description || item.description || item.name || 'Product Details Missing';
                        
                        return `
                        <div class="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0">
                            <img src="${itemImg}" class="w-16 h-16 object-contain rounded-lg bg-white border border-gray-100 shadow-sm" 
                                 onerror="this.src='../image/logo.png'">
                            <div class="flex-grow">
                                <h4 class="text-[11px] font-black uppercase leading-tight text-black tracking-tight">${productDesc}</h4>
                                <div class="flex gap-3 mt-2">
                                    <p class="text-[9px] font-black text-gray-400 uppercase">Qty: <span class="text-blue-600">${item.quantity}</span></p>
                                    ${item.size ? `<p class="text-[9px] font-black text-gray-400 uppercase">Size: <span class="text-black">${item.size}</span></p>` : ''}
                                    ${item.color ? `<p class="text-[9px] font-black text-gray-400 uppercase">Color: <span class="text-black">${item.color}</span></p>` : ''}
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <div class="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest">Update Order Step:</p>
                    <select onchange="updateStatus('${order._id}', this.value)" 
                            class="bg-black text-white border-none text-[10px] font-bold uppercase px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-all outline-none">
                        <option value="" disabled selected>Select Action...</option>
                        <option value="Approved">Approve Payment</option>
                        <option value="Order Made">In Production</option>
                        <option value="Transporting">Ship Order</option>
                        <option value="Received">Mark Delivered</option>
                        <option value="Cancelled">Void Order</option>
                    </select>
                </div>
            </div>
        </div>`;
    }).join('');
}
/**
 * 5. DELETE ORDER FUNCTION
 */
async function deleteOrder(orderId) {
    if (!confirm("Are you sure you want to delete this order from history? This cannot be undone.")) return;

    try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log("Order deleted successfully.");
            fetchOrders(); // Refresh list
        } else {
            alert("Failed to delete order. Check if your backend supports DELETE /api/orders/:id");
        }
    } catch (err) {
        console.error("Delete Error:", err);
    }
}

async function updateStatus(orderId, newStatus) {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) fetchOrders();
    } catch (err) { console.error(err); }
}
/**
 * 6. CLEAR ALL HISTORY (Delete Received & Cancelled Orders)
 */
async function clearAllHistory() {
    // 1. Filter for orders that are safe to delete
    const historyOrders = allOrders.filter(o => o.status === 'Received' || o.status === 'Cancelled');

    if (historyOrders.length === 0) {
        alert("No completed or cancelled orders found to clear.");
        return;
    }

    const confirmClear = confirm(`Are you sure you want to PERMANENTLY delete ${historyOrders.length} archived orders? This cannot be undone.`);
    
    if (confirmClear) {
        try {
            const token = await auth.currentUser.getIdToken();
            
            // We loop through the history orders and delete them
            // In a production environment, you'd ideally have a single "Delete All" endpoint on your backend
            const deletePromises = historyOrders.map(order => 
                fetch(`${API_BASE}/orders/${order._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );

            await Promise.all(deletePromises);
            
            alert("History cleared successfully.");
            fetchOrders(); // Refresh the UI
            
        } catch (err) {
            console.error("Clear History Error:", err);
            alert("An error occurred while clearing history.");
        }
    }
}

// Expose to window so the floating button can find it
window.clearAllHistory = clearAllHistory;
window.deleteOrder = deleteOrder;
window.updateStatus = updateStatus;
window.fetchOrders = fetchOrders;