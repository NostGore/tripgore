import { getDatabase, ref, get, set, push, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { app } from './firebase.js';
import { mediaDB } from '../database/mediaDB.js';
import { uservips } from '../database/uservips.js';

// Cargar el script de roles
const rolesScript = document.createElement('script');
rolesScript.src = 'js/roles.js';
document.head.appendChild(rolesScript);

// Inicializar servicios
const db = getDatabase(app);
const auth = getAuth(app);
let currentUser = null;

// Función para mostrar mensaje flotante de puntos
function mostrarMensajePuntos(puntos) {
  const mensaje = document.createElement('div');
  mensaje.className = 'puntos-mensaje';
  mensaje.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
    <span>Haz ganado ${puntos} ${puntos === 1 ? 'punto' : 'puntos'}</span>
  `;
  document.body.appendChild(mensaje);
  
  // Animar entrada
  setTimeout(() => mensaje.classList.add('show'), 10);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    mensaje.classList.remove('show');
    setTimeout(() => mensaje.remove(), 300);
  }, 3000);
}

// Función para actualizar puntos en Firebase
async function actualizarPuntos(incremento) {
  if (!currentUser) return;
  
  try {
    const emailKey = currentUser.email.split('@')[0];
    const userRef = ref(db, `puntos/${emailKey}`);
    const snapshot = await get(userRef);
    
    let puntosActuales = 0;
    let username = emailKey;
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      puntosActuales = data.puntos || 0;
      username = data.username || emailKey;
    }
    
    // Actualizar puntos
    await set(userRef, {
      puntos: puntosActuales + incremento,
      username: username
    });
    
    // Mostrar mensaje flotante
    mostrarMensajePuntos(incremento);
    
    // Actualizar el valor de puntos en el login-box si existe
    const pointsValue = document.querySelector('.points-value');
    if (pointsValue) {
      pointsValue.textContent = puntosActuales + incremento;
    }
  } catch (error) {
    console.error('Error al actualizar puntos:', error);
  }
}

// Obtener ID del video desde la URL
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id');

console.log('Video ID:', videoId); // Debug

// Verificar estado de autenticación
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  // El manejo del UI del login-box se hace en auth-state.js
});

// Cargar datos del video
async function cargarVideo() {
  if (!videoId) {
    console.error('No se proporcionó un ID de video');
    alert('No se especificó un video para mostrar');
    return;
  }

  try {
    console.log('mediaDB cargado:', mediaDB); // Debug

    // Buscar el video por ID en mediaDB local
    let video = mediaDB.find(v => v.id === videoId);

    // Si no se encuentra en mediaDB, buscar en Firebase
    if (!video) {
      console.log('Video no encontrado en mediaDB, buscando en Firebase...'); // Debug
      const videosRef = ref(db, 'videos');
      const snapshot = await get(videosRef);

      if (snapshot.exists()) {
        const videosFirebase = snapshot.val();
        // Buscar el video por el campo 'id' dentro de cada objeto
        video = Object.values(videosFirebase).find(v => v.id === videoId);
        console.log('Video encontrado en Firebase:', video); // Debug
      }
    }

    if (!video) {
      console.error('Video no encontrado:', videoId);
      alert('Video no encontrado');
      return;
    }

    console.log('Video encontrado:', video); // Debug

    // Actualizar información del video en la página
    const videoTitle = document.querySelector('.video-title');
    const videoDate = document.querySelector('.video-date');
    const authorName = document.querySelector('.author-name');
    const iframe = document.querySelector('.video-player iframe');
    const authorAvatar = document.querySelector('.author-avatar');
    const ogImageMeta = document.querySelector('meta[property="og:image"]');

    if (videoTitle) videoTitle.textContent = video.titulo;
    if (videoDate) videoDate.textContent = video.fecha;
    if (authorName) authorName.textContent = video.autor;
    
    // Actualizar título de la página/pestaña
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = `${video.titulo} - TripGore`;
    } else {
      document.title = `${video.titulo} - TripGore`;
    }

    // Cargar el video en el iframe
    if (iframe) {
      iframe.src = video.video;
      console.log('Video cargado en iframe:', video.video); // Debug
    }

    // Si hay una portada, actualizar la imagen del autor y la og:image
    if (video.portada) {
      if (authorAvatar) {
        authorAvatar.src = video.portada;
      }
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', video.portada);
      }
    }

    // Cargar likes y dislikes
    cargarLikesYDislikes();

    // Cargar comentarios
    cargarComentarios();

  } catch (error) {
    console.error('Error al cargar el video:', error);
    alert('Error al cargar el video: ' + error.message);
  }
}

// Cargar likes y dislikes
function cargarLikesYDislikes() {
  const likesRef = ref(db, `likes/${videoId}`);

  onValue(likesRef, (snapshot) => {
    const data = snapshot.val();
    let likesCount = 0;
    let dislikesCount = 0;

    console.log('Datos de likes:', data); // Debug

    if (data) {
      Object.values(data).forEach(item => {
        if (item.type === 'like') {
          likesCount++;
        } else if (item.type === 'dislike') {
          dislikesCount++;
        }
      });
    }

    // Actualizar contadores en la página
    const likeCountEl = document.querySelector('.like-count');
    const dislikeCountEl = document.querySelector('.dislike-count');

    if (likeCountEl) likeCountEl.textContent = likesCount;
    if (dislikeCountEl) dislikeCountEl.textContent = dislikesCount;

    // Verificar si el usuario actual ya dio like o dislike
    if (currentUser && data && data[currentUser.uid]) {
      const userReaction = data[currentUser.uid].type;
      const likeBtn = document.querySelector('.like-btn');
      const dislikeBtn = document.querySelector('.dislike-btn');

      if (userReaction === 'like' && likeBtn) {
        likeBtn.classList.add('active');
      } else if (userReaction === 'dislike' && dislikeBtn) {
        dislikeBtn.classList.add('active');
      }
    }
  });
}

// Función para mostrar el modal de advertencia
function mostrarModalAdvertencia() {
  const modal = document.getElementById('auth-warning-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Función para cerrar el modal
function cerrarModalAdvertencia() {
  const modal = document.getElementById('auth-warning-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Evento para cerrar el modal
const closeModalBtn = document.getElementById('close-auth-modal');
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', cerrarModalAdvertencia);
}

// Cerrar modal al hacer click fuera de él
const authModal = document.getElementById('auth-warning-modal');
if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      cerrarModalAdvertencia();
    }
  });
}

// Manejar click en like
const likeBtn = document.querySelector('.like-btn');
if (likeBtn) {
  likeBtn.addEventListener('click', async () => {
    if (!currentUser) {
      mostrarModalAdvertencia();
      return;
    }

    const likeRef = ref(db, `likes/${videoId}/${currentUser.uid}`);

    try {
      const snapshot = await get(likeRef);
      const existingReaction = snapshot.val();

      if (existingReaction && existingReaction.type === 'like') {
        // Si ya dio like, removerlo y restar punto
        await set(likeRef, null);
        likeBtn.classList.remove('active');
        await actualizarPuntos(-1);
      } else {
        // Agregar o cambiar a like
        await set(likeRef, {
          userId: currentUser.uid,
          username: currentUser.displayName || currentUser.email,
          type: 'like',
          timestamp: Date.now()
        });
        likeBtn.classList.add('active');
        const dislikeBtn = document.querySelector('.dislike-btn');
        if (dislikeBtn) dislikeBtn.classList.remove('active');
        
        // Dar 1 punto solo si no tenía ninguna reacción previa
        if (!existingReaction) {
          await actualizarPuntos(1);
        }
      }
    } catch (error) {
      console.error('Error al dar like:', error);
      alert('Error al dar like');
    }
  });
}

// Manejar click en dislike
const dislikeBtn = document.querySelector('.dislike-btn');
if (dislikeBtn) {
  dislikeBtn.addEventListener('click', async () => {
    if (!currentUser) {
      mostrarModalAdvertencia();
      return;
    }

    const dislikeRef = ref(db, `likes/${videoId}/${currentUser.uid}`);

    try {
      const snapshot = await get(dislikeRef);
      const existingReaction = snapshot.val();

      if (existingReaction && existingReaction.type === 'dislike') {
        // Si ya dio dislike, removerlo y restar punto
        await set(dislikeRef, null);
        dislikeBtn.classList.remove('active');
        await actualizarPuntos(-1);
      } else {
        // Agregar o cambiar a dislike
        await set(dislikeRef, {
          userId: currentUser.uid,
          username: currentUser.displayName || currentUser.email,
          type: 'dislike',
          timestamp: Date.now()
        });
        dislikeBtn.classList.add('active');
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) likeBtn.classList.remove('active');
        
        // Dar 1 punto solo si no tenía ninguna reacción previa
        if (!existingReaction) {
          await actualizarPuntos(1);
        }
      }
    } catch (error) {
      console.error('Error al dar dislike:', error);
      alert('Error al dar dislike');
    }
  });
}

// Manejar click en compartir
const shareBtn = document.querySelector('.share-btn');
if (shareBtn) {
  const crearPanelCompartir = () => {
    let overlay = document.getElementById('share-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'share-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(0,0,0,0.7)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';

      const modal = document.createElement('div');
      modal.style.background = '#111';
      modal.style.padding = '1.5rem';
      modal.style.borderRadius = '8px';
      modal.style.maxWidth = '320px';
      modal.style.width = '90%';
      modal.style.color = '#fff';
      modal.style.fontFamily = "'Oswald', Arial, sans-serif";

      modal.innerHTML = `
        <h3 style="margin-top:0;margin-bottom:1rem;font-size:1.1rem;text-align:center;">Compartir video</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <button data-share="whatsapp" style="padding:0.6rem 1rem;border:none;border-radius:4px;background:#25D366;color:#fff;font-weight:600;cursor:pointer;">WhatsApp</button>
          <button data-share="telegram" style="padding:0.6rem 1rem;border:none;border-radius:4px;background:#0088cc;color:#fff;font-weight:600;cursor:pointer;">Telegram</button>
          <button data-share="twitter" style="padding:0.6rem 1rem;border:none;border-radius:4px;background:#1DA1F2;color:#fff;font-weight:600;cursor:pointer;">X / Twitter</button>
          <button data-share="facebook" style="padding:0.6rem 1rem;border:none;border-radius:4px;background:#1877f2;color:#fff;font-weight:600;cursor:pointer;">Facebook</button>
          <button data-share="copy" style="padding:0.6rem 1rem;border:none;border-radius:4px;background:#444;color:#fff;font-weight:600;cursor:pointer;">Copiar enlace</button>
          <button data-share="close" style="margin-top:0.5rem;padding:0.6rem 1rem;border:1px solid #666;border-radius:4px;background:transparent;color:#ccc;font-weight:600;cursor:pointer;">Cerrar</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.dataset.share === 'close') {
          overlay.remove();
        }
      });

      modal.querySelectorAll('button[data-share]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const action = e.currentTarget.getAttribute('data-share');
          if (action === 'close') {
            overlay.remove();
            return;
          }

          const url = window.location.href;
          const text = 'Mira este video en TripGore';

          try {
            let shareUrl = '';
            if (action === 'whatsapp') {
              shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            } else if (action === 'telegram') {
              shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            } else if (action === 'twitter') {
              shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            } else if (action === 'facebook') {
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (action === 'copy') {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
              } else {
                const dummy = document.createElement('input');
                dummy.value = url;
                document.body.appendChild(dummy);
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
              }
              alert('Enlace copiado al portapapeles');
              return;
            }

            if (shareUrl) {
              window.open(shareUrl, '_blank', 'noopener');
            }
          } catch (err) {
            console.error('Error al compartir:', err);
          }
        });
      });
    }
  };

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'Mira este video en TripGore',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        crearPanelCompartir();
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      crearPanelCompartir();
    }
  });
}

