
// Variables globales para paginación
let currentPage = 1;
let videosPerPage = 25; // 5 filas × 5 columnas = 25 videos por página
let totalPages = 1;
let allVideos = [];
let firebaseVideosInitialized = false;
let firebaseUnsubscribe = null;

function addVideosToMediaDB(videos) {
    if (!Array.isArray(videos) || videos.length === 0) {
        return false;
    }

    const idIndex = new Map(mediaDB.map((video, index) => [video.id, index]));
    let changed = false;

    videos.forEach(video => {
        if (!video || !video.id) return;

        let normalized = video;
        if (typeof window.mapFirebaseVideoToMediaDB === 'function' && video.hasOwnProperty('status')) {
            normalized = window.mapFirebaseVideoToMediaDB(video.idOriginal || video.id, video, 'approved');
            normalized.id = normalized.id || video.id;
        }

        if (idIndex.has(normalized.id)) {
            const idx = idIndex.get(normalized.id);
            mediaDB[idx] = normalized;
        } else {
            mediaDB.push(normalized);
            idIndex.set(normalized.id, mediaDB.length - 1);
        }
        changed = true;
    });

    if (changed) {
        mediaDB.sort((a, b) => parseDate(b.fecha) - parseDate(a.fecha));
    }

    return changed;
}

function initializeFirebaseVideos() {
    if (firebaseVideosInitialized) {
        return;
    }

    if (typeof window.getApprovedVideosOnce !== 'function' ||
        typeof window.subscribeApprovedVideos !== 'function') {
        setTimeout(initializeFirebaseVideos, 200);
        return;
    }

    firebaseVideosInitialized = true;

    window.getApprovedVideosOnce()
        .then((videos) => {
            if (addVideosToMediaDB(videos)) {
                console.log('✅ Videos aprobados cargados (lote inicial)');
                renderVideos();
                renderRecommendedVideos();
                renderHiddenVideos();
            }
        })
        .catch((error) => console.error('Error al cargar videos aprobados:', error));

    firebaseUnsubscribe = window.subscribeApprovedVideos((videos) => {
        if (addVideosToMediaDB(videos)) {
            console.log('🔄 Videos aprobados actualizados');
            renderVideos();
            renderRecommendedVideos();
            renderHiddenVideos();
        }
    });
}

// Función para convertir fecha DD/MM/YY a objeto Date para ordenamiento
function parseDate(dateString) {
    if (!dateString) {
        return new Date(0);
    }

    const parts = dateString.split('/');
    if (parts.length !== 3) {
        return new Date(dateString);
    }

    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10) || 1;
    const month = (parseInt(monthStr, 10) || 1) - 1;
    const year = yearStr.length === 2 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr, 10);

    return new Date(year, month, day);
}

// Función para ordenar videos por fecha (más reciente primero)
function sortVideosByDate(videos) {
    return videos.sort((a, b) => {
        const dateA = parseDate(a.fecha);
        const dateB = parseDate(b.fecha);
        return dateB - dateA; // Orden descendente (más reciente primero)
    });
}

// Función para obtener videos recomendados (aleatorios)
function getRandomRecommendedVideos() {
    // Filtrar videos que no sean OCULTO
    const availableVideos = mediaDB.filter(video => video.categoria !== 'OCULTO');

    // Mezclar array aleatoriamente y tomar los primeros 10
    const shuffled = [...availableVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
}

// Función para renderizar videos recomendados
function renderRecommendedVideos() {
    const carousel = document.getElementById('recommendedCarousel');
    if (!carousel) return;

    const recommendedVideos = getRandomRecommendedVideos();
    carousel.innerHTML = '';

    console.log(`Cargando ${recommendedVideos.length} videos recomendados ALEATORIOS...`);

    recommendedVideos.forEach(video => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.innerHTML = `
                    <img src="${video.portada}" alt="${video.titulo}">
                `;

        // Agregar evento de clic para redirigir a video.html
        carouselItem.addEventListener('click', () => {
            window.location.href = `video.html?id=${video.id}`;
        });

        carousel.appendChild(carouselItem);
    });
}

