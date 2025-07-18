// Sistema de Header con menú hamburguesa simple y clásico
document.addEventListener('DOMContentLoaded', function() {
    createSimpleHeader();
    setupSimpleHeaderEvents();
});

function createSimpleHeader() {
    // Buscar el contenedor del header
    const headerContainer = document.querySelector('.header .container');
    if (!headerContainer) return;

    // Limpiar contenido existente (excepto el logo)
    const existingLogo = headerContainer.querySelector('.logo');
    headerContainer.innerHTML = '';

    // Crear estructura del header simple
    const headerHTML = `
        <!-- Menú hamburguesa -->
        <button class="hamburger-menu" id="hamburgerMenu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Logo -->
        <div class="logo">
            <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPGORE" class="logo-img">
        </div>

        <!-- Buscador -->
        <div class="search-container">
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="Buscar videos..." id="searchInput">
                <i class="fa-solid fa-search search-icon"></i>
            </div>
            <div class="search-results" id="searchResults"></div>
        </div>

        <!-- Navegación principal -->
        <nav class="main-nav">
            <a href="/adminpanel.html" class="nav-btn">
                <i class="fa-solid fa-upload"></i>
                <span>Subir</span>
            </a>
            <a href="/soporte.html" class="nav-btn">
                <i class="fa-solid fa-headset"></i>
                <span>Soporte</span>
            </a>
            <div class="user-info" id="userInfo">
                <i class="fa-solid fa-user"></i>
                <span id="userDisplay">Invitado</span>
            </div>
        </nav>

        <!-- Menú desplegable -->
        <div class="dropdown-menu" id="dropdownMenu">
            <div class="dropdown-content">
                <div class="dropdown-header">
                <p>ㅤ</p>
                <p>ㅤ</p>
                <p>ㅤ</p>
                    <div class="dropdown-user" id="dropdownUser">
                        <i class="fa-solid fa-user"></i>
                        <span id="dropdownUserName">Invitado</span>
                    </div>
                </div>

                <div class="dropdown-section">
                    <a href="/index.html" class="dropdown-item">
                        <i class="fa-solid fa-house"></i>
                        <span>Inicio</span>
                    </a>
                    <a href="/adminpanel.html" class="dropdown-item">
                        <i class="fa-solid fa-upload"></i>
                        <span>Subir</span>
                    </a>
                    <a href="/chat.html" class="dropdown-item">
                        <i class="fa-solid fa-comments"></i>
                        <span>Chat</span>
                    </a>
                    <a href="/soporte.html" class="dropdown-item">
                        <i class="fa-solid fa-headset"></i>
                        <span>Soporte</span>
                    </a>
                </div>

                <div class="dropdown-divider"></div>

                <div class="dropdown-section">
                    <div class="dropdown-subtitle">Menú Extra</div>
                    <a href="/submenu/novedades.html" class="dropdown-item">
                        <i class="fa-solid fa-star"></i>
                        <span>Novedades</span>
                    </a>
                    <a href="#" class="dropdown-item" id="donationsBtn">
                        <i class="fa-solid fa-heart"></i>
                        <span>Donaciones</span>
                    </a>
                    <a href="https://discord.gg/6AKMHVRxmH" class="dropdown-item" target="_blank">
                        <i class="fa-brands fa-discord"></i>
                        <span>Discord</span>
                    </a>
                    <a href="/submenu/colaboradores.html" class="dropdown-item">
                        <i class="fa-solid fa-users"></i>
                        <span>Colaboradores</span>
                    </a>
                    <a href="/submenu/roles.html" class="dropdown-item">
                        <i class="fa-solid fa-crown"></i>
                        <span>Roles</span>
                    </a>
                </div>

                <div class="dropdown-divider"></div>

                <div class="dropdown-section">
                    <a href="/login.html" class="dropdown-item" id="loginLink">
                        <i class="fa-solid fa-sign-in-alt"></i>
                        <span>Iniciar Sesión</span>
                    </a>
                    <a href="/registro.html" class="dropdown-item" id="registerLink">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Registrarse</span>
                    </a>
                    <a href="#" class="dropdown-item" id="logoutLink" style="display: none;">
                        <i class="fa-solid fa-sign-out-alt"></i>
                        <span>Cerrar Sesión</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Overlay para cerrar el menú -->
        <div class="menu-overlay" id="menuOverlay"></div>
    `;

    headerContainer.innerHTML = headerHTML;
    addSimpleHeaderStyles();
}

function addSimpleHeaderStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Header principal */
        .header {
            background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(220, 20, 60, 0.9));
            backdrop-filter: blur(10px);
            border-bottom: 2px solid rgba(139, 0, 0, 0.3);
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
            padding: 15px 0; /* Ajusta el valor según sea necesario */
        }

        .header .container {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 15px 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Menú hamburguesa */
        .hamburger-menu {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            width: 40px;
            height: 40px;
            background: rgba(139, 0, 0, 0.9);
            border: 2px solid rgba(220, 20, 60, 0.6);
            border-radius: 8px;
            cursor: pointer;
            padding: 8px;
            transition: all 0.3s ease;
            z-index: 1001;
        }

        .hamburger-menu:hover {
            background: rgba(220, 20, 60, 0.9);
            border-color: #DC143C;
        }

        .hamburger-menu span {
            width: 100%;
            height: 3px;
            background: white;
            border-radius: 2px;
            transition: all 0.3s ease;
            display: block;
        }

        .hamburger-menu.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger-menu.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger-menu.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Logo */
        .logo {
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }

        .logo-img {
            height: 40px;
            width: auto;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        }

        /* Buscador */
        .search-container {
            position: relative;
            flex: 1;
            max-width: 400px;
            margin: 0 20px;
        }

        .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .search-input {
            width: 100%;
            padding: 12px 45px 12px 15px;
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(139, 0, 0, 0.5);
            border-radius: 25px;
            color: #FFB6C1;
            font-size: 14px;
            transition: all 0.3s ease;
            outline: none;
        }

        .search-input::placeholder {
            color: rgba(255, 182, 193, 0.6);
        }

        .search-input:focus {
            border-color: #DC143C;
            background: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 15px rgba(220, 20, 60, 0.3);
        }

        .search-icon {
            position: absolute;
            right: 15px;
            color: rgba(255, 182, 193, 0.7);
            font-size: 16px;
            pointer-events: none;
        }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(20, 20, 20, 0.95);
            border: 2px solid rgba(139, 0, 0, 0.5);
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            max-height: 400px;
            overflow-y: auto;
            z-index: 1001;
            margin-top: 5px;
            display: none;
        }

        /* Navegación principal */
        .main-nav {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .nav-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            text-decoration: none;
            padding: 10px 15px;
            border-radius: 8px;
            background: rgba(139, 0, 0, 0.3);
            border: 1px solid rgba(220, 20, 60, 0.3);
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        }

        .nav-btn:hover {
            background: rgba(220, 20, 60, 0.5);
            border-color: #DC143C;
            transform: translateY(-2px);
        }

        .nav-btn i {
            color: #DC143C;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #FFB6C1;
            font-size: 14px;
            font-weight: 500;
            padding: 10px 15px;
            background: rgba(139, 0, 0, 0.3);
            border: 1px solid rgba(220, 20, 60, 0.3);
            border-radius: 8px;
            cursor: default;
        }

        .user-info i {
            color: #DC143C;
        }

        /* Menú desplegable */
        .dropdown-menu {
            position: fixed;
            top: 0;
            left: -350px;
            width: 320px;
            height: 100vh;
            padding: 15px;
            min-height: 100vh;
            max-height: 100vh;
            background: linear-gradient(145deg, #1a0000, #2a0000);
            border-right: 2px solid #DC143C;
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.8);
            z-index: 999;
            transition: left 0.3s ease;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .dropdown-menu.active {
            left: 0;
        }

        .dropdown-content {
            padding: 25px 20px;
            min-height: calc(100vh - 50px);
            height: 100%;
            overflow-y: visible;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .dropdown-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(220, 20, 60, 0.3);
        }

        .dropdown-user {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #FFB6C1;
            font-size: 16px;
            font-weight: bold;
        }

        .dropdown-user i {
            color: #DC143C;
            font-size: 20px;
        }

        .dropdown-section {
            margin-bottom: 30px;
        }

        .dropdown-subtitle {
            color: #DC143C;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #FFB6C1;
            text-decoration: none;
            padding: 16px 18px;
            border-radius: 8px;
            margin-bottom: 8px;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
            min-height: 50px;
        }

        .dropdown-item:hover {
            background: rgba(220, 20, 60, 0.2);
            border-left-color: #DC143C;
            color: white;
            transform: translateX(5px);
        }

        .dropdown-item i {
            color: #DC143C;
            font-size: 16px;
            width: 20px;
            text-align: center;
        }

        .dropdown-divider {
            height: 1px;
            background: rgba(220, 20, 60, 0.3);
            margin: 15px 0;
        }

        /* Overlay */
        .menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
            .header .container {
                gap: 15px;
                padding: 12px 15px;
            }

            .search-container {
                max-width: 300px;
                margin: 0 15px;
            }

            .nav-btn span {
                display: none;
            }

            .nav-btn {
                padding: 8px 12px;
            }

            .user-info {
                padding: 8px 12px;
            }
        }

        @media (max-width: 768px) {
            .header .container {
                gap: 12px;
                padding: 10px 12px;
            }

            .search-container {
                max-width: 250px;
                margin: 0 10px;
            }

            .search-input {
                padding: 10px 40px 10px 12px;
                font-size: 13px;
            }

            /* Ocultar navegación principal en móviles */
            .main-nav {
                display: none;
            }

            .dropdown-menu {
                width: 280px;
                left: -300px;
                height: auto;
                padding: 10px;
                min-height: 100vh;
                max-height: 100vh;
            }

            .dropdown-content {
                padding: 15px;
                min-height: calc(100vh - 30px);
                height: auto;
            }
        }

        @media (max-width: 480px) {
            .header .container {
                gap: 8px;
                padding: 8px 10px;
            }

            .search-container {
                max-width: 200px;
                margin: 0 8px;
            }

            .hamburger-menu {
                width: 35px;
                height: 35px;
                padding: 6px;
            }

            .logo-img {
                height: 35px;
            }

            /* Navegación principal completamente oculta en móviles pequeños */
            .main-nav {
                display: none;
            }

            .dropdown-menu {
                width: 100%;
                left: -100%;
                height: auto;
                padding: 10px;
                min-height: 100vh;
                max-height: 100vh;
            }

            .dropdown-content {
                padding: 15px;
                min-height: calc(100vh - 30px);
                height: auto;
            }

            .dropdown-item {
                padding: 15px;
                font-size: 16px;
            }
        }

        /* Resultados de búsqueda */
        .search-result-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            border-bottom: 1px solid rgba(139, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .search-result-item:hover,
        .search-result-item.selected {
            background: rgba(220, 20, 60, 0.1);
            transform: translateX(2px);
        }

        .search-result-item:last-child {
            border-bottom: none;
        }

        .search-result-image {
            width: 60px;
            height: 45px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid rgba(139, 0, 0, 0.3);
            flex-shrink: 0;
        }

        .search-result-content {
            flex: 1;
            min-width: 0;
        }

        .search-result-title {
            color: #FFB6C1;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .search-result-title mark {
            background: rgba(220, 20, 60, 0.3);
            color: white;
            padding: 1px 2px;
            border-radius: 2px;
        }

        .search-result-meta {
            display: flex;
            gap: 12px;
            margin-bottom: 4px;
        }

        .search-result-author,
        .search-result-category,
        .search-result-date {
            color: rgba(255, 182, 193, 0.8);
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .search-result-author i,
        .search-result-category i,
        .search-result-date i {
            color: #DC143C;
            font-size: 10px;
        }

        .search-no-results {
            padding: 20px;
            text-align: center;
            color: rgba(255, 182, 193, 0.7);
            font-size: 14px;
        }

        .search-no-results i {
            color: #DC143C;
            margin-right: 8px;
        }

        /* Scrollbar personalizado para el menú */
        .dropdown-content::-webkit-scrollbar {
            width: 6px;
        }

        .dropdown-content::-webkit-scrollbar-track {
            background: rgba(139, 0, 0, 0.1);
            border-radius: 3px;
        }

        .dropdown-content::-webkit-scrollbar-thumb {
            background: rgba(139, 0, 0, 0.5);
            border-radius: 3px;
        }

        .dropdown-content::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 0, 0, 0.7);
        }
    `;

    document.head.appendChild(style);
}

function setupSimpleHeaderEvents() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const logoutLink = document.getElementById('logoutLink');
    const donationsBtn = document.getElementById('donationsBtn');

    // Toggle del menú hamburguesa
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Cerrar menú con overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
        });
    }

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Cerrar menú al hacer click en los enlaces
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!this.id.includes('logout') && !this.id.includes('donations')) {
                closeMenu();
            }
        });
    });

    // Configurar logout
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const { authFunctions } = await import('./firebase.js');
                const result = await authFunctions.logout();
                if (result.success) {
                    closeMenu();
                    window.location.href = '/index.html';
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

    // Configurar donaciones
    if (donationsBtn) {
        donationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showDonationsModal === 'function') {
                window.showDonationsModal();
            }
            closeMenu();
        });
    }

    // Configurar funcionalidad de búsqueda
    setupSearchFunctionality();

    function toggleMenu() {
        if (dropdownMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        hamburgerMenu.classList.add('active');
        dropdownMenu.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateDropdownUser();
    }

    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        dropdownMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Inicializar auth state listener
    setTimeout(() => {
        import('./firebase.js').then(({ authFunctions }) => {
            authFunctions.onAuthStateChanged((user) => {
                updateUserDisplay();
                updateDropdownUser();
            });
            updateUserDisplay();
        }).catch(error => {
            console.error('Error loading Firebase:', error);
        });
    }, 1000);
}

// Función para actualizar el display del usuario
const updateUserDisplay = async () => {
    const userElement = document.getElementById('userDisplay');
    if (userElement) {
        try {
            const { authFunctions, getUsernameFromEmail, realtimeDb } = await import('./firebase.js');
            const { ref, get } = await import('https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js');

            const currentUser = authFunctions.getCurrentUser();

            if (currentUser) {
                const username = getUsernameFromEmail(currentUser.email);
                updateAuthLinks(true);

                try {
                    const { getUserRoleTagWithSize } = await import('./rolesDB.js');
                    const roleData = getUserRoleTagWithSize(username);

                    let profilePicture = '';
                    try {
                        const profileRef = ref(realtimeDb, `perfil/${currentUser.uid}/fotoPerfil`);
                        const profileSnapshot = await get(profileRef);
                        if (profileSnapshot.exists()) {
                            profilePicture = `<img src="${profileSnapshot.val()}" alt="perfil" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px; object-fit: cover; border: 1px solid #DC143C;">`;
                        }
                    } catch (profileError) {
                        console.log('No se pudo cargar foto de perfil:', profileError);
                    }

                    if (roleData) {
                        userElement.innerHTML = `${profilePicture}<img src="${roleData.etiqueta}" alt="role" style="width: ${roleData.ancho}; height: ${roleData.alto}; margin-right: 3px; vertical-align: middle;"> ${username}`;
                    } else {
                        userElement.innerHTML = `${profilePicture}${username}`;
                    }
                } catch (error) {
                    userElement.innerHTML = username;
                }
            } else {
                userElement.textContent = 'Invitado';
                updateAuthLinks(false);
            }
        } catch (error) {
            console.error('Error updating user display:', error);
            userElement.textContent = 'Invitado';
            updateAuthLinks(false);
        }
    }
};

