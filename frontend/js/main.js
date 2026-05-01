// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const itemsContainer = document.getElementById('itemsContainer');
const searchInput = document.getElementById('searchInput');

// State
let allItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupSearch();
});

// Fetch all items
async function loadItems() {
    try {
        itemsContainer.innerHTML = '<div class="loading">Loading items...</div>';
        
        const response = await fetch(`${API_BASE_URL}/items`);
        if (!response.ok) throw new Error('Failed to load items');
        
        allItems = await response.json();
        displayItems(allItems);
    } catch (error) {
        console.error('Error loading items:', error);
        itemsContainer.innerHTML = '<div class="loading" style="color: red;">Failed to load items</div>';
    }
}

// Display items in grid
function displayItems(items) {
    if (items.length === 0) {
        itemsContainer.innerHTML = '<div class="loading">No items found</div>';
        return;
    }

    itemsContainer.innerHTML = items.map(item => createItemCard(item)).join('');
}

// Create item card HTML
function createItemCard(item) {
    const date = new Date(item.date_found).toLocaleDateString('en-IE');
    const imageUrl = item.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23E8E8E8" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23D4A574" font-size="48"%3E📦%3C/text%3E%3C/svg%3E';
    
    return `
        <div class="item-card">
            <div class="item-image">
                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23E8E8E8%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23D4A574%22 font-size=%2248%22%3E📦%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="item-content">
                <h3 class="item-name">${escapeHtml(item.name)}</h3>
                <p class="item-description">${escapeHtml(item.description)}</p>
                <p class="item-date">📅 ${date}</p>
            </div>
        </div>
    `;
}

// Setup search functionality
function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredItems = allItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
        displayItems(filteredItems);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