// Función para refrescar videos recomendados
function refreshRecommendedVideos() {
    console.log('Refrescando videos recomendados ALEATORIOS...');
    renderRecommendedVideos();
}

// Función para obtener videos ocultos
function getHiddenVideos() {
    // Filtrar solo videos de categoría OCULTO
    const hiddenVideos = mediaDB.filter(video => video.categoria === 'OCULTO');

    // Mezclar aleatoriamente y tomar los primeros 5
    const shuffled = [...hiddenVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
}

// Función para renderizar videos ocultos
function renderHiddenVideos() {
    const hiddenGrid = document.getElementById('hiddenContentGrid');
    if (!hiddenGrid) return;

    const hiddenVideos = getHiddenVideos();
    hiddenGrid.innerHTML = '';

    console.log(`Cargando ${hiddenVideos.length} videos OCULTOS...`);

    hiddenVideos.forEach(video => {
        const hiddenCard = document.createElement('div');
        hiddenCard.className = 'hidden-content-card';
        hiddenCard.innerHTML = `
                    <img src="${video.portada}" alt="Contenido Oculto">
                    <div class="hidden-content-card-content">
                        <div class="hidden-content-title">${video.titulo}</div>
                    </div>
                    <div class="hidden-content-overlay">
                        <div class="hidden-content-lock">🔒</div>
                    </div>
                `;

        // Agregar evento de clic (no hace nada por ahora)
        hiddenCard.addEventListener('click', () => {
            console.log('Contenido oculto - Acceso denegado');
            // Aquí podrías agregar lógica para mostrar un modal de acceso denegado
        });

        hiddenGrid.appendChild(hiddenCard);
    });
}

// Función para renderizar videos dinámicamente
function renderVideos() {
    console.log('Iniciando renderizado de videos...');
    console.log('mediaDB disponible:', typeof mediaDB !== 'undefined');
    console.log('Número de videos:', mediaDB ? mediaDB.length : 'No definido');
    if (Array.isArray(mediaDB)) {
        console.log('Primeros videos (id, fecha):', mediaDB.slice(0, 5).map(v => ({ id: v.id, fecha: v.fecha })));
    }

    const videosGrid = document.getElementById('videosGrid');

    if (!videosGrid) {
        console.error('No se encontró el elemento videosGrid');
        return;
    }

    if (!mediaDB || !Array.isArray(mediaDB)) {
        console.error('mediaDB no está definido o no es un array');
        videosGrid.innerHTML = '<p>Error: No se pudo cargar la base de datos de videos</p>';
        return;
    }

    // Guardar todos los videos, excluyendo los de categoría "OCULTO" y ordenar por fecha
    const filteredVideos = mediaDB.filter(video => video.categoria !== 'OCULTO');
    allVideos = sortVideosByDate([...filteredVideos]);

    // Calcular total de páginas
    totalPages = Math.ceil(allVideos.length / videosPerPage);

    console.log(`Total de videos en base de datos: ${mediaDB.length}`);
    console.log(`Videos filtrados (sin OCULTO): ${allVideos.length}`);
    console.log(`Videos por página: ${videosPerPage}`);
    console.log(`Total de páginas: ${totalPages}`);

    // Mostrar las primeras 5 fechas para verificar el ordenamiento
    if (allVideos.length > 0) {
        console.log('Primeras 5 fechas (ordenadas de más reciente a más antigua, mezcladas por categoría):');
        allVideos.slice(0, 5).forEach((video, index) => {
            console.log(`${index + 1}. ${video.fecha} - [${video.categoria}] ${video.titulo}`);
        });

        // Mostrar distribución de categorías
        const categoryCount = {};
        allVideos.forEach(video => {
            categoryCount[video.categoria] = (categoryCount[video.categoria] || 0) + 1;
        });
        console.log('Distribución de categorías en TODOS:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`- ${category}: ${count} videos`);
        });
    }

    // Renderizar videos de la página actual
    renderCurrentPage();

    // Crear botones de paginación
    createPaginationButtons();

    // Renderizar videos recomendados
    renderRecommendedVideos();

    // Renderizar videos ocultos
    renderHiddenVideos();
}