// Función para actualizar el usuario en el dropdown
const updateDropdownUser = async () => {
    const dropdownUserName = document.getElementById('dropdownUserName');
    const userDisplay = document.getElementById('userDisplay');

    if (dropdownUserName && userDisplay) {
        dropdownUserName.innerHTML = userDisplay.innerHTML;
    }
};

// Función para actualizar los enlaces de autenticación
function updateAuthLinks(isLoggedIn) {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');

    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'flex';
    } else {
        if (loginLink) loginLink.style.display = 'flex';
        if (registerLink) registerLink.style.display = 'flex';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Función para configurar la búsqueda
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let selectedIndex = -1;
    let allVideos = [];

    // Cargar la base de datos de medios
    import('../mediaDB.js').then(module => {
        allVideos = module.default || [];
    }).catch(error => {
        console.error('Error loading mediaDB:', error);
    });

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            performSearch(query);
        } else {
            hideResults();
        }
    });

    // Navegación con teclado
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
                break;
            case 'Escape':
                hideResults();
                searchInput.blur();
                break;
        }
    });

    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideResults();
        }
    });

    // Mostrar resultados al enfocar si hay texto
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            performSearch(searchInput.value.trim());
        }
    });

    function performSearch(query) {
        const normalizedQuery = normalizeText(query);
        const matchingVideos = allVideos.filter(video => {
            if (!video.titulo || !video.autor || !video.categoria) return false;

            const normalizedTitle = normalizeText(video.titulo);
            const normalizedAuthor = normalizeText(video.autor);
            const normalizedCategory = normalizeText(video.categoria);

            return normalizedTitle.includes(normalizedQuery) ||
                normalizedAuthor.includes(normalizedQuery) ||
                normalizedCategory.includes(normalizedQuery);
        });

        displayResults(matchingVideos, query);
    }

    function normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '');
    }

    function displayResults(videos, query) {
        if (videos.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fa-solid fa-exclamation-circle"></i>
                    <span>No se encontraron videos para "${query}"</span>
                </div>
            `;
        } else {
            const limitedVideos = videos.slice(0, 6);
            searchResults.innerHTML = limitedVideos.map(video => {
                const videoIdUrl = generateVideoId(video.titulo);
                return `
                    <div class="search-result-item" data-video-id="${videoIdUrl}">
                        <img src="${video.portada}" alt="${video.titulo}" class="search-result-image" 
                             onerror="this.src='https://via.placeholder.com/80x60/8B0000/FFFFFF?text=Error'">
                        <div class="search-result-content">
                            <h4 class="search-result-title">${highlightText(video.titulo, query)}</h4>
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
                `;
            }).join('');

            // Agregar event listeners a los resultados
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const videoId = item.getAttribute('data-video-id');
                    window.location.href = `video.html?id=${videoId}`;
                });

                item.addEventListener('mouseenter', () => {
                    clearSelection();
                });
            });
        }

        showResults();
        selectedIndex = -1;
    }

    function generateVideoId(title) {
        return title.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
    }

    function highlightText(text, query) {
        const normalizedQuery = normalizeText(query);
        const normalizedText = normalizeText(text);
        const index = normalizedText.indexOf(normalizedQuery);

        if (index === -1) return text;

        const start = index;
        const end = index + query.length;

        return text.substring(0, start) +
            '<mark>' + text.substring(start, end) + '</mark>' +
            text.substring(end);
    }

    function showResults() {
        searchResults.style.display = 'block';
    }

    function hideResults() {
        searchResults.style.display = 'none';
        selectedIndex = -1;
    }

    function updateSelection(items) {
        clearSelection();
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].classList.add('selected');
        }
    }

    function clearSelection() {
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
}