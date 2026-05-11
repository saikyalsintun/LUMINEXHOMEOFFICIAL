// 1. CONFIGURATION & STATE
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app";

// Your verified Cloudinary Base URL
const CLOUDINARY_BASE = "https://res.cloudinary.com/dq8rbpfis/image/upload";

let allProducts = [];       // Master list (all collections combined)
let filteredProducts = [];  // List after category/search filters applied
let currentPage = 1;
const itemsPerPage = 20;    
const userSelections = {};

// 2. AUTHENTICATION TRACKER
let currentUser = null;
firebase.auth().onAuthStateChanged(user => {
    currentUser = user || null;
});

// 3. CORE DATA FETCHING & AGGREGATION
async function doSearch() {
    const term = document.getElementById('searchBox').value;
    const grid = document.getElementById('grid');
    
    try {
        // Parallel fetching from 3 MongoDB collections
        const [resStandard, resChairs, resDining] = await Promise.all([
            fetch(`${API_BASE_URL}/api/products?keyword=${term}`),
            fetch(`${API_BASE_URL}/api/chairs`),
            fetch(`${API_BASE_URL}/api/dining`)
        ]);

        const standard = await resStandard.json();
        const chairs = await resChairs.json();
        const dining = await resDining.json();

        // Map Chairs - Targeting your Underscore folder
        const formattedChairs = chairs.map(item => ({
            _id: item._id,
            category: "Chair",
            product_description: `${item.id}: ${item.description_en || item.description_cn}`,
            // We use encodeURIComponent to handle the Chinese characters/symbols safely
            image: `${CLOUDINARY_BASE}/Chair_Reduce/${encodeURIComponent(item.filename)}`,
            productColor: "Default",
            productSize: "Standard",
            remark: item.remark || "In Stock",
            productStatus: "Collection"
        }));

        // Map Dining - Targeting your Underscore folder
        const formattedDining = dining.map(item => ({
            _id: item._id,
            category: "Dining Table",
            product_description: `${item.id}: ${item.description_en || item.description_cn}`,
            image: `${CLOUDINARY_BASE}/Table_Reduce/${encodeURIComponent(item.filename)}`,
            productColor: "Default",
            productSize: "Standard",
            remark: item.remark || "In Stock",
            productStatus: "Premium"
        }));

        // Combine into one master array
        allProducts = [...standard, ...formattedChairs, ...formattedDining];
        
        // Initial filtering based on search term
        filteredProducts = term 
            ? allProducts.filter(p => 
                (p.product_description || "").toLowerCase().includes(term.toLowerCase()) ||
                (p.category || "").toLowerCase().includes(term.toLowerCase())
              )
            : allProducts;

        currentPage = 1; 
        renderFilters(allProducts);
        updateDisplay();

    } catch (err) {
        console.error("Aggregation error:", err);
        grid.innerHTML = '<p class="text-red-500 text-center py-10 uppercase tracking-widest text-[10px]">Database connection error. Please refresh.</p>';
    }
}

// 4. PAGINATION & RENDERING ENGINE
function updateDisplay() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredProducts.slice(startIndex, endIndex);

    renderProducts(paginatedItems);
    renderPaginationControls();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPaginationControls() {
    const container = document.getElementById('paginationControls');
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = (i === currentPage) 
            ? "bg-black text-white border-black" 
            : "bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black";
        
        html += `<button onclick="goToPage(${i})" class="px-4 py-2 mx-1 text-[12px] font-bold border transition-all ${activeClass}">${i}</button>`;
    }
    container.innerHTML = `<div class="flex justify-center items-center mt-12 mb-20">${html}</div>`;
}

window.goToPage = function(page) {
    currentPage = page;
    updateDisplay();
};

