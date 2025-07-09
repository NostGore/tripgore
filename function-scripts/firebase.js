// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";
import { getDatabase, ref, push, set, get, onValue, remove, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9xGNTqaPo2g41YkLowiYnE3Oj_w9e6P8",
  authDomain: "triplegore.firebaseapp.com",
  projectId: "triplegore",
  storageBucket: "triplegore.firebasestorage.app",
  messagingSenderId: "324310616202",
  appId: "1:324310616202:web:b9db1a6eb90bd0d6de0573",
  measurementId: "G-P9J0XH1QLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Export additional Firebase functions
export { getDatabase, ref, get, onValue, query, orderByChild, limitToLast };
const realtimeDb = getDatabase(app);

// Authentication functions
export const authFunctions = {
  // Register new user
  register: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return auth.currentUser !== null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Function to get username from email (without @ and domain)
export const getUsernameFromEmail = (email) => {
  if (!email) return "Invitado";
  return email.split('@')[0];
};

// Function to update user display across all pages
export const updateUserDisplay = async () => {
  const userElement = document.getElementById('userDisplay');
  if (userElement) {
    // Force check auth state
    return new Promise((resolve) => {
      const unsubscribe = authFunctions.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          const username = getUsernameFromEmail(currentUser.email);

          // Importar funciones de roles y cargar foto de perfil
          try {
            const { getUserRoleTagWithSize } = await import('./rolesDB.js');
            const roleData = getUserRoleTagWithSize(username);

            // Cargar foto de perfil desde Firebase
            let profilePicture = '';
            try {
              const profileRef = ref(realtimeDb, `perfil/${currentUser.uid}/fotoPerfil`);
              const profileSnapshot = await get(profileRef);
              if (profileSnapshot.exists()) {
                profilePicture = `<img src="${profileSnapshot.val()}" alt="perfil" style="width: 25px; height: 25px; border-radius: 50%; margin-right: 8px; vertical-align: middle; object-fit: cover; border: 1px solid #DC143C;">`;
              }
            } catch (profileError) {
              console.log('No se pudo cargar foto de perfil:', profileError);
            }

            if (roleData) {
              userElement.innerHTML = `${profilePicture}<img src="${roleData.etiqueta}" alt="role" style="width: ${roleData.ancho}; height: ${roleData.alto}; margin-right: 5px; vertical-align: middle;"><i class="fa-solid fa-user"></i> ${username}`;
            } else {
              userElement.innerHTML = `${profilePicture}<i class="fa-solid fa-user"></i> ${username}`;
            }
          } catch (error) {
            userElement.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;
          }

          userElement.style.color = '#FFB6C1';
          userElement.style.cursor = 'default';
        } else {
          userElement.innerHTML = `<i class="fa-solid fa-user"></i> Invitado`;
          userElement.style.color = '#cccccc';
          userElement.style.cursor = 'default';
        }
        unsubscribe();
        resolve();
      });
    });
  }
};

// Dropdown functionality removed

// Global auth state verification
export const verifyAuthState = () => {
  return new Promise((resolve) => {
    const unsubscribe = authFunctions.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Initialize auth state listener
authFunctions.onAuthStateChanged((user) => {
  updateUserDisplay();
});

// Video management functions
export const videoFunctions = {
  // Submit video for approval
  submitVideo: async (videoData) => {
    try {
      const currentUser = authFunctions.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const videoRef = ref(realtimeDb, 'pending_videos');
      const newVideoRef = push(videoRef);

      // Get username from email
      const username = getUsernameFromEmail(currentUser.email);

      const videoWithMetadata = {
        ...videoData,
        autor: username,
        fecha: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now(),
        status: 'pending',
        id: newVideoRef.key
      };

      await set(newVideoRef, videoWithMetadata);
      return { success: true, videoId: newVideoRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get pending videos for moderation
  getPendingVideos: (callback) => {
    const videosRef = ref(realtimeDb, 'pending_videos');
    return onValue(videosRef, (snapshot) => {
      const videos = [];
      snapshot.forEach((childSnapshot) => {
        videos.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(videos);
    });
  },

  // Approve video
  approveVideo: async (videoId, videoData) => {
    try {
      // Add to approved videos
      const approvedRef = ref(realtimeDb, `approved_videos/${videoId}`);
      await set(approvedRef, {
        ...videoData,
        status: 'approved',
        approvedAt: new Date().toLocaleDateString('es-ES')
      });

      // Remove from pending
      const pendingRef = ref(realtimeDb, `pending_videos/${videoId}`);
      await remove(pendingRef);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reject video
  rejectVideo: async (videoId) => {
    try {
      const pendingRef = ref(realtimeDb, `pending_videos/${videoId}`);
      await remove(pendingRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get approved videos by category
  getApprovedVideosByCategory: (category, callback) => {
    const videosRef = ref(realtimeDb, 'approved_videos');
    return onValue(videosRef, (snapshot) => {
      const videos = [];
      snapshot.forEach((childSnapshot) => {
        const video = childSnapshot.val();
        if (video.categoria && video.categoria.toUpperCase().includes(category.toUpperCase())) {
          videos.push({
            id: childSnapshot.key,
            ...video
          });
        }
      });
      callback(videos);
    });
  },

  // Get all approved videos
  getAllApprovedVideos: (callback) => {
    const videosRef = ref(realtimeDb, 'approved_videos');
    return onValue(videosRef, (snapshot) => {
      const videos = [];
      snapshot.forEach((childSnapshot) => {
        videos.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(videos);
    });
  },

  // Get video by ID
  getVideoById: (videoId, callback) => {
    const videoRef = ref(realtimeDb, `approved_videos/${videoId}`);
    return onValue(videoRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.key,
          ...snapshot.val()
        });
      } else {
        callback(null);
      }
    });
  },

  // Get random videos excluding current video
  getRandomVideos: (count, excludeId, callback) => {
    const videosRef = ref(realtimeDb, 'approved_videos');
    return onValue(videosRef, (snapshot) => {
      const videos = [];
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.key !== excludeId) {
          videos.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        }
      });

      // Shuffle and take requested count
      const shuffled = videos.sort(() => 0.5 - Math.random());
      callback(shuffled.slice(0, count));
    });
  },

  // Add comment to video
  addComment: async (videoId, commentText) => {
    try {
      const currentUser = authFunctions.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const commentsRef = ref(realtimeDb, `comments/${videoId}`);
      const newCommentRef = push(commentsRef);

      // Get username from email
      const username = getUsernameFromEmail(currentUser.email);

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
    const commentsRef = ref(realtimeDb, `comments/${videoId}`);
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

  // Delete approved video
  deleteApprovedVideo: async (videoId) => {
    try {
      // Remove from approved videos
      const approvedRef = ref(realtimeDb, `approved_videos/${videoId}`);
      await remove(approvedRef);

      // Also remove associated comments
      const commentsRef = ref(realtimeDb, `comments/${videoId}`);
      await remove(commentsRef);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add like to video
  addLike: async (videoId, isLike) => {
    try {
      const currentUser = authFunctions.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const userId = currentUser.uid;
      const likesRef = ref(realtimeDb, `likes/${videoId}/${userId}`);

      // Get username from email
      const username = getUsernameFromEmail(currentUser.email);

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
      const currentUser = authFunctions.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const userId = currentUser.uid;
      const likesRef = ref(realtimeDb, `likes/${videoId}/${userId}`);
      await remove(likesRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get likes for a video
  getLikes: (videoId, callback) => {
    const likesRef = ref(realtimeDb, `likes/${videoId}`);
    return onValue(likesRef, (snapshot) => {
      const likes = [];
      const dislikes = [];

      snapshot.forEach((childSnapshot) => {
        const like = childSnapshot.val();
        if (like.type === 'like') {
          likes.push(like);
        } else {
          dislikes.push(like);
        }
      });

      callback({ likes, dislikes });
    });
  },

  // Get user's like status for a video
  getUserLike: (videoId, userId, callback) => {
    const userLikeRef = ref(realtimeDb, `likes/${videoId}/${userId}`);
    return onValue(userLikeRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  }
};

// Username management functions
// Removed username management functions

// Update the getUsernameFromEmail function to check the database first
//Removed username data checking
// Report management functions
export const reportFunctions = {
  // Submit report
  submitReport: async (reportData) => {
    try {
      const currentUser = authFunctions.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const reportRef = ref(realtimeDb, 'reportes');
      const newReportRef = push(reportRef);

      // Get username from email
      const username = getUsernameFromEmail(currentUser.email);

      const reportWithMetadata = {
        ...reportData,
        autor: username,
        usuarioId: currentUser.uid,
        fecha: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now(),
        status: 'pending',
        id: newReportRef.key
      };

      await set(newReportRef, reportWithMetadata);
      return { success: true, reportId: newReportRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get pending reports for moderation
  getPendingReports: (callback) => {
    const reportsRef = ref(realtimeDb, 'reportes');
    return onValue(reportsRef, (snapshot) => {
      const reports = [];
      snapshot.forEach((childSnapshot) => {
        reports.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(reports);
    });
  },

  // Mark report as resolved
  resolveReport: async (reportId) => {
    try {
      const reportRef = ref(realtimeDb, `reportes/${reportId}`);
      await set(reportRef, {
        ...await get(reportRef).then(snapshot => snapshot.val()),
        status: 'resolved',
        resolvedAt: new Date().toLocaleDateString('es-ES')
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const reportRef = ref(realtimeDb, `reportes/${reportId}`);
      await remove(reportRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Export Firebase services for use in other files
export { app, analytics, db, storage, auth, realtimeDb };