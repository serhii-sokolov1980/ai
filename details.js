// Конфигурация API
const API_URL = 'http://localhost:3000';

// DOM элементы
const bodyElement = document.body;
const themeToggleButton = document.getElementById('themeToggle');
const aiDetails = document.getElementById('aiDetails');
const reviewsContainer = document.getElementById('reviewsContainer');
const reviewForm = document.getElementById('reviewForm');
const stars = document.querySelectorAll('.stars i');
const ratingValue = document.getElementById('ratingValue');
const reviewText = document.getElementById('reviewText');
const favoritesLink = document.getElementById('favoritesLink');
const favoritesCount = document.getElementById('favoritesCount');

// Состояние приложения
let currentAI = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let reviews = [];

// Инициализация темы
function initTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        bodyElement.classList.add('dark-theme');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Загрузка данных ИИ
async function loadAIDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const aiId = urlParams.get('id');

    if (!aiId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Загрузка данных ИИ
        const aiResponse = await fetch(`${API_URL}/aiTools/${aiId}`);
        if (!aiResponse.ok) throw new Error('ИИ не найден');
        currentAI = await aiResponse.json();

        // Загрузка отзывов
        const reviewsResponse = await fetch(`${API_URL}/reviews?aiId=${aiId}`);
        if (reviewsResponse.ok) {
            reviews = await reviewsResponse.json();
        }

        renderAIDetails();
        renderReviews();
        updateFavoritesCount();
    } catch (error) {
        console.error('Ошибка:', error);
        aiDetails.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки данных</h3>
                <p>Попробуйте обновить страницу позже</p>
            </div>
        `;
    }
}

// Рендер деталей ИИ
function renderAIDetails() {
    const priceText = currentAI.price === 'free' ? 'Бесплатно' :
        currentAI.price === 'freemium' ? 'Freemium (бесплатно с ограничениями)' :
            'Платный';

    aiDetails.innerHTML = `
        <div class="ai-details-header">
            <span class="ai-details-icon" style="background-color: ${currentAI.iconColor}">${currentAI.icon}</span>
            <div>
                <h1 class="ai-details-title">${currentAI.name}</h1>
                <p class="ai-details-developer">Разработчик: ${currentAI.developer}</p>
                <div class="ai-details-meta">
                    <span class="indicator ${currentAI.price === 'free' ? 'price-free' :
        currentAI.price === 'freemium' ? 'price-free' :
            'price-paid'}">${priceText}</span>
                    ${currentAI.russian ? '<span class="indicator lang-ru">Русский язык</span>' : ''}
                    ${currentAI.popular ? '<span class="indicator popular">Популярное</span>' : ''}
                </div>
            </div>
        </div>
        <div class="ai-details-description">
            <h3>Описание</h3>
            <p>${currentAI.description}</p>
        </div>
        <div class="ai-details-links">
            <a href="${currentAI.links.try}" target="_blank" class="btn btn-primary">Попробовать</a>
            ${currentAI.links.docs ? `<a href="${currentAI.links.docs}" target="_blank" class="btn btn-outline">Документация</a>` : ''}
            <button class="btn ${favorites.includes(currentAI.id) ? 'btn-primary' : 'btn-outline'}" id="favoriteBtn">
                ${favorites.includes(currentAI.id) ? 'В избранном' : 'В избранное'}
            </button>
        </div>
    `;

    // Добавляем обработчик для кнопки избранного
    document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
}

// Рендер отзывов
function renderReviews() {
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <p>Пока нет отзывов. Будьте первым!</p>
            </div>
        `;
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${review.author || 'Аноним'}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
            </div>
            <div class="review-text">${review.text}</div>
        </div>
    `).join('');
}

// Добавление отзыва
async function addReview(e) {
    e.preventDefault();

    const rating = parseInt(ratingValue.value);
    const text = reviewText.value.trim();

    if (rating === 0) {
        alert('Пожалуйста, поставьте оценку');
        return;
    }

    if (text === '') {
        alert('Пожалуйста, напишите отзыв');
        return;
    }

    const newReview = {
        aiId: currentAI.id,
        rating,
        text,
        author: 'Пользователь', // В реальном приложении можно брать из авторизации
        date: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReview)
        });

        if (!response.ok) throw new Error('Ошибка при отправке отзыва');

        reviews.push(newReview);
        renderReviews();
        reviewForm.reset();
        ratingValue.value = '0';
        stars.forEach(star => star.classList.remove('active'));
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить отзыв. Попробуйте позже.');
    }
}

// Переключение избранного
function toggleFavorite() {
    const index = favorites.indexOf(currentAI.id);
    const favoriteBtn = document.getElementById('favoriteBtn');

    if (index === -1) {
        favorites.push(currentAI.id);
        favoriteBtn.textContent = 'В избранном';
        favoriteBtn.classList.remove('btn-outline');
        favoriteBtn.classList.add('btn-primary');
    } else {
        favorites.splice(index, 1);
        favoriteBtn.textContent = 'В избранное';
        favoriteBtn.classList.remove('btn-primary');
        favoriteBtn.classList.add('btn-outline');
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

// Инициализация звезд рейтинга
function initStars() {
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingValue.value = rating;

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('active');
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);

            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                }
            });
        });

        star.addEventListener('mouseout', () => {
            const currentRating = parseInt(ratingValue.value);

            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
}

// Инициализация приложения
function init() {
    initTheme();
    initStars();
    loadAIDetails();

    // Обработчики событий
    themeToggleButton.addEventListener('click', toggleTheme);
    reviewForm.addEventListener('submit', addReview);
    favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);