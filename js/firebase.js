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
        
        // Agregar metadatos al video
        videoData.id = newVideoRef.key;
        videoData.timestamp = Date.now();
        videoData.status = 'pending';
        videoData.submittedAt = new Date().toISOString();
        videoData.submittedBy = getCurrentUser() ? getCurrentUser().email : 'anonymous';
        
        await set(newVideoRef, videoData);
        
        console.log('Video pendiente guardado exitosamente:', videoData);
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
        // Mover el video de pending a approved
        const approvedRef = dbRef(db, `videos/${videoId}`);
        const pendingRef = dbRef(db, `video-pending/${videoId}`);
        
        // Actualizar datos del video
        videoData.status = 'approved';
        videoData.approvedAt = new Date().toISOString();
        videoData.approvedBy = getCurrentUser() ? getCurrentUser().email : 'admin';
        
        // Guardar en videos aprobados
        await set(approvedRef, videoData);
        
        // Eliminar de pendientes
        await remove(pendingRef);
        
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

// Marcar Firebase como listo
window.firebaseReady = true;
console.log('Firebase functions exported to window');