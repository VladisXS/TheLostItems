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
let token = null;
let currentUser = null;
let allItems = [];
let mainImageData = null;
let secondaryImagesData = [];
let secondaryInputs = [];
let secondaryPreviews = [];
let secondaryClearButtons = [];
const blockedImageHosts = ['via.placeholder.com'];

// Image compression function - achieve ~680 bytes per image (1500 photos = 1MB)
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Create small thumbnail: 80x80 pixels
                const maxWidth = 80;
                const maxHeight = 80;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Very aggressive JPEG compression (quality 0.08 = 8%)
                const compressedData = canvas.toDataURL('image/jpeg', 0.08);
                
                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (compressedData.length / 1024).toFixed(2);
                console.log(`📸 Stisnut slika: ${originalSize}KB → ${compressedSize}KB`);
                
                resolve(compressedData);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Handle file input change for image compression
    const mainImageInput = document.getElementById('mainImage');
    if (mainImageInput && mainImageInput.type === 'file') {
        mainImageInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                mainImageData = null;
                return;
            }
            try {
                mainImageData = await compressImage(file);
            } catch (error) {
                alert('Помилка при стисканні головного фото: ' + error.message);
                mainImageData = null;
                mainImageInput.value = '';
            }
        });
    }

    secondaryInputs = [
        document.getElementById('secondaryImage1'),
        document.getElementById('secondaryImage2'),
        document.getElementById('secondaryImage3')
    ];
    secondaryPreviews = [
        document.getElementById('secondaryPreview1'),
        document.getElementById('secondaryPreview2'),
        document.getElementById('secondaryPreview3')
    ];
    secondaryClearButtons = [
        document.getElementById('clearSecondary1'),
        document.getElementById('clearSecondary2'),
        document.getElementById('clearSecondary3')
    ];

    const setPreview = (index, dataUrl) => {
        const el = secondaryPreviews[index];
        if (!el) return;
        if (!dataUrl) {
            el.innerHTML = 'Немає фото';
            return;
        }
        el.innerHTML = `<img src="${dataUrl}" alt="Secondary photo ${index + 1}">`;
    };

    // init previews
    for (let i = 0; i < 3; i += 1) setPreview(i, null);

    secondaryInputs.forEach((input, index) => {
        if (!input || input.type !== 'file') return;
        input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                secondaryImagesData[index] = null;
                setPreview(index, null);
                return;
            }

            try {
                const compressed = await compressImage(file);
                secondaryImagesData[index] = compressed;
                setPreview(index, compressed);
            } catch (error) {
                alert('Помилка при стисканні фото: ' + error.message);
                secondaryImagesData[index] = null;
                input.value = '';
                setPreview(index, null);
            }
        });
    });

    secondaryClearButtons.forEach((btn, index) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            secondaryImagesData[index] = null;
            const input = secondaryInputs[index];
            if (input) input.value = '';
            setPreview(index, null);
        });
    });

    // Check for token from Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const callbackToken = urlParams.get('token');
    const userParam = urlParams.get('user');
    const authError = urlParams.get('error');

    if (authError) {
        alert('Помилка авторизації. Спробуйте ще раз.');
        window.history.replaceState({}, document.title, '/admin.html');
    }
    
    if (callbackToken) {
        token = callbackToken;
        if (userParam) {
            currentUser = JSON.parse(decodeURIComponent(userParam));
        }
        localStorage.setItem('adminToken', token);
        window.history.replaceState({}, document.title, '/admin.html');
        // Only admins can access dashboard.
        verifyToken();
    } else {
        // Check for stored token
        token = localStorage.getItem('adminToken');
        if (token) {
            verifyToken();
        }
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
        currentUser = { email: data.email, name: 'Admin' };
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
            const data = await response.json();
            currentUser = data.user;
            if (currentUser?.isAdmin) {
                showDashboard();
                loadAdminItems();
            } else {
                showLoginForm();
            }
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
    const imageUrl = sanitizeImageUrl(item.image_url) || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23E8E8E8" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23D4A574" font-size="48"%3E📦%3C/text%3E%3C/svg%3E';
    
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
    const main_image_url = mainImageData;
    const secondary_image_urls = secondaryImagesData.filter(Boolean);

    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, date_found, main_image_url, secondary_image_urls })
        });

        if (!response.ok) throw new Error('Failed to add item');

        alert('Item added successfully!');
        addItemForm.reset();
        mainImageData = null;
        secondaryImagesData = [];
        for (let i = 0; i < 3; i += 1) {
            const input = secondaryInputs[i];
            if (input) input.value = '';
            const preview = secondaryPreviews[i];
            if (preview) preview.innerHTML = 'Немає фото';
        }
        loadAdminItems();
    } catch (error) {
        alert('Error adding item: ' + error.message);
    }
}

// Handle Edit Item
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
    currentUser = null;
    localStorage.removeItem('adminToken');
    showLoginForm();
    if (loginForm) loginForm.reset();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const parsed = new URL(url, window.location.origin);
        if (blockedImageHosts.includes(parsed.hostname)) {
            return null;
        }
        return url;
    } catch {
        return url;
    }
}
