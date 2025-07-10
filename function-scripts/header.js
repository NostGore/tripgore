// Sistema de Header con menú dinámico
document.addEventListener('DOMContentLoaded', function() {
    createHeaderMenu();
    setupHeaderEvents();
});

function createHeaderMenu() {
    // Buscar el contenedor del header
    const headerContainer = document.querySelector('.header .container');
    if (!headerContainer) return;

    // Crear estructura del menú
    const menuHTML = `
        <nav class="nav">
            <ul class="nav-menu">
                <li><a href="/index.html" class="nav-link"><i class="fa-solid fa-house"></i> Inicio</a></li>
                <li><a href="/adminpanel.html" class="nav-link"><i class="fa-solid fa-upload"></i> Subir</a></li>
                <li><a href="/chat.html" class="nav-link"><i class="fa-solid fa-comments"></i> Chat</a></li>
                <li><a href="/soporte.html" class="nav-link"><i class="fa-solid fa-headset"></i> Soporte</a></li>
                
                <li class="user-menu">
                    <span id="userDisplay" class="nav-link"><i class="fa-solid fa-user"></i> Invitado</span>
                    <div class="user-dropdown">
                        <a href="/login.html" id="loginLink" class="dropdown-link">
                            <i class="fa-solid fa-sign-in-alt"></i> Iniciar Sesión
                        </a>
                        <a href="/registro.html" id="registerLink" class="dropdown-link">
                            <i class="fa-solid fa-user-plus"></i> Registrarse
                        </a>
                        <a href="/adminpanel.html" id="adminLink" class="dropdown-link" style="display: none;">
                            <i class="fa-solid fa-cogs"></i> Admin Panel
                        </a>
                        <a href="#" id="logoutLink" class="dropdown-link" style="display: none;">
                            <i class="fa-solid fa-sign-out-alt"></i> Cerrar Sesión
                        </a>
                    </div>
                </li>
            </ul>
        </nav>

        <!-- Botón hamburguesa para móvil -->
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Menú móvil -->
        <div class="mobile-menu" id="mobileMenu">
            <div class="mobile-menu-header">
                <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPGORE" class="mobile-logo">
            </div>
            <div class="mobile-menu-content">
                <a href="/index.html" class="mobile-menu-item">
                    <i class="fa-solid fa-house"></i>
                    <span>Inicio</span>
                </a>
                <a href="/adminpanel.html" class="mobile-menu-item">
                    <i class="fa-solid fa-upload"></i>
                    <span>Subir</span>
                </a>
                <a href="/chat.html" class="mobile-menu-item">
                    <i class="fa-solid fa-comments"></i>
                    <span>Chat</span>
                </a>
                <a href="/soporte.html" class="mobile-menu-item">
                    <i class="fa-solid fa-headset"></i>
                    <span>Soporte</span>
                </a>
                
                <div class="mobile-menu-divider"></div>
                <div class="mobile-submenu-section">
                    <div class="mobile-submenu-title" id="mobileSubmenuToggle">
                        <i class="fa-solid fa-bars"></i>
                        <span>Menú Extra</span>
                        <i class="fa-solid fa-chevron-down submenu-arrow" id="submenuArrow"></i>
                    </div>
                    <div class="mobile-submenu-items" id="mobileSubmenuItems">
                        <a href="/submenu/novedades.html" class="mobile-menu-item mobile-submenu-item">
                            <i class="fa-solid fa-star"></i>
                            <span>Novedades</span>
                            <span class="notification-dot mobile-notification"></span>
                        </a>
                        <a href="#" class="mobile-menu-item mobile-submenu-item" id="donationsBtnMobile">
                            <i class="fa-solid fa-heart"></i>
                            <span>Donaciones</span>
                        </a>
                        <a href="https://discord.gg/6AKMHVRxmH" class="mobile-menu-item mobile-submenu-item" id="discordBtnMobile">
                            <i class="fa-brands fa-discord"></i>
                            <span>Discord</span>
                        </a>
                        <a href="/submenu/colaboradores.html" class="mobile-menu-item mobile-submenu-item">
                            <i class="fa-solid fa-users"></i>
                            <span>Colaboradores</span>
                        </a>
                        <a href="/submenu/roles.html" class="mobile-menu-item mobile-submenu-item">
                            <i class="fa-solid fa-crown"></i>
                            <span>Roles</span>
                        </a>
                        <a href="#" class="mobile-menu-item mobile-submenu-item">
                            <i class="fa-solid fa-gem"></i>
                            <span>ZonaVIP</span>
                        </a>
                    </div>
                </div>
                <div class="mobile-menu-divider"></div>
                <div class="mobile-user-section">
                    <div class="mobile-user-info">
                        <i class="fa-solid fa-user"></i>
                        <span id="mobileUserDisplay">Invitado</span>
                    </div>
                    <div class="mobile-user-actions">
                        <a href="/login.html" class="mobile-menu-item" id="mobileLoginLink">
                            <i class="fa-solid fa-sign-in-alt"></i>
                            <span>Iniciar Sesión</span>
                        </a>
                        <a href="/registro.html" class="mobile-menu-item" id="mobileRegisterLink">
                            <i class="fa-solid fa-user-plus"></i>
                            <span>Registrarse</span>
                        </a>
                        <a href="/adminpanel.html" class="mobile-menu-item" id="mobileAdminLink" style="display: none;">
                            <i class="fa-solid fa-cogs"></i>
                            <span>Admin Panel</span>
                        </a>
                        <a href="#" class="mobile-menu-item" id="mobileLogoutLink" style="display: none;">
                            <i class="fa-solid fa-sign-out-alt"></i>
                            <span>Cerrar Sesión</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overlay para cerrar el menú -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
    `;

    // Insertar solo la navegación principal en el header
    const navHTML = menuHTML.split('<!-- Botón hamburguesa para móvil -->')[0];
    headerContainer.insertAdjacentHTML('beforeend', navHTML);

    // Insertar el botón hamburguesa y menú móvil después del nav
    const mobileHTML = menuHTML.split('<!-- Botón hamburguesa para móvil -->')[1];
    headerContainer.insertAdjacentHTML('beforeend', mobileHTML);

    // Insertar el submenú después del header completo
    const headerElement = document.querySelector('.header');
    if (headerElement) {
        headerElement.insertAdjacentHTML('afterend', `
            <div class="submenu">
                <div class="submenu-container">
                    <a href="/submenu/novedades.html" class="submenu-item">
                        <i class="fa-solid fa-star"></i>
                        <span>Novedades</span>
                        <span class="notification-dot desktop-notification"></span>
                    </a>
                    <a href="#" class="submenu-item">
                        <i class="fa-solid fa-heart"></i>
                        <span>Donaciones</span>
                    </a>
                    <a href="https://discord.gg/6AKMHVRxmH" class="submenu-item" id="discordBtnDesktop">
                        <i class="fa-brands fa-discord"></i>
                        <span>Discord</span>
                    </a>
                    <a href="/submenu/colaboradores.html" class="submenu-item">
                        <i class="fa-solid fa-users"></i>
                        <span>Colaboradores</span>
                    </a>
                    <a href="/submenu/roles.html" class="submenu-item">
                        <i class="fa-solid fa-crown"></i>
                        <span>Roles</span>
                    </a>
                    <a href="#" class="submenu-item">
                        <i class="fa-solid fa-gem"></i>
                        <span>ZonaVIP</span>
                    </a>
                </div>
            </div>
        `);
    }

    // Agregar estilos CSS
    addHeaderStyles();
}

function addHeaderStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos del menú de navegación */
        .nav {
            display: flex;
            align-items: center;
            gap: 30px;
            flex-shrink: 0;
        }

        .nav-menu {
            display: flex;
            list-style: none;
            gap: 25px;
            margin: 0;
            padding: 0;
        }

        .nav-link {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
            position: relative;
            cursor: pointer;
        }

        .nav-link:hover {
            color: #FFB6C1;
        }

        .nav-link:hover::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: #FFB6C1;
        }

        /* User Menu Styles */
        .user-menu {
            position: relative;
        }

        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: linear-gradient(145deg, #2a0000, #1a0000);
            border-radius: 10px;
            padding: 15px 0;
            min-width: 200px;
            box-shadow: 0 10px 30px rgba(139, 0, 0, 0.4);
            border: 2px solid rgba(139, 0, 0, 0.3);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .user-menu:hover .user-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-link {
            display: block;
            color: #FFB6C1;
            text-decoration: none;
            padding: 12px 20px;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }

        .dropdown-link:hover {
            background: rgba(139, 0, 0, 0.3);
            border-left-color: #DC143C;
            color: white;
        }

        .dropdown-link i {
            margin-right: 10px;
            color: #DC143C;
            width: 16px;
        }

        /* Botón hamburguesa móvil */
        .mobile-menu-btn {
            display: none;
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
            z-index: 100002;
            position: relative;
        }

        .mobile-menu-btn:hover {
            background: rgba(220, 20, 60, 0.9);
            border-color: #DC143C;
        }

        .mobile-menu-btn span {
            width: 100%;
            height: 3px;
            background: white;
            border-radius: 2px;
            transition: all 0.3s ease;
            display: block;
        }

        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }

        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Overlay del menú móvil */
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 99999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Menú móvil */
        .mobile-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 320px;
            height: calc(120vh - 60px); /* No mover esto para nada */
            display: none;
            flex-direction: column;
            background: linear-gradient(145deg, #1a0000, #2a0000);
            overflow-y: auto;
            border-left: 2px solid #DC143C;
            z-index: 100000;
            transition: right 0.3s ease;
            box-shadow: -5px 0 25px rgba(0, 0, 0, 0.8);
            will-change: transform;
            contain: layout style paint;
        }

        .mobile-menu.active {
            display: flex;
            right: 0;
        }

        .mobile-menu-header {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px;
            background: #2a0000;
            border-bottom: 1px solid #DC143C;
        }

        .mobile-logo {
            height: 35px;
            width: auto;
        }

        .mobile-menu-content {
            padding: 15px;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            height: calc(100vh - 70px);
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }

        /* Ocultar scrollbar para mejor rendimiento */
        .mobile-menu-content::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }

        .mobile-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
            text-decoration: none;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            transition: background-color 0.2s ease;
            border-left: 3px solid transparent;
            background: #2a0000;
        }

        .mobile-menu-item:hover {
            background: #DC143C;
            border-left-color: #FF6B6B;
            color: white;
        }

        .mobile-menu-item i {
            font-size: 18px;
            color: #DC143C;
            width: 20px;
            text-align: center;
        }

        .mobile-menu-divider {
            height: 1px;
            background: #DC143C;
            margin: 15px 0;
        }

        .mobile-user-section {
            margin-top: 15px;
            margin-bottom: 15px;
        }

        .mobile-user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #FFB6C1;
            font-size: 14px;
            font-weight: 500;
            background: #2a0000;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #DC143C;
            margin-bottom: 12px;
        }

        .mobile-user-info i {
            color: #DC143C;
            font-size: 18px;
        }

        .mobile-user-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* Estilos del header */
        .header {
            background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(220, 20, 60, 0.9));
            backdrop-filter: blur(10px);
            border-bottom: 2px solid rgba(139, 0, 0, 0.3);
            position: sticky;
            top: 0;
            z-index: 1001;
            transition: all 0.3s ease;
        }

        /* Estilos del submenú */
        .submenu {
            background: linear-gradient(135deg, rgba(26, 0, 0, 0.9), rgba(42, 0, 0, 0.8));
            border-bottom: 1px solid rgba(139, 0, 0, 0.3);
            border-top: 1px solid rgba(139, 0, 0, 0.2);
            padding: 8px 0;
            backdrop-filter: blur(5px);
            box-shadow: 0 2px 10px rgba(139, 0, 0, 0.3);
            position: sticky;
            top: 0;
            z-index: 1000;
            overflow: hidden;
        }

        .submenu::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(220, 20, 60, 0.05), transparent);
            animation: submenuShine 6s ease-in-out infinite;
        }

        @keyframes submenuShine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
        }

        .submenu-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 2;
        }

        .submenu-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 6px;
            color: #FFB6C1;
            text-decoration: none;
            padding: 8px 15px;
            transition: all 0.3s ease;
            border-radius: 6px;
            margin: 0 2px;
            position: relative;
            overflow: hidden;
            background: rgba(139, 0, 0, 0.05);
            border: 1px solid rgba(139, 0, 0, 0.1);
            text-align: center;
            font-size: 13px;
        }

        .submenu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(220, 20, 60, 0.2), transparent);
            transition: left 0.4s ease;
        }

        .submenu-item:hover::before {
            left: 100%;
        }

        .submenu-item:hover {
            background: rgba(220, 20, 60, 0.15);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(139, 0, 0, 0.3);
            border-color: rgba(220, 20, 60, 0.4);
        }

        .submenu-item i {
            font-size: 14px;
            color: #DC143C;
            transition: all 0.3s ease;
        }

        .submenu-item:hover i {
            color: #FFB6C1;
            transform: scale(1.05);
        }

        .submenu-item span {
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
        }

        /* Estilos para el submenú móvil */
        .mobile-submenu-section {
            margin: 15px 0;
        }

        .mobile-submenu-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #DC143C;
            font-size: 13px;
            font-weight: bold;
            background: #2a0000;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #DC143C;
            margin-bottom: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            user-select: none;
        }

        .mobile-submenu-title:hover {
            background: #DC143C;
            color: white;
        }

        .mobile-submenu-title i {
            color: #FFB6C1;
            font-size: 16px;
        }

        .submenu-arrow {
            margin-left: auto !important;
            transition: transform 0.3s ease !important;
            color: #DC143C !important;
            font-size: 14px !important;
        }

        .mobile-submenu-items {
            overflow: visible;
            transition: all 0.4s ease;
            max-height: none;
            opacity: 1;
        }

        .mobile-submenu-items.collapsed {
            max-height: 0;
            opacity: 0;
            margin-bottom: 0;
            overflow: hidden;
        }

        .mobile-submenu-item {
            margin-left: 10px;
            background: #1a0000;
            border-left: 2px solid #DC143C;
        }

        .mobile-submenu-item:hover {
            background: #DC143C;
            border-left-color: #FF6B6B;
        }

        /* Optimizaciones para rendimiento móvil */
        .mobile-menu,
        .mobile-menu-item,
        .mobile-submenu-title,
        .mobile-user-info {
            will-change: auto;
            contain: layout;
        }

        /* Desactivar animaciones complejas en móviles */
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
            }

            .nav {
                display: none !important;
            }

            .submenu {
                display: none !important;
            }

            /* Reducir transiciones para mejor rendimiento */
            .mobile-menu {
                transition: right 0.2s ease;
            }

            .mobile-menu-item,
            .mobile-submenu-title {
                transition: background-color 0.1s ease;
            }
        }

        @media (min-width: 769px) {
            /* Ocultar COMPLETAMENTE todo el sistema de menú móvil en PC */
            .mobile-menu-btn {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
            }

            .mobile-menu {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                right: auto !important;
                transform: translateX(-9999px) !important;
            }

            .mobile-menu-overlay {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
            }

            .mobile-menu.active {
                display: none !important;
                right: auto !important;
                left: -9999px !important;
            }

            .nav {
                display: flex !important;
            }

            .submenu {
                display: block !important;
            }
        }

        /* Asegurar que NUNCA aparezca en pantallas grandes */
        @media (min-width: 1024px) {
            .mobile-menu-btn,
            .mobile-menu,
            .mobile-menu-overlay {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                z-index: -1 !important;
            }
        }

        @media (max-width: 1024px) {
            .submenu-container {
                gap: 3px;
                padding: 0 15px;
            }

            .submenu-item {
                padding: 6px 12px;
                margin: 0 1px;
                font-size: 12px;
            }

            .submenu-item i {
                font-size: 12px;
            }

            .submenu-item span {
                font-size: 12px;
            }
        }

        /* Estilos para el punto de notificación */
        .notification-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #FF0000;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
            animation: pulse-notification 2s infinite;
        }

        .desktop-notification {
            top: -2px;
            right: 5px;
        }

        .mobile-notification {
            top: 8px;
            right: 15px;
        }

        @keyframes pulse-notification {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.7;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        /* Asegurar que los contenedores tengan posición relativa */
        .submenu-item {
            position: relative;
        }

        .mobile-menu-item {
            position: relative;
        }

        @media (max-width: 480px) {
            .mobile-menu {
                width: 300px;
                right: -100%;
                transform: translateX(100%);
            }

            .mobile-menu.active {
                right: 0;
                transform: translateX(0);
            }

            .mobile-menu-content {
                padding: 15px;
            }

            .mobile-menu-item {
                padding: 12px;
                font-size: 14px;
            }
        }
    `;

    document.head.appendChild(style);
}

function setupHeaderEvents() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    // Función para abrir el menú
    function openMobileMenu() {
        if (!mobileMenu || !mobileMenuOverlay || !mobileMenuBtn) return;

        // Mostrar el menú y activar inmediatamente
        mobileMenu.style.display = 'flex';
        mobileMenuBtn.classList.add('active');
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Actualizar información del usuario en el menú móvil
        updateMobileUserInfo();
    }

    // Función para cerrar el menú
    function closeMobileMenu() {
        if (!mobileMenu || !mobileMenuOverlay || !mobileMenuBtn) return;

        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';

        // Ocultar menú más rápido
        setTimeout(() => {
            if (!mobileMenu.classList.contains('active')) {
                mobileMenu.style.display = 'none';
            }
        }, 200);
    }

    // Event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Cerrar menú al hacer click en los enlaces
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Solo cerrar si no es el enlace de logout
            if (!this.id.includes('Logout')) {
                closeMobileMenu();
            }
        });
    });

    // Configurar logout en menú móvil
    const mobileLogoutLink = document.getElementById('mobileLogoutLink');
    if (mobileLogoutLink) {
        mobileLogoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const { authFunctions } = await import('./firebase.js');
                const result = await authFunctions.logout();
                if (result.success) {
                    closeMobileMenu();
                    window.location.href = '/index.html';
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }

    // Configurar toggle del submenú móvil
    const mobileSubmenuToggle = document.getElementById('mobileSubmenuToggle');
    const mobileSubmenuItems = document.getElementById('mobileSubmenuItems');
    const submenuArrow = document.getElementById('submenuArrow');

    if (mobileSubmenuToggle && mobileSubmenuItems && submenuArrow) {
        mobileSubmenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isExpanded = !mobileSubmenuItems.classList.contains('collapsed');

            if (isExpanded) {
                // Colapsar
                mobileSubmenuItems.classList.add('collapsed');
                submenuArrow.classList.remove('fa-chevron-down');
                submenuArrow.classList.add('fa-chevron-right');
            } else {
                // Expandir
                mobileSubmenuItems.classList.remove('collapsed');
                submenuArrow.classList.remove('fa-chevron-right');
                submenuArrow.classList.add('fa-chevron-down');
            }
        });
    }

    // Configurar eventos de logout para escritorio
    setupLogoutEvents();

    // Configurar el modal de donaciones
    setupDonationsModal();



    // Inicializar la actualización del usuario
    setTimeout(updateUserDisplay, 500);
}

async function updateMobileUserInfo() {
    const userDisplay = document.getElementById('userDisplay');
    const mobileUserDisplay = document.getElementById('mobileUserDisplay');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileRegisterLink = document.getElementById('mobileRegisterLink');
    const mobileAdminLink = document.getElementById('mobileAdminLink');
    const mobileLogoutLink = document.getElementById('mobileLogoutLink');

    if (!userDisplay || !mobileUserDisplay) return;

    // Copiar el contenido completo del usuario (incluyendo roles) del menú de escritorio al móvil
    const userHTML = userDisplay.innerHTML;
    let userName = 'Invitado';
    let isLoggedIn = false;

    if (userHTML && !userHTML.includes('Invitado')) {
        // Extraer solo el nombre del usuario, sin iconos
        const textContent = userDisplay.textContent || userDisplay.innerText || '';
        const cleanText = textContent.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        const parts = cleanText.split(' ').filter(part => part && !part.includes('fa-') && part.length > 1);
        if (parts.length > 0) {
            userName = parts[parts.length - 1];
            isLoggedIn = true;
            // Copiar el HTML pero quitar el icono fa-user si existe para evitar duplicación
            let cleanHTML = userHTML.replace(/<i class="fa-solid fa-user"><\/i>\s*/, '');
            mobileUserDisplay.innerHTML = cleanHTML;
        }
    }

    if (!isLoggedIn) {
        mobileUserDisplay.innerHTML = 'Invitado';
    }

    // Mostrar/ocultar enlaces según el estado de autenticación
    if (isLoggedIn) {
        mobileLoginLink.style.display = 'none';
        mobileRegisterLink.style.display = 'none';
        mobileAdminLink.style.display = 'flex';
        mobileLogoutLink.style.display = 'flex';
    } else {
        mobileLoginLink.style.display = 'flex';
        mobileRegisterLink.style.display = 'flex';
        mobileAdminLink.style.display = 'none';
        mobileLogoutLink.style.display = 'none';
    }
}

function setupLogoutEvents() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const { authFunctions } = await import('./firebase.js');
                const result = await authFunctions.logout();
                if (result.success) {
                    window.location.href = '/index.html';
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        });
    }
}



function setupDonationsModal() {
    // Configurar botón de donaciones en el submenú de escritorio
    const allSubmenuItems = document.querySelectorAll('.submenu-item');
    if (allSubmenuItems.length > 0) {
        allSubmenuItems.forEach(item => {
            const span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Donaciones') {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (typeof window.showDonationsModal === 'function') {
                        window.showDonationsModal();
                    } else {
                        console.error('showDonationsModal function not found');
                    }
                });
            }
        });
    }

    // Configurar botón de donaciones en el menú móvil
    const donationsBtnMobile = document.getElementById('donationsBtnMobile');
    if (donationsBtnMobile) {
        donationsBtnMobile.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.showDonationsModal === 'function') {
                window.showDonationsModal();
            } else {
                console.error('showDonationsModal function not found');
            }
            // Cerrar el menú móvil después de abrir el modal
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenu && mobileMenuOverlay && mobileMenuBtn) {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize auth state listener with proper delay and error handling
document.addEventListener('DOMContentLoaded', function() {
    // Delay to ensure Firebase is fully initialized
    setTimeout(() => {
        import('./firebase.js').then(({ authFunctions }) => {
            authFunctions.onAuthStateChanged((user) => {
                updateUserDisplay();
            });
            // Force immediate update
            updateUserDisplay();
        }).catch(error => {
            console.error('Error loading Firebase:', error);
        });
    }, 1000);
});

// Function to update user display across all pages
const updateUserDisplay = async () => {
    const userElement = document.getElementById('userDisplay');
    if (userElement) {
        try {
            const { authFunctions, getUsernameFromEmail, realtimeDb } = await import('./firebase.js');
            const { ref, get } = await import('https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js');

            // Check current user immediately
            const currentUser = authFunctions.getCurrentUser();

            if (currentUser) {
                const username = getUsernameFromEmail(currentUser.email);

                // Update dropdown links visibility
                updateDropdownLinks(true);

                // Importar funciones de roles y cargar foto de perfil
                try {
                    const { getUserRoleTagWithSize } = await import('./rolesDB.js');
                    const roleData = getUserRoleTagWithSize(username);

                    // Cargar foto de perfil desde Firebase
                    let profilePicture = '';
                    try {
                        const profileRef = ref(realtimeDb, `perfil/${currentUser.uid}/fotoPerfil`);
                        const profileSnapshot = await get(profileRef);
                        if (profileSnapshot.exists()) {
                            profilePicture = `<img src="${profileSnapshot.val()}" alt="perfil" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; object-fit: cover; border: 1px solid #DC143C;">`;
                        }
                    } catch (profileError) {
                        console.log('No se pudo cargar foto de perfil:', profileError);
                    }

                    if (roleData) {
                        userElement.innerHTML = `${profilePicture}<img src="${roleData.etiqueta}" alt="role" style="width: ${roleData.ancho}; height: ${roleData.alto}; margin-right: 5px; vertical-align: middle;"><i class="fa-solid fa-user"></i> ${username}`;
                    } else {
                        userElement.innerHTML = `${profilePicture}<i class="fa-solid fa-user"></i> ${username}`;
                    }
                } catch (error) {
                    userElement.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;
                }

                userElement.style.color = '#FFB6C1';
                userElement.style.cursor = 'default';
            } else {
                userElement.innerHTML = `<i class="fa-solid fa-user"></i> Invitado`;
                userElement.style.color = '#cccccc';
                userElement.style.cursor = 'default';

                // Update dropdown links visibility
                updateDropdownLinks(false);
            }
        } catch (error) {
            console.error('Error updating user display:', error);
            userElement.innerHTML = `<i class="fa-solid fa-user"></i> Invitado`;
            userElement.style.color = '#cccccc';
            userElement.style.cursor = 'default';
            updateDropdownLinks(false);
        }
    }
};

// Function to update dropdown links visibility
function updateDropdownLinks(isLoggedIn) {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');

    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}