// Función para renderizar la página actual
function renderCurrentPage() {
    console.log('🎬 Iniciando renderCurrentPage()');
    console.log('📊 allVideos.length:', allVideos ? allVideos.length : 'No definido');
    console.log('📊 currentPage:', currentPage);
    console.log('📊 videosPerPage:', videosPerPage);
    
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) {
        console.error('❌ No se encontró videosGrid');
        return;
    }

    // Limpiar el grid
    videosGrid.innerHTML = '';

    // Calcular índices de inicio y fin
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = Math.min(startIndex + videosPerPage, allVideos.length);

    console.log(`🎯 Renderizando página ${currentPage}: videos ${startIndex + 1} a ${endIndex} de ${allVideos.length} total`);

    // Renderizar videos de la página actual
    for (let i = startIndex; i < endIndex; i++) {
        const video = allVideos[i];
        console.log(`📹 Renderizando video ${i + 1}: ${video.titulo} (${video.categoria})`);
        
        const videoCard = document.createElement('div');
        videoCard.className = 'content-card';
        videoCard.setAttribute('data-categoria', video.categoria);
        videoCard.innerHTML = `
                    <img src="${video.portada}" alt="${video.titulo}" class="card-image">
                    <div class="card-content">
                        <h3 class="card-title">${video.titulo}</h3>
                        <div class="card-meta">
                            <span class="meta-item">
                                <i class="fa-solid fa-calendar"></i>
                                <span>${video.fecha}</span>
                            </span>
                            <span class="author-info"><i class="fa-solid fa-user"></i> <span>${video.autor}</span></span>
                        </div>
                    </div>
                `;

        // Navegar al reproductor con el ID del video
        videoCard.addEventListener('click', () => {
            window.location.href = `video.html?id=${video.id}`;
        });

        videosGrid.appendChild(videoCard);
    }

    console.log('✅ Renderizado completado. Videos mostrados:', videosGrid.children.length);

    // Agregar efectos hover después de renderizar
    addHoverEffects();

}

// Función para crear botones de paginación
function createPaginationButtons() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
        return; // No mostrar paginación si hay una página o menos
    }

    // Botón "Anterior"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);

    // Calcular qué páginas mostrar
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Mostrar primera página si no está visible
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => goToPage(1));
        paginationContainer.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.color = '#ccc';
            paginationContainer.appendChild(dots);
        }
    }

    // Botones de páginas
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        paginationContainer.appendChild(pageBtn);
    }

    // Mostrar última página si no está visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.color = '#ccc';
            paginationContainer.appendChild(dots);
        }

        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToPage(totalPages));
        paginationContainer.appendChild(lastBtn);
    }

    // Botón "Siguiente"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '›';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);

    // Información de página
    const info = document.createElement('div');
    info.className = 'pagination-info';
    info.textContent = `Página ${currentPage} de ${totalPages}`;
    paginationContainer.appendChild(info);
}

// Función para ir a una página específica
function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }

    currentPage = page;
    renderCurrentPage();
    createPaginationButtons();

    // Scroll hacia arriba del grid
    document.getElementById('videosGrid').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Función para abrir modal de video