// Cargar comentarios
function cargarComentarios() {
  const commentsRef = ref(db, `comments/${videoId}`);

  onValue(commentsRef, (snapshot) => {
    const comments = snapshot.val();
    const commentsList = document.querySelector('.comments-list');
    const commentCountEl = document.querySelector('.comment-count');

    console.log('Comentarios cargados:', comments); // Debug

    if (!commentsList) return;

    // Actualizar contador de comentarios
    const commentCount = comments ? Object.keys(comments).length : 0;
    if (commentCountEl) commentCountEl.textContent = `(${commentCount})`;

    // Limpiar lista de comentarios
    commentsList.innerHTML = '';

    if (!comments) {
      return;
    }

    // Crear un mapa de comentarios por ID para acceso rápido
    const commentsMap = {};
    Object.values(comments).forEach(comment => {
      commentsMap[comment.id] = comment;
    });

    // Organizar comentarios por jerarquía
    const mainComments = [];
    const repliesMap = {};

    Object.values(comments).forEach(comment => {
      if (!comment.parentId) {
        mainComments.push(comment);
      } else {
        if (!repliesMap[comment.parentId]) {
          repliesMap[comment.parentId] = [];
        }
        repliesMap[comment.parentId].push(comment);
      }
    });

    // Ordenar comentarios principales por timestamp (más recientes primero)
    mainComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Ordenar respuestas por timestamp (más recientes primero)
    Object.keys(repliesMap).forEach(parentId => {
      repliesMap[parentId].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    });

    // Función recursiva para renderizar comentarios y sus respuestas
    const renderCommentWithReplies = async (comment, level = 0) => {
      // Obtener el autor del comentario padre si existe
      let parentAuthor = null;
      if (comment.parentId && commentsMap[comment.parentId]) {
        parentAuthor = commentsMap[comment.parentId].autor;
      }

      const commentElement = await crearElementoComentario(comment, level > 0, level, parentAuthor);
      commentsList.appendChild(commentElement);

      // Renderizar respuestas de forma recursiva
      if (repliesMap[comment.id]) {
        for (const reply of repliesMap[comment.id]) {
          await renderCommentWithReplies(reply, level + 1);
        }
      }
    };

    // Renderizar comentarios principales y sus respuestas anidadas
    const renderComments = async () => {
      for (const comment of mainComments) {
        await renderCommentWithReplies(comment, 0);
      }
    };

    renderComments();
  });
}

