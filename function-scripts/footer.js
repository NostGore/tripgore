
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
                    <!-- Columna 1: Logo -->
                    <div class="footer-column footer-brand">
                        <div class="footer-logo">
                            <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPGORE" class="footer-logo-img">
                        </div>
                    </div>

                    <!-- Columna 2: Descripción -->
                    <div class="footer-column footer-description">
                        <p class="footer-description-text">
                            Tripgore noticias impactantes que destruyeron el internet a nivel mundial.
                        </p>
                    </div>

                    <!-- Columna 3: Estadísticas -->
                    <div class="footer-column footer-stats">
                        <div class="footer-stat-item">
                            <i class="fa-solid fa-video"></i>
                            <span>Videos Totales: <span id="footerVideoCount">0</span></span>
                        </div>
                        <div class="footer-stat-item">
                            <i class="fa-solid fa-users"></i>
                            <span>Total de Colaboradores: <span id="footerCollaboratorsCount">0</span></span>
                        </div>
                        <div class="footer-stat-item">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>Página Segura</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Bottom -->
                <div class="footer-bottom">
                    <div class="footer-copyright">
                        <p>
                            <i class="fa-solid"></i>
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
            will-change: auto;
        }

        .dynamic-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #DC143C, transparent);
        }

        /* Animación deshabilitada en móviles */
        @media (min-width: 769px) and (prefers-reduced-motion: no-preference) {
            .dynamic-footer::before {
                animation: footerShine 6s ease-in-out infinite;
            }
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
            grid-template-columns: 1fr 2fr 1.5fr 1fr;
            gap: 25px;
            padding: 30px 0 20px;
            align-items: center;
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

        /* Columna de Logo */
        .footer-brand {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .footer-logo-img {
            height: 60px;
            width: auto;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
            transition: all 0.3s ease;
        }

        /* Solo hover en desktop */
        @media (min-width: 769px) {
            .footer-brand:hover .footer-logo-img {
                transform: scale(1.05);
                filter: drop-shadow(0 0 10px rgba(220, 20, 60, 0.6));
            }
        }

        /* Columna de Descripción */
        .footer-description {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .footer-description-text {
            color: #FFB6C1;
            line-height: 1.5;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
        }

        /* Columna de Estadísticas */
        .footer-stats {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .footer-stat-item {
            color: #FFB6C1;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            font-weight: 500;
        }

        .footer-stat-item i {
            color: #DC143C;
            width: 18px;
            font-size: 14px;
        }

        .footer-stat-item span {
            color: #FFB6C1;
        }

        #footerVideoCount,
        #footerCollaboratorsCount {
            color: #DC143C;
            font-weight: bold;
        }

        .footer-stat-item:last-child {
            background: rgba(0, 128, 0, 0.1);
            border: 1px solid rgba(0, 128, 0, 0.3);
            padding: 8px 12px;
            border-radius: 6px;
        }

        .footer-stat-item:last-child i {
            color: #28a745 !important;
        }

        /* Columna de Derechos de Autor */
        .footer-copyright {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .copyright-content {
            color: #FFB6C1;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
        }

        .copyright-content i {
            color: #DC143C;
            font-size: 14px;
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
            font-size: 14px;
            will-change: auto;
        }

        /* Hover optimizado solo para desktop */
        @media (min-width: 769px) {
            .scroll-to-top-btn {
                transition: all 0.3s ease;
            }
            
            .scroll-to-top-btn:hover {
                background: linear-gradient(135deg, #DC143C, #FF1450);
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(220, 20, 60, 0.4);
                border-color: #DC143C;
            }
        }

        /* En móviles, solo cambio de color sin animaciones */
        @media (max-width: 768px) {
            .scroll-to-top-btn:active {
                background: linear-gradient(135deg, #DC143C, #FF1450);
            }
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
            will-change: auto;
        }

        .footer-decoration:nth-child(1) { top: 20%; left: 10%; }
        .footer-decoration:nth-child(2) { top: 60%; left: 20%; }
        .footer-decoration:nth-child(3) { top: 30%; right: 15%; }
        .footer-decoration:nth-child(4) { bottom: 40%; left: 30%; }
        .footer-decoration:nth-child(5) { top: 70%; right: 25%; }
        .footer-decoration:nth-child(6) { bottom: 20%; right: 35%; }
        .footer-decoration:nth-child(7) { top: 40%; left: 60%; }
        .footer-decoration:nth-child(8) { bottom: 60%; right: 10%; }

        /* Solo animar en desktop */
        @media (min-width: 769px) and (prefers-reduced-motion: no-preference) {
            .footer-decoration {
                animation: footerFloat 12s ease-in-out infinite;
                will-change: transform;
            }
            
            .footer-decoration:nth-child(1) { animation-delay: 0s; }
            .footer-decoration:nth-child(2) { animation-delay: 1.5s; }
            .footer-decoration:nth-child(3) { animation-delay: 3s; }
            .footer-decoration:nth-child(4) { animation-delay: 4.5s; }
            .footer-decoration:nth-child(5) { animation-delay: 6s; }
            .footer-decoration:nth-child(6) { animation-delay: 7.5s; }
            .footer-decoration:nth-child(7) { animation-delay: 9s; }
            .footer-decoration:nth-child(8) { animation-delay: 10.5s; }
        }

        @keyframes footerFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
        }

        /* Optimizaciones de rendimiento */
        @media (max-width: 768px) {
            /* Deshabilitar todas las animaciones en móviles */
            .dynamic-footer *,
            .dynamic-footer *::before,
            .dynamic-footer *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                will-change: auto !important;
            }
            
            /* Simplificar gradientes en móviles */
            .dynamic-footer {
                background: #1a0000;
            }
            
            .scroll-to-top-btn {
                background: #8B0000;
            }
            
            /* Ocultar decoraciones en móviles */
            .footer-decorations {
                display: none;
            }
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
                gap: 25px;
                text-align: center;
            }

            .footer-brand,
            .footer-description,
            .footer-stats,
            .footer-copyright {
                justify-content: center;
                text-align: center;
            }

            .footer-stats {
                align-items: center;
            }

            .footer-bottom {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }
        }

        @media (max-width: 480px) {
            .footer-container {
                padding: 0 15px;
            }

            .footer-content {
                padding: 20px 0 15px;
                gap: 20px;
            }

            .footer-logo-img {
                height: 45px;
            }

            .footer-description-text {
                font-size: 13px;
            }

            .footer-stat-item {
                font-size: 12px;
            }

            .copyright-content {
                font-size: 12px;
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

    // Cargar contador de colaboradores
    loadFooterCollaboratorsCount();

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

function loadFooterCollaboratorsCount() {
    const footerCollaboratorsCountElement = document.getElementById('footerCollaboratorsCount');
    if (!footerCollaboratorsCountElement) return;

    // Intentar importar mediaDB para contar autores únicos
    try {
        import('../mediaDB.js').then(module => {
            const mediaDB = module.default;
            const validVideos = mediaDB.filter(video =>
                video.titulo && video.portada && video.video && video.autor && video.categoria
            );

            // Obtener autores únicos
            const uniqueAuthors = [...new Set(validVideos.map(video => video.autor))];
            footerCollaboratorsCountElement.textContent = uniqueAuthors.length;
        }).catch(() => {
            // Si no se puede importar, usar un valor por defecto
            footerCollaboratorsCountElement.textContent = '0';
        });
    } catch (error) {
        footerCollaboratorsCountElement.textContent = '0';
    }
}