function openVideoModal(video) {
    // Crear modal si no existe
    let modal = document.getElementById('videoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
                    max-width: 90%;
                    max-height: 90%;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 10001;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                `;

        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.style.cssText = `
                    width: 100%;
                    height: auto;
                    max-height: 80vh;
                `;

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(videoElement);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Eventos para cerrar modal
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeVideoModal();
        });

        modal.addEventListener('click', closeVideoModal);
    }

    // Configurar video
    const videoElement = modal.querySelector('video');
    videoElement.src = video.video;
    videoElement.poster = video.portada;

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Pausar video
        const video = modal.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }
}

// Cargar videos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, verificando mediaDB...');
    initializeFirebaseVideos();
    // Esperar un poco para asegurar que mediaDB.js se haya cargado
    setTimeout(() => {
        if (typeof mediaDB !== 'undefined') {
            console.log('mediaDB cargado correctamente');
            renderVideos();
            renderRecommendedVideos();
            renderHiddenVideos();
            if (typeof window.subscribeCollaboratorVideos === 'function' && !collaboratorSyncInitialized) {
                // Garantizar que la suscripción siga activa tras la primera carga
                initializeFirebaseVideos();
            }
        } else {
            console.error('mediaDB no se cargó correctamente');
            // Intentar cargar de nuevo después de un poco más
            setTimeout(() => {
                if (typeof mediaDB !== 'undefined') {
                    console.log('mediaDB cargado en segundo intento');
                    renderVideos();
                    renderRecommendedVideos();
                    renderHiddenVideos();
                    if (typeof window.subscribeCollaboratorVideos === 'function' && !collaboratorSyncInitialized) {
                    initializeFirebaseVideos();
                    }
                } else {
                    console.error('mediaDB sigue sin estar disponible');
                    document.getElementById('videosGrid').innerHTML = '<p>Error: No se pudo cargar la base de datos de videos. Verifica que el archivo mediaDB.js esté disponible.</p>';
                }
            }, 1000);
        }
    }, 100);
});

// Search functionality
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer.classList.contains('show')) {
        searchContainer.classList.remove('show');
    } else {
        searchContainer.classList.add('show');
        // Focus on the search input when it appears
        setTimeout(() => {
            document.querySelector('.search-input').focus();
        }, 300); // Wait for animation to complete
    }
}

// Close search when clicking outside
document.addEventListener('click', function (event) {
    const searchContainer = document.getElementById('searchContainer');
    const searchBar = document.querySelector('.search-bar');

    if (!searchBar.contains(event.target) && !searchContainer.contains(event.target)) {
        searchContainer.classList.remove('show');
    }
});

// Carousel functionality
const carousel = document.querySelector('.carousel');
const prevBtn = document.querySelector('.carousel-nav.prev');
const nextBtn = document.querySelector('.carousel-nav.next');

if (prevBtn && nextBtn && carousel) {
    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -220, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: 220, behavior: 'smooth' });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Función de búsqueda
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchSubmitBtn = document.querySelector('.search-submit-btn');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            // Si no hay término de búsqueda, mostrar todos los videos mezclados por fecha (excluyendo OCULTO)
            const filteredVideos = mediaDB.filter(video => video.categoria !== 'OCULTO');
            allVideos = sortVideosByDate([...filteredVideos]);
            console.log(`Búsqueda vacía: Mostrando TODOS los videos mezclados por fecha: ${allVideos.length} videos`);
        } else {
            // Filtrar videos por término de búsqueda (excluyendo OCULTO)
            const filteredVideos = mediaDB.filter(video =>
                video.categoria !== 'OCULTO' && (
                    video.titulo.toLowerCase().includes(searchTerm) ||
                    video.autor.toLowerCase().includes(searchTerm) ||
                    video.categoria.toLowerCase().includes(searchTerm)
                )
            );
            allVideos = sortVideosByDate([...filteredVideos]);
        }

        // Recalcular paginación
        totalPages = Math.ceil(allVideos.length / videosPerPage);
        currentPage = 1; // Volver a la primera página

        // Re-renderizar
        renderCurrentPage();
        createPaginationButtons();

        console.log(`Búsqueda: "${searchTerm}" - ${allVideos.length} videos encontrados`);
    }

    searchSubmitBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Función para filtrar por categoría
function setupCategoryFilter() {
    console.log('🔧 Configurando filtros de categoría...');
    
    // Función para configurar los enlaces cuando estén disponibles
    function trySetupCategoryFilter() {
        const categoryLinks = document.querySelectorAll('.secondary-nav-links a');
        console.log('📋 Enlaces de categoría encontrados:', categoryLinks.length);

        if (categoryLinks.length === 0) {
            console.log('⏳ Enlaces no encontrados, reintentando en 200ms...');
            setTimeout(trySetupCategoryFilter, 200);
            return;
        }

        configureCategoryLinks(categoryLinks);
    }
    
    // Intentar configurar inmediatamente
    trySetupCategoryFilter();
}

function configureCategoryLinks(categoryLinks) {
    console.log('🔗 Configurando enlaces de categoría...');
    
    categoryLinks.forEach((link, index) => {
        console.log(`🔗 Configurando enlace ${index + 1}: "${link.textContent.trim()}"`);
        
        // Remover event listeners existentes para evitar duplicados
        link.removeEventListener('click', handleCategoryClick);
        
        // Agregar nuevo event listener
        link.addEventListener('click', handleCategoryClick);
    });
    
    console.log('✅ Filtros de categoría configurados correctamente');
}

function handleCategoryClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const link = e.target;
    console.log('🖱️ Click en categoría:', link.textContent.trim());

    // Remover clase active de todos los enlaces
    const allLinks = document.querySelectorAll('.secondary-nav-links a');
    allLinks.forEach(l => l.classList.remove('active'));
    
    // Agregar clase active al enlace clickeado
    link.classList.add('active');

    const category = link.textContent.trim();
    console.log('🎯 Llamando a filterVideosByCategory con:', category);
    
    // Asegurar que mediaDB esté disponible antes de filtrar
    if (typeof mediaDB === 'undefined') {
        console.error('❌ mediaDB no está disponible para filtrar');
        alert('Error: Base de datos no disponible. Recarga la página.');
        return;
    }
    
    filterVideosByCategory(category);
}

function filterVideosByCategory(category) {
    console.log('🔍 Iniciando filtrado por categoría:', category);
    console.log('📊 mediaDB disponible:', typeof mediaDB !== 'undefined');
    console.log('📊 Total videos en mediaDB:', mediaDB ? mediaDB.length : 'No definido');
    
    const normalizedCategory = category ? category.toUpperCase() : 'TODOS';

    const videosGrid = document.getElementById('videosGrid');
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (!videosGrid) {
        console.error('❌ No se encontró videosGrid');
        return;
    }
    
    if (!mediaDB) {
        console.error('❌ mediaDB no está disponible');
        return;
    }
    
    // Mostrar todas las categorías disponibles para debug
    const allCategories = [...new Set(mediaDB.map(v => v.categoria))];
    console.log('📋 Categorías disponibles en mediaDB:', allCategories);
    
    // Crear indicador de carga si no existe
    let loadingIndicator = document.getElementById('loadingIndicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 40px;
                color: #666;
                font-size: 16px;
            ">
                <i class="fa-solid fa-spinner fa-spin" style="margin-right: 10px; color: #ff0000;"></i>
                Cargando videos...
            </div>
        `;
        videosGrid.parentNode.insertBefore(loadingIndicator, videosGrid);
    }
    
    // Fade out effect
    videosGrid.style.opacity = '0';
    videosGrid.style.transform = 'translateY(20px)';
    paginationContainer.style.opacity = '0';
    
    // Mostrar indicador de carga
    loadingIndicator.style.display = 'block';
    loadingIndicator.style.opacity = '1';
    
    // After fade out, filter and render
    setTimeout(() => {
        if (normalizedCategory === 'TODOS') {
            // Mostrar todos los videos (excluyendo OCULTO) mezclados por fecha
            const filteredVideos = mediaDB.filter(video => video.categoria !== 'OCULTO');
            allVideos = sortVideosByDate([...filteredVideos]);
            console.log(`✅ Mostrando TODOS los videos mezclados por fecha: ${allVideos.length} videos`);
        } else {
            // Filtrar videos por categoría específica (excluyendo OCULTO)
            const filteredVideos = mediaDB.filter(video => video.categoria === normalizedCategory && video.categoria !== 'OCULTO');
            allVideos = sortVideosByDate([...filteredVideos]);
            console.log(`✅ Mostrando videos de categoría "${category}": ${allVideos.length} videos`);
            
            // Debug: mostrar algunos ejemplos de videos filtrados
            if (filteredVideos.length > 0) {
                console.log('📋 Ejemplos de videos filtrados:', filteredVideos.slice(0, 3).map(v => ({ titulo: v.titulo, categoria: v.categoria })));
            } else {
                console.log('⚠️ No se encontraron videos para la categoría:', category);
                console.log('🔍 Verificando coincidencias exactas...');
                
                // Verificar si hay coincidencias parciales
                const partialMatches = mediaDB.filter(video => 
                    video.categoria.toLowerCase().includes(category.toLowerCase()) && 
                    video.categoria !== 'OCULTO'
                );
                console.log('🔍 Coincidencias parciales encontradas:', partialMatches.length);
                if (partialMatches.length > 0) {
                    console.log('📋 Categorías con coincidencias parciales:', [...new Set(partialMatches.map(v => v.categoria))]);
                }
            }
        }

        // Recalcular paginación
        totalPages = Math.ceil(allVideos.length / videosPerPage);
        currentPage = 1; // Volver a la primera página

        // Re-renderizar
        renderCurrentPage();
        createPaginationButtons();
        
        // Ocultar indicador de carga
        loadingIndicator.style.opacity = '0';
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
        }, 200);
        
        // Fade in effect
        videosGrid.style.opacity = '1';
        videosGrid.style.transform = 'translateY(0)';
        paginationContainer.style.opacity = '1';

        console.log(`🎯 Filtro por categoría: "${category}" - ${allVideos.length} videos encontrados`);
    }, 300); // 300ms delay for smooth transition
}

