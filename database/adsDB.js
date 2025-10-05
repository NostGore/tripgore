// Base de datos de anuncios para TRIPGORE
// Organizada por categorías para fácil gestión

/**
 * Base de datos para los anuncios emergentes (pop-up) en la página de inicio.
 * Cada anuncio tiene:
 * - id: Identificador único.
 * - imagen: URL de la imagen a mostrar.
 * - direccion: URL a la que se redirige al hacer clic en la imagen.
 */
const popupAds = [
    {
        id: "subir-video",
        imagen: "https://files.catbox.moe/cgy2f7.jpg", // Imagen de ejemplo
        direccion: "other/subir.html"
    }
    // Puedes agregar más anuncios aquí en el futuro
    // { id: "popup_ad_2", imagen: "path/to/image2.png", direccion: "otra/pagina.html" }
];

const adsDB = {
    // Anuncios de notificaciones push
    "Push-Notification": [
        {
            id: "push_1",
            name: "Vaugroar Push",
            script: '<script src="https://vaugroar.com/act/files/tag.min.js?z=9394867" data-cfasync="false" async></script>',
            active: true,
            priority: 1,
            description: "Notificación push principal"
        },
        {
            id: "push_2",
            name: "Upskittyan Push",
            script: '<script src="https://upskittyan.com/act/files/tag.min.js?z=9387446" data-cfasync="false" async></script>',
            active: true,
            priority: 2,
            description: "Notificación push secundaria"
        }
    ],

    // Anuncios de banner vignette
    "Vignette-Banner": [
        {
            id: "vignette_1",
            name: "Gizokraijaw Vignette",
            script: '<script>(function(s){s.dataset.zone=\'9394873\',s.src=\'https://gizokraijaw.net/vignette.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))</script>',
            active: true,
            priority: 1,
            description: "Banner vignette principal"
        }
    ],

    // Anuncios in-page push
    "In-Page-Push": [
        {
            id: "inpage_1",
            name: "Forfrogadiertor In-Page",
            script: '<script>(function(s){s.dataset.zone=\'9394869\',s.src=\'https://forfrogadiertor.com/tag.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))</script>',
            active: true,
            priority: 1,
            description: "In-page push principal"
        }
    ],

    // Anuncios de banner tradicional
    "Banner": [
        // Aquí puedes agregar banners tradicionales en el futuro
    ],

    // Anuncios de video
    "Video": [
        // Aquí puedes agregar anuncios de video en el futuro
    ],

    // Anuncios de popup
    "Popup": [
        // Aquí puedes agregar popups en el futuro
    ],

    // Enlaces directos
    "direct-links": [
        {
            id: "direct_1",
            name: "Otieu Direct Link 1",
            script: '<script src="https://otieu.com/4/9068006" data-cfasync="false" async></script>',
            active: true,
            priority: 1,
            description: "Enlace directo Otieu 1"
        },
        {
            id: "direct_2",
            name: "Otieu Direct Link 2", 
            script: '<script src="https://otieu.com/4/9400628" data-cfasync="false" async></script>',
            active: true,
            priority: 2,
            description: "Enlace directo Otieu 2"
        }
    ],

    // Scripts de clic global
    "Global-Click": [
        {
            id: "global_click_1",
            name: "Direct Link Click Handler",
            script: `<script>
                (function() {
                    console.log('🎯 Script de clic global cargado');
                    
                    // URLs de direct links disponibles
                    const directLinks = [
                        'https://otieu.com/4/9068006',
                        'https://otieu.com/4/9400628'
                    ];
                    
                    // Función para abrir direct link aleatorio
                    function openRandomDirectLink() {
                        const randomIndex = Math.floor(Math.random() * directLinks.length);
                        const url = directLinks[randomIndex];
                        console.log('🔗 Abriendo direct link:', url);
                        
                        try {
                            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                            if (newWindow) {
                                // Cambiar foco de vuelta a la ventana actual
                                setTimeout(() => {
                                    newWindow.blur();
                                    window.focus();
                                }, 100);
                                console.log('✅ Direct link abierto exitosamente');
                            } else {
                                console.error('❌ No se pudo abrir la nueva ventana (posible bloqueador de popups)');
                            }
                        } catch (error) {
                            console.error('❌ Error al abrir direct link:', error);
                        }
                    }
                    
                    // Función para manejar clics
                    function handleClick(event) {
                        // Verificar si el clic es en header, menú o elementos de navegación
                        const target = event.target;
                        const isHeader = target.closest('header') || 
                                       target.closest('.header') || 
                                       target.closest('#header-container') ||
                                       target.closest('.main-header') ||
                                       target.closest('.header-content');
                        
                        const isMenu = target.closest('nav') || 
                                      target.closest('.nav') || 
                                      target.closest('.navigation') ||
                                      target.closest('.menu') ||
                                      target.closest('.navbar') ||
                                      target.closest('.nav-links') ||
                                      target.closest('.nav-item') ||
                                      target.closest('.logo') ||
                                      target.closest('.header-logo') ||
                                      target.closest('.secondary-nav') ||
                                      target.closest('.secondary-nav-links') ||
                                      target.closest('.upload-buttons') ||
                                      target.closest('.upload-btn');
                        
                        const isButton = target.tagName === 'BUTTON' || 
                                        target.closest('button') ||
                                        target.classList.contains('btn') ||
                                        target.closest('.btn') ||
                                        target.closest('.carousel-nav') ||
                                        target.closest('.scroll-top') ||
                                        target.closest('.back-to-colaboradores');
                        
                        const isLink = target.tagName === 'A' || 
                                     target.closest('a') ||
                                     target.closest('.link') ||
                                     target.closest('.nav-link') ||
                                     target.closest('.header-link');
                        
                        // Si es header, menú, botón o enlace, no abrir direct link
                        if (isHeader || isMenu || isButton || isLink) {
                            console.log('🚫 Clic en header/menú/botón/enlace - Direct link bloqueado');
                            console.log('📍 Elemento:', target.tagName, target.className);
                            return;
                        }
                        
                        console.log('🖱️ Clic detectado en:', event.target);
                        console.log('📍 Tipo de elemento:', event.target.tagName);
                        console.log('📍 Clases del elemento:', event.target.className);
                        openRandomDirectLink();
                    }
                    
                    // Agregar múltiples event listeners para capturar todos los clics
                    
                    // 1. Event listener en document (captura todo)
                    document.addEventListener('click', handleClick, true);
                    
                    // 2. Event listener en body (captura clics en body)
                    document.body.addEventListener('click', handleClick, true);
                    
                    // 3. Event listener en window (captura clics en ventana)
                    window.addEventListener('click', handleClick, true);
                    
                    // 4. Event listener específico para videos y elementos multimedia
                    document.addEventListener('click', function(event) {
                        // Detectar clics en videos, iframes, y elementos multimedia
                        if (event.target.tagName === 'VIDEO' || 
                            event.target.tagName === 'IFRAME' || 
                            event.target.tagName === 'AUDIO' ||
                            event.target.closest('.video-card') ||
                            event.target.closest('.colaborador-video-card') ||
                            event.target.closest('[onclick*="openVideo"]')) {
                            console.log('🎬 Clic detectado en elemento multimedia:', event.target);
                            handleClick(event);
                        }
                    }, true);
                    
                    // 5. Event listener para elementos con onclick
                    document.addEventListener('click', function(event) {
                        if (event.target.onclick || event.target.getAttribute('onclick')) {
                            console.log('🔗 Clic detectado en elemento con onclick:', event.target);
                            handleClick(event);
                        }
                    }, true);
                    
                    // 6. Event listener para el contenedor principal
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.addEventListener('click', handleClick, true);
                    }
                    
                    // 7. Event listener para el grid de videos
                    const videosGrid = document.getElementById('videosGrid');
                    if (videosGrid) {
                        videosGrid.addEventListener('click', handleClick, true);
                    }
                    
                    console.log('✅ Múltiples event listeners de clic global configurados');
                    console.log('🎯 Cobertura: 100% de la pantalla incluyendo videos');
                })();
            </script>`,
            active: true,
            priority: 1,
            description: "Script que abre direct links al hacer clic en cualquier parte de la pantalla"
        }
    ]
};

