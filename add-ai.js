// Конфигурация API
const API_URL = 'http://localhost:3000';

// DOM элементы
const bodyElement = document.body;
const themeToggleButton = document.getElementById('themeToggle');
const addAIForm = document.getElementById('addAIForm');
const favoritesLink = document.getElementById('favoritesLink');
const favoritesCount = document.getElementById('favoritesCount');

// Состояние приложения
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Инициализация темы
function initTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        bodyElement.classList.add('dark-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Добавление нового ИИ
async function addNewAI(e) {
    e.preventDefault();

    const formData = new FormData(addAIForm);
    const newAI = {
        name: formData.get('aiName'),
        developer: formData.get('aiDeveloper'),
        category: formData.get('aiCategory'),
        description: formData.get('aiDescription'),
        price: formData.get('price'),
        russian: document.getElementById('aiRussian').checked,
        icon: formData.get('aiIcon'),
        iconColor: formData.get('aiIconColor'),
        links: {
            try: formData.get('aiTryLink'),
            docs: formData.get('aiDocsLink') || null
        },
        popular: false,
        dateAdded: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/aiTools`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAI)
        });

        if (!response.ok) throw new Error('Ошибка при добавлении ИИ');

        alert('ИИ успешно добавлен в каталог!');
        addAIForm.reset();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить ИИ. Попробуйте позже.');
    }
}

// Переключение темы
function toggleTheme() {
    bodyElement.classList.toggle('dark-theme');
    const icon = bodyElement.classList.contains('dark-theme') ? 'sun' : 'moon';
    themeToggleButton.innerHTML = `<i class="fas fa-${icon}"></i>`;
    localStorage.setItem('theme', bodyElement.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Обновление счетчика избранного
function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
}

// Инициализация приложения
function init() {
    initTheme();
    updateFavoritesCount();

    // Обработчики событий
    themeToggleButton.addEventListener('click', toggleTheme);
    addAIForm.addEventListener('submit', addNewAI);
    favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);