// Crear elemento de comentario
async function crearElementoComentario(comment, isReply = false, level = 0, parentAuthor = null) {
  const commentDiv = document.createElement('div');
  commentDiv.className = isReply ? 'comment reply' : 'comment';
  commentDiv.dataset.commentId = comment.id;

  // Todas las respuestas tienen el mismo margen izquierdo (3rem)
  // No importa el nivel de anidación
  if (level > 0) {
    commentDiv.style.marginLeft = '3rem';
  }

  // Obtener puntos del usuario desde Firebase
  let userPoints = 0;
  if (comment.autor) {
    try {
      // Usar el nombre del autor directamente (sin @dominio)
      const userPointsRef = ref(db, `puntos/${comment.autor}`);
      const snapshot = await get(userPointsRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        // Acceder a la propiedad 'puntos' dentro del objeto
        userPoints = userData.puntos || 0;
      }
      console.log(`Puntos para ${comment.autor}:`, userPoints); // Debug
    } catch (error) {
      console.error('Error al obtener puntos del usuario:', error);
    }
  }

  // Construir el nombre del autor con la referencia al usuario padre si existe
  let authorDisplay = comment.autor;
  let replyArrow = '';
  if (parentAuthor) {
    authorDisplay = comment.autor;
    replyArrow = `<span class="reply-arrow">▸</span> ${parentAuthor}`;
  }

  // Obtener el badge del rol basado en puntos
  let roleBadge = '';
  if (typeof getRoleByPoints !== 'undefined' && typeof getRoleBadgeHTML !== 'undefined') {
    const role = getRoleByPoints(userPoints);
    roleBadge = getRoleBadgeHTML(role);
  }

  const rawAuthor = comment.autor || '';
  const normalizedAuthor = rawAuthor.includes('@') ? rawAuthor.split('@')[0] : rawAuthor;
  const isVip = Array.isArray(uservips) && uservips.some(entry => entry && entry.username === normalizedAuthor && entry.rol === 'vip');
  const authorClass = isVip ? 'comment-author rgb-username' : 'comment-author';

  commentDiv.innerHTML = `
    <img src="https://files.catbox.moe/4c4g7d.jpg" alt="Avatar" class="comment-avatar">
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author-info">
          ${roleBadge}
          <span class="${authorClass}">${authorDisplay}</span>
          ${replyArrow ? replyArrow : '<span class="comment-separator">▸</span>'}
          <span class="comment-points">
            <svg class="trophy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            ${Number(userPoints).toLocaleString('es-ES')}
          </span>
        </span>
        <span class="comment-date">${comment.fecha}</span>
      </div>
      <p class="comment-text">${comment.texto}</p>
      <div class="comment-actions">
        <button class="comment-reply" data-comment-id="${comment.id}">Responder</button>
      </div>
    </div>
  `;

  // Agregar evento al botón de responder
  const replyBtn = commentDiv.querySelector('.comment-reply');
  replyBtn.addEventListener('click', () => mostrarFormularioRespuesta(comment.id, comment.autor));

  return commentDiv;
}