// Funciones de utilidad para gestionar anuncios

/**
 * Obtiene todos los anuncios de una categoría específica
 * @param {string} category - Categoría de anuncios
 * @param {boolean} activeOnly - Solo anuncios activos (default: true)
 * @returns {Array} Array de anuncios
 */
function getAdsByCategory(category, activeOnly = true) {
    if (!adsDB[category]) {
        console.warn(`Categoría de anuncios "${category}" no encontrada`);
        return [];
    }

    if (activeOnly) {
        return adsDB[category].filter(ad => ad.active);
    }

    return adsDB[category];
}

/**
 * Obtiene todos los anuncios activos de todas las categorías
 * @returns {Object} Objeto con anuncios por categoría
 */
function getAllActiveAds() {
    const activeAds = {};

    for (const category in adsDB) {
        activeAds[category] = getAdsByCategory(category, true);
    }

    return activeAds;
}

/**
 * Obtiene un anuncio específico por ID
 * @param {string} id - ID del anuncio
 * @returns {Object|null} Anuncio encontrado o null
 */
function getAdById(id) {
    for (const category in adsDB) {
        const ad = adsDB[category].find(ad => ad.id === id);
        if (ad) return ad;
    }
    return null;
}

/**
 * Activa o desactiva un anuncio
 * @param {string} id - ID del anuncio
 * @param {boolean} active - Estado activo
 * @returns {boolean} True si se actualizó correctamente
 */
