// Variables globales
let currentUser = null;
let currentVideoId = null;
let isLiked = false;
let isDisliked = false;
let isFavorited = false;
let isPlaying = false;
let collaboratorSubscriptionActive = false;
let collaboratorInitialLoadPromise = null;

function parseDate(dateString) {
    if (!dateString) {
        return new Date(0);
    }

    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [dayStr, monthStr, yearStr] = parts;
        const day = parseInt(dayStr, 10) || 1;
        const month = (parseInt(monthStr, 10) || 1) - 1;
        const year = yearStr.length === 2 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr, 10);
        const parsed = new Date(year, month, day);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const fallback = new Date(dateString);
    return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

function addFirebaseVideosToMediaDB(videos) {
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

// Reproductor por iframe: no se requiere lógica de play/pause manual

// Función para toggle like
async function toggleLike() {
    // Verificar autenticación usando las funciones de Firebase
    if (!window.isUserLoggedIn || !window.isUserLoggedIn()) {
        alert('Debes iniciar sesión para dar like');
        return;
    }

    if (!currentVideoId) return;

    try {
    if (isLiked) {
            // Remove like
            const result = await window.videoFunctions.removeLike(currentVideoId);
            if (result.success) {
        isLiked = false;
                updateLikeButtons();
            } else {
                alert('Error al quitar like: ' + result.error);
            }
    } else {
            // Add like
            const result = await window.videoFunctions.addLike(currentVideoId, true);
            if (result.success) {
        isLiked = true;
            isDisliked = false;
                updateLikeButtons();
            } else {
                alert('Error al dar like: ' + result.error);
            }
        }
    } catch (error) {
        console.error('Error en toggleLike:', error);
        alert('Error al procesar like');
    }
}

// Función para toggle dislike
async function toggleDislike() {
    // Verificar autenticación usando las funciones de Firebase
    if (!window.isUserLoggedIn || !window.isUserLoggedIn()) {
        alert('Debes iniciar sesión para dar dislike');
        return;
    }

    if (!currentVideoId) return;

    try {
    if (isDisliked) {
            // Remove dislike
            const result = await window.videoFunctions.removeLike(currentVideoId);
            if (result.success) {
        isDisliked = false;
                updateLikeButtons();
            } else {
                alert('Error al quitar dislike: ' + result.error);
            }
    } else {
            // Add dislike
            const result = await window.videoFunctions.addLike(currentVideoId, false);
            if (result.success) {
        isDisliked = true;
            isLiked = false;
                updateLikeButtons();
            } else {
                alert('Error al dar dislike: ' + result.error);
            }
        }
    } catch (error) {
        console.error('Error en toggleDislike:', error);
        alert('Error al procesar dislike');
    }
}

// Función para toggle favorite
function toggleFavorite() {
    const favoriteBtn = document.getElementById('favoriteBtn');

    if (isFavorited) {
        isFavorited = false;
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i> + Favorite';
    } else {
        isFavorited = true;
        favoriteBtn.classList.add('favorited');
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
    }
}

// Función para obtener parámetro de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Función para actualizar botones de like/dislike
function updateLikeButtons() {
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    
    if (likeBtn) {
        if (isLiked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    }
    
    if (dislikeBtn) {
        if (isDisliked) {
            dislikeBtn.classList.add('liked');
        } else {
            dislikeBtn.classList.remove('liked');
        }
    }
}

// Cargar datos del video por ID
function loadVideoById(videoId) {
    if (typeof mediaDB === 'undefined') return;
    
    // Limpiar comentarios del video anterior si estamos cambiando de video
    if (currentVideoId && currentVideoId !== videoId) {
        cleanupComments();
    }
    
    // Buscar video por ID (incluyendo videos OCULTOS)
    const video = mediaDB.find(v => v.id === videoId);
    if (!video) {
        console.error('Video no encontrado');
        return;
    }

    // Título
    document.getElementById('videoTitle').textContent = video.titulo;
    // Actualizar título de la pestaña
    document.title = `${video.titulo} - TRIPGORE`;
    // Meta: fecha y autor
    document.getElementById('videoMeta').innerHTML = `<strong>Publicado el ${video.fecha} por:</strong> ${video.autor}`;
    // Establecer iframe con la URL del video
    const iframe = document.getElementById('videoIframe');
    iframe.src = video.video;

    // Mostrar categoría actual
    const catEl = document.getElementById('currentCategory');
    if (catEl) {
        catEl.textContent = video.categoria;
    }

    // Guardar en window para navegación siguiente/anterior
    window.__currentVideoId = videoId;
    currentVideoId = videoId;
    
    // Cargar likes/dislikes desde Firebase
    loadLikesDislikes(videoId);
}

// Cargar likes/dislikes desde Firebase Realtime Database
function loadLikesDislikes(videoId) {
    if (!videoId || !window.videoFunctions) return;
    
    // Load likes
    window.videoFunctions.getLikes(videoId, (data) => {
        const likeCount = document.getElementById('likeCount');
        const dislikeCount = document.getElementById('dislikeCount');
        
        const totalLikes = (data.likes?.length || 0) + (data.botLikesCount || 0);
        const totalDislikes = (data.dislikes?.length || 0) + (data.botDislikesCount || 0);

        if (likeCount) likeCount.textContent = totalLikes;
        if (dislikeCount) dislikeCount.textContent = totalDislikes;
    });
    
    // Load user's like status
    if (window.isUserLoggedIn && window.isUserLoggedIn()) {
        const currentUser = window.getCurrentUser();
        if (currentUser) {
            window.videoFunctions.getUserLike(videoId, currentUser.uid, (userLike) => {
                if (userLike) {
                    isLiked = userLike.type === 'like';
                    isDisliked = userLike.type === 'dislike';
                } else {
                    isLiked = false;
                    isDisliked = false;
                }
                updateLikeButtons();
            });
        }
    } else {
        // Usuario no logueado, resetear estados
        isLiked = false;
        isDisliked = false;
        updateLikeButtons();
    }
}

// Cargar videos relacionados aleatorios desde mediaDB
function loadRelatedVideosRandom(currentId) {
    if (typeof mediaDB === 'undefined') return;
    // Obtener el video actual para determinar si mostrar videos ocultos
    const currentVideo = mediaDB.find(v => v.id === currentId);
    const isCurrentVideoHidden = currentVideo && currentVideo.categoria === 'OCULTO';
    
    // Si el video actual es oculto, mostrar videos ocultos en relacionados
    // Si no, excluir videos ocultos de los relacionados
    const candidates = mediaDB.filter(v => {
        if (v.id === currentId) return false; // Excluir el video actual
        if (isCurrentVideoHidden) {
            return true; // Mostrar todos los videos si el actual es oculto
        } else {
            return v.categoria !== 'OCULTO'; // Excluir ocultos si el actual no es oculto
        }
    });
    const shuffled = [...candidates].sort(() => Math.random() - 0.5).slice(0, 5);
    const relatedList = document.getElementById('relatedVideosList');
    relatedList.innerHTML = shuffled.map(v => `
                <div class="related-video-item" onclick="window.location.href='video.html?id=${v.id}'" style="padding: 10px; display: flex; gap: 12px; align-items: center;">
                    <img src="${v.portada}" alt="${v.titulo}" class="related-video-thumbnail">
                    <div class="related-video-info">
                        <h3 class="related-video-title" style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #333;">${v.titulo}</h3>
                        <div class="related-video-meta" style="font-size: 12px; color: #666;">${v.autor}</div>
                    </div>
                </div>
            `).join('');
}

// Función para cargar un video específico
function loadVideo(videoId) {
    // Simular carga de video
    console.log(`Cargando video ${videoId}...`);

    // Aquí iría la lógica para cargar el video desde la base de datos
    // Por ahora solo mostramos un mensaje
    alert(`Cargando video ${videoId}. En una implementación real, esto cargaría el video desde la base de datos.`);
}

// Utilidades de historial en sessionStorage
const HISTORY_KEY = 'videoHistory';
function getHistory() {
    try {
        const raw = sessionStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}
function setHistory(arr) {
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch (e) { }
}
function pushToHistory(id) {
    const hist = getHistory();
    // Evitar duplicar al recargar misma página consecutivamente
    if (hist.length === 0 || hist[hist.length - 1] !== id) {
        hist.push(id);
        setHistory(hist);
    }
}

// Obtener un ID aleatorio excluyendo el actual
function getRandomVideoId(excludeId) {
    if (typeof mediaDB === 'undefined') return null;
    // Obtener el video actual para determinar si mostrar videos ocultos
    const currentVideo = mediaDB.find(v => v.id === excludeId);
    const isCurrentVideoHidden = currentVideo && currentVideo.categoria === 'OCULTO';
    
    // Si el video actual es oculto, incluir videos ocultos en la selección
    // Si no, excluir videos ocultos
    const candidates = mediaDB.filter(v => {
        if (v.id === excludeId) return false; // Excluir el video actual
        if (isCurrentVideoHidden) {
            return true; // Incluir todos los videos si el actual es oculto
        } else {
            return v.categoria !== 'OCULTO'; // Excluir ocultos si el actual no es oculto
        }
    });
    
    if (candidates.length === 0) return null;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return pick.id;
}

// Función para ir al video anterior (desde historial)
function goToPreviousVideo() {
    const hist = getHistory();
    if (hist.length <= 1) {
        console.warn('No hay video anterior en el historial');
        return;
    }
    // El actual es el último; retroceder uno
    hist.pop();
    const prevId = hist[hist.length - 1];
    setHistory(hist);
    window.location.href = `video.html?id=${prevId}`;
}

// Función para ir al siguiente video (aleatorio)
function goToNextVideo() {
    const currentId = window.__currentVideoId || getQueryParam('id');
    const nextId = getRandomVideoId(currentId);
    if (!nextId) {
        console.warn('No se pudo seleccionar un video aleatorio');
        return;
    }
    // Agregar el siguiente al historial
    const hist = getHistory();
    hist.push(nextId);
    setHistory(hist);
    window.location.href = `video.html?id=${nextId}`;
}

// Funciones de comentarios
async function addComment(parentId = null) {
    console.log('🚀 addComment llamado');
    console.log('currentUser:', currentUser);
    console.log('currentVideoId:', currentVideoId);
    console.log('window.isUserLoggedIn:', typeof window.isUserLoggedIn);
    console.log('window.getCurrentUser:', typeof window.getCurrentUser);
    
    if (!currentUser) {
        // Try to get user again
        if (window.isUserLoggedIn && window.isUserLoggedIn()) {
            currentUser = window.getCurrentUser();
            console.log('✅ Usuario obtenido en addComment:', currentUser);
        } else {
            console.log('❌ Usuario no logueado en addComment');
            alert('Debes iniciar sesión para comentar');
            return;
        }
    }

    if (!currentVideoId) {
        console.log('❌ No hay videoId');
        return;
    }

    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert('Por favor escribe un comentario');
        return;
    }

    console.log('📝 Enviando comentario:', commentText);

    try {
        let result;
        if (parentId) {
            // Es una respuesta
            console.log('💬 Enviando respuesta');
            result = await window.videoFunctions.addReply(currentVideoId, parentId, commentText);
        } else {
            // Es un comentario principal
            console.log('💬 Enviando comentario principal');
            result = await window.videoFunctions.addComment(currentVideoId, commentText);
        }

        console.log('📊 Resultado:', result);

        if (result.success) {
            commentInput.value = '';
            console.log('✅ Comentario enviado exitosamente');
            // Los comentarios se actualizarán automáticamente por el listener
        } else {
            alert('Error al enviar comentario: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error al añadir comentario:', error);
        alert('Error al enviar comentario');
    }
}

function saveComment(comment) {
    const comments = getComments();
    comments.push(comment);
    localStorage.setItem('videoComments', JSON.stringify(comments));
}

function getComments() {
    try {
        const comments = localStorage.getItem('videoComments');
        return comments ? JSON.parse(comments) : [];
    } catch (e) {
        return [];
    }
}

// Variables para optimización de comentarios
let commentsDebounceTimer = null;
let commentsUnsubscribe = null;
let commentsInitialRender = true;
let renderedCommentsCount = 0;
const COMMENTS_PER_BATCH = 15; // Cargar comentarios en lotes
const COMMENTS_DEBOUNCE_MS = 300; // Debounce para evitar renders constantes

// Función helper para escapar HTML y prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Renderizar comentario individual (optimizado)
function renderCommentElement(comment, replies) {
    const commentRow = document.createElement('div');
    commentRow.className = 'comment-row';
    
    const initial = (comment.autor || '?').trim().charAt(0).toUpperCase();
    const escapedAutor = escapeHtml(comment.autor || '');
    const escapedFecha = escapeHtml(comment.fecha || '');
    const escapedTexto = escapeHtml(comment.texto || '');
    const escapedId = escapeHtml(comment.id || '');
    
    // Crear estructura del comentario
    commentRow.innerHTML = `
        <div class="comment-avatar" title="${escapedAutor}"><span>${initial}</span></div>
        <div class="comment-main">
            <div class="comment-meta">
                <span class="comment-time">${escapedFecha}</span>
            </div>
            <div class="comment-bubble">
                <div class="comment-topline">
                    <div class="comment-identity">
                        <span class="comment-username" data-user-badge="${escapedAutor}">${escapedAutor}</span>
                    </div>
                    <button class="comment-number" title="#">#</button>
                </div>
                <div class="comment-text">${escapedTexto}</div>
                <div class="comment-actions">
                    <button class="reply-btn" onclick="showReplyForm('${escapedId}')">
                        <i class="fa-solid fa-reply"></i> Responder
                    </button>
                </div>
                <div class="reply-form" id="reply-form-${escapedId}" style="display: none;">
                    <textarea class="reply-input" placeholder="Escribe tu respuesta..."></textarea>
                    <div>
                        <button class="reply-submit-btn" onclick="submitReply('${escapedId}')">
                            <i class="fa-solid fa-reply"></i> Responder
                        </button>
                        <button class="reply-cancel-btn" onclick="hideReplyForm('${escapedId}')">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar respuestas si existen
    if (replies && replies.length > 0) {
        const repliesContainer = commentRow.querySelector('.comment-bubble');
        const repliesFragment = document.createDocumentFragment();
        
        replies.forEach(reply => {
            const replyRow = document.createElement('div');
            replyRow.className = 'comment-row reply';
            const replyInitial = (reply.autor || '?').trim().charAt(0).toUpperCase();
            const escapedReplyAutor = escapeHtml(reply.autor || '');
            const escapedReplyFecha = escapeHtml(reply.fecha || '');
            const escapedReplyTexto = escapeHtml(reply.texto || '');
            
            replyRow.innerHTML = `
                <div class="comment-avatar" title="${escapedReplyAutor}"><span>${replyInitial}</span></div>
                <div class="comment-main">
                    <div class="comment-meta">
                        <span class="comment-time">${escapedReplyFecha}</span>
                    </div>
                    <div class="comment-bubble">
                        <div class="comment-topline">
                            <div class="comment-identity">
                                <span class="comment-username" data-user-badge="${escapedReplyAutor}">${escapedReplyAutor}</span>
                            </div>
                            <button class="comment-number" title="#">#</button>
                        </div>
                        <div class="comment-text">${escapedReplyTexto}</div>
                    </div>
                </div>
            `;
            repliesFragment.appendChild(replyRow);
        });
        
        repliesContainer.appendChild(repliesFragment);
    }
    
    return commentRow;
}

// Renderizar comentarios de forma optimizada con paginación
function renderCommentsOptimized(comments, commentsList, startIndex = 0, batchSize = COMMENTS_PER_BATCH) {
    // Filter main comments (not replies)
    const mainComments = comments.filter(comment => !comment.parentId);
    
    if (mainComments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="fa-solid fa-comment-slash"></i>
                <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </div>
        `;
        return;
    }
    
    // Usar DocumentFragment para renderizado eficiente
    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(startIndex + batchSize, mainComments.length);
    
    // Limpiar solo si es el primer render
    if (startIndex === 0) {
        commentsList.innerHTML = '';
    }
    
    // Pre-computar respuestas para evitar múltiples filtrados
    const repliesMap = new Map();
    comments.forEach(comment => {
        if (comment.parentId) {
            if (!repliesMap.has(comment.parentId)) {
                repliesMap.set(comment.parentId, []);
            }
            repliesMap.get(comment.parentId).push(comment);
        }
    });
    
    // Renderizar batch de comentarios
    for (let i = startIndex; i < endIndex; i++) {
        const comment = mainComments[i];
        const replies = repliesMap.get(comment.id) || [];
        const commentElement = renderCommentElement(comment, replies);
        fragment.appendChild(commentElement);
    }
    
    commentsList.appendChild(fragment);
    renderedCommentsCount = endIndex;
    
    // Decorar badges solo para los elementos recién renderizados (debatido para mejor rendimiento)
    if (window.decorateElementsWithBadges) {
        // Usar requestAnimationFrame para evitar bloquear el render
        requestAnimationFrame(() => {
            // Decorar solo los nuevos elementos, no todos los comentarios
            const allCommentRows = commentsList.querySelectorAll('.comment-row');
            const newCommentRows = Array.from(allCommentRows).slice(startIndex);
            
            // Crear un contenedor temporal solo con los nuevos elementos
            if (newCommentRows.length > 0) {
                // Decorar solo los nuevos elementos usando la función global optimizada
                window.decorateElementsWithBadges('data-user-badge', {});
            }
        });
    }
    
    // Si hay más comentarios, añadir botón "Cargar más" o usar Intersection Observer
    if (endIndex < mainComments.length) {
        // Eliminar botón anterior si existe
        const existingLoadMore = commentsList.querySelector('.load-more-comments');
        if (existingLoadMore) {
            existingLoadMore.remove();
        }
        
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'load-more-comments';
        loadMoreBtn.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreComments()">
                <i class="fa-solid fa-chevron-down"></i>
                Cargar más comentarios (${mainComments.length - endIndex} restantes)
            </button>
        `;
        commentsList.appendChild(loadMoreBtn);
    }
}

// Función para cargar más comentarios
let allCommentsCache = [];
let allMainCommentsCache = [];

function loadMoreComments() {
    if (!currentVideoId || !window.videoFunctions) return;
    
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    renderCommentsOptimized(allCommentsCache, commentsList, renderedCommentsCount, COMMENTS_PER_BATCH);
}

// Cargar comentarios desde Firebase con debouncing y optimizaciones
function loadComments() {
    if (!currentVideoId || !window.videoFunctions) return;

    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    // Limpiar listener anterior si existe
    if (commentsUnsubscribe && typeof commentsUnsubscribe === 'function') {
        commentsUnsubscribe();
    }

    // Mostrar estado de carga solo en el primer render
    if (commentsInitialRender) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Cargando comentarios...</p>
            </div>
        `;
        commentsInitialRender = false;
    }

    // Función de renderizado con debouncing
    const debouncedRender = (comments) => {
        // Cancelar timer anterior
        if (commentsDebounceTimer) {
            clearTimeout(commentsDebounceTimer);
        }
        
        // Guardar en cache
        allCommentsCache = comments;
        
        // Debounce para evitar renders constantes
        commentsDebounceTimer = setTimeout(() => {
            renderedCommentsCount = 0;
            renderCommentsOptimized(comments, commentsList, 0, COMMENTS_PER_BATCH);
            commentsDebounceTimer = null;
        }, COMMENTS_DEBOUNCE_MS);
    };

    // Load comments from Firebase con listener optimizado
    commentsUnsubscribe = window.videoFunctions.getComments(currentVideoId, debouncedRender);
}

// Limpiar recursos al cambiar de video
function cleanupComments() {
    if (commentsUnsubscribe && typeof commentsUnsubscribe === 'function') {
        commentsUnsubscribe();
        commentsUnsubscribe = null;
    }
    if (commentsDebounceTimer) {
        clearTimeout(commentsDebounceTimer);
        commentsDebounceTimer = null;
    }
    allCommentsCache = [];
    allMainCommentsCache = [];
    renderedCommentsCount = 0;
    commentsInitialRender = true;
}

// Mostrar formulario de respuesta
function showReplyForm(parentId) {
    const el = document.getElementById(`reply-form-${parentId}`);
    if (el) el.style.display = 'block';
}

// Ocultar formulario de respuesta
function hideReplyForm(parentId) {
    const el = document.getElementById(`reply-form-${parentId}`);
    if (el) {
        el.style.display = 'none';
        const input = el.querySelector('.reply-input');
        if (input) input.value = '';
    }
}

// Enviar respuesta
async function submitReply(parentId) {
    console.log('🚀 submitReply llamado para parentId:', parentId);

    if (!currentUser) {
        // Try to get user again
        if (window.isUserLoggedIn && window.isUserLoggedIn()) {
            currentUser = window.getCurrentUser();
            console.log('✅ Usuario obtenido en submitReply:', currentUser);
        } else {
            console.log('❌ Usuario no logueado en submitReply');
            alert('Debes iniciar sesión para responder');
            return;
        }
    }

    if (!currentVideoId) {
        console.log('❌ No hay videoId');
        return;
    }

    const form = document.getElementById(`reply-form-${parentId}`);
    if (!form) {
        console.log('❌ No se encontró el formulario de respuesta');
        return;
    }

    const input = form.querySelector('.reply-input');
    if (!input) {
        console.log('❌ No se encontró el input de respuesta');
        return;
    }

    const text = input.value.trim();
    if (!text) {
        alert('Por favor escribe una respuesta');
        return;
    }

    console.log('📝 Enviando respuesta:', text);

    try {
        const result = await window.videoFunctions.addReply(currentVideoId, parentId, text);

        console.log('📊 Resultado de respuesta:', result);

        if (result.success) {
            input.value = '';
            console.log('✅ Respuesta enviada exitosamente');
            // Ocultar el formulario
            hideReplyForm(parentId);
            // Los comentarios se actualizarán automáticamente por el listener
        } else {
            alert('Error al enviar respuesta: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error al enviar respuesta:', error);
        alert('Error al enviar respuesta');
    }
}

// Compartir y Descargar
function shareCurrentVideo() {
    const id = window.__currentVideoId || getQueryParam('id');
    const url = `${window.location.origin}${window.location.pathname.split('/').slice(0, -1).join('/')}/video.html?id=${id}`;
    if (navigator.share) {
        navigator.share({ title: document.title, url }).catch(() => copyToClipboard(url));
    } else {
        copyToClipboard(url);
        alert('Enlace copiado al portapapeles');
    }
}

function copyToClipboard(text) {
    try {
        navigator.clipboard.writeText(text);
    } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }
}

function downloadCurrentVideo() {
    const id = window.__currentVideoId || getQueryParam('id');
    const video = (typeof mediaDB !== 'undefined') ? mediaDB.find(v => v.id === id) : null;
    if (!video) return;
    const a = document.createElement('a');
    a.href = video.video;
    a.download = `${video.id}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function ensureCollaboratorVideosLoaded() {
    if (collaboratorInitialLoadPromise) {
        return collaboratorInitialLoadPromise;
    }

    collaboratorInitialLoadPromise = new Promise((resolve) => {
        const mergeVideos = (videos) => {
            addFirebaseVideosToMediaDB(videos);
        };

        if (typeof window.getApprovedVideosOnce === 'function') {
            window.getApprovedVideosOnce()
                .then((videos) => {
                    mergeVideos(videos);
                    resolve();
                })
                .catch((error) => {
                    console.error('Error al cargar videos de colaboradores (una vez):', error);
                    resolve();
                });
        } else {
            resolve();
        }

        if (!collaboratorSubscriptionActive && typeof window.subscribeApprovedVideos === 'function') {
            collaboratorSubscriptionActive = true;

            window.subscribeApprovedVideos((videos) => {
                const changed = addFirebaseVideosToMediaDB(videos);

                if (changed) {
                    if (typeof window.refreshLikeroBadges === 'function') {
                        window.refreshLikeroBadges();
                    }
                    if (typeof window.refreshComentorBadges === 'function') {
                        window.refreshComentorBadges();
                    }

                    const updatedVideo = currentVideoId && typeof mediaDB !== 'undefined'
                        ? mediaDB.find(v => v.id === currentVideoId)
                        : null;

                    if (currentVideoId && updatedVideo) {
                        loadVideoById(currentVideoId);
                        loadRelatedVideosRandom(currentVideoId);
                    }
                }
            });
        }
    });

    return collaboratorInitialLoadPromise;
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    const id = getQueryParam('id');
    ensureCollaboratorVideosLoaded().then(() => {
        if (id) {
            // Registrar en historial y cargar datos
            pushToHistory(id);
            loadVideoById(id);
            loadRelatedVideosRandom(id);
            loadComments();
        }
    });
    
    // Event listener para el botón de comentario
    const submitCommentBtn = document.getElementById('submitComment');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', async function() {
            await addComment(null);
        });
    }
    
    // Auth state listener
    const checkAuth = () => {
        console.log('🔍 Verificando autenticación...');
        console.log('isUserLoggedIn function:', typeof window.isUserLoggedIn);
        console.log('getCurrentUser function:', typeof window.getCurrentUser);
        
        if (window.isUserLoggedIn && window.isUserLoggedIn()) {
            currentUser = window.getCurrentUser();
            console.log('✅ Usuario logueado:', currentUser);
            // Reload likes and comments when user logs in
            if (currentVideoId) {
                loadLikesDislikes(currentVideoId);
                loadComments();
            }
        } else {
            currentUser = null;
            console.log('❌ Usuario no logueado');
            // Reset like/dislike states when user logs out
            if (currentVideoId) {
                isLiked = false;
                isDisliked = false;
                updateLikeButtons();
            }
        }
    };
    
    // Función para verificar autenticación con reintentos
    const checkAuthWithRetry = (retries = 0) => {
        if (window.isUserLoggedIn && window.getCurrentUser) {
            checkAuth();
        } else if (retries < 10) {
            console.log(`🔄 Reintentando verificación de auth (${retries + 1}/10)...`);
            setTimeout(() => checkAuthWithRetry(retries + 1), 200);
        } else {
            console.log('❌ No se pudo verificar autenticación después de 10 intentos');
            currentUser = null;
        }
    };
    
    // Check immediately
    checkAuthWithRetry();
    
    // Listen for auth state changes
    if (window.addEventListener) {
        window.addEventListener('storage', checkAuth);
    }
    
    // También verificar cuando se hace clic en like/dislike
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            // Verificar auth antes de proceder
            setTimeout(checkAuth, 100);
        });
    }
    
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
            // Verificar auth antes de proceder
            setTimeout(checkAuth, 100);
        });
    }
});