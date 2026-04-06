/**
 * LUMINEX HOME - PRODUCT LOGIC
 * Handles: API Fetching, Category Filtering, Variant Selection, and Wishlist
 */

// 1. CONFIGURATION & STATE
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app";

let allProducts = [];
const userSelections = {};
let currentScale = 1;
let currentUser = null;

// 2. AUTHENTICATION TRACKER
// Relies on Firebase being initialized in auth-logic.js
firebase.auth().onAuthStateChanged(user => {
    currentUser = user || null;
});

// 3. CORE SEARCH & FETCH FUNCTION
async function doSearch() {
    const searchInput = document.getElementById('searchBox');
    const term = searchInput ? searchInput.value : "";
    const grid = document.getElementById('grid');
    
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/products?keyword=${term}`);
        allProducts = await res.json();
        
        renderFilters(allProducts);
        renderProducts(allProducts);

    } catch (err) {
        console.error("Search error:", err);
        grid.innerHTML = '<p class="text-red-500 text-center py-10 font-bold uppercase tracking-widest">Backend Offline / Connection Error</p>';
    }
}

// 4. DYNAMIC CATEGORY FILTERING UI
function renderFilters(products) {
    const filterContainer = document.getElementById('filterContainer');
    if (!filterContainer) return;

    const categoryCounts = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(categoryCounts);

    // Default "All" button
    filterContainer.innerHTML = `
        <button onclick="filterByCategory('All')" 
            class="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black text-white border border-black transition-all">
            ALL (${products.length})
        </button>
    `;

    categories.forEach(cat => {
        filterContainer.innerHTML += `
            <button onclick="filterByCategory('${cat}')" 
                class="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-all">
                ${cat.toUpperCase()} (${categoryCounts[cat]})
            </button>
        `;
    });
}

window.filterByCategory = function(category) {
    const buttons = document.querySelectorAll('#filterContainer button');
    
    buttons.forEach(btn => {
        const isMatch = btn.innerText.toUpperCase().includes(category.toUpperCase());
        btn.className = isMatch 
            ? "px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black text-white border border-black transition-all"
            : "px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-all";
    });

    const filtered = category === 'All' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    renderProducts(filtered);
};

// 5. PRODUCT RENDERING ENGINE
function renderProducts(products) {
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!products || products.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-400 font-light uppercase tracking-widest">No items found.</p>`;
        return;
    }

    products.forEach((p) => {
        const colors = Array.isArray(p.productColor) ? p.productColor : (p.productColor ? p.productColor.split(',') : []);
        const sizes = Array.isArray(p.productSize) ? p.productSize : (p.productSize ? p.productSize.split(',') : []);

        const isPreOrder = p.remark === 'Pre-Order';
        const remarkBadgeClass = isPreOrder ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
        const remarkText = p.remark || 'In Stock';

        const marketingText = p.productStatus || ''; 
        let marketingBadgeClass = 'bg-black text-white border-black'; 
        if (marketingText.toLowerCase().includes('hot')) marketingBadgeClass = 'bg-orange-500 text-white border-orange-500';

        const colorButtons = colors.map(color => `
            <button onclick="selectVariant(this, 'color', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white mb-1">${color.trim()}</button>`).join('');

        const sizeButtons = sizes.map(size => `
            <button onclick="selectVariant(this, 'size', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white mb-1">${size.trim()}</button>`).join('');

        grid.innerHTML += `
            <div class="group relative flex flex-col bg-white border border-gray-100 p-4 transition-all duration-300 min-h-[480px] hover:shadow-md" id="prod-${p._id}">
                <div class="relative aspect-[3/2] w-full overflow-hidden bg-gray-50 mb-4 shrink-0">
                    <img src="${p.image}" class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/600x400?text=LUMINEX'">
                    <div class="absolute top-2 left-2">${marketingText ? `<span class="${marketingBadgeClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${marketingText}</span>` : ''}</div>
                    <div class="absolute top-2 right-2"><span class="${remarkBadgeClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${remarkText}</span></div>
                    <button onclick="openZoom('${p.image}')" class="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 z-10">
                        <i class="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                    </button>
                </div>
                <div class="flex flex-col flex-grow relative">
                    <div class="mb-3 pr-6"> 
                        <p class="text-[9px] text-blue-600 font-bold uppercase tracking-widest mb-1">${p.category || 'Collection'}</p>
                        <h2 class="text-[13px] font-medium text-gray-900 leading-snug">${p.product_description || 'Essential Piece'}</h2>
                    </div>
                    <div class="grid grid-cols-1 gap-4 pt-3 border-t border-gray-50 mt-auto pb-4">
                        <div><span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Colors</span><div class="flex flex-wrap gap-2">${colorButtons}</div></div>
                        <div><span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Sizes (mm)</span><div class="flex flex-wrap gap-2">${sizeButtons}</div></div>
                    </div>
                    <button onclick="handleAddToCart('${p._id}')" class="w-full bg-[#1a1c23] text-white text-[11px] font-bold uppercase py-3.5 hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-star"></i> Add to Wishlist
                    </button>
                </div>
            </div>`;
    });
}

// 6. VARIANT SELECTION
window.selectVariant = function(btn, type, productId) {
    const rowContainer = btn.parentElement;
    rowContainer.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('border-gray-300', 'bg-white', 'text-gray-700');
    });
    btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    if (!userSelections[productId]) userSelections[productId] = {};
    userSelections[productId][type] = btn.innerText.trim();
};

// 7. WISHLIST / CART LOGIC
async function handleAddToCart(productId) {
    const selection = userSelections[productId];
    if (!selection || !selection.color || !selection.size) {
        alert("Please select both Color and Size before adding to wishlist.");
        return;
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn || !currentUser) { 
        alert("Please login to save items to your wishlist."); 
        window.location.href = "login.html";
        return; 
    }

    triggerFlyAnimation(productId);
    await addToCartDB(productId, selection.color, selection.size);
}

async function addToCartDB(productId, color, size) {
    const token = await currentUser.getIdToken(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ productId, color, size })
        });
        if (!res.ok) throw new Error("Database update failed");
        console.log("Success: Added to wishlist");
    } catch (err) {
        console.error("Cart Error:", err);
    }
}

// 8. ANIMATIONS & MODALS
function triggerFlyAnimation(productId) {
    const productCard = document.getElementById(`prod-${productId}`);
    const productImage = productCard ? productCard.querySelector('img') : null;
    const wishlistIcon = document.getElementById('wishlist-icon');

    if (!productImage || !wishlistIcon) return;

    const flyingImg = productImage.cloneNode();
    const rect = productImage.getBoundingClientRect();
    const targetRect = wishlistIcon.getBoundingClientRect();

    Object.assign(flyingImg.style, {
        position: 'fixed', zIndex: '9999', transition: 'all 0.8s ease-in-out',
        top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`
    });

    document.body.appendChild(flyingImg);
    setTimeout(() => {
        Object.assign(flyingImg.style, {
            top: `${targetRect.top}px`, left: `${targetRect.left}px`, width: '20px', height: '20px', opacity: '0'
        });
    }, 10);
    setTimeout(() => {
        flyingImg.remove();
        wishlistIcon.classList.add('animate-beat');
        setTimeout(() => wishlistIcon.classList.remove('animate-beat'), 400);
    }, 800);
}

window.openZoom = function(imgSrc) {
    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomedImg');
    img.src = imgSrc;
    currentScale = 1; 
    img.style.transform = `scale(${currentScale})`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
};

window.closeZoom = function() {
    document.getElementById('zoomModal').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
};

window.adjustZoom = function(amount) {
    const img = document.getElementById('zoomedImg');
    currentScale += amount;
    currentScale = Math.min(Math.max(currentScale, 0.5), 3);
    img.style.transform = `scale(${currentScale})`;
};

// INITIALIZE
doSearch();