function setAdActive(id, active) {
    for (const category in adsDB) {
        const adIndex = adsDB[category].findIndex(ad => ad.id === id);
        if (adIndex !== -1) {
            adsDB[category][adIndex].active = active;
            console.log(`Anuncio ${id} ${active ? 'activado' : 'desactivado'}`);
            return true;
        }
    }
    console.warn(`Anuncio con ID "${id}" no encontrado`);
    return false;
}

/**
 * Agrega un nuevo anuncio a una categoría
 * @param {string} category - Categoría del anuncio
 * @param {Object} adData - Datos del anuncio
 * @returns {boolean} True si se agregó correctamente
 */
function addAd(category, adData) {
    if (!adsDB[category]) {
        console.warn(`Categoría "${category}" no existe`);
        return false;
    }

    const requiredFields = ['id', 'name', 'script'];
    for (const field of requiredFields) {
        if (!adData[field]) {
            console.warn(`Campo requerido "${field}" no encontrado`);
            return false;
        }
    }

    // Verificar que el ID no exista
    if (getAdById(adData.id)) {
        console.warn(`Anuncio con ID "${adData.id}" ya existe`);
        return false;
    }

    adsDB[category].push({
        active: true,
        priority: 1,
        description: '',
        ...adData
    });

    console.log(`Anuncio ${adData.id} agregado a la categoría ${category}`);
    return true;
}

/**
 * Elimina un anuncio por ID
 * @param {string} id - ID del anuncio
 * @returns {boolean} True si se eliminó correctamente
 */
function removeAd(id) {
    for (const category in adsDB) {
        const adIndex = adsDB[category].findIndex(ad => ad.id === id);
        if (adIndex !== -1) {
            adsDB[category].splice(adIndex, 1);
            console.log(`Anuncio ${id} eliminado de la categoría ${category}`);
            return true;
        }
    }
    console.warn(`Anuncio con ID "${id}" no encontrado`);
    return false;
}

/**
 * Obtiene scripts de anuncios para insertar en el HTML
 * @param {string} category - Categoría específica (opcional)
 * @returns {string} Scripts concatenados
 */
function getAdScripts(category = null) {
    let scripts = '';

    if (category) {
        const ads = getAdsByCategory(category, true);
        scripts = ads.map(ad => ad.script).join('\n');
    } else {
        const allAds = getAllActiveAds();
        for (const cat in allAds) {
            scripts += allAds[cat].map(ad => ad.script).join('\n') + '\n';
        }
    }

    return scripts.trim();
}

/**
 * Inserta anuncios en el DOM
 * @param {string} category - Categoría específica (opcional)
 * @param {string} targetElement - Selector del elemento donde insertar (default: 'head')
 */
function insertAds(category = null, targetElement = 'head') {
    const scripts = getAdScripts(category);
    const target = document.querySelector(targetElement);

    if (!target) {
        console.warn(`Elemento "${targetElement}" no encontrado`);
        return;
    }

    // Crear un contenedor temporal para los scripts
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scripts;

    // Insertar cada script
    const scriptElements = tempDiv.querySelectorAll('script');
    scriptElements.forEach(script => {
        const newScript = document.createElement('script');
        newScript.innerHTML = script.innerHTML;

        // Copiar atributos
        Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });

        target.appendChild(newScript);
    });

    console.log(`Anuncios ${category || 'de todas las categorías'} insertados en ${targetElement}`);
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        popupAds,
        adsDB,
        getAdsByCategory,
        getAllActiveAds,
        getAdById,
        setAdActive,
        addAd,
        removeAd,
        getAdScripts,
        insertAds
    };
}