// Función para mostrar el formulario de respuesta
function mostrarFormularioRespuesta(parentCommentId, parentAuthor) {
  if (!currentUser) {
    mostrarModalAdvertencia();
    return;
  }

  // Remover cualquier formulario de respuesta existente
  const existingForm = document.querySelector('.reply-form');
  if (existingForm) {
    existingForm.remove();
  }

  // Crear el formulario de respuesta
  const replyForm = document.createElement('div');
  replyForm.className = 'reply-form';
  replyForm.innerHTML = `
    <img src="https://files.catbox.moe/4c4g7d.jpg" alt="Tu avatar" class="comment-avatar">
    <div class="comment-input-wrapper">
      <div class="comment-toolbar">
        <button class="toolbar-btn" data-command="bold" title="Negrita"><b>B</b></button>
        <button class="toolbar-btn" data-command="italic" title="Cursiva"><i>I</i></button>
        <button class="toolbar-btn" data-command="underline" title="Subrayado"><u>U</u></button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-command="insertUnorderedList" title="Lista">• ≡</button>
        <button class="toolbar-btn" data-command="removeFormat" title="Limpiar formato">✕</button>
      </div>
      <div class="comment-input reply-input" contenteditable="true" data-placeholder="Responder a ${parentAuthor}..." data-empty="true"></div>
    </div>
    <div class="reply-form-actions">
      <button class="submit-reply-btn">Enviar</button>
      <button class="cancel-reply-btn">Cancelar</button>
    </div>
  `;

  // Insertar el formulario después del comentario padre
  const parentComment = document.querySelector(`[data-comment-id="${parentCommentId}"]`);
  if (parentComment) {
    parentComment.after(replyForm);

    // Configurar editor de respuesta
    const replyInput = replyForm.querySelector('.reply-input');
    const replyToolbarBtns = replyForm.querySelectorAll('.toolbar-btn');

    // Manejar placeholder
    const updateReplyPlaceholder = () => {
      if (replyInput.textContent.trim() === '') {
        replyInput.setAttribute('data-empty', 'true');
      } else {
        replyInput.removeAttribute('data-empty');
      }
    };

    replyInput.addEventListener('input', updateReplyPlaceholder);
    replyInput.addEventListener('focus', updateReplyPlaceholder);
    replyInput.addEventListener('blur', updateReplyPlaceholder);

    // Manejar botones de toolbar
    replyToolbarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.dataset.command;
        document.execCommand(command, false, null);
        replyInput.focus();
      });
    });

    // Focus en el editor
    replyInput.focus();

    // Evento para cancelar
    const cancelBtn = replyForm.querySelector('.cancel-reply-btn');
    cancelBtn.addEventListener('click', () => {
      replyForm.remove();
    });

    // Evento para enviar respuesta
    const submitBtn = replyForm.querySelector('.submit-reply-btn');
    submitBtn.addEventListener('click', async () => {
      const replyHTML = replyInput.innerHTML.trim();
      const replyText = replyInput.textContent.trim();

      if (!replyText) {
        alert('Por favor escribe una respuesta');
        return;
      }

      try {
        const commentsRef = ref(db, `comments/${videoId}`);
        const newReplyRef = push(commentsRef);

        const now = new Date();
        const fecha = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        await set(newReplyRef, {
          id: newReplyRef.key,
          parentId: parentCommentId,
          userId: currentUser.uid,
          autor: currentUser.displayName || currentUser.email.split('@')[0],
          texto: replyHTML, // Guardar HTML
          fecha: fecha,
          timestamp: Date.now()
        });

        // Remover el formulario
        replyForm.remove();

        // Dar 3 puntos por responder
        await actualizarPuntos(3);

        console.log('Respuesta agregada exitosamente');

      } catch (error) {
        console.error('Error al agregar respuesta:', error);
        alert('Error al agregar respuesta');
      }
    });
  }
}

