// 1. CONFIGURATION & STATE

// Check if we are running on localhost or a live server
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://luminexhomeofficial.vercel.app/"; // Your new Backend URL // <--- Replace with your actual Vercel URL

const firebaseConfig = {
    // These are public keys, but it's still better to use variables if your bundler supports them
    apiKey: "AIzaSyCDJ042NuwnbGCxaTN7ZIQcaPN3ius8Bmo",
    authDomain: "luminex-7ba90.firebaseapp.com",
    projectId: "luminex-7ba90",
    storageBucket: "luminex-7ba90.firebasestorage.app",
    messagingSenderId: "977344382421",
    appId: "1:977344382421:web:6fa2461522856b4563295c",
    measurementId: "G-TB90F73ZGX"
};

firebase.initializeApp(firebaseConfig);

let allProducts = [];
const userSelections = {};
let currentScale = 1;

// 2. AUTHENTICATION TRACKER
let currentUser = null;
firebase.auth().onAuthStateChanged(user => {
    currentUser = user || null;
});

// 3. CORE SEARCH FUNCTION
async function doSearch() {
    const term = document.getElementById('searchBox').value;
    const grid = document.getElementById('grid');
    
    try {
        // FIXED: Using API_BASE_URL instead of hardcoded localhost
        const res = await fetch(`${API_BASE_URL}/api/products?keyword=${term}`);
        allProducts = await res.json();
        
        renderFilters(allProducts);
        renderProducts(allProducts);

    } catch (err) {
        console.error("Search error:", err);
        grid.innerHTML = '<p class="text-red-500 text-center py-10">Backend not responding...</p>';
    }
}

