
// Sistema de Footer dinámico
document.addEventListener('DOMContentLoaded', function() {
    createFooter();
});

function createFooter() {
    // Verificar si ya existe un footer
    const existingFooter = document.querySelector('.footer');
    if (existingFooter) {
        existingFooter.remove();
    }

    // Crear estructura del footer
    const footerHTML = `
        <footer class="dynamic-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <!-- Columna 1: Logo y Descripción -->
                    <div class="footer-column footer-brand">
                        <div class="footer-logo">
                            <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPGORE" class="footer-logo-img">
                        </div>
                        <p class="footer-description">
                            TripGore las noticias mas impactantes que rompieron todo internet.
                        </p>
                        <div class="footer-social">
                            <a href="https://discord.gg/6AKMHVRxmH" class="social-link" title="Discord">
                                <i class="fa-brands fa-discord"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Columna 2: Enlaces del Encabezado -->
                    <div class="footer-column footer-navigation">
                        <h3 class="footer-title">Navegación</h3>
                        <ul class="footer-links">
                            <li><a href="index.html"><i class="fa-solid fa-house"></i> Inicio</a></li>
                            <li><a href="adminpanel.html"><i class="fa-solid fa-upload"></i> Subir</a></li>
                            <li><a href="chat.html"><i class="fa-solid fa-comments"></i> Chat</a></li>
                            <li><a href="soporte.html"><i class="fa-solid fa-headset"></i> Soporte</a></li>
                        </ul>
                    </div>

                    <!-- Columna 3: Submenú -->
                    <div class="footer-column footer-submenu">
                        <h3 class="footer-title">Categorías</h3>
                        <ul class="footer-links">
                            <li><a href="/submenu/novedades.html"><i class="fa-solid fa-star"></i> Novedades</a></li>
                            <li><a href="/submenu/colaboradores.html"><i class="fa-solid fa-users"></i> Colaboradores</a></li>
                            <li><a href="/submenu/roles.html"><i class="fa-solid fa-crown"></i> Roles</a></li>
                            <li><a href="#"><i class="fa-solid fa-gem"></i> ZonaVIP</a></li>
                        </ul>
                    </div>

                    <!-- Columna 4: Información -->
                    <div class="footer-column footer-info">
                        <h3 class="footer-title">Información</h3>
                        <div class="footer-stats">
                            <p class="video-count">
                                <i class="fa-solid fa-video"></i>
                                Videos totales: <span id="footerVideoCount">0</span>
                            </p>
                            <p class="security-badge">
                                <i class="fa-solid fa-shield-halved"></i>
                                Página Segura
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer Bottom -->
                <div class="footer-bottom">
                    <div class="footer-copyright">
                        <p>
                            <i class="fa-solid fa-copyright"></i>
                            © <span id="currentYear"></span> TRIPGORE - Todos los derechos reservados.
                        </p>
                    </div>
                    <div class="footer-scroll">
                        <button id="footerScrollToTop" class="scroll-to-top-btn">
                            <i class="fa-solid fa-arrow-up"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Decoraciones flotantes -->
            <div class="footer-decorations">
                <div class="footer-decoration">🕷️</div>
                <div class="footer-decoration">💀</div>
                <div class="footer-decoration">⚰️</div>
                <div class="footer-decoration">🩸</div>
                <div class="footer-decoration">👻</div>
                <div class="footer-decoration">🔪</div>
                <div class="footer-decoration">🦇</div>
                <div class="footer-decoration">⚡</div>
            </div>
        </footer>
    `;

    // Insertar el footer al final del body
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Agregar estilos CSS
    addFooterStyles();

    // Configurar funcionalidades
    setupFooterFunctionality();
}

function addFooterStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Footer Styles */
        .dynamic-footer {
            background: linear-gradient(135deg, #1a0000, #2a0000);
            color: white;
            margin-top: 60px;
            position: relative;
            overflow: hidden;
            border-top: 3px solid rgba(220, 20, 60, 0.5);
        }

        .dynamic-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #DC143C, transparent);
            animation: footerShine 4s ease-in-out infinite;
        }

        @keyframes footerShine {
            0%, 100% { transform: translateX(-100%); opacity: 0; }
            50% { transform: translateX(100%); opacity: 1; }
        }

        .footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            position: relative;
            z-index: 2;
        }

        .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 25px;
            padding: 30px 0 20px;
        }

        .footer-column h3.footer-title {
            color: #DC143C;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            position: relative;
            padding-bottom: 8px;
        }

        .footer-column h3.footer-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, #DC143C, #FFB6C1);
        }

        /* Columna de Brand */
        .footer-brand .footer-logo {
            margin-bottom: 20px;
        }

        .footer-logo-img {
            height: 50px;
            width: auto;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        }

        .footer-description {
            color: #FFB6C1;
            line-height: 1.5;
            margin-bottom: 15px;
            font-size: 13px;
        }

        .footer-social {
            display: flex;
            gap: 15px;
        }

        .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: rgba(139, 0, 0, 0.3);
            border: 2px solid rgba(220, 20, 60, 0.4);
            border-radius: 8px;
            color: #DC143C;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 18px;
        }

        .social-link:hover {
            background: rgba(220, 20, 60, 0.2);
            border-color: #DC143C;
            color: #FFB6C1;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(220, 20, 60, 0.3);
        }

        /* Enlaces del Footer */
        .footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .footer-links li {
            margin-bottom: 8px;
        }

        .footer-links a {
            color: #FFB6C1;
            text-decoration: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 0;
            font-size: 14px;
        }

        .footer-links a:hover {
            color: white;
            transform: translateX(5px);
        }

        .footer-links a i {
            color: #DC143C;
            width: 16px;
            font-size: 12px;
        }

        /* Información del Footer */
        .footer-stats p {
            color: #FFB6C1;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
        }

        .footer-stats i {
            color: #DC143C;
            width: 16px;
        }

        .security-badge {
            background: rgba(0, 128, 0, 0.1);
            border: 1px solid rgba(0, 128, 0, 0.3);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
        }

        .security-badge i {
            color: #28a745 !important;
        }

        /* Footer Bottom */
        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-top: 1px solid rgba(220, 20, 60, 0.3);
            margin-top: 15px;
        }

        .footer-copyright p {
            color: #FFB6C1;
            font-size: 13px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .footer-copyright i {
            color: #DC143C;
        }

        .scroll-to-top-btn {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #8B0000, #DC143C);
            border: 2px solid rgba(220, 20, 60, 0.4);
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .scroll-to-top-btn:hover {
            background: linear-gradient(135deg, #DC143C, #FF1450);
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(220, 20, 60, 0.4);
            border-color: #DC143C;
        }

        /* Decoraciones flotantes */
        .footer-decorations {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .footer-decoration {
            position: absolute;
            font-size: 20px;
            opacity: 0.1;
            animation: footerFloat 8s ease-in-out infinite;
        }

        .footer-decoration:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .footer-decoration:nth-child(2) { top: 60%; left: 20%; animation-delay: 1s; }
        .footer-decoration:nth-child(3) { top: 30%; right: 15%; animation-delay: 2s; }
        .footer-decoration:nth-child(4) { bottom: 40%; left: 30%; animation-delay: 3s; }
        .footer-decoration:nth-child(5) { top: 70%; right: 25%; animation-delay: 4s; }
        .footer-decoration:nth-child(6) { bottom: 20%; right: 35%; animation-delay: 5s; }
        .footer-decoration:nth-child(7) { top: 40%; left: 60%; animation-delay: 6s; }
        .footer-decoration:nth-child(8) { bottom: 60%; right: 10%; animation-delay: 7s; }

        @keyframes footerFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .footer-content {
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
        }

        @media (max-width: 768px) {
            .footer-content {
                grid-template-columns: 1fr;
                gap: 20px;
                text-align: center;
            }

            .footer-column h3.footer-title::after {
                left: 50%;
                transform: translateX(-50%);
            }

            .footer-bottom {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }

            .footer-social {
                justify-content: center;
            }

            .footer-stats {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
        }

        @media (max-width: 480px) {
            .footer-container {
                padding: 0 15px;
            }

            .footer-content {
                padding: 20px 0 15px;
            }

            .footer-logo-img {
                height: 40px;
            }

            .social-link {
                width: 35px;
                height: 35px;
                font-size: 16px;
            }
        }
    `;

    document.head.appendChild(style);
}

function setupFooterFunctionality() {
    // Configurar año actual
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Cargar contador de videos
    loadFooterVideoCount();

    // Configurar botón de scroll hacia arriba
    const scrollToTopBtn = document.getElementById('footerScrollToTop');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
            } else {
                scrollToTopBtn.style.opacity = '0.7';
                scrollToTopBtn.style.visibility = 'visible';
            }
        });
    }

    // Configurar enlaces de redes sociales
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Aquí puedes agregar los enlaces reales de Discord
            console.log('Discord link clicked');
        });
    });
}

function loadFooterVideoCount() {
    const footerVideoCountElement = document.getElementById('footerVideoCount');
    if (!footerVideoCountElement) return;

    // Intentar importar mediaDB
    try {
        import('../mediaDB.js').then(module => {
            const mediaDB = module.default;
            const validVideos = mediaDB.filter(video =>
                video.titulo && video.portada && video.video && video.autor && video.categoria
            );
            footerVideoCountElement.textContent = validVideos.length;
        }).catch(() => {
            // Si no se puede importar, usar un valor por defecto
            footerVideoCountElement.textContent = '0';
        });
    } catch (error) {
        footerVideoCountElement.textContent = '0';
    }
}
