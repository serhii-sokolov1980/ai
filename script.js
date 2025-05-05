// Конфигурация API
const API_URL = 'http://localhost:3000';

// DOM элементы
const bodyElement = document.body;
const themeToggleButton = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const categoryTabs = document.getElementById('categoryTabs');
const aiGrid = document.getElementById('aiGrid');
const favoritesLink = document.getElementById('favoritesLink');
const favoritesCount = document.getElementById('favoritesCount');

// Состояние приложения
let currentCategory = 'all';
let currentSearch = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let aiTools = [];

// Инициализация темы
function initTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        bodyElement.classList.add('dark-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Загрузка данных с сервера
async function loadAITools() {
    try {
        const response = await fetch(`${API_URL}/aiTools`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        aiTools = await response.json();
        renderAITools(filterAI());
        updateFavoritesCount();
    } catch (error) {
        console.error('Ошибка:', error);
        aiGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки данных</h3>
                <p>Попробуйте обновить страницу позже</p>
            </div>
        `;
    }
}

// Фильтрация ИИ
function filterAI() {
    return aiTools.filter(tool => {
        const categoryMatch = currentCategory === 'all' || tool.category === currentCategory;
        const searchMatch = currentSearch === '' ||
            tool.name.toLowerCase().includes(currentSearch) ||
            tool.description.toLowerCase().includes(currentSearch) ||
            tool.developer.toLowerCase().includes(currentSearch);
        return categoryMatch && searchMatch;
    });
}

// Рендер карточек ИИ
function renderAITools(tools) {
    if (tools.length === 0) {
        aiGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска или выбрать другую категорию</p>
            </div>
        `;
        return;
    }

    aiGrid.innerHTML = tools.map(tool => `
        <div class="ai-card" data-id="${tool.id}">
            <button class="favorite-btn ${favorites.includes(tool.id) ? 'active' : ''}" 
                    data-id="${tool.id}">
                <i class="fas fa-star"></i>
            </button>
            <div class="card-header">
                <span class="ai-icon" style="background-color: ${tool.iconColor}">${tool.icon}</span>
                <div>
                    <h3 class="ai-title">${tool.name}</h3>
                    <p class="ai-developer">${tool.developer}</p>
                </div>
            </div>
            <p class="ai-description">${tool.description}</p>
            <div class="ai-indicators">
                ${tool.price === 'free' ? '<span class="indicator price-free">Бесплатно</span>' :
        tool.price === 'freemium' ? '<span class="indicator price-free">Freemium</span>' :
            '<span class="indicator price-paid">Платный</span>'}
                ${tool.russian ? '<span class="indicator lang-ru">RU</span>' : ''}
                ${tool.popular ? '<span class="indicator popular">Популярное</span>' : ''}
            </div>
            <div class="ai-actions">
                <a href="details.html?id=${tool.id}" class="btn btn-primary">Подробнее</a>
                <a href="${tool.links.try}" target="_blank" class="btn btn-outline">Попробовать</a>
            </div>
        </div>
    `).join('');

    // Добавляем обработчики для кнопок избранного
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

// Переключение избранного
function toggleFavorite(e) {
    const aiId = parseInt(e.currentTarget.dataset.id);
    const index = favorites.indexOf(aiId);

    if (index === -1) {
        favorites.push(aiId);
        e.currentTarget.classList.add('active');
    } else {
        favorites.splice(index, 1);
        e.currentTarget.classList.remove('active');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Обновление счетчика избранного
function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
}

// Переключение темы
function toggleTheme() {
    bodyElement.classList.toggle('dark-theme');
    const icon = bodyElement.classList.contains('dark-theme') ? 'sun' : 'moon';
    themeToggleButton.innerHTML = `<i class="fas fa-${icon}"></i>`;
    localStorage.setItem('theme', bodyElement.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Поиск
function handleSearch(e) {
    currentSearch = e.target.value.toLowerCase();
    renderAITools(filterAI());
}

// Фильтрация по категории
function handleCategoryChange(e) {
    if (e.target.classList.contains('category-tab')) {
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.category;
        renderAITools(filterAI());
    }
}

// Переход к избранному
function showFavorites() {
    currentCategory = 'all';
    currentSearch = '';
    searchInput.value = '';
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.category-tab[data-category="all"]').classList.add('active');

    const favoriteTools = aiTools.filter(tool => favorites.includes(tool.id));
    renderAITools(favoriteTools);
}

// Инициализация приложения
function init() {
    initTheme();
    loadAITools();

    // Обработчики событий
    themeToggleButton.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', handleSearch);
    categoryTabs.addEventListener('click', handleCategoryChange);
    favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFavorites();
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);