// 4. DYNAMIC CATEGORY FILTERING
function renderFilters(products) {
    const filterContainer = document.getElementById('filterContainer');
    if (!filterContainer) return;

    const categoryCounts = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(categoryCounts);

    // Initial "All" button - Starts in the ACTIVE state (Black background)
    filterContainer.innerHTML = `
        <button onclick="filterByCategory('All')" 
            class="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black text-white border border-black transition-all">
            ALL (${products.length})
        </button>
    `;

    // Category Buttons - Start in the INACTIVE state (White background/Gray text)
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
    // UI Update: Minimalist highlight logic
    const buttons = document.querySelectorAll('#filterContainer button');
    
    buttons.forEach(btn => {
        const isMatch = btn.innerText.toUpperCase().includes(category.toUpperCase());
        
        if (isMatch) {
            // Active State: Solid black, bold, uppercase
            btn.className = "px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black text-white border border-black transition-all";
        } else {
            // Inactive State: Transparent/White, thin border, gray text
            btn.className = "px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black transition-all";
        }
    });

    // Filtering logic
    const filtered = category === 'All' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    renderProducts(filtered);
};
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

        const isPreOrder = p.remark === 'Pre-Order';
        const remarkBadgeClass = isPreOrder ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
        const remarkText = p.remark || 'In Stock';

        const marketingText = p.productStatus || ''; 
        let marketingBadgeClass = 'bg-black text-white border-black'; 
        if (marketingText.toLowerCase().includes('hot')) {
            marketingBadgeClass = 'bg-orange-500 text-white border-orange-500';
        }

        const colorButtons = colors.map(color => `
            <button onclick="selectVariant(this, 'color', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white whitespace-nowrap mb-1">${color.trim()}</button>`).join('');

        const sizeButtons = sizes.map(size => `
            <button onclick="selectVariant(this, 'size', '${p._id}')" class="border border-gray-200 px-3 py-1.5 text-[10px] uppercase font-medium hover:border-black transition-all bg-white whitespace-nowrap mb-1">${size.trim()}</button>`).join('');

        grid.innerHTML += `
            <div class="group relative flex flex-col bg-white border border-gray-100 p-4 transition-all duration-300 min-h-[480px] h-full w-full hover:shadow-md" id="prod-${p._id}">
                
                <div class="relative aspect-[3/2] w-full overflow-hidden bg-gray-50 mb-4 shrink-0">
                    <img src="${p.image}" class="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/600x400?text=LUMINEX'">
                    
                    <div class="absolute top-2 left-2">${marketingText ? `<span class="${marketingBadgeClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${marketingText}</span>` : ''}</div>
                    <div class="absolute top-2 right-2"><span class="${remarkBadgeClass} text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm border shadow-sm">${remarkText}</span></div>

                    <button onclick="openZoom('${p.image}')" class="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-100 z-10">
                        <i class="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                    </button>
                </div>

                <div class="flex flex-col flex-grow relative">
                    <div class="absolute right-0 top-0 group/info">
                        <i class="fa-solid fa-circle-info text-gray-300 hover:text-blue-600 cursor-help transition-colors text-sm"></i>
                        <div class="absolute right-0 bottom-6 w-48 bg-white border border-gray-100 shadow-xl p-3 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 rounded-sm">
                            <p class="text-[9px] uppercase font-bold text-gray-400 mb-2 border-b pb-1">Specifications</p>
                            <p class="text-[10px] text-gray-600 mb-1"><strong>SKU:</strong> ${p.itemNo}</p>
                            <p class="text-[10px] text-gray-600"><strong>Material:</strong> ${p.material}</p>
                        </div>
                    </div>

                    <div class="mb-3 pr-6"> <p class="text-[9px] text-blue-600 font-bold uppercase tracking-widest mb-1">${p.category || 'Collection'}</p>
                        <h2 class="text-[13px] font-medium text-gray-900 leading-snug">
                            ${p.product_description || 'Essential Piece'}
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 gap-4 pt-3 border-t border-gray-50 mt-auto pb-4">
                        <div>
                            <span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Colors</span>
                            <div class="flex flex-wrap gap-2">${colorButtons}</div>
                        </div>
                        <div>
                            <span class="text-[10px] uppercase text-gray-400 font-bold block mb-2">Sizes (mm)</span>
                            <div class="flex flex-wrap gap-2">${sizeButtons}</div>
                        </div>
                    </div>

                    <button onclick="handleAddToCart('${p._id}')" 
                        class="w-full bg-[#1a1c23] text-white text-[11px] font-bold uppercase py-3.5 hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-star"></i> Add to Wishlist
                    </button>
                </div>
            </div>`;
    });
}

// Ensure the popover flips if it hits the right edge of the screen
function adjustPopoverDirection(element) {
    const popover = element.querySelector('.popover-box');
    const arrow = element.querySelector('.popover-arrow');
    const rect = element.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    if (rect.right > screenWidth * 0.75) {
        popover.style.left = 'auto';
        popover.style.right = '100%';
        popover.style.marginLeft = '0';
        popover.style.marginRight = '15px';
        arrow.style.left = 'auto';
        arrow.style.right = '-9px';
        arrow.style.borderLeft = 'none';
        arrow.style.borderBottom = 'none';
        arrow.style.borderRight = '1px solid #f3f4f6';
        arrow.style.borderTop = '1px solid #f3f4f6';
    } else {
        popover.style.left = '100%';
        popover.style.right = 'auto';
        popover.style.marginLeft = '15px';
        popover.style.marginRight = '0';
        arrow.style.right = 'auto';
        arrow.style.left = '-9px';
        arrow.style.borderRight = 'none';
        arrow.style.borderTop = 'none';
        arrow.style.borderLeft = '1px solid #f3f4f6';
        arrow.style.borderBottom = '1px solid #f3f4f6';
    }
}
// 6. VARIANT SELECTION (Isolates clicks to specific card rows)
window.selectVariant = function(btn, type, productId) {
    const rowContainer = btn.parentElement;
    
    // Reset only the buttons in this row (color or size)
    rowContainer.querySelectorAll('button').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        b.classList.add('border-gray-300', 'bg-white', 'text-gray-700');
    });

    // Style the clicked button
    btn.classList.remove('border-gray-300', 'bg-white', 'text-gray-700');
    btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
    
    // Save selection
    if (!userSelections[productId]) userSelections[productId] = {};
    userSelections[productId][type] = btn.innerText.trim();
};

// 7. CART LOGIC
async function handleAddToCart(productId) {
    const selection = userSelections[productId];
    
    // 1. Validation check
    if (!selection || !selection.color || !selection.size) {
        alert("Please select both Color and Size before adding to wishlist.");
        return;
    }

    // 2. Trigger the Animation (Visual feedback)
    triggerFlyAnimation(productId);

    // 3. Proceed to Database logic
    await addToCart(productId, selection.color, selection.size);
}

function triggerFlyAnimation(productId) {
    const productCard = document.getElementById(`prod-${productId}`);
    const productImage = productCard.querySelector('img');
    const wishlistIcon = document.getElementById('wishlist-icon');

    if (!productImage || !wishlistIcon) return;

    // Create the flying ghost element
    const flyingImg = productImage.cloneNode();
    const rect = productImage.getBoundingClientRect();
    const targetRect = wishlistIcon.getBoundingClientRect();

    flyingImg.classList.add('fly-item');
    // Start position (at the product image)
    flyingImg.style.top = `${rect.top}px`;
    flyingImg.style.left = `${rect.left}px`;
    flyingImg.style.width = `${rect.width}px`;
    flyingImg.style.height = `${rect.height}px`;

    document.body.appendChild(flyingImg);

    // Transition to Navbar icon
    setTimeout(() => {
        flyingImg.style.top = `${targetRect.top}px`;
        flyingImg.style.left = `${targetRect.left}px`;
        flyingImg.style.width = '20px';
        flyingImg.style.height = '20px';
        flyingImg.style.opacity = '0';
        flyingImg.style.transform = 'rotate(360deg)';
    }, 10);

    // Cleanup and heart "beat"
    setTimeout(() => {
        flyingImg.remove();
        wishlistIcon.classList.add('animate-beat');
        setTimeout(() => wishlistIcon.classList.remove('animate-beat'), 400);
    }, 800);
}

async function addToCart(productId, color, size) {
    if (!currentUser) { 
        alert("Please login first"); 
        return; 
    }

    // Refresh the Firebase token to ensure it's valid
    const token = await currentUser.getIdToken(true);

    try {
        // FIXED: Using ${API_BASE_URL} instead of localhost
        const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ productId, color, size })
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            console.error("Failed to add to database:", errorData.message);
            // Optional: alert("Could not save to cart. Please try again.");
        } else {
            console.log("Item successfully added to cart!");
        }
    } catch (err) {
        console.error("Cart Network Error:", err);
        alert("Server is currently unreachable. Check your connection.");
    }
}

//count
// 8. IMAGE ZOOM MODAL LOGIC
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
    if (currentScale < 0.5) currentScale = 0.5;
    if (currentScale > 3) currentScale = 3;
    img.style.transform = `scale(${currentScale})`;
};

window.toggleDetails = function(productId) {
    // Find the specific detail div for this product
    const detailsDiv = document.getElementById(`details-${productId}`);
    
    if (detailsDiv) {
        // Toggle the 'hidden' class
        const isHidden = detailsDiv.classList.contains('hidden');
        
        if (isHidden) {
            detailsDiv.classList.remove('hidden');
            // Optional: add a slight animation class if using Tailwind
            detailsDiv.classList.add('block'); 
        } else {
            detailsDiv.classList.add('hidden');
            detailsDiv.classList.remove('block');
        }
    } else {
        console.error("Could not find detail div for ID:", productId);
    }
};


function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    // This toggles the 'hidden' class provided by Tailwind
    searchBar.classList.toggle('hidden');
    
    // Focus the input automatically when it opens
    if (!searchBar.classList.contains('hidden')) {
        document.getElementById('searchBox').focus();
    }
}


 


// Check access immediately when page loads
(function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    // If NOT logged in and NOT already on the signup page, kick them out
    if (isLoggedIn !== "true" && !window.location.pathname.includes("signup.html")) {
        alert("Please log in to view our products.");
        window.location.href = "signup.html";
    }
})();

function handleAuthAction() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        // Confirm sign out
        if (confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "signup.html";
        }
    } else {
        // If they aren't logged in, just take them to the auth page
        window.location.href = "signup.html";
    }
}

function toggleSearch() {
    const sb = document.getElementById('search-bar');
    sb.classList.toggle('hidden');
    if(!sb.classList.contains('hidden')) document.getElementById('searchBox').focus();
}
 
// Initialize the page
doSearch();