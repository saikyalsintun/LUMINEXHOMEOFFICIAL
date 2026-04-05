// --- orders-admin.js ---

// 1. CONFIGURATION
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app"; // Your actual Vercel backend

// Using a standard constant instead of 'export' to avoid Module errors in regular scripts
const API_BASE = `${API_BASE_URL}/api`;

let allOrders = []; 

/**
 * 2. FETCH ALL ORDERS FROM DATABASE
 */
async function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    
    try {
        // Cache busting with Date.now() ensures you always get the freshest data
        const response = await fetch(`${API_BASE}/orders?t=${Date.now()}`);
        
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        
        allOrders = await response.json();
        renderOrders(allOrders);
        console.log("Orders synced successfully.");
        
    } catch (error) {
        console.error("Fetch Error:", error);
        if (container) {
            container.innerHTML = `
                <div class="text-red-500 text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                    <i class="fa-solid fa-triangle-exclamation mb-4 text-2xl"></i>
                    <p class="font-black uppercase text-[10px] tracking-widest">Database Sync Error</p>
                    <p class="text-[10px] mt-2">${error.message}</p>
                    <button onclick="fetchOrders()" class="mt-4 bg-red-500 text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase">Retry Connection</button>
                </div>`;
        }
    }
}

/**
 * 3. RENDER ORDERS TO THE HTML GRID
 */
function renderOrders(ordersToDisplay) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    if (!Array.isArray(ordersToDisplay) || ordersToDisplay.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                No orders found in this category.
            </div>`;
        return;
    }

    const statusColors = {
        'Pending': 'bg-blue-100 text-blue-700',
        'Approved': 'bg-emerald-100 text-emerald-700',
        'Direct Contact': 'bg-purple-100 text-purple-700',
        'Order Made': 'bg-orange-100 text-orange-700',
        'Transporting': 'bg-black text-white',
        'Received': 'bg-gray-100 text-gray-400', 
        'Cancelled': 'bg-red-100 text-red-700'
    };

    container.innerHTML = ordersToDisplay.map(order => {
        const colorClass = statusColors[order.status] || 'bg-gray-100 text-gray-700';
        const isCompleted = order.status === 'Received';
        const isCancelled = order.status === 'Cancelled';
        
        // Clean Line ID for the link (removes @ if present)
        const lineLink = order.customer?.lineId ? order.customer.lineId.replace('@', '') : '';

        return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all ${isCompleted ? 'opacity-60 grayscale-[0.5]' : 'hover:border-black hover:shadow-md'}">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-black text-white">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <p class="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Customer Profile</p>
                        <span class="text-[7px] px-2 py-0.5 rounded border border-blue-500 text-blue-500 font-black uppercase tracking-tighter">Verified Order</span>
                    </div>
                    <h3 class="text-lg font-bold uppercase tracking-tight italic">${order.customer?.name || 'Anonymous'}</h3>
                    
                    <div class="flex flex-wrap gap-4 mt-3">
                        <p class="text-[10px] text-gray-400 font-bold"><i class="fa-solid fa-phone mr-1 text-blue-500"></i>${order.customer?.phone || 'N/A'}</p>
                        
                        ${order.customer?.lineId ? `
                        <a href="https://line.me/ti/p/~${lineLink}" target="_blank" class="text-[10px] text-emerald-400 font-bold hover:underline">
                            <i class="fa-brands fa-line mr-1"></i>${order.customer.lineId}
                        </a>` : ''}
                        
                        <p class="text-[10px] text-gray-400 font-bold"><i class="fa-solid fa-envelope mr-1"></i>${order.customer?.email || 'N/A'}</p>
                    </div>
                </div>

                <div class="md:text-right flex flex-col justify-between items-end">
                    <div class="w-full">
                        <p class="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Delivery Address</p>
                        <p class="text-xs text-gray-200 mt-1 leading-relaxed">${order.customer?.address || 'Address missing'}</p>
                        
                        ${order.customer?.deliveryInstructions ? `
                        <div class="mt-2 bg-yellow-400/10 border border-yellow-400/20 p-2 rounded-lg inline-block text-left">
                            <p class="text-[8px] text-yellow-400 font-black uppercase tracking-widest">Note for Driver:</p>
                            <p class="text-[10px] text-yellow-200 italic">"${order.customer.deliveryInstructions}"</p>
                        </div>` : ''}
                    </div>
                    <div class="mt-4">
                        <span class="px-3 py-1 ${colorClass} rounded-full text-[9px] font-black uppercase tracking-widest">
                            ${order.status || 'Pending'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <div class="space-y-4">
                    ${order.items.map(item => `
                        <div class="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <img src="${item.image}" class="w-14 h-14 object-cover rounded-lg bg-gray-50 border border-gray-100" onerror="this.src='../image/logo.png'">
                            <div class="flex-grow">
                                <h4 class="text-[11px] font-black uppercase text-black leading-tight">${item.product_description || 'Product'}</h4>
                                <p class="text-[9px] text-gray-400 font-bold uppercase mt-1">Size: <span class="text-black">${item.size || 'N/A'}</span> | Color: <span class="text-black">${item.color || 'N/A'}</span></p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-black italic tracking-tighter text-blue-600">x${item.quantity}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-t border-gray-100">
                <div class="flex flex-col">
                    <span class="text-[8px] text-gray-400 font-mono uppercase tracking-widest">Internal Order Ref</span>
                    <span class="text-[9px] text-gray-400 font-mono">${order._id}</span>
                </div>

                <div class="flex items-center gap-3">
                    ${!isCompleted && !isCancelled ? `
                        <p class="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Status Control:</p>
                        <select 
                            onchange="updateStatus('${order._id}', this.value)" 
                            class="bg-white border border-gray-200 text-[10px] font-bold uppercase px-3 py-2 rounded-lg cursor-pointer hover:border-black transition-all"
                        >
                            <option value="" disabled selected>Update Step...</option>
                            <option value="Pending">1. New Order</option>
                            <option value="Approved">2. Payment Approved</option>
                            <option value="Direct Contact">3. Contacting via Line</option>
                            <option value="Order Made">4. Production/Stock Ready</option>
                            <option value="Transporting">5. In Transit</option>
                            <option value="Received">6. Delivered</option>
                            <option value="Cancelled">X. Void Order</option>
                        </select>
                    ` : `
                        <p class="text-[10px] font-black uppercase ${isCancelled ? 'text-red-500' : 'text-emerald-600'} tracking-widest italic">
                            <i class="fa-solid ${isCancelled ? 'fa-ban' : 'fa-circle-check'} mr-1"></i> 
                            ${isCancelled ? 'Order Cancelled' : 'Order Completed'}
                        </p>
                    `}
                </div>
            </div>
        </div>`;
    }).join('');
}
/**
 * 4. FILTER & UPDATE LOGIC
 */
function filterByStatus(status) {
    if (!status) {
        renderOrders(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.status === status);
        renderOrders(filtered);
    }
}
//change
async function updateStatus(orderId, newStatus) {
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH', // Matches the backend router.patch
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            console.log("Update successful");
            fetchOrders(); // Refresh the UI
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Failed to connect. Is the backend server running?");
    }
}

// Global exposure
window.updateStatus = updateStatus;
window.filterByStatus = filterByStatus;
window.fetchOrders = fetchOrders;

// Start
fetchOrders();

// Refresh every 30s
setInterval(fetchOrders, 30000);