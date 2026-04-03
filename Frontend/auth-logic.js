// 1. Protection Logic (Immediate Execution)
(function() {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // 2. Element Selectors
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('search-bar');
    const searchBox = document.getElementById('searchBox');
    const authBtn = document.getElementById('authBtn');
    const zoomModal = document.getElementById('zoomModal');
    
    // 3. Search Toggle Logic
    if(searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if(!searchBar.classList.contains('hidden')) {
                searchBox.focus();
            }
        });
    }

    // 4. Logout Logic
    if(authBtn) {
        authBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to sign out?")) {
                localStorage.removeItem("isLoggedIn");
                window.location.href = "login.html";
            }
        });
    }
    
    // 5. Search Execution (Debounce/Input)
    if(searchBox) {
        searchBox.addEventListener('input', (e) => {
            // Your existing doSearch() logic here
            console.log("Searching for:", e.target.value);
        });
    }
});

// Zoom functions (Keep global if called from dynamically generated HTML)
window.closeZoom = function() {
    document.getElementById('zoomModal').classList.add('hidden');
}

window.adjustZoom = function(amount) {
    const img = document.getElementById('zoomedImg');
    // Simple scaling logic
    let currentScale = parseFloat(img.getAttribute('data-scale') || 1);
    currentScale += amount;
    img.style.transform = `scale(${currentScale})`;
    img.setAttribute('data-scale', currentScale);
}