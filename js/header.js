// Función para cargar el encabezado dinámicamente
function loadHeader() {
    const headerHTML = `
    <!-- Header -->
    <header class="header">
        <div class="header-top">
            <div class="logo">
                <img src="img/tripgore-logo.png" alt="Logo TRIPGORE">
            </div>

            <!-- Menú hamburguesa para móviles -->
            <div class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>

            <!-- Barra de búsqueda -->
            <div class="search-bar" onclick="toggleSearch()">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>Buscar Videos</span>
            </div>

            <!-- Navegación desktop -->
            <div class="nav-links">
                <a href="../index.html" style="font-weight: bold;">INICIO</a>
                <a href="#" onclick="openSupportEmail(); return false;" style="font-weight: bold;">SOPORTE</a>
                <a href="https://t.me/perritogoree" style="font-weight: bold;">Telegram</a>
                <a href="https://discord.gg/pS7qvjP4S5" style="font-weight: bold;">Discord</a>
                <a href="index.html?page=colaboradores" style="font-weight: bold;">Colaboradores</a>
                <a href="other/aris.html" style="font-weight: bold;">ARIS CODE</a>
                <a href="#" style="font-weight: bold;">ZONA HOT 🔥</a>
            </div>

            <!-- Acciones de usuario desktop -->
            <div class="user-actions">
                <span>🔒</span>
                <a href="auth/auth.html" style="font-weight: bold;">Iniciar sesión</a>
                <a href="auth/auth.html" style="font-weight: bold;">Regístrate</a>
            </div>
        </div>

        <!-- Enlaces promocionales desktop -->
        <div class="promo-links">
            <a href="#" class="yellow" onclick="showRemoveAdsModal()">Eliminar Anuncios</a>
        </div>

        <!-- Container de búsqueda -->
        <div class="search-container" id="searchContainer">
            <div class="search-input-container">
                <input type="text" class="search-input" id="searchInput" placeholder="Buscar videos..." autocomplete="off">
                <button class="search-btn" onclick="performModalSearch()">Buscar</button>
                <button class="search-close-btn" onclick="closeSearch()">Cerrar</button>
            </div>
            <div class="search-results" id="searchResults"></div>
        </div>

        <!-- Modal de búsqueda -->
        <div class="search-modal" id="searchModal">
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h3 class="search-modal-title">Resultados de búsqueda</h3>
                    <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
                </div>
                <div class="search-modal-body">
                    <div class="search-modal-results" id="searchModalResults">
                        <!-- Los resultados se cargarán aquí -->
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Menú móvil -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-header">
            <div class="logo">
                <img src="img/tripgore-logo.png" alt="Logo TRIPGORE">
            </div>
        </div>

        <!-- Perfil de usuario móvil -->
        <div class="mobile-user-profile">
            <div class="user-profile">
                <div class="user-info">
                    <i class="fa-solid fa-lock user-icon"></i>
                    <span class="user-email">No logueado</span>
                </div>
                <a href="auth/auth.html" class="logout-btn">
                    <i class="fa-solid fa-sign-in-alt"></i>
                    Iniciar sesión
                </a>
            </div>
        </div>

        <!-- Búsqueda móvil -->
        <div class="mobile-search-section">
            <div class="mobile-search-title">
                <i class="fa-solid fa-magnifying-glass"></i> Buscar
            </div>
            <input type="text" class="mobile-search-input" id="mobileSearchInput" placeholder="Buscar videos..." autocomplete="off">
            
            <div class="mobile-search-results" id="mobileSearchResults"></div>
        </div>

        <!-- Navegación principal móvil -->
        <div class="mobile-nav-section">
            <div class="mobile-nav-title">
                <i class="fa-solid fa-home"></i> Navegación
            </div>
            <div class="mobile-nav-links">
                <a href="../index.html">
                    <i class="fa-brands fa-telegram"></i>
                    INICIO
                </a>
                <a href="#" onclick="openSupportEmail(); return false;">
                    <i class="fa-solid fa-life-ring"></i>
                    SOPORTE
                </a>
                <a href="https://t.me/perritogoree">
                    <i class="fa-brands fa-telegram"></i>
                    Telegram
                </a>
                <a href="https://discord.gg/pS7qvjP4S5">
                    <i class="fa-brands fa-discord"></i>
                    Discord
                </a>
                <a href="index.html?page=colaboradores">
                    <i class="fa-solid fa-users"></i>
                    Colaboradores
                </a>
                <a href="other/aris.html">
                    <i class="fa-solid fa-star"></i>
                    ARIS CODE
                </a>
                <a href="#">
                    <i class="fa-solid fa-fire"></i>
                    ZONA HOT 🔥
                </a>
            </div>

            <!-- Enlaces promocionales -->
            <div class="mobile-promo-links">
                <a href="#" onclick="showRemoveAdsModal()">
                    <i class="fa-solid fa-ad"></i>
                    Eliminar Anuncios
                </a>
            </div>
        </div>
    </div>
    `;

    return headerHTML;
}

