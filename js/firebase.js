// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDatabase, ref as dbRef, onValue, off, get, set, remove, push } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9xGNTqaPo2g41YkLowiYnE3Oj_w9e6P8",
    authDomain: "triplegore.firebaseapp.com",
    databaseURL: "https://triplegore-default-rtdb.firebaseio.com",
    projectId: "triplegore",
    storageBucket: "triplegore.firebasestorage.app",
    messagingSenderId: "324310616202",
    appId: "1:324310616202:web:b9db1a6eb90bd0d6de0573",
    measurementId: "G-P9J0XH1QLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// ------------------- Helpers -------------------

function slugifyTitle(value) {
    return String(value || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function createMediaId(title, originalId = '') {
    const base = slugifyTitle(title);
    const suffixSource = String(originalId || '')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()
        .slice(-5);
    const suffix = suffixSource ? `-${suffixSource}` : '';
    const id = `${base || 'video'}${suffix}`.replace(/(^-|-$)/g, '');
    return id || `video-${Date.now()}`;
}

function formatDateToDMY(value) {
    if (!value) {
        return formatDateToDMY(new Date());
    }

    if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length === 3) {
            const [d, m, y] = parts;
            const day = parseInt(d, 10) || 1;
            const month = (parseInt(m, 10) || 1) - 1;
            const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
            const dateObj = new Date(year, month, day);
            if (!Number.isNaN(dateObj.getTime())) {
                return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            }
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return `${parsed.getDate()}/${parsed.getMonth() + 1}/${parsed.getFullYear()}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '1/1/1970';
    }

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function parseMediaDate(value) {
    if (!value) return new Date(0);

    if (typeof value === 'string') {
        const parts = value.split('/');
        if (parts.length === 3) {
            const [d, m, y] = parts;
            const day = parseInt(d, 10) || 1;
            const month = (parseInt(m, 10) || 1) - 1;
            const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
            const parsed = new Date(year, month, day);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

function ensureCoverFromVideo(videoUrl = '', currentCover = '') {
    const cover = currentCover || '';
    if (cover && /\.(jpe?g|png|webp)$/i.test(cover)) {
        return cover;
    }

    if (!videoUrl) {
        return cover;
    }

    try {
        const url = new URL(videoUrl);
        const pathname = url.pathname.replace(/\.(mp4|mov|mkv)$/i, '.jpg');
        url.pathname = pathname;
        return url.toString();
    } catch (err) {
        return videoUrl.replace(/\.(mp4|mov|mkv)$/i, '.jpg');
    }
}

const RESERVED_SOURCE_KEYS = new Set([
    'id', 'titulo', 'title', 'nombre',
    'portada', 'thumbnail', 'cover',
    'video', 'videourl', 'url', 'link',
    'autor', 'author',
    'categoria', 'category',
    'fecha', 'date',
    'status',
    'submittedat', 'submittedby',
    'approvedat', 'approvedby',
    'idoriginal', 'origen',
    'timestamp', 'lastsyncedat'
]);

function extractAuthor(value) {
    if (!value) return 'Colaborador';
    const email = String(value).trim();
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email || 'Colaborador';
    const username = email.slice(0, atIndex);
    return username || email;
}

function createMediaEntry(source = {}, options = {}) {
    const {
        statusOverride,
        approvedAtOverride,
        approvedByOverride,
        idOverride,
        lastSyncedAtOverride
    } = options;

    const originalId = source.idOriginal || source.id || source.firebaseKey || source.key || '';
    const title = (source.titulo || source.title || source.nombre || 'Video sin título').toString();
    const id = idOverride || createMediaId(title, originalId);
    const videoUrl = source.video || source.videoUrl || source.url || source.link || '';
    const cover = ensureCoverFromVideo(videoUrl, source.portada || source.thumbnail || source.cover || '');
    const rawCategory = source.categoria || source.category || 'COLABORADORES';
    const category = String(rawCategory).trim().toUpperCase() || 'COLABORADORES';
    const authorEmail = source.autor || source.author || source.submittedBy || 'Colaborador';
    const author = extractAuthor(authorEmail);
    const status = statusOverride || source.status || 'pending';
    const submittedAt = source.submittedAt || new Date().toISOString();
    const submittedBy = source.submittedBy || authorEmail;
    const approvedAt = approvedAtOverride !== undefined
        ? approvedAtOverride
        : source.approvedAt || null;
    const approvedBy = approvedByOverride !== undefined
        ? approvedByOverride
        : source.approvedBy || null;

    const baseEntry = {
        id,
        titulo: title,
        portada: cover,
        video: videoUrl,
        autor: author,
        categoria: category,
        fecha: formatDateToDMY(source.fecha || source.date || source.fechaSubida || new Date())
    };

    const runtimeEntry = {
        ...baseEntry,
        link: videoUrl,
        title,
        category,
        status,
        submittedAt,
        submittedBy,
        approvedAt: approvedAt || null,
        approvedBy: approvedBy || null,
        origen: source.origen || 'colaboradores',
        idOriginal: originalId || id,
        timestamp: source.timestamp || Date.now(),
        lastSyncedAt: lastSyncedAtOverride || source.lastSyncedAt || null
    };

    return runtimeEntry;
}

function normalizeVideoForStorage(videoId, data = {}, options = {}) {
    return createMediaEntry({ ...data, idOriginal: videoId }, options);
}

function extractMediaRecord(entry) {
    return {
        id: entry.id,
        titulo: entry.titulo,
        portada: entry.portada,
        video: entry.video,
        autor: entry.autor,
        categoria: entry.categoria,
        fecha: entry.fecha
    };
}

function mapFirebaseVideoToMediaDB(videoId, data, statusOverride = 'approved') {
    const normalized = normalizeVideoForStorage(videoId, data, { statusOverride });
    return extractMediaRecord(normalized);
}

// Variable global para el usuario actual
let currentUser = null;

// Función para detectar cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario está logueado
        currentUser = user;
        console.log('Usuario logueado:', user.email);
        updateHeaderForLoggedUser(user);
    } else {
        // Usuario no está logueado
        currentUser = null;
        console.log('Usuario no logueado');
        updateHeaderForGuestUser();
    }
});

// Función para actualizar el encabezado cuando el usuario está logueado
function updateHeaderForLoggedUser(user) {
    const userActions = document.querySelector('.user-actions');
    const mobileUserProfile = document.querySelector('.mobile-user-profile');

    // Extraer el nombre de usuario del email (sin @gmail.com)
    const email = user.email;
    const username = email.split('@')[0];
    
    // Mostrar enlaces al perfil
    const profileLink = document.getElementById('profileLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    
    if (profileLink) {
        profileLink.style.display = 'inline-block';
    }
    if (mobileProfileLink) {
        mobileProfileLink.style.display = 'block';
    }

    // Actualizar perfil desktop
    if (userActions) {
        userActions.innerHTML = `
            <div class="user-profile">
                <div class="user-info">
                    <i class="fa-solid fa-user-circle user-icon"></i>
                    <span class="user-email">${username}</span>
                </div>
                <a href="perfil.html" class="logout-btn" style="text-decoration: none; margin-right: 10px;">
                    <i class="fa-solid fa-user"></i>
                    Perfil
                </a>
                <button class="logout-btn" onclick="logoutUser()">
                    <i class="fa-solid fa-sign-out-alt"></i>
                    Salir
                </button>
            </div>
        `;
    }

    // Actualizar perfil móvil
    if (mobileUserProfile) {
        mobileUserProfile.innerHTML = `
            <div class="user-profile">
                <div class="user-info">
                    <i class="fa-solid fa-user-circle user-icon"></i>
                    <span class="user-email">${username}</span>
                </div>
                <a href="perfil.html" class="logout-btn" style="text-decoration: none; margin-right: 10px;">
                    <i class="fa-solid fa-user"></i>
                    Perfil
                </a>
                <button class="logout-btn" onclick="logoutUser()">
                    <i class="fa-solid fa-sign-out-alt"></i>
                    Cerrar sesión
                </button>
            </div>
        `;
    }
}

// Función para actualizar el encabezado cuando el usuario no está logueado
function updateHeaderForGuestUser() {
    const userActions = document.querySelector('.user-actions');
    const mobileUserProfile = document.querySelector('.mobile-user-profile');

    // Ocultar enlaces al perfil
    const profileLink = document.getElementById('profileLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    
    if (profileLink) {
        profileLink.style.display = 'none';
    }
    if (mobileProfileLink) {
        mobileProfileLink.style.display = 'none';
    }

    // Actualizar perfil desktop
    if (userActions) {
        userActions.innerHTML = `
            <a href="auth/auth.html">Iniciar Sesión</a>
            <a href="auth/auth.html">Registrarse</a>
        `;
    }

    // Actualizar perfil móvil
    if (mobileUserProfile) {
        mobileUserProfile.innerHTML = `
            <div class="user-profile">
                <div class="user-info">
                    <i class="fa-solid fa-lock user-icon"></i>
                    <span class="user-email">No logueado</span>
                </div>
                <a href="auth/auth.html" class="logout-btn">
                    <i class="fa-solid fa-sign-in-alt"></i>
                    Iniciar sesión
                </a>
            </div>
        `;
    }
}

// Función para hacer logout
function logoutUser() {
    signOut(auth).then(() => {
        console.log('Usuario cerró sesión exitosamente');
        // El onAuthStateChanged se encargará de actualizar la UI
        window.location.reload(); // Recargar la página automáticamente
    }).catch((error) => {
        console.error('Error al desloguear:', error);
    });
}

// Función para obtener el usuario actual
function getCurrentUser() {
    return currentUser;
}

// Función para verificar si el usuario está logueado
function isUserLoggedIn() {
    return currentUser !== null;
}

// Función para registrar un nuevo usuario
async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuario registrado exitosamente:', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return { success: false, error: error.message };
    }
}

// Función para iniciar sesión
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuario logueado exitosamente:', userCredential.user.email);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return { success: false, error: error.message };
    }
}

// Función para redirigir después del login exitoso
function redirectAfterLogin() {
    // Redirigir específicamente a tripgore/index.html
    window.location.href = '../index.html';
}

// ------------------- Video Functions (basado en tripgore/function-scripts/firebase.js) -------------------

// Video management functions
const videoFunctions = {
  // Add comment to video
  addComment: async (videoId, commentText) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const commentsRef = dbRef(db, `comments/${videoId}`);
      const newCommentRef = push(commentsRef);

      // Get username from email
      const username = currentUser.email ? currentUser.email.split('@')[0] : 'Usuario';

      const comment = {
        texto: commentText,
        autor: username,
        fecha: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now(),
        id: newCommentRef.key
      };

      await set(newCommentRef, comment);
      return { success: true, commentId: newCommentRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get comments for a video
  getComments: (videoId, callback) => {
    const commentsRef = dbRef(db, `comments/${videoId}`);
    return onValue(commentsRef, (snapshot) => {
      const comments = [];
      snapshot.forEach((childSnapshot) => {
        comments.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Sort by timestamp (newest first)
      comments.sort((a, b) => b.timestamp - a.timestamp);
      callback(comments);
    });
  },

  // Add like to video
  addLike: async (videoId, isLike) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const userId = currentUser.uid;
      const likesRef = dbRef(db, `likes/${videoId}/${userId}`);

      // Get username from email
      const username = currentUser.email ? currentUser.email.split('@')[0] : 'Usuario';

      const likeData = {
        userId: userId,
        username: username,
        type: isLike ? 'like' : 'dislike',
        timestamp: Date.now()
      };

      await set(likesRef, likeData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove like/dislike from video
  removeLike: async (videoId) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const userId = currentUser.uid;
      const likesRef = dbRef(db, `likes/${videoId}/${userId}`);
      await remove(likesRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get likes for a video
  getLikes: (videoId, callback) => {
    const likesRef = dbRef(db, `likes/${videoId}`);
    return onValue(likesRef, (snapshot) => {
      const likes = [];
      const dislikes = [];
      let botLikesCount = 0;
      let botDislikesCount = 0;

      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const val = childSnapshot.val();
        if (typeof val === 'number') {
          // Contador de bot, p.ej. bot_agustin_like: 100
          if (key && key.endsWith('_like')) botLikesCount += val;
          else if (key && key.endsWith('_dislike')) botDislikesCount += val;
        } else if (val && typeof val === 'object') {
          if (val.type === 'like') likes.push(val);
          else dislikes.push(val);
        }
      });

      // Incluir los contadores de bot como totales adicionales
      callback({ likes, dislikes, botLikesCount, botDislikesCount });
    });
  },

  // Get user's like status for a video
  getUserLike: (videoId, userId, callback) => {
    const userLikeRef = dbRef(db, `likes/${videoId}/${userId}`);
    return onValue(userLikeRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  },

  // Add reply to comment
  addReply: async (videoId, parentCommentId, replyText) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const commentsRef = dbRef(db, `comments/${videoId}`);
      const newReplyRef = push(commentsRef);

      // Get username from email
      const username = currentUser.email ? currentUser.email.split('@')[0] : 'Usuario';

      const reply = {
        texto: replyText,
        autor: username,
        fecha: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now(),
        id: newReplyRef.key,
        parentId: parentCommentId
      };

      await set(newReplyRef, reply);
      return { success: true, replyId: newReplyRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ------------------- Video Pending Functions -------------------

// Función para subir un video pendiente
async function uploadPendingVideo(videoData) {
    try {
        const videosRef = dbRef(db, 'video-pending');
        const newVideoRef = push(videosRef);

        const now = new Date();
        const baseData = {
            ...videoData,
            status: 'pending',
            submittedAt: now.toISOString(),
            submittedBy: getCurrentUser() ? getCurrentUser().email : 'anonymous',
            approvedAt: null,
            approvedBy: null,
            timestamp: Date.now(),
            idOriginal: newVideoRef.key
        };

        const normalizedVideo = normalizeVideoForStorage(newVideoRef.key, baseData, {
            statusOverride: 'pending'
        });

        await set(newVideoRef, normalizedVideo);

        console.log('Video pendiente guardado exitosamente:', normalizedVideo);
        return { success: true, videoId: newVideoRef.key };
    } catch (error) {
        console.error('Error al guardar video pendiente:', error);
        return { success: false, error: error.message };
    }
}

// Función para obtener todos los videos pendientes
function getPendingVideos(callback) {
    const videosRef = dbRef(db, 'video-pending');
    return onValue(videosRef, (snapshot) => {
        const videos = [];
        snapshot.forEach((childSnapshot) => {
            videos.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Ordenar por timestamp (más recientes primero)
        videos.sort((a, b) => b.timestamp - a.timestamp);
        callback(videos);
    });
}

// Función para aprobar un video
async function approveVideo(videoId, videoData) {
    try {
        const now = new Date().toISOString();
        const publicRef = dbRef(db, `videos/${videoId}`);
        const pendingRef = dbRef(db, `video-pending/${videoId}`);

        let sourceData = videoData;
        if (!sourceData || Object.keys(sourceData).length === 0) {
            const pendingSnapshot = await get(pendingRef);
            if (pendingSnapshot.exists()) {
                sourceData = pendingSnapshot.val();
            }
        }

        const normalizedVideo = normalizeVideoForStorage(videoId, {
            ...sourceData,
            status: 'approved',
            lastSyncedAt: now
        }, {
            statusOverride: 'approved',
            approvedAtOverride: now,
            approvedByOverride: getCurrentUser() ? getCurrentUser().email : 'admin',
            lastSyncedAtOverride: now
        });

        await set(publicRef, extractMediaRecord(normalizedVideo));
        await remove(pendingRef);
        
        // Agregar 5 puntos al usuario que subió el video
        try {
            // Obtener el nombre de usuario del video
            const authorEmail = sourceData.submittedBy || sourceData.autor || normalizedVideo.autor || '';
            let username = '';
            
            // Extraer nombre de usuario del email
            if (authorEmail && authorEmail.includes('@')) {
                username = authorEmail.split('@')[0];
            } else if (authorEmail) {
                // Si ya es un nombre de usuario sin @, usarlo directamente
                username = authorEmail;
            }
            
            // Si tenemos un nombre de usuario válido, agregar los puntos
            if (username && typeof window.addPointsToUser === 'function') {
                const pointsResult = await window.addPointsToUser(username, 5);
                if (pointsResult.success) {
                    console.log(`✅ Se agregaron 5 puntos a ${username} por aprobar su video`);
                } else {
                    console.warn(`⚠️ No se pudieron agregar puntos a ${username}:`, pointsResult.error);
                }
            } else if (username) {
                console.warn(`⚠️ Función addPointsToUser no disponible para agregar puntos a ${username}`);
            }
        } catch (pointsError) {
            // No fallar la aprobación del video si hay error al agregar puntos
            console.error('Error al agregar puntos al aprobar video:', pointsError);
        }
        
        console.log('Video aprobado exitosamente:', videoId);
        return { success: true };
    } catch (error) {
        console.error('Error al aprobar video:', error);
        return { success: false, error: error.message };
    }
}

// Función para rechazar un video
async function rejectVideo(videoId, reason = '') {
    try {
        const rejectedRef = dbRef(db, `video-rejected/${videoId}`);
        const pendingRef = dbRef(db, `video-pending/${videoId}`);
        const publicRef = dbRef(db, `videos/${videoId}`);
        
        // Obtener datos del video pendiente
        const videoSnapshot = await get(pendingRef);
        if (!videoSnapshot.exists()) {
            return { success: false, error: 'Video no encontrado' };
        }
        
        const videoData = videoSnapshot.val();
        videoData.status = 'rejected';
        videoData.rejectedAt = new Date().toISOString();
        videoData.rejectedBy = getCurrentUser() ? getCurrentUser().email : 'admin';
        videoData.rejectionReason = reason;
        
        // Guardar en videos rechazados
        await set(rejectedRef, videoData);
        
        // Eliminar de pendientes
        await remove(pendingRef);
        await remove(publicRef);
        
        console.log('Video rechazado exitosamente:', videoId);
        return { success: true };
    } catch (error) {
        console.error('Error al rechazar video:', error);
        return { success: false, error: error.message };
    }
}

// Función para obtener un video específico
async function getVideoById(videoId) {
    try {
        const videoRef = dbRef(db, `video-pending/${videoId}`);
        const snapshot = await get(videoRef);
        
        if (snapshot.exists()) {
            return { success: true, video: { id: videoId, ...snapshot.val() } };
        } else {
            return { success: false, error: 'Video no encontrado' };
        }
    } catch (error) {
        console.error('Error al obtener video:', error);
        return { success: false, error: error.message };
    }
}

// ------------------- Collaborator Videos -------------------

function normalizeCollaboratorVideo(videoId, data = {}) {
    if (!videoId) {
        return null;
    }

    return normalizeVideoForStorage(videoId, data, {
        statusOverride: data.status || 'approved',
        approvedAtOverride: data.approvedAt || data.lastSyncedAt || null,
        approvedByOverride: data.approvedBy || null,
        lastSyncedAtOverride: data.lastSyncedAt || null
    });
}

function mergeCollaboratorVideosIntoMediaDB(videos) {
    if (typeof window === 'undefined') {
        return false;
    }

    if (!Array.isArray(videos) || videos.length === 0) {
        return false;
    }

    if (!Array.isArray(window.mediaDB)) {
        window.mediaDB = [];
    }

    window.collaboratorMeta = window.collaboratorMeta || new Map();

    let existingMap = new Map(window.mediaDB.map(video => [video.id, video]));
    const mapByOriginal = new Map();
    window.mediaDB.forEach(video => {
        if (!video) return;
        const meta = window.collaboratorMeta.get(video.id);
        if (meta && meta.idOriginal) {
            mapByOriginal.set(meta.idOriginal, video);
        }
    });
    let changed = false;

    const normalizeEntry = (video) => {
        if (!video) return null;

        const record = normalizeCollaboratorVideo(video.idOriginal || video.id, video);
        window.collaboratorMeta.set(record.id, {
            idOriginal: record.idOriginal,
            status: record.status,
            submittedAt: record.submittedAt,
            submittedBy: record.submittedBy,
            approvedAt: record.approvedAt,
            approvedBy: record.approvedBy,
            origen: record.origen,
            timestamp: record.timestamp
        });
        return record;
    };

    videos.forEach(rawVideo => {
        if (!rawVideo) return;
        const candidateId = rawVideo.idOriginal || rawVideo.id;
        const normalized = normalizeCollaboratorVideo(candidateId, rawVideo);
        if (!normalized || !normalized.id || normalized.origen !== 'colaboradores') return;

        let current = mapByOriginal.get(normalized.idOriginal) || existingMap.get(normalized.id);
        if (current) {
            const normalizedCurrent = normalizeEntry({ ...current, ...normalized });
            Object.assign(current, normalizedCurrent);
            existingMap.set(current.id, current);
            if (current.idOriginal) {
                mapByOriginal.set(current.idOriginal, current);
            }
        } else {
            const normalizedEntry = normalizeEntry(normalized);

            if (existingMap.has(normalizedEntry.id)) {
                const existingBackup = existingMap.get(normalizedEntry.id);
                const merged = { ...existingBackup, ...normalizedEntry };
                const index = window.mediaDB.findIndex(video => video.id === normalizedEntry.id);

                if (index !== -1) {
                    window.mediaDB[index] = merged;
                }

                existingMap.set(normalizedEntry.id, merged);
                if (normalizedEntry.idOriginal) {
                    mapByOriginal.set(normalizedEntry.idOriginal, merged);
                }
            } else {
                window.mediaDB.push(normalizedEntry);
                existingMap.set(normalizedEntry.id, normalizedEntry);
                if (normalizedEntry.idOriginal) {
                    mapByOriginal.set(normalizedEntry.idOriginal, normalizedEntry);
                }
            }
        }

        changed = true;
    });

    if (changed) {
        const normalizedList = window.mediaDB
            .map(normalizeEntry)
            .filter(Boolean);

        const visible = normalizedList.filter(video => video.categoria !== 'OCULTO');
        const hidden = normalizedList.filter(video => video.categoria === 'OCULTO');

        visible.sort((a, b) => {
            const dateA = parseMediaDate(a.fecha || '01/01/1970');
            const dateB = parseMediaDate(b.fecha || '01/01/1970');
            return dateB - dateA;
        });

        const ordered = [...visible, ...hidden];
        window.mediaDB = ordered.map(extractMediaRecord);

    }

    return changed;
}

async function getApprovedVideosOnce() {
    try {
        const videosRef = dbRef(db, 'videos');
        const snapshot = await get(videosRef);
        const videos = [];
        snapshot.forEach(childSnapshot => {
            const record = mapFirebaseVideoToMediaDB(childSnapshot.key, childSnapshot.val(), 'approved');
            if (record) {
                videos.push(record);
            }
        });
        return videos.sort((a, b) => parseMediaDate(b.fecha) - parseMediaDate(a.fecha));
    } catch (error) {
        console.error('Error al obtener videos aprobados:', error);
        return [];
    }
}

function subscribeApprovedVideos(callback) {
    const videosRef = dbRef(db, 'videos');
    return onValue(videosRef, (snapshot) => {
        const videos = [];
        snapshot.forEach(childSnapshot => {
            const record = mapFirebaseVideoToMediaDB(childSnapshot.key, childSnapshot.val(), 'approved');
            if (record) {
                videos.push(record);
            }
        });
        videos.sort((a, b) => parseMediaDate(b.fecha) - parseMediaDate(a.fecha));
        callback(videos);
    });
}

async function sanitizeApprovedVideos() {
    try {
        const videosSnapshot = await get(dbRef(db, 'videos'));
        const updates = {};

        videosSnapshot.forEach(childSnapshot => {
            const record = mapFirebaseVideoToMediaDB(childSnapshot.key, childSnapshot.val(), 'approved');
            if (record) {
                updates[childSnapshot.key] = record;
            }
        });

        await set(dbRef(db, 'videos'), updates);
        const total = Object.keys(updates).length;
        console.log('Videos aprobados sanitizados:', total);
        return { success: true, count: total };
    } catch (error) {
        console.error('Error al sanitizar videos aprobados:', error);
        return { success: false, error: error.message };
    }
}

// Exportar funciones para uso global
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.redirectAfterLogin = redirectAfterLogin;
window.videoFunctions = videoFunctions;
window.uploadPendingVideo = uploadPendingVideo;
window.getPendingVideos = getPendingVideos;
window.approveVideo = approveVideo;
window.rejectVideo = rejectVideo;
window.getVideoById = getVideoById;
window.getApprovedVideosOnce = getApprovedVideosOnce;
window.subscribeApprovedVideos = subscribeApprovedVideos;
window.mapFirebaseVideoToMediaDB = mapFirebaseVideoToMediaDB;
window.sanitizeApprovedVideos = sanitizeApprovedVideos;

// Exportar la base de datos para uso global
window.db = db;

// Marcar Firebase como listo
window.firebaseReady = true;
window.firebaseInitTime = Date.now();
console.log('Firebase functions exported to window');