// Función de prueba para verificar el filtrado
function testCategoryFiltering() {
    console.log('🧪 INICIANDO PRUEBA DE FILTRADO');
    console.log('📊 mediaDB disponible:', typeof mediaDB !== 'undefined');
    console.log('📊 Total videos:', mediaDB ? mediaDB.length : 'No definido');
    
    if (mediaDB) {
        // Contar videos por categoría
        const categories = {};
        mediaDB.forEach(video => {
            categories[video.categoria] = (categories[video.categoria] || 0) + 1;
        });
        console.log('📋 Videos por categoría:', categories);
        
        // Probar filtrado manual
        const asesinatosVideos = mediaDB.filter(video => video.categoria === 'ASESINATOS');
        console.log('🔪 Videos de ASESINATOS encontrados:', asesinatosVideos.length);
        if (asesinatosVideos.length > 0) {
            console.log('📹 Primeros 3 videos de ASESINATOS:', asesinatosVideos.slice(0, 3).map(v => v.titulo));
        }
    }
    
    // Verificar elementos del DOM
    const videosGrid = document.getElementById('videosGrid');
    const categoryLinks = document.querySelectorAll('.secondary-nav-links a');
    console.log('🎯 videosGrid encontrado:', !!videosGrid);
    console.log('🔗 Enlaces de categoría encontrados:', categoryLinks.length);
}