// Función para alternar menú móvil
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    mobileMenu.classList.toggle('show');
    menuToggle.classList.toggle('active');

    // Prevenir scroll del body cuando el menú está abierto
    if (mobileMenu.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Función para cerrar menú móvil
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    mobileMenu.classList.remove('show');
    menuToggle.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Función para búsqueda móvil
function performMobileSearch() {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const query = mobileSearchInput.value.trim();

    if (query.length > 0) {
        // Cerrar menú móvil
        closeMobileMenu();

        // Realizar búsqueda (usar la misma función que la búsqueda desktop)
        if (typeof searchVideos === 'function') {
            searchVideos(query);
        } else {
            // Si estamos en index.html, usar la función de filtrado
            console.log('Búsqueda móvil:', query);
            // Aquí podrías implementar la búsqueda específica para mobile
        }
    }
}

// Función para inicializar el encabezado
function initializeHeader() {
    // Buscar el contenedor donde insertar el header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = loadHeader();

        // Configurar eventos de búsqueda
        setupSearchEvents();

        // Configurar eventos móviles
        setupMobileEvents();
    }
}

// Función para configurar eventos móviles
function setupMobileEvents() {
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    if (mobileSearchInput) {
        // Búsqueda en tiempo real en móvil
        mobileSearchInput.addEventListener('input', function() {
            const query = this.value.trim();

            if (query.length >= 1) {
                searchVideosMobile(query);
            } else {
                const mobileSearchResults = document.getElementById('mobileSearchResults');
                if (mobileSearchResults) {
                    mobileSearchResults.style.display = 'none';
                }
            }
        });

        // Búsqueda al presionar Enter en móvil
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performMobileSearch();
            }
        });
    }

    // Cerrar menú móvil al hacer clic en enlaces
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Cerrar menú móvil al hacer clic fuera
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }
}


// Usar la base de datos real mediaDB
// La base de datos se carga desde database/mediaDB.js

// Variable global para almacenar la base de datos
let globalMediaDB = null;

// Función para cargar la base de datos desde el archivo JSON
async function loadMediaDB() {
    try {
        const response = await fetch('database/mediaDB.js');
        const scriptContent = await response.text();
        
        // Extraer el contenido de mediaDB del script
        const match = scriptContent.match(/const mediaDB = (\[[\s\S]*?\]);/);
        if (match) {
            globalMediaDB = JSON.parse(match[1]);
            console.log('✅ Base de datos cargada:', globalMediaDB.length, 'videos');
        } else {
            console.error('❌ No se pudo extraer mediaDB del archivo');
        }
    } catch (error) {
        console.error('❌ Error al cargar la base de datos:', error);
    }
}

// Función para obtener la base de datos (compatible con index.html)
function getMediaDB() {
    // Si mediaDB está definido globalmente (en index.html), usarlo
    if (typeof mediaDB !== 'undefined') {
        return mediaDB;
    }
    // Si no, usar la base de datos cargada globalmente
    return globalMediaDB;
}

// Función para alternar la búsqueda
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchBar = document.querySelector('.search-bar'); // Obtener la barra de búsqueda desktop

    searchContainer.classList.toggle('show');
    searchBar.classList.toggle('hidden-desktop'); // Ocultar la barra de búsqueda desktop cuando el contenedor de búsqueda está visible

    if (searchContainer.classList.contains('show')) {
        // Enfocar el input cuando se abre
        const searchInput = document.getElementById('searchInput');
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    } else {
        // Limpiar resultados cuando se cierra
        clearSearchResults();
    }
}


// Función para cerrar la búsqueda
function closeSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchBar = document.querySelector('.search-bar');

    searchContainer.classList.remove('show');
    searchBar.classList.remove('hidden-desktop'); // Mostrar la barra de búsqueda desktop nuevamente
    clearSearchResults();
}

