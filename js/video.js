// Variables globales
let currentUser = null;
let currentVideoId = null;
let isLiked = false;
let isDisliked = false;
let isFavorited = false;
let isPlaying = false;

// Reproductor por iframe: no se requiere lógica de play/pause manual

// Función para toggle like
async function toggleLike() {
    if (!currentUser) {
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
    if (!currentUser) {
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
    // excluir OCULTO
    const video = mediaDB.find(v => v.id === videoId && v.categoria !== 'OCULTO');
    if (!video) {
        console.error('Video no encontrado o es OCULTO');
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
        
        if (likeCount) likeCount.textContent = data.likes.length;
        if (dislikeCount) dislikeCount.textContent = data.dislikes.length;
    });
    
    // Load user's like status
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
}

// Cargar videos relacionados aleatorios desde mediaDB
function loadRelatedVideosRandom(currentId) {
    if (typeof mediaDB === 'undefined') return;
    const candidates = mediaDB.filter(v => v.categoria !== 'OCULTO' && v.id !== currentId);
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

// Obtener un ID aleatorio excluyendo OCULTO y el actual
function getRandomVideoId(excludeId) {
    if (typeof mediaDB === 'undefined') return null;
    const candidates = mediaDB.filter(v => v.categoria !== 'OCULTO' && v.id !== excludeId);
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

// Cargar comentarios desde Firebase
function loadComments() {
    if (!currentVideoId || !window.videoFunctions) return;

    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    // Mostrar estado de carga
    commentsList.innerHTML = `
        <div class="no-comments">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>Cargando comentarios...</p>
        </div>
    `;

    // Load comments from Firebase
    window.videoFunctions.getComments(currentVideoId, (comments) => {
        if (!comments || comments.length === 0) {
        commentsList.innerHTML = `
                    <div class="no-comments">
                        <i class="fa-solid fa-comment-slash"></i>
                        <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                    </div>
                `;
        return;
    }

        // Filter main comments (not replies)
        const mainComments = comments.filter(comment => !comment.parentId);
        
        let commentsHTML = '';
        mainComments.forEach(comment => {
            // Get replies for this comment
            const replies = comments.filter(reply => reply.parentId === comment.id);
            
            commentsHTML += `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">${comment.autor}</span>
                        <span class="comment-date">${comment.fecha}</span>
                    </div>
                    <div class="comment-text">${comment.texto}</div>
                    <div class="comment-actions">
                        <button class="reply-btn" onclick="showReplyForm('${comment.id}')">
                            <i class="fa-solid fa-reply"></i> Responder
                        </button>
                    </div>
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                        <textarea class="reply-input" placeholder="Escribe tu respuesta..."></textarea>
                        <div>
                            <button class="reply-submit-btn" onclick="submitReply('${comment.id}')">
                                <i class="fa-solid fa-reply"></i> Responder
                            </button>
                            <button class="reply-cancel-btn" onclick="hideReplyForm('${comment.id}')">
                                Cancelar
                            </button>
                        </div>
                    </div>
                    ${replies.map(reply => `
                        <div class="reply-comment">
                            <div class="comment-header">
                                <span class="comment-author">${reply.autor}</span>
                                <span class="comment-date">${reply.fecha}</span>
                            </div>
                            <div class="comment-text">${reply.texto}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        commentsList.innerHTML = commentsHTML;
    });
}

function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => { map[c.id] = { ...c, children: [] }; });
    comments.forEach(c => {
        if (c.parentId) {
            if (map[c.parentId]) map[c.parentId].children.push(map[c.id]);
            else roots.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });
    return roots;
}

function renderCommentTree(nodes, level = 0) {
    return nodes.map(node => `
                <div class="comment-item" style="margin-left:${level * 16}px;">
                    <div class="comment-header">
                        <span class="comment-author">${node.author}</span>
                        <span class="comment-date">${node.date}</span>
                    </div>
                    <div class="comment-text">${node.text}</div>
                    <div style="margin-top:8px;">
                        <button class="reply-btn" onclick="showReplyForm(${node.id})">
                            <i class="fa-solid fa-reply"></i>
                            Responder
                        </button>
                    </div>
                    <div id="reply-form-${node.id}" style="display:none; margin-top:10px;">
                        <div class="comment-input-group">
                            <textarea class="comment-input" id="reply-input-${node.id}" placeholder="Escribe tu respuesta..." rows="2"></textarea>
                            <button class="reply-submit-btn" onclick="submitReply(${node.id})">
                                <i class="fa-solid fa-reply"></i>
                                Responder
                            </button>
                        </div>
                    </div>
                    ${node.children && node.children.length ? renderCommentTree(node.children, level + 1) : ''}
                </div>
            `).join('');
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

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    const id = getQueryParam('id');
    if (id) {
        // Registrar en historial y cargar datos
        pushToHistory(id);
        loadVideoById(id);
        loadRelatedVideosRandom(id);
        loadComments();
    }
    
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
        }
    };
    
    // Check immediately
    checkAuth();
    
    // Check again after a short delay to ensure Firebase is loaded
    setTimeout(checkAuth, 1000);
    
    // Listen for auth state changes
    if (window.addEventListener) {
        window.addEventListener('storage', checkAuth);
    }
});