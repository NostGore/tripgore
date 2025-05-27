
import { videoFunctions } from './firebase.js';

class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.allVideos = [];
        this.isVisible = false;
        this.selectedIndex = -1;
        
        this.init();
    }

    init() {
        this.createSearchElements();
        this.loadAllVideos();
        this.setupEventListeners();
    }

    createSearchElements() {
        // Crear el contenedor del buscador
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" id="searchInput" class="search-input" placeholder="Buscar videos...">
                <i class="fa-solid fa-search search-icon"></i>
            </div>
            <div id="searchResults" class="search-results" style="display: none;"></div>
        `;

        // Insertar en el header después del logo
        const header = document.querySelector('.header .container');
        const nav = document.querySelector('.nav');
        header.insertBefore(searchContainer, nav);

        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
    }

    setupEventListeners() {
        if (!this.searchInput) return;

        // Búsqueda en tiempo real
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.performSearch(query);
            } else {
                this.hideResults();
            }
        });

        // Navegación con teclado
        this.searchInput.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;

            const items = this.searchResults.querySelectorAll('.search-result-item');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                    this.updateSelection(items);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                    this.updateSelection(items);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                        items[this.selectedIndex].click();
                    }
                    break;
                case 'Escape':
                    this.hideResults();
                    this.searchInput.blur();
                    break;
            }
        });

        // Ocultar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        // Mostrar resultados al enfocar si hay texto
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim().length > 0) {
                this.performSearch(this.searchInput.value.trim());
            }
        });
    }

    loadAllVideos() {
        videoFunctions.getAllApprovedVideos((videos) => {
            this.allVideos = videos;
        });
    }

    performSearch(query) {
        const normalizedQuery = this.normalizeText(query);
        const matchingVideos = this.allVideos.filter(video => {
            const normalizedTitle = this.normalizeText(video.titulo);
            const normalizedAuthor = this.normalizeText(video.autor);
            const normalizedCategory = this.normalizeText(video.categoria);
            
            return normalizedTitle.includes(normalizedQuery) ||
                   normalizedAuthor.includes(normalizedQuery) ||
                   normalizedCategory.includes(normalizedQuery);
        });

        this.displayResults(matchingVideos, query);
    }

    normalizeText(text) {
        return text.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // Remover tildes
                  .replace(/[^\w\s]/g, ''); // Remover caracteres especiales
    }

    displayResults(videos, query) {
        if (videos.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fa-solid fa-exclamation-circle"></i>
                    <span>No se encontraron videos para "${query}"</span>
                </div>
            `;
        } else {
            // Limitar a 6 resultados
            const limitedVideos = videos.slice(0, 6);
            this.searchResults.innerHTML = limitedVideos.map(video => `
                <div class="search-result-item" data-video-id="${video.id}">
                    <img src="${video.portada}" alt="${video.titulo}" class="search-result-image" 
                         onerror="this.src='https://via.placeholder.com/80x60/8B0000/FFFFFF?text=Error'">
                    <div class="search-result-content">
                        <h4 class="search-result-title">${this.highlightText(video.titulo, query)}</h4>
                        <div class="search-result-meta">
                            <span class="search-result-author">
                                <i class="fa-solid fa-user"></i> ${video.autor}
                            </span>
                            <span class="search-result-category">
                                <i class="fa-solid fa-tag"></i> ${video.categoria}
                            </span>
                        </div>
                        <span class="search-result-date">
                            <i class="fa-solid fa-calendar"></i> ${video.fecha}
                        </span>
                    </div>
                </div>
            `).join('');

            // Agregar event listeners a los resultados
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const videoId = item.getAttribute('data-video-id');
                    window.location.href = `video.html?id=${videoId}`;
                });

                item.addEventListener('mouseenter', () => {
                    this.clearSelection();
                });
            });
        }

        this.showResults();
        this.selectedIndex = -1;
    }

    highlightText(text, query) {
        const normalizedQuery = this.normalizeText(query);
        const normalizedText = this.normalizeText(text);
        const index = normalizedText.indexOf(normalizedQuery);
        
        if (index === -1) return text;
        
        const start = index;
        const end = index + query.length;
        
        return text.substring(0, start) + 
               '<mark>' + text.substring(start, end) + '</mark>' + 
               text.substring(end);
    }

    showResults() {
        this.searchResults.style.display = 'block';
        this.isVisible = true;
    }

    hideResults() {
        this.searchResults.style.display = 'none';
        this.isVisible = false;
        this.selectedIndex = -1;
    }

    updateSelection(items) {
        this.clearSelection();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
            items[this.selectedIndex].classList.add('selected');
        }
    }

    clearSelection() {
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
}

// Exportar para uso global
export { SearchManager };

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SearchManager();
    });
} else {
    new SearchManager();
}