// Función para limpiar resultados de búsqueda
function clearSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}



// Función para buscar videos con sugerencias en tiempo real
function searchVideos(query) {
    const searchResults = document.getElementById('searchResults');
    const mediaDB = getMediaDB();

    // Verificar que mediaDB esté disponible
    if (!mediaDB) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Base de datos no disponible</p>
            </div>
        `;
        return;
    }

    // Si no hay query, ocultar resultados
    if (!query || query.trim().length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    // Mostrar resultados
    searchResults.style.display = 'block';

    // Filtrar videos que coincidan con la búsqueda (máximo 6 resultados para mejor UX)
    const filteredVideos = mediaDB.filter(video =>
        video.categoria !== 'OCULTO' && (
            video.titulo.toLowerCase().includes(query.toLowerCase()) ||
            video.categoria.toLowerCase().includes(query.toLowerCase()) ||
            video.autor.toLowerCase().includes(query.toLowerCase())
        )
    ).slice(0, 6);

    if (filteredVideos.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-search"></i>
                <p>No se encontraron resultados para "${query}"</p>
            </div>
        `;
        return;
    }

    // Generar HTML de resultados
    const resultsHTML = filteredVideos.map(video => `
        <div class="search-suggestion-item" onclick="openVideo('${video.id}')">
            <div class="suggestion-thumbnail">
                <img src="${video.portada}" alt="${video.titulo}">
            </div>
            <div class="suggestion-info">
                <h3 class="suggestion-title">${highlightSearchTerm(video.titulo, query)}</h3>
                <div class="suggestion-meta">
                    <span class="suggestion-author">${video.autor}</span>
                    <span class="suggestion-date">${video.fecha}</span>
                    <span class="suggestion-category">${video.categoria}</span>
                </div>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = resultsHTML;
}

// Función para búsqueda móvil con sugerencias
function searchVideosMobile(query) {
    const mobileSearchResults = document.getElementById('mobileSearchResults');
    const mediaDB = getMediaDB();

    // Si no existe el contenedor, crearlo
    if (!mobileSearchResults) {
        const mobileSearchSection = document.querySelector('.mobile-search-section');
        if (mobileSearchSection) {
            const resultsContainer = document.createElement('div');
            resultsContainer.id = 'mobileSearchResults';
            resultsContainer.className = 'mobile-search-results';
            mobileSearchSection.appendChild(resultsContainer);
        }
        return;
    }

    // Verificar que mediaDB esté disponible
    if (!mediaDB) {
        mobileSearchResults.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Base de datos no disponible</p>
            </div>
        `;
        return;
    }

    // Si no hay query, ocultar resultados
    if (!query || query.trim().length === 0) {
        mobileSearchResults.style.display = 'none';
        return;
    }

    // Mostrar resultados
    mobileSearchResults.style.display = 'block';

    // Filtrar videos que coincidan con la búsqueda (máximo 5 resultados para móvil)
    const filteredVideos = mediaDB.filter(video =>
        video.categoria !== 'OCULTO' && (
            video.titulo.toLowerCase().includes(query.toLowerCase()) ||
            video.categoria.toLowerCase().includes(query.toLowerCase()) ||
            video.autor.toLowerCase().includes(query.toLowerCase())
        )
    ).slice(0, 5);

    if (filteredVideos.length === 0) {
        mobileSearchResults.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-search"></i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        return;
    }

    // Generar HTML de resultados para móvil
    const resultsHTML = filteredVideos.map(video => `
        <div class="mobile-suggestion-item" onclick="openVideoAndCloseMenu('${video.id}')">
            <div class="mobile-suggestion-thumbnail">
                <img src="${video.portada}" alt="${video.titulo}">
            </div>
            <div class="mobile-suggestion-info">
                <h3 class="mobile-suggestion-title">${highlightSearchTerm(video.titulo, query)}</h3>
                <div class="mobile-suggestion-meta">
                    <span class="mobile-suggestion-category">${video.categoria}</span>
                </div>
            </div>
        </div>
    `).join('');

    mobileSearchResults.innerHTML = resultsHTML;
}