// Configurar editor de texto enriquecido
const commentInput = document.querySelector('.comment-input[contenteditable]');
const toolbarBtns = document.querySelectorAll('.toolbar-btn');

if (commentInput) {
  // Mostrar/ocultar placeholder
  const updatePlaceholder = () => {
    if (commentInput.textContent.trim() === '') {
      commentInput.setAttribute('data-empty', 'true');
    } else {
      commentInput.removeAttribute('data-empty');
    }
  };

  commentInput.addEventListener('input', updatePlaceholder);
  commentInput.addEventListener('focus', updatePlaceholder);
  commentInput.addEventListener('blur', updatePlaceholder);

  // Aplicar estilos de placeholder con CSS
  const style = document.createElement('style');
  style.textContent = `
    .comment-input[contenteditable][data-empty="true"]:before {
      content: attr(data-placeholder);
      color: #999;
      position: absolute;
      pointer-events: none;
    }
    .comment-input[contenteditable] {
      position: relative;
    }
  `;
  document.head.appendChild(style);

  updatePlaceholder();
}

// Manejar botones de la barra de herramientas
toolbarBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const command = btn.dataset.command;
    document.execCommand(command, false, null);
    commentInput.focus();
  });
});

// Actualizar estado activo de botones
if (commentInput) {
  commentInput.addEventListener('mouseup', () => {
    toolbarBtns.forEach(btn => {
      const command = btn.dataset.command;
      if (document.queryCommandState(command)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });

  commentInput.addEventListener('keyup', () => {
    toolbarBtns.forEach(btn => {
      const command = btn.dataset.command;
      if (document.queryCommandState(command)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });
}

// Manejar envío de comentarios
const submitCommentBtn = document.querySelector('.submit-comment-btn');
if (submitCommentBtn) {
  submitCommentBtn.addEventListener('click', async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    const commentInputDiv = document.querySelector('.comment-input[contenteditable]');
    if (!commentInputDiv) return;

    // Obtener el HTML del contenido
    const commentHTML = commentInputDiv.innerHTML.trim();
    const commentText = commentInputDiv.textContent.trim();

    if (!commentText) {
      alert('Por favor escribe un comentario');
      return;
    }

    try {
      const commentsRef = ref(db, `comments/${videoId}`);
      const newCommentRef = push(commentsRef);

      const now = new Date();
      const fecha = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      await set(newCommentRef, {
        id: newCommentRef.key,
        userId: currentUser.uid,
        autor: currentUser.displayName || currentUser.email.split('@')[0],
        texto: commentHTML, // Guardar HTML en lugar de texto plano
        fecha: fecha,
        timestamp: Date.now()
      });

      // Limpiar input
      commentInputDiv.innerHTML = '';
      commentInputDiv.setAttribute('data-empty', 'true');

      // Dar 3 puntos por comentar
      await actualizarPuntos(3);

      console.log('Comentario agregado exitosamente'); // Debug

    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar comentario');
    }
  });
}

// Función para cargar otros videos aleatorios
async function cargarOtrosVideos() {
  const otrosVideosGrid = document.getElementById('other-videos-grid');
  if (!otrosVideosGrid) return;

  try {
    // Obtener videos de Firebase
    const videosRef = ref(db, 'videos');
    const snapshot = await get(videosRef);

    let todosLosVideos = [...mediaDB];

    if (snapshot.exists()) {
      const videosFirebase = Object.values(snapshot.val());
      // Combinar videos evitando duplicados
      const idsExistentes = new Set(mediaDB.map(v => v.id));
      const videosNuevos = videosFirebase.filter(v => !idsExistentes.has(v.id));
      todosLosVideos = [...mediaDB, ...videosNuevos];
    }

    // Filtrar el video actual
    const videosDisponibles = todosLosVideos.filter(v => v.id !== videoId);

    // Obtener 4 videos aleatorios
    const videosAleatorios = [];
    const indices = new Set();
    const maxVideos = 4; // Siempre mostrar 4 videos

    while (videosAleatorios.length < maxVideos && videosAleatorios.length < videosDisponibles.length) {
      const indiceAleatorio = Math.floor(Math.random() * videosDisponibles.length);
      if (!indices.has(indiceAleatorio)) {
        indices.add(indiceAleatorio);
        videosAleatorios.push(videosDisponibles[indiceAleatorio]);
      }
    }

    // Renderizar los videos
    otrosVideosGrid.innerHTML = '';
    videosAleatorios.forEach(video => {
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      videoCard.innerHTML = `
        <img src="${video.portada}" alt="${video.titulo}">
        <h3>${video.titulo}</h3>
        <div class="video-meta">
          <span class="date">${video.fecha}</span>
          <span class="author">${video.autor}</span>
        </div>
      `;

      // Agregar evento click
      videoCard.addEventListener('click', () => {
        window.location.href = `video.html?id=${video.id}`;
      });

      otrosVideosGrid.appendChild(videoCard);
    });

  } catch (error) {
    console.error('Error al cargar otros videos:', error);
  }
}

// Cargar Top Puntos desde Firebase
async function cargarTopPuntos() {
  try {
    const puntosRef = ref(db, 'puntos');
    const snapshot = await get(puntosRef);

    if (!snapshot.exists()) {
      console.log('No hay datos de puntos disponibles');
      return;
    }

    // Convertir los datos a un array y ordenar por puntos (descendente)
    const usuarios = Object.values(snapshot.val());
    const topUsuarios = usuarios
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 5); // Tomar solo los primeros 5

    // Encontrar el contenedor de Top Puntos en el sidebar
    const leaderboardSections = document.querySelectorAll('.leaderboard-section');
    let topPuntosSection = null;

    leaderboardSections.forEach(section => {
      const title = section.querySelector('h3');
      if (title && title.textContent.trim() === 'Top Puntos') {
        topPuntosSection = section;
      }
    });

    if (!topPuntosSection) return;

    const leaderboardList = topPuntosSection.querySelector('.leaderboard-list');
    if (!leaderboardList) return;

    // Limpiar contenido actual
    leaderboardList.innerHTML = '';

    // Renderizar los top 5 usuarios
    topUsuarios.forEach((usuario, index) => {
      const leaderboardItem = document.createElement('div');
      leaderboardItem.className = 'leaderboard-item';

      leaderboardItem.innerHTML = `
        <div class="rank-username">
          <span class="rank">#${index + 1}</span>
          <span class="separator">|</span>
          <span class="leaderboard-name">${usuario.username}</span>
        </div>
        <div class="points-container">
          <svg class="trophy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
          <span class="leaderboard-points">${Number(usuario.puntos).toLocaleString('es-ES')} puntos</span>
        </div>
      `;

      leaderboardList.appendChild(leaderboardItem);
    });

  } catch (error) {
    console.error('Error al cargar Top Puntos:', error);
  }
}

// Cargar Top Colaboradores desde mediaDB y Firebase
async function cargarTopColaboradores() {
  try {
    // Obtener videos de Firebase
    const videosRef = ref(db, 'videos');
    const snapshot = await get(videosRef);

    let todosLosVideos = [...mediaDB];

    if (snapshot.exists()) {
      const videosFirebase = Object.values(snapshot.val());
      // Combinar videos evitando duplicados
      const idsExistentes = new Set(mediaDB.map(v => v.id));
      const videosNuevos = videosFirebase.filter(v => !idsExistentes.has(v.id));
      todosLosVideos = [...mediaDB, ...videosNuevos];
    }

    // Contar videos por autor
    const conteoAutores = {};
    todosLosVideos.forEach(video => {
      if (video.autor && video.autor !== 'TripGore') {
        conteoAutores[video.autor] = (conteoAutores[video.autor] || 0) + 1;
      }
    });

    // Convertir a array y ordenar por cantidad de videos
    const topColaboradores = Object.entries(conteoAutores)
      .map(([autor, cantidad]) => ({ autor, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Encontrar el contenedor de Top Colaboradores
    const leaderboardSections = document.querySelectorAll('.leaderboard-section');
    let topColaboradoresSection = null;

    leaderboardSections.forEach(section => {
      const title = section.querySelector('h3');
      if (title && title.textContent.trim() === 'Top Colaboradores') {
        topColaboradoresSection = section;
      }
    });

    if (!topColaboradoresSection) return;

    const leaderboardList = topColaboradoresSection.querySelector('.leaderboard-list');
    if (!leaderboardList) return;

    // Limpiar contenido actual
    leaderboardList.innerHTML = '';

    // Renderizar los top 5 colaboradores
    topColaboradores.forEach((colaborador, index) => {
      const leaderboardItem = document.createElement('div');
      leaderboardItem.className = 'leaderboard-item';

      leaderboardItem.innerHTML = `
        <div class="rank-username">
          <span class="rank">#${index + 1}</span>
          <span class="separator">|</span>
          <span class="leaderboard-name">${colaborador.autor}</span>
        </div>
        <div class="points-container">
          <svg class="trophy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 21h20"></path>
            <path d="M3.5 21V7.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21"></path>
            <path d="M9.5 21V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21"></path>
            <path d="M15.5 21V10.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21"></path>
          </svg>
          <span class="leaderboard-points">${colaborador.cantidad} videos</span>
        </div>
      `;

      leaderboardList.appendChild(leaderboardItem);
    });

  } catch (error) {
    console.error('Error al cargar Top Colaboradores:', error);
  }
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarVideo();
  cargarOtrosVideos();
  cargarTopPuntos(); // Cargar Top Puntos desde Firebase
  cargarTopColaboradores(); // Cargar Top Colaboradores
  configurarComentarios();

  // Configurar modal de advertencia
  const modal = document.getElementById('auth-warning-modal');
  const closeBtn = document.getElementById('close-auth-modal');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
});