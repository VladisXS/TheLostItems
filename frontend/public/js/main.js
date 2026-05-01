const API_BASE_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 8;

const itemsContainer = document.getElementById('itemsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const locationFilter = document.getElementById('locationFilter');
const sortFilter = document.getElementById('sortFilter');
const pagination = document.getElementById('pagination');
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');
const authActionBtn = document.getElementById('authActionBtn');
const userRole = document.getElementById('userRole');
const userName = document.getElementById('userName');
const adminPanelLink = document.getElementById('adminPanelLink');
const logoutBtn = document.getElementById('logoutBtn');
const addItemNavLink = document.getElementById('addItemNavLink');
const addItemCta = document.getElementById('addItemCta');

const itemModal = document.getElementById('itemModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalDate = document.getElementById('modalDate');
const modalLocation = document.getElementById('modalLocation');
const modalCategory = document.getElementById('modalCategory');

const fallbackCategories = ['Сумки', 'Електроніка', 'Інше', 'Одяг', 'Канцелярія', 'Навчання'];
const fallbackLocations = ['Коридор, 1 поверх', 'Кабінет інформатики', 'Спортивний зал', 'Роздягальня', 'Бібліотека', 'Кабінет математики'];

let allItems = [];
let filteredItems = [];
let currentPage = 1;
let isAuthenticated = false;
let authUser = null;
const blockedImageHosts = ['via.placeholder.com'];

document.addEventListener('DOMContentLoaded', () => {
    setupUiActions();
    syncAuthFromUrl();
    syncAuthState();
    loadItems();
});

async function loadItems() {
    try {
        itemsContainer.innerHTML = '<div class="loading">Завантаження предметів...</div>';
        const response = await fetch(`${API_BASE_URL}/items`);
        if (!response.ok) throw new Error('Не вдалося завантажити предмети');

        const rawItems = await response.json();
        allItems = rawItems.map(enrichItem);
        hydrateFilters(allItems);
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error loading items:', error);
        itemsContainer.innerHTML = '<div class="loading" style="color: #d14343;">Помилка завантаження предметів</div>';
        if (pagination) pagination.innerHTML = '';
    }
}

function enrichItem(item) {
    const safeId = Number(item.id) || 0;
    return {
        ...item,
        category: item.category || fallbackCategories[safeId % fallbackCategories.length],
        location: item.location || fallbackLocations[safeId % fallbackLocations.length]
    };
}

function setupUiActions() {
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndRender);
    if (locationFilter) locationFilter.addEventListener('change', applyFiltersAndRender);
    if (sortFilter) sortFilter.addEventListener('change', applyFiltersAndRender);

    if (userMenuButton && userDropdown) {
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isHidden = userDropdown.hasAttribute('hidden');
            if (isHidden) {
                userDropdown.removeAttribute('hidden');
                userMenuButton.setAttribute('aria-expanded', 'true');
            } else {
                userDropdown.setAttribute('hidden', '');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('click', (event) => {
            if (!userDropdown.contains(event.target) && !userMenuButton.contains(event.target)) {
                userDropdown.setAttribute('hidden', '');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    if (authActionBtn) {
        authActionBtn.addEventListener('click', () => {
            window.location.href = 'http://localhost:5000/api/auth/google?next=/index.html&prompt=select_account';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.reload();
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (itemModal) {
        itemModal.addEventListener('click', (event) => {
            if (event.target === itemModal) closeModal();
        });
    }
}

async function syncAuthState() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        applyAuthUi(false, null);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('adminToken');
            applyAuthUi(false, null);
            return;
        }

        const data = await response.json();
        applyAuthUi(true, data.user);
    } catch (error) {
        console.error('Auth state check failed:', error);
        localStorage.removeItem('adminToken');
        applyAuthUi(false, null);
    }
}

function syncAuthFromUrl() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const userParam = url.searchParams.get('user');
    const notice = url.searchParams.get('notice');

    if (token) {
        localStorage.setItem('adminToken', token);
    }

    if (token || userParam || notice) {
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        url.searchParams.delete('notice');
        url.searchParams.delete('error');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
    }

}

function applyAuthUi(authenticated, user) {
    isAuthenticated = authenticated;
    authUser = user;

    if (authActionBtn) {
        authActionBtn.textContent = authenticated ? 'Змінити акаунт' : 'Увійти';
    }

    if (logoutBtn) {
        if (authenticated) {
            logoutBtn.removeAttribute('hidden');
        } else {
            logoutBtn.setAttribute('hidden', '');
        }
    }

    if (userRole) {
        userRole.textContent = authenticated ? (user?.isAdmin ? 'Адміністратор' : 'Користувач') : 'Гість';
    }

    if (userName) {
        userName.textContent = authenticated ? (user?.email || 'Адмін') : 'Не авторизовано';
    }

    const avatar = document.querySelector('.avatar');
    if (avatar) {
        const sourceText = authenticated ? (user?.email || user?.name || 'A') : 'G';
        avatar.textContent = sourceText.charAt(0).toUpperCase();
    }

    if (adminPanelLink) {
        const canSeeAdmin = Boolean(authenticated && user?.isAdmin);
        if (canSeeAdmin) {
            adminPanelLink.removeAttribute('hidden');
            adminPanelLink.style.display = '';
        } else {
            adminPanelLink.setAttribute('hidden', '');
            adminPanelLink.style.display = 'none';
        }
    }

    const canAddItems = Boolean(authenticated && user?.isAdmin);
    if (addItemNavLink) {
        if (canAddItems) {
            addItemNavLink.removeAttribute('hidden');
            addItemNavLink.style.display = '';
        } else {
            addItemNavLink.setAttribute('hidden', '');
            addItemNavLink.style.display = 'none';
        }
    }
    if (addItemCta) {
        if (canAddItems) {
            addItemCta.removeAttribute('hidden');
            addItemCta.style.display = '';
        } else {
            addItemCta.setAttribute('hidden', '');
            addItemCta.style.display = 'none';
        }
    }
}

function hydrateFilters(items) {
    if (categoryFilter) {
        const categories = [...new Set(items.map((item) => item.category))];
        categoryFilter.innerHTML = '<option value="">Усі категорії</option>' +
            categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
    }

    if (locationFilter) {
        const locations = [...new Set(items.map((item) => item.location))];
        locationFilter.innerHTML = '<option value="">Усі локації</option>' +
            locations.map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join('');
    }
}

function applyFiltersAndRender() {
    const selectedCategory = categoryFilter?.value || '';
    const selectedLocation = locationFilter?.value || '';
    const selectedSort = sortFilter?.value || 'newest';

    filteredItems = allItems.filter((item) => {
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesLocation = !selectedLocation || item.location === selectedLocation;
        return matchesCategory && matchesLocation;
    });

    filteredItems.sort((a, b) => {
        if (selectedSort === 'oldest') return new Date(a.date_found) - new Date(b.date_found);
        if (selectedSort === 'name_asc') return a.name.localeCompare(b.name, 'uk');
        if (selectedSort === 'name_desc') return b.name.localeCompare(a.name, 'uk');
        return new Date(b.date_found) - new Date(a.date_found);
    });

    currentPage = 1;
    renderCurrentPage();
}

function renderCurrentPage() {
    const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    if (currentPage > pageCount) currentPage = pageCount;

    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleItems = filteredItems.slice(start, start + PAGE_SIZE);
    renderItems(visibleItems);
    renderPagination(pageCount);
}

function renderItems(items) {
    if (!items.length) {
        itemsContainer.innerHTML = '<div class="loading">Нічого не знайдено</div>';
        return;
    }

    itemsContainer.innerHTML = items.map((item) => createItemCard(item)).join('');
    bindDetailButtons();
    bindCarousels();
}

function createItemCard(item) {
    const date = new Date(item.date_found).toLocaleDateString('uk-UA');
    const images = getItemImages(item);
    const firstImage = images[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23E8E8E8" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23D4A574" font-size="48"%3E📦%3C/text%3E%3C/svg%3E';

    return `
        <div class="item-card">
            <div class="item-image carousel" data-images-count="${images.length}" data-images='${escapeHtml(JSON.stringify(images))}' data-active-index="0">
                <img src="${firstImage}" alt="${escapeHtml(item.name)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23E8E8E8%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23D4A574%22 font-size=%2248%22%3E📦%3C/text%3E%3C/svg%3E'">
                <button type="button" class="carousel-btn prev" ${images.length > 1 ? '' : 'style="display:none"'} aria-label="Previous photo">‹</button>
                <button type="button" class="carousel-btn next" ${images.length > 1 ? '' : 'style="display:none"'} aria-label="Next photo">›</button>
            </div>
            <div class="item-content">
                <span class="item-badge">${escapeHtml(item.category)}</span>
                <h3 class="item-name">${escapeHtml(item.name)}</h3>
                <p class="item-description">${escapeHtml(item.description)}</p>
                <p class="meta">🗓 Знайдено: ${date}</p>
                <p class="meta">📍 ${escapeHtml(item.location)}</p>
                <button type="button" class="detail-btn" data-id="${item.id}">Детальніше</button>
            </div>
        </div>
    `;
}

function bindDetailButtons() {
    const detailButtons = document.querySelectorAll('.detail-btn');
    detailButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const itemId = Number(button.dataset.id);
            const item = allItems.find((entry) => Number(entry.id) === itemId);
            if (item) openModal(item);
        });
    });
}

function bindCarousels() {
    document.querySelectorAll('.item-image.carousel').forEach((carousel) => {
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const img = carousel.querySelector('img');
        if (!img) return;

        let images = [];
        try {
            images = JSON.parse(carousel.getAttribute('data-images') || '[]');
        } catch {
            images = [];
        }
        if (images.length <= 1) return;

        const setIndex = (idx) => {
            const nextIndex = (idx + images.length) % images.length;
            carousel.setAttribute('data-active-index', String(nextIndex));
            img.src = images[nextIndex];
        };

        prevBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = Number(carousel.getAttribute('data-active-index') || '0');
            setIndex(current - 1);
        });
        nextBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const current = Number(carousel.getAttribute('data-active-index') || '0');
            setIndex(current + 1);
        });
    });
}

