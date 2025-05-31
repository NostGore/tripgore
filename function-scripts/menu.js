
// Sistema de menú móvil mejorado
document.addEventListener('DOMContentLoaded', function() {
    createMobileMenu();
    setupMobileMenuEvents();
});

function createMobileMenu() {
    // Crear overlay
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'mobile-menu-overlay';
    menuOverlay.className = 'mobile-menu-overlay';
    
    // Crear contenedor del menú
    const menuContainer = document.createElement('div');
    menuContainer.id = 'mobile-menu';
    menuContainer.className = 'mobile-menu';
    
    // Header del menú con logo
    const menuHeader = document.createElement('div');
    menuHeader.className = 'mobile-menu-header';
    menuHeader.innerHTML = `
        <div class="mobile-menu-logo">
            <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPLEGORE" class="mobile-logo-img">
        </div>
        <button id="mobile-menu-close" class="mobile-menu-close">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    
    // Separador decorativo
    const separator = document.createElement('div');
    separator.className = 'mobile-menu-separator';
    separator.innerHTML = '<span>Explora las opciones</span>';
    
    // Contenido del menú
    const menuContent = document.createElement('div');
    menuContent.id = 'mobile-menu-content';
    menuContent.className = 'mobile-menu-content';
    
    // Ensamblar menú
    menuContainer.appendChild(menuHeader);
    menuContainer.appendChild(separator);
    menuContainer.appendChild(menuContent);
    
    // Crear botón hamburguesa para el header
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.id = 'mobile-menu-toggle';
    hamburgerBtn.className = 'mobile-menu-toggle';
    hamburgerBtn.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
    `;
    
    // Añadir elementos al DOM
    document.body.appendChild(menuOverlay);
    document.body.appendChild(menuContainer);
    
    // Añadir botón hamburguesa al header
    const header = document.querySelector('.header .container');
    if (header) {
        header.appendChild(hamburgerBtn);
    }
    
    // Añadir estilos CSS
    addMobileMenuStyles();
    setupMobileMenuEvents();
}

function addMobileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Botón hamburguesa */
        .mobile-menu-toggle {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
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
        
        .mobile-menu-toggle:hover {
            background: rgba(220, 20, 60, 0.9);
            border-color: #DC143C;
            transform: scale(1.05);
        }
        
        .hamburger-line {
            width: 20px;
            height: 2px;
            background: white;
            margin: 2px 0;
            transition: all 0.3s ease;
            border-radius: 1px;
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        /* Overlay del menú */
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        /* Contenedor del menú */
        .mobile-menu {
            position: fixed;
            top: 0;
            right: -350px;
            width: 320px;
            height: 100%;
            background: linear-gradient(145deg, #1a0000, #2a0000);
            border-left: 3px solid rgba(220, 20, 60, 0.5);
            z-index: 1000;
            transition: all 0.4s ease;
            overflow-y: auto;
            box-shadow: -5px 0 25px rgba(0, 0, 0, 0.5);
        }
        
        .mobile-menu.active {
            right: 0;
        }
        
        /* Header del menú */
        .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: linear-gradient(135deg, rgba(139, 0, 0, 0.9), rgba(220, 20, 60, 0.9));
            border-bottom: 2px solid rgba(220, 20, 60, 0.3);
        }
        
        .mobile-menu-logo {
            display: flex;
            align-items: center;
        }
        
        .mobile-logo-img {
            height: 35px;
            width: auto;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        }
        
        .mobile-menu-user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #FFB6C1;
            font-size: 14px;
            font-weight: 500;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px 12px;
            border-radius: 20px;
            border: 1px solid rgba(220, 20, 60, 0.3);
        }
        
        .mobile-menu-user-info i {
            color: #DC143C;
            font-size: 16px;
        }
        
        .mobile-menu-close {
            background: rgba(139, 0, 0, 0.8);
            border: 2px solid rgba(220, 20, 60, 0.6);
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .mobile-menu-close:hover {
            background: rgba(220, 20, 60, 0.9);
            border-color: #DC143C;
            transform: rotate(90deg);
        }
        
        /* Separador decorativo */
        .mobile-menu-separator {
            padding: 15px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(220, 20, 60, 0.3);
            background: rgba(139, 0, 0, 0.1);
        }
        
        .mobile-menu-separator span {
            color: #FFB6C1;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        /* Contenido del menú */
        .mobile-menu-content {
            padding: 20px;
        }
        
        .mobile-menu-nav {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .mobile-menu-nav li {
            margin-bottom: 12px;
        }
        
        .mobile-menu-nav a {
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
            text-decoration: none;
            padding: 15px 18px;
            border-radius: 10px;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            background: rgba(139, 0, 0, 0.1);
            border: 1px solid rgba(139, 0, 0, 0.2);
        }
        
        .mobile-menu-nav a:hover {
            background: rgba(220, 20, 60, 0.2);
            border-left-color: #DC143C;
            color: #FFB6C1;
            transform: translateX(8px);
            border-color: rgba(220, 20, 60, 0.4);
        }
        
        .mobile-menu-nav a i {
            font-size: 18px;
            color: #DC143C;
            width: 20px;
            text-align: center;
        }
        
        .mobile-menu-user {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid rgba(220, 20, 60, 0.3);
        }
        
        .mobile-menu-user h4 {
            color: #FFB6C1;
            margin-bottom: 15px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
            background: rgba(139, 0, 0, 0.2);
            padding: 8px;
            border-radius: 5px;
        }
        
        .mobile-user-info-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #FFB6C1;
            font-size: 16px;
            font-weight: 600;
            background: rgba(139, 0, 0, 0.3);
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid rgba(220, 20, 60, 0.4);
            margin-bottom: 15px;
        }
        
        .mobile-user-info-display i {
            color: #DC143C;
            font-size: 18px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .mobile-menu-toggle {
                display: flex;
            }
            
            .nav {
                display: none !important;
            }
        }
        
        @media (max-width: 480px) {
            .mobile-menu {
                width: 280px;
                right: -300px;
            }
            
            .mobile-menu-content {
                padding: 15px;
            }
            
            .mobile-menu-nav a {
                padding: 12px 15px;
                font-size: 14px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function setupMobileMenuEvents() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuClose = document.getElementById('mobile-menu-close');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    
    // Abrir menú
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            openMobileMenu();
        });
    }
    
    // Cerrar menú
    if (menuClose) {
        menuClose.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
    
    // Cerrar menú al hacer click en overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
    
    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    // Copiar contenido del header al menú móvil
    copyHeaderContent();
    
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    
    if (menuOverlay && menu) {
        menuOverlay.classList.add('active');
        menu.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    
    if (menuOverlay && menu) {
        menuOverlay.classList.remove('active');
        menu.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function copyHeaderContent() {
    const menuContent = document.getElementById('mobile-menu-content');
    const nav = document.querySelector('.nav');
    
    if (!menuContent || !nav) return;
    
    // Limpiar contenido anterior
    menuContent.innerHTML = '';
    
    // Crear navegación móvil principal
    const mobileNav = document.createElement('ul');
    mobileNav.className = 'mobile-menu-nav';
    
    // Enlaces de navegación principales con iconos
    const navItems = [
        { href: 'index.html', text: 'Inicio', icon: 'fa-solid fa-house' },
        { href: 'adminpanel.html', text: 'Subir', icon: 'fa-solid fa-upload' },
        { href: 'chat.html', text: 'Chat', icon: 'fa-solid fa-comments' }
    ];
    
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
        a.addEventListener('click', function() {
            closeMobileMenu();
        });
        li.appendChild(a);
        mobileNav.appendChild(li);
    });
    
    menuContent.appendChild(mobileNav);
    
    // Sección de usuario
    const mobileUserSection = document.createElement('div');
    mobileUserSection.className = 'mobile-menu-user';
    
    const userTitle = document.createElement('h4');
    userTitle.textContent = 'Cuenta de Usuario';
    mobileUserSection.appendChild(userTitle);
    
    // Información del usuario actual - obtener del header
    const userInfo = document.createElement('div');
    userInfo.className = 'mobile-user-info-display';
    
    // Obtener la información del usuario desde el header
    const userDisplay = document.getElementById('userDisplay');
    let userName = 'Invitado';
    let isLoggedIn = false;
    
    if (userDisplay) {
        const userText = userDisplay.textContent.trim();
        if (userText && userText !== 'Invitado' && !userText.includes('Invitado')) {
            // Extraer solo el nombre de usuario (sin iconos)
            const textParts = userText.split(' ');
            // Buscar la parte que no sea un icono (generalmente la segunda parte)
            for (let part of textParts) {
                if (part && !part.includes('fa-') && part !== '' && part.length > 1) {
                    userName = part;
                    isLoggedIn = true;
                    break;
                }
            }
        }
    }
    
    userInfo.innerHTML = `
        <i class="fa-solid fa-user"></i>
        <span id="mobile-user-display-section">${userName}</span>
    `;
    mobileUserSection.appendChild(userInfo);
    
    const userNav = document.createElement('ul');
    userNav.className = 'mobile-menu-nav';
    
    if (isLoggedIn) {
        // Usuario logueado - mostrar opciones completas
        const loggedInItems = [
            { href: 'adminpanel.html', text: 'Admin Panel', icon: 'fa-solid fa-cogs' },
            { href: '#', text: 'Cerrar Sesión', icon: 'fa-solid fa-sign-out-alt', id: 'mobile-logout' }
        ];
        
        loggedInItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.href;
            a.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
            
            if (item.id === 'mobile-logout') {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleMobileLogout();
                });
            } else {
                a.addEventListener('click', function() {
                    closeMobileMenu();
                });
            }
            
            li.appendChild(a);
            userNav.appendChild(li);
        });
    } else {
        // Usuario no logueado - solo opciones de login/registro
        const guestItems = [
            { href: 'login.html', text: 'Iniciar Sesión', icon: 'fa-solid fa-sign-in-alt' },
            { href: 'registro.html', text: 'Registrarse', icon: 'fa-solid fa-user-plus' }
        ];
        
        guestItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.href;
            a.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
            a.addEventListener('click', function() {
                closeMobileMenu();
            });
            li.appendChild(a);
            userNav.appendChild(li);
        });
    }
    
    mobileUserSection.appendChild(userNav);
    menuContent.appendChild(mobileUserSection);
}



async function handleMobileLogout() {
    try {
        // Importar las funciones de Firebase
        const { authFunctions } = await import('../firebase.js');
        const result = await authFunctions.logout();
        
        if (result.success) {
            closeMobileMenu();
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}
