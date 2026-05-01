// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const addItemForm = document.getElementById('addItemForm');
const adminItemsContainer = document.getElementById('adminItemsContainer');
const logoutBtn = document.getElementById('logoutBtn');

// State
let token = localStorage.getItem('adminToken');
let allItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        verifyToken();
    }

    // Event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        token = data.token;
        localStorage.setItem('adminToken', token);
        
        showDashboard();
        loadAdminItems();
        loginForm.reset();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Verify Token
async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showDashboard();
            loadAdminItems();
        } else {
            localStorage.removeItem('adminToken');
            token = null;
            showLoginForm();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showLoginForm();
    }
}

// Show Dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
}

// Show Login Form
function showLoginForm() {
    loginSection.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// Load Admin Items
async function loadAdminItems() {
    try {
        adminItemsContainer.innerHTML = '<div class="loading">Loading items...</div>';
        
        const response = await fetch(`${API_BASE_URL}/items`);
        if (!response.ok) throw new Error('Failed to load items');
        
        allItems = await response.json();
        displayAdminItems(allItems);
    } catch (error) {
        console.error('Error loading items:', error);
        adminItemsContainer.innerHTML = '<div class="loading" style="color: red;">Failed to load items</div>';
    }
}

// Display Admin Items with Edit/Delete buttons
function displayAdminItems(items) {
    if (items.length === 0) {
        adminItemsContainer.innerHTML = '<div class="loading">No items yet</div>';
        return;
    }

    adminItemsContainer.innerHTML = items.map(item => createAdminItemCard(item)).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            handleEditItem(itemId);
        });
    });

    document.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.id;
            handleDeleteItem(itemId);
        });
    });
}

// Create Admin Item Card
function createAdminItemCard(item) {
    const date = new Date(item.date_found).toLocaleDateString('en-IE');
    const imageUrl = item.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23E8E8E8" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23D4A574" font-size="48"%3E📦%3C/text%3E%3C/svg%3E';
    
    return `
        <div class="admin-item-card">
            <div class="admin-item-image">
                <img src="${imageUrl}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23E8E8E8%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23D4A574%22 font-size=%2248%22%3E📦%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="admin-item-content">
                <h3 class="admin-item-name">${escapeHtml(item.name)}</h3>
                <p class="admin-item-description">${escapeHtml(item.description)}</p>
                <p class="admin-item-date">📅 ${date}</p>
                <div class="admin-item-actions">
                    <button class="btn btn-secondary btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn btn-danger btn-delete-item" data-id="${item.id}">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Handle Add Item
async function handleAddItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const date_found = document.getElementById('itemDate').value;
    const image_url = document.getElementById('itemImage').value;

    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, date_found, image_url })
        });

        if (!response.ok) throw new Error('Failed to add item');

        alert('Item added successfully!');
        addItemForm.reset();
        loadAdminItems();
    } catch (error) {
        alert('Error adding item: ' + error.message);
    }
}

// Handle Edit Item (placeholder - would need modal implementation)
function handleEditItem(itemId) {
    const item = allItems.find(i => i.id == itemId);
    if (!item) return;

    const newName = prompt('Enter item name:', item.name);
    if (newName === null) return;

    const newDescription = prompt('Enter description:', item.description);
    if (newDescription === null) return;

    const newDate = prompt('Enter date found (YYYY-MM-DD):', item.date_found);
    if (newDate === null) return;

    const newImage = prompt('Enter image URL (leave blank for none):', item.image_url || '');

    updateItem(itemId, {
        name: newName,
        description: newDescription,
        date_found: newDate,
        image_url: newImage || null
    });
}

// Update Item
async function updateItem(itemId, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to update item');

        alert('Item updated successfully!');
        loadAdminItems();
    } catch (error) {
        alert('Error updating item: ' + error.message);
    }
}

// Handle Delete Item
async function handleDeleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete item');

        alert('Item deleted successfully!');
        loadAdminItems();
    } catch (error) {
        alert('Error deleting item: ' + error.message);
    }
}

// Handle Logout
function handleLogout(e) {
    e.preventDefault();
    
    token = null;
    localStorage.removeItem('adminToken');
    showLoginForm();
    loginForm.reset();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