// 5. PRODUCT RENDERING
function renderProducts(products) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    if (!products || products.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-20 text-gray-400 font-light uppercase tracking-widest">No items found.</p>`;
        return;
    }

    products.forEach((p) => {
        const colors = Array.isArray(p.productColor) ? p.productColor : (p.productColor ? p.productColor.split(',') : []);
        const sizes = Array.isArray(p.productSize) ? p.productSize : (p.productSize ? p.productSize.split(',') : []);
        const remarkClass = p.remark === 'Pre-Order' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
        const marketingClass = (p.productStatus || '').toLowerCase().includes('hot') ? 'bg-orange-500 text-white border-orange-500' : 'bg-black text-white border-black';

        const colorBtns = colors.map(c => `<button onclick="selectVariant(this, 'color', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white mb-1">${c.trim()}</button>`).join('');
        const sizeBtns = sizes.map(s => `<button onclick="selectVariant(this, 'size', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white mb-1">${s.trim()}</button>`).join('');

        grid.innerHTML += `
            <div class="group relative flex flex-col bg-white border border-gray-100 p-4 transition-all duration-300 min-h-[480px] h-full hover:shadow-md" id="prod-${p._id}">
                <div class="relative aspect-[3/2] w-full overflow-hidden bg-gray-50 mb-4 shrink-0">
                    <img src="${p.image}" class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.src='https://placehold.co/600x400?text=LUMINEX'">
                    <div class="absolute top-2 left-2">${p.productStatus ? `<span class="${marketingClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${p.productStatus}</span>` : ''}</div>
                    <div class="absolute top-2 right-2"><span class="${remarkClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${p.remark || 'In Stock'}</span></div>
                    <button onclick="openZoom('${p.image}')" class="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 z-10">
                        <i class="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                    </button>
                </div>
                <div class="flex flex-col flex-grow">
                    <div class="mb-3 pr-6"> 
                        <p class="text-[9px] text-blue-600 font-bold uppercase tracking-widest mb-1">${p.category || 'Collection'}</p>
                        <h2 class="text-[13px] font-medium text-gray-900 leading-snug">${p.product_description}</h2>
                    </div>
                    <div class="grid grid-cols-1 gap-4 pt-3 border-t border-gray-50 mt-auto pb-4">
                        <div><span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Colors</span><div class="flex flex-wrap gap-2">${colorBtns}</div></div>
                        <div><span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Sizes (mm)</span><div class="flex flex-wrap gap-2">${sizeBtns}</div></div>
                    </div>
                    <button onclick="handleAddToCart('${p._id}')" class="w-full bg-[#1a1c23] text-white text-[11px] font-bold uppercase py-3.5 hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-star"></i> Add to Wishlist
                    </button>
                </div>
            </div>`;
    });
}

// 6. FILTERING LOGIC
function renderFilters(products) {
    const container = document.getElementById('filterContainer');
    if (!container) return;

    const counts = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(counts);
    container.innerHTML = `<button onclick="filterByCategory('All')" class="px-6 py-2 text-[10px] font-black uppercase bg-black text-white border border-black transition-all">ALL (${products.length})</button>`;

    categories.forEach(cat => {
        container.innerHTML += `<button onclick="filterByCategory('${cat}')" class="px-6 py-2 text-[10px] font-bold uppercase bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-all">${cat} (${counts[cat]})</button>`;
    });
}

window.filterByCategory = function(category) {
    currentPage = 1;
    filteredProducts = category === 'All' ? allProducts : allProducts.filter(p => p.category === category);
    
    document.querySelectorAll('#filterContainer button').forEach(btn => {
        const isMatch = btn.innerText.toUpperCase().includes(category.toUpperCase());
        btn.className = isMatch 
            ? "px-6 py-2 text-[10px] font-black uppercase bg-black text-white border border-black transition-all"
            : "px-6 py-2 text-[10px] font-bold uppercase bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-all";
    });

    updateDisplay();
};

// 7. VARIANTS & CART
window.selectVariant = function(btn, type, productId) {
    btn.parentElement.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('border-gray-200', 'bg-white', 'text-gray-700');
    });
    btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    if (!userSelections[productId]) userSelections[productId] = {};
    userSelections[productId][type] = btn.innerText.trim();
};

async function handleAddToCart(productId) {
    const selection = userSelections[productId];
    if (!selection || !selection.color || !selection.size) {
        alert("Please select both Color and Size.");
        return;
    }
    triggerFlyAnimation(productId);
    await addToCart(productId, selection.color, selection.size);
}

async function addToCart(productId, color, size) {
    if (!currentUser) { alert("Please login first"); window.location.href = "login.html"; return; }
    const token = await currentUser.getIdToken(true);
    try {
        await fetch(`${API_BASE_URL}/api/cart/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ productId, color, size })
        });
    } catch (err) { console.error("Cart Error:", err); }
}

// 8. UI HELPERS
function triggerFlyAnimation(productId) {
    const productImage = document.getElementById(`prod-${productId}`).querySelector('img');
    const wishlistIcon = document.getElementById('wishlist-icon');
    if (!productImage || !wishlistIcon) return;

    const flyingImg = productImage.cloneNode();
    const rect = productImage.getBoundingClientRect();
    const targetRect = wishlistIcon.getBoundingClientRect();

    Object.assign(flyingImg.style, {
        position: 'fixed', zIndex: '100', top: `${rect.top}px`, left: `${rect.left}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, transition: 'all 0.8s ease-in-out', pointerEvents: 'none'
    });

    document.body.appendChild(flyingImg);
    setTimeout(() => {
        Object.assign(flyingImg.style, {
            top: `${targetRect.top}px`, left: `${targetRect.left}px`, width: '20px', height: '20px', opacity: '0', transform: 'rotate(360deg)'
        });
    }, 10);
    setTimeout(() => { flyingImg.remove(); }, 800);
}

window.openZoom = function(src) {
    const img = document.getElementById('zoomedImg');
    img.src = src;
    img.style.transform = 'scale(1)';
    document.getElementById('zoomModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
};

window.closeZoom = function() {
    document.getElementById('zoomModal').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
};

window.toggleSearch = function() {
    const sb = document.getElementById('search-bar');
    sb.classList.toggle('hidden');
    if(!sb.classList.contains('hidden')) document.getElementById('searchBox').focus();
};

// INITIALIZE
doSearch();