function getItemImages(item) {
    const main = sanitizeImageUrl(item.main_image_url || item.image_url || null);
    let secondary = [];
    if (Array.isArray(item.secondary_image_urls)) {
        secondary = item.secondary_image_urls;
    } else if (typeof item.secondary_image_urls === 'string' && item.secondary_image_urls.trim()) {
        try {
            const parsed = JSON.parse(item.secondary_image_urls);
            if (Array.isArray(parsed)) secondary = parsed;
        } catch {
            secondary = [];
        }
    }
    const images = [main, ...secondary.map(sanitizeImageUrl)].filter(Boolean);
    return images.slice(0, 4);
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

function renderPagination(pageCount) {
    if (!pagination) return;
    if (pageCount <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let markup = `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    for (let page = 1; page <= pageCount; page += 1) {
        markup += `<button type="button" class="page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
    }
    markup += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>›</button>`;
    pagination.innerHTML = markup;

    pagination.querySelectorAll('.page-btn').forEach((button) => {
        if (button.disabled) return;
        button.addEventListener('click', () => {
            currentPage = Number(button.dataset.page);
            renderCurrentPage();
        });
    });
}

function openModal(item) {
    modalTitle.textContent = item.name;
    modalDescription.textContent = item.description;
    modalDate.textContent = `🗓 Знайдено: ${new Date(item.date_found).toLocaleDateString('uk-UA')}`;
    modalLocation.textContent = `📍 Локація: ${item.location}`;
    modalCategory.textContent = `🏷 Категорія: ${item.category}`;
    itemModal.classList.add('open');
    itemModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    itemModal.classList.remove('open');
    itemModal.setAttribute('aria-hidden', 'true');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}
