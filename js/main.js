// Loading Screen
// script.js
// script.js
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0'; // Fade out
        setTimeout(function() {
            loadingScreen.style.display = 'none'; // Hide after fade-out
            document.getElementById('main-content').style.display = 'block';
        }, 500); // Wait for the fade-out to complete
    }, 2000); // 2 seconds delay
});

function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
 anchor.addEventListener('click', function (e) {
     e.preventDefault();
     const target = document.querySelector(this.getAttribute('href'));
     if (target) {
         window.scrollTo({
             top: target.offsetTop - 80,
             behavior: 'smooth'
         });
     }
 });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

// Load services from API
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const services = await response.json();

        // Update services section
        const servicesContainer = document.querySelector('#services .row');
        if (servicesContainer) {
            servicesContainer.innerHTML = services.map(service => `
                <div class="col-md-4">
                    <div class="service-card">
                        <div class="service-icon">
                            <i class="fas ${getServiceIcon(service.category.name)}"></i>
                        </div>
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="price">${i18next.t('services.price', { price: service.price })}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Search functionality
const searchInput = document.querySelector('.search-container input');
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const query = this.value.trim();
            if (query) {
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const results = await response.json();
                    displaySearchResults(results);
                } catch (error) {
                    console.error('Error searching:', error);
                }
            } else {
                clearSearchResults();
            }
        }, 300);
    });
}

function displaySearchResults(results) {
    const searchContainer = document.querySelector('.search-container');
    let resultsDiv = document.querySelector('.search-results');

    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        searchContainer.appendChild(resultsDiv);
    }

    resultsDiv.innerHTML = results.length ? results.map(result => `
        <div class="search-result">
            <h4>${result.name}</h4>
            <p>${result.description}</p>
            <div class="meta">
                <span class="category">${result.category}</span>
                <span class="provider">by ${result.provider.name} (${result.provider.rating}⭐)</span>
            </div>
        </div>
    `).join('') : '<div class="no-results">No services found</div>';
}

function clearSearchResults() {
    const resultsDiv = document.querySelector('.search-results');
    if (resultsDiv) {
        resultsDiv.remove();
    }
}

function getServiceIcon(category) {
    const icons = {
        'Emergency Plumbing': 'fa-wrench',
        'Electrical Installation': 'fa-bolt',
        'Green House Cleaning': 'fa-broom'
    };
    return icons[category] || 'fa-hand-holding-heart';
}

// WhatsApp contact buttons
document.querySelectorAll('.btn-whatsapp').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const message = encodeURIComponent('Hi, I found you on Salahly. I need your services.');
        window.open(`https://wa.me/?text=${message}`, '_blank');
    });
});

// Animation on scroll
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.service-card, .provider-card, .testimonial-card');
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight - 100) {
            element.classList.add('animate');
        }
    });
});

// Theme switching functionality
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
});

// Language switching functionality
function toggleLanguage() {
    const currentLang = i18next.language;
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    i18next.changeLanguage(newLang, (err) => {
        if (err) return console.error('Error changing language:', err);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
        updateContent();
    });
}

// Update content with translations
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = i18next.t(key);
            } else {
                element.textContent = i18next.t(key);
            }
        }
    });
}

// Initialize i18next
i18next
    .use(i18nextBrowserLanguageDetector)
    .init({
        resources: translations,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })
    .then(() => {
        updateContent();
    });


// Show loading screen before loading services
document.addEventListener('DOMContentLoaded', () => {
    showLoadingScreen();
    Promise.all([
        loadServices(),
        initMap(),
        updateContent()
    ]).then(() => {
        hideLoadingScreen();
    }).catch(error => {
        console.error('Error loading content:', error);
        hideLoadingScreen();
    });
});

// Form submission for provider registration
const joinButton = document.querySelector('.join-section .btn');
if (joinButton) {
    joinButton.addEventListener('click', function() {
        // Mock form submission
        alert('Provider registration will be implemented in the future!');
    });
}

// Mobile menu toggle
const navbarToggler = document.querySelector('.navbar-toggler');
if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
        document.querySelector('.navbar-collapse').classList.toggle('show');
    });
}

// Initialize map
function initMap() {
    const mansouraCenterCoords = [31.0409, 31.3785]; // Mansoura coordinates
    const map = L.map('mansouraMap').setView(mansouraCenterCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker for Mansoura center
    L.marker(mansouraCenterCoords)
        .addTo(map)
        .bindPopup('Mansoura City Center')
        .openPopup();
}
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});