// Función para verificar el estado del filtrado
function debugFilteringState() {
    console.log('🔍 === DEBUG DEL ESTADO DE FILTRADO ===');
    console.log('📊 mediaDB disponible:', typeof mediaDB !== 'undefined');
    console.log('📊 Total videos:', mediaDB ? mediaDB.length : 'No definido');
    
    if (mediaDB) {
        const categories = [...new Set(mediaDB.map(v => v.categoria))];
        console.log('📋 Categorías disponibles:', categories);
        
        categories.forEach(cat => {
            const count = mediaDB.filter(v => v.categoria === cat).length;
            console.log(`  - ${cat}: ${count} videos`);
        });
    }
    
    const categoryLinks = document.querySelectorAll('.secondary-nav-links a');
    console.log('🔗 Enlaces de categoría encontrados:', categoryLinks.length);
    categoryLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. "${link.textContent.trim()}"`);
    });
    
    const videosGrid = document.getElementById('videosGrid');
    console.log('🎯 videosGrid encontrado:', !!videosGrid);
    console.log('🎯 Videos actualmente mostrados:', videosGrid ? videosGrid.children.length : 'No disponible');
    
    console.log('🔍 === FIN DEBUG ===');
}

// Función para inicializar todo cuando esté listo
function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    if (typeof mediaDB === 'undefined') {
        console.log('⏳ Esperando mediaDB...');
        setTimeout(initializeApp, 100);
        return;
    }
    
    console.log('✅ mediaDB disponible, configurando funcionalidades...');
    setupSearch();
    setupCategoryFilter();
    debugFilteringState();
    
    // Verificar que los filtros funcionen
    setTimeout(() => {
        const categoryLinks = document.querySelectorAll('.secondary-nav-links a');
        console.log('🔍 Verificación final - Enlaces encontrados:', categoryLinks.length);
        if (categoryLinks.length > 0) {
            console.log('✅ Filtros de categoría configurados correctamente');
        } else {
            console.error('❌ Error: No se pudieron configurar los filtros');
        }
    }, 1000);
}

// Configurar funcionalidades cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, iniciando configuración...');
    initializeApp();
});

// Configurar filtros también cuando la ventana esté completamente cargada
window.addEventListener('load', () => {
    console.log('🔄 Ventana completamente cargada, verificando configuración...');
    setTimeout(() => {
        if (typeof mediaDB !== 'undefined') {
            setupCategoryFilter();
            debugFilteringState();
        }
    }, 200);
});

// Add hover effects to cards (se ejecutará después de renderVideos)
function addHoverEffects() {
    document.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Agregar efectos hover después de renderizar videos
setTimeout(addHoverEffects, 100);

// Función de prueba para verificar filtros (disponible en consola)
window.testFilters = function() {
    console.log('🧪 === PRUEBA DE FILTROS ===');
    
    // Verificar mediaDB
    if (typeof mediaDB === 'undefined') {
        console.error('❌ mediaDB no está disponible');
        return;
    }
    
    console.log('✅ mediaDB disponible con', mediaDB.length, 'videos');
    
    // Verificar enlaces de categoría
    const categoryLinks = document.querySelectorAll('.secondary-nav-links a');
    console.log('🔗 Enlaces de categoría encontrados:', categoryLinks.length);
    
    if (categoryLinks.length === 0) {
        console.error('❌ No se encontraron enlaces de categoría');
        return;
    }
    
    // Mostrar enlaces disponibles
    categoryLinks.forEach((link, index) => {
        console.log(`${index + 1}. "${link.textContent.trim()}"`);
    });
    
    // Probar filtrado manual
    const testCategory = 'ASESINATOS';
    const testVideos = mediaDB.filter(video => video.categoria === testCategory);
    console.log(`🔍 Videos de ${testCategory}:`, testVideos.length);
    
    if (testVideos.length > 0) {
        console.log('📹 Ejemplos:', testVideos.slice(0, 3).map(v => v.titulo));
    }
    
    // Simular click en ASESINATOS
    const asesinatosLink = Array.from(categoryLinks).find(link => 
        link.textContent.trim() === 'ASESINATOS'
    );
    
    if (asesinatosLink) {
        console.log('🖱️ Simulando click en ASESINATOS...');
        asesinatosLink.click();
    } else {
        console.error('❌ No se encontró enlace de ASESINATOS');
    }
    
    console.log('🧪 === FIN PRUEBA ===');
};

// Función para forzar reconfiguración de filtros
window.reconfigureFilters = function() {
    console.log('🔧 Reconfigurando filtros...');
    setupCategoryFilter();
    debugFilteringState();
};