// Función para resaltar términos de búsqueda
function highlightSearchTerm(text, term) {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Función para abrir video
function openVideo(videoId) {
    console.log(`Abriendo video ${videoId}`);
    // Limpiar búsqueda y cerrar resultados
    clearSearchResults();
    closeSearch();
    // Navegar al reproductor con el ID del video
    const currentPath = window.location.pathname;
    const basePath = currentPath.split('/').slice(0, -1).join('/');
    window.location.href = `${basePath}/video.html?id=${videoId}`;
}

// Función para abrir video desde móvil y cerrar menú
function openVideoAndCloseMenu(videoId) {
    console.log(`Abriendo video ${videoId} desde móvil`);
    // Cerrar menú móvil
    closeMobileMenu();
    // Limpiar búsqueda móvil
    const mobileSearchResults = document.getElementById('mobileSearchResults');
    if (mobileSearchResults) {
        mobileSearchResults.style.display = 'none';
    }
    // Navegar al reproductor con el ID del video
    const currentPath = window.location.pathname;
    const basePath = currentPath.split('/').slice(0, -1).join('/');
    window.location.href = `${basePath}/video.html?id=${videoId}`;
}

// Función para configurar eventos de búsqueda
function setupSearchEvents() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        // Búsqueda en tiempo real mientras se escribe
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();

            if (query.length >= 1) {
                searchVideos(query);
            } else {
                clearSearchResults();
            }
        });

        // Búsqueda al presionar Enter (abrir modal)
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performModalSearch();
            }
        });

        // Cerrar búsqueda al hacer clic fuera
        document.addEventListener('click', function(e) {
            const searchContainer = document.getElementById('searchContainer');
            const searchBar = document.querySelector('.search-bar');

            // Si el clic no está dentro del contenedor de búsqueda ni en la barra de búsqueda, cierra la búsqueda
            if (!searchContainer.contains(e.target) && !searchBar.contains(e.target)) {
                closeSearch();
            }
        });
    }
}

// Función para realizar búsqueda modal
function performModalSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query || query.length === 0) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }

    // Cerrar barra de búsqueda y abrir modal
    closeSearch();
    openSearchModal(query);
}

// Función para abrir modal de búsqueda
function openSearchModal(query) {
    const modal = document.getElementById('searchModal');
    const modalResults = document.getElementById('searchModalResults');

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Mostrar estado de carga
    modalResults.innerHTML = `
        <div class="modal-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Buscando "${query}"...</p>
        </div>
    `;

    // Realizar búsqueda
    setTimeout(() => {
        searchVideosForModal(query);
    }, 300);
}

// Función para cerrar modal de búsqueda
function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Limpiar resultados
    const modalResults = document.getElementById('searchModalResults');
    modalResults.innerHTML = '';
}

// Función para normalizar texto (quitar tildes y convertir a minúsculas)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// Función para buscar videos para el modal con palabras clave
function searchVideosForModal(query) {
    const modalResults = document.getElementById('searchModalResults');
    const mediaDB = getMediaDB();

    // Verificar que mediaDB esté disponible
    if (!mediaDB) {
        modalResults.innerHTML = `
            <div class="no-modal-results">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Base de datos no disponible</p>
            </div>
        `;
        return;
    }

    // Normalizar query y dividir en palabras clave
    const normalizedQuery = normalizeText(query);
    const keywords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);

    // Filtrar videos
    const filteredVideos = mediaDB.filter(video => {
        if (video.categoria === 'OCULTO') return false;

        const normalizedTitle = normalizeText(video.titulo);
        const normalizedAuthor = normalizeText(video.autor);
        const normalizedCategory = normalizeText(video.categoria);

        // Buscar coincidencia exacta primero
        if (normalizedTitle.includes(normalizedQuery) ||
            normalizedAuthor.includes(normalizedQuery) ||
            normalizedCategory.includes(normalizedQuery)) {
            return true;
        }

        // Luego buscar por palabras clave
        return keywords.some(keyword =>
            normalizedTitle.includes(keyword) ||
            normalizedAuthor.includes(keyword) ||
            normalizedCategory.includes(keyword)
        );
    });

    if (filteredVideos.length === 0) {
        modalResults.innerHTML = `
            <div class="no-modal-results">
                <i class="fa-solid fa-search"></i>
                <p>No se encontraron videos para "${query}"</p>
                <small>Intenta con otras palabras clave</small>
            </div>
        `;
        return;
    }

    // Ordenar por relevancia (coincidencias exactas primero)
    const sortedVideos = filteredVideos.sort((a, b) => {
        const aNormalizedTitle = normalizeText(a.titulo);
        const bNormalizedTitle = normalizeText(b.titulo);

        const aExactMatch = aNormalizedTitle.includes(normalizedQuery);
        const bExactMatch = bNormalizedTitle.includes(normalizedQuery);

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        return 0;
    });

    // Generar HTML de resultados
    const resultsHTML = `
        <div class="modal-results-header">
            <h4>Se encontraron ${sortedVideos.length} resultado(s) para "${query}"</h4>
        </div>
        <div class="modal-results-grid">
            ${sortedVideos.map(video => `
                <div class="modal-result-item" onclick="openVideoFromModal('${video.id}')">
                    <div class="modal-result-thumbnail">
                        <img src="${video.portada}" alt="${video.titulo}">
                    </div>
                    <div class="modal-result-info">
                        <h3 class="modal-result-title">${highlightSearchTermModal(video.titulo, query, keywords)}</h3>
                        <div class="modal-result-meta">
                            <span class="modal-result-author">${video.autor}</span>
                            <span class="modal-result-date">${video.fecha}</span>
                            <span class="modal-result-category">${video.categoria}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    modalResults.innerHTML = resultsHTML;
}

// Función para resaltar términos de búsqueda en el modal
function highlightSearchTermModal(text, originalQuery, keywords) {
    let highlightedText = text;

    // Resaltar query completo primero
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(originalQuery);

    if (normalizedText.includes(normalizedQuery)) {
        const regex = new RegExp(`(${escapeRegex(originalQuery)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="modal-highlight">$1</span>');
    } else {
        // Resaltar palabras clave individuales
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="modal-highlight-keyword">$1</span>');
        });
    }

    return highlightedText;
}

// Función para escapar caracteres especiales de regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Función para abrir video desde modal
function openVideoFromModal(videoId) {
    console.log(`Abriendo video ${videoId} desde modal`);
    closeSearchModal();
    const currentPath = window.location.pathname;
    const basePath = currentPath.split('/').slice(0, -1).join('/');
    window.location.href = `${basePath}/video.html?id=${videoId}`;
}

// Función para mostrar modal de eliminar anuncios
function showRemoveAdsModal() {
    alert('¡Esta opcion aun esta en desarrollo..!');
}

// Función para ir al inicio
function goToHome() {
    // Redirigir directamente a la URL completa del sitio
    window.location.href = 'https://tripgore.space/index.html';
}

// Función para ir a una página específica con parámetros
function goToPage(page) {
    // Redirigir directamente a la URL completa del sitio con parámetros
    window.location.href = 'https://tripgore.space/index.html?page=' + page;
}

// Función para abrir el cliente de correo con soporte
function openSupportEmail() {
    const email = 'colabmc.net@gmail.com';
    const subject = 'Soporte Tecnico TRIPGORE';
    const body = 'Hola, Necesito ayuda con: ';
    
    // Crear el enlace mailto
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Intentar abrir el cliente de correo
    try {
        window.location.href = mailtoLink;
        console.log('Abriendo cliente de correo para soporte...');
    } catch (error) {
        console.error('Error al abrir el cliente de correo:', error);
        
        // Fallback: mostrar un modal con la información
        showSupportModal(email, subject, body);
    }
}

// Función para mostrar modal de soporte como fallback
function showSupportModal(email, subject, body) {
    // Crear modal si no existe
    let modal = document.getElementById('supportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supportModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border: 2px solid #ff0000;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            ">
                <h3 style="color: #fff; margin: 0 0 20px 0; font-size: 24px;">
                    <i class="fa-solid fa-envelope" style="color: #ff0000; margin-right: 10px;"></i>
                    Soporte Técnico
                </h3>
                <p style="color: #ccc; margin: 0 0 20px 0; line-height: 1.5;">
                    Copia la siguiente información y envíala a tu cliente de correo:
                </p>
                <div style="
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: left;
                ">
                    <p style="color: #fff; margin: 0 0 10px 0;"><strong>Para:</strong> ${email}</p>
                    <p style="color: #fff; margin: 0 0 10px 0;"><strong>Asunto:</strong> ${subject}</p>
                    <p style="color: #fff; margin: 0;"><strong>Mensaje:</strong> ${body}</p>
                </div>
                <button onclick="closeSupportModal()" style="
                    background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Cerrar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}

// Función para cerrar el modal de soporte
function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cargar el header cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    
    // Cargar la base de datos si no está disponible (para páginas que no son index.html)
    if (typeof mediaDB === 'undefined') {
        loadMediaDB();
    }
});