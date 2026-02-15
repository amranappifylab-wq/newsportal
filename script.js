const API_KEY = 'pub_d1981e9566244753ba6902b24adaeef1'; // <--- PUT YOUR KEY HERE
const BASE_URL = 'https://newsdata.io/api/1/news';

const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadingMessage = document.getElementById('loading-message');
const loadMoreButton = document.getElementById('load-more-button');
const categoryButtons = document.querySelectorAll('.cat-btn');

// State variables
let currentQuery = '';
let currentCategory = 'top'; // Default category
let nextPageToken = null;

// Fetch news function
async function fetchNews(query = '', category = 'top', isPagination = false) {
    if (!isPagination) {
        loadingMessage.style.display = 'block';
        newsContainer.innerHTML = '';
        nextPageToken = null;
        loadMoreButton.style.display = 'none';
    }
    
    let url = `${BASE_URL}?apikey=${API_KEY}&language=en`;
    
    // Add category parameter
    if (category && category !== 'top') {
        url += `&category=${category}`;
    }

    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
    }
    
    if (isPagination && nextPageToken) {
        url += `&page=${nextPageToken}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            displayNews(data.results);
            nextPageToken = data.nextPage;
            
            if (nextPageToken) {
                loadMoreButton.style.display = 'inline-block';
            } else {
                loadMoreButton.style.display = 'none';
            }
        } else {
            newsContainer.innerHTML = '<p>Error fetching news. Please check your API key.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        newsContainer.innerHTML = '<p>Failed to load news.</p>';
    } finally {
        loadingMessage.style.display = 'none';
    }
}

// Display news cards (same as before)
function displayNews(articles) {
    if (articles.length === 0 && newsContainer.innerHTML === '') {
        newsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }

    articles.forEach(article => {
        if (!article.image_url) return;

        const card = document.createElement('div');
        card.className = 'news-card';

        card.innerHTML = `
            <img src="${article.image_url}" alt="News Image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="card-content">
                <h2>${article.title}</h2>
                <p>${article.description ? article.description.substring(0, 100) + '...' : ''}</p>
                <div class="source">${article.source_id} | ${new Date(article.pubDate).toLocaleDateString()}</div>
                <a href="${article.link}" target="_blank">Read More</a>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

// Search functionality
searchButton.addEventListener('click', () => {
    currentQuery = searchInput.value;
    // When searching, we usually want to clear category or search across all
    fetchNews(currentQuery, '', false);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentQuery = searchInput.value;
        fetchNews(currentQuery, '', false);
    }
});

// Category Bar Functionality
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button state
        document.querySelector('.cat-btn.active').classList.remove('active');
        button.classList.add('active');

        // Fetch news for category
        currentCategory = button.getAttribute('data-category');
        currentQuery = ''; // Clear search input when switching categories
        searchInput.value = '';
        fetchNews(currentQuery, currentCategory, false);
    });
});

// Load more functionality
loadMoreButton.addEventListener('click', () => {
    fetchNews(currentQuery, currentCategory, true);
});

// Initial load
fetchNews();