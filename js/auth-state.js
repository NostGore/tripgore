

import { app } from './firebase.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { uservips } from '../database/uservips.js';

const auth = getAuth(app);
const database = getDatabase(app);

// Cargar el script de roles
const rolesScript = document.createElement('script');
rolesScript.src = 'js/roles.js';
document.head.appendChild(rolesScript);

// Función para obtener los datos del usuario desde Firebase
async function getUserData(userEmail) {
  try {
    // Obtener el email sin el dominio (ej: "usuario" de "usuario@gmail.com")
    const emailKey = userEmail.split('@')[0];
    
    const userRef = ref(database, `puntos/${emailKey}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        username: data.username || emailKey,
        puntos: data.puntos || 0
      };
    } else {
      // Si el usuario no tiene datos, devolver valores por defecto
      return {
        username: emailKey,
        puntos: 0
      };
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return {
      username: '',
      puntos: 0
    };
  }
}

// Función para actualizar el UI según el estado de autenticación
function updateAuthUI() {
  const loginBoxes = document.querySelectorAll('.login-box');
  
  onAuthStateChanged(auth, async (user) => {
    loginBoxes.forEach(async loginBox => {
      if (user) {
        // Usuario autenticado - obtener datos desde Firebase usando el email
        const userData = await getUserData(user.email);
        const username = userData.username || user.displayName || user.email.split('@')[0];
        const points = userData.puntos;

        const emailKey = user.email.split('@')[0];
        const isVip = Array.isArray(uservips) && uservips.some(entry => entry && entry.username === emailKey && entry.rol === 'vip');
        const usernameClass = isVip ? 'user-name rgb-username' : 'user-name';
        
        // Esperar a que el script de roles esté cargado
        await new Promise(resolve => {
          if (typeof getRoleByPoints !== 'undefined' && typeof getRoleBadgeHTML !== 'undefined') {
            resolve();
          } else {
            rolesScript.addEventListener('load', resolve);
          }
        });
        
        // Obtener el rol basado en los puntos
        const role = getRoleByPoints(points);
        const roleBadgeHTML = getRoleBadgeHTML(role);
        
        loginBox.innerHTML = `
          <p class="login-text">Bienvenido/a</p>
          ${roleBadgeHTML ? `<div style="text-align: center; margin: 0.5rem 0;">${roleBadgeHTML}</div>` : ''}
          <p class="${usernameClass}">${username}</p>
          <p class="user-points">Puntos: <span class="points-value">${points}</span></p>
          <button class="profile-btn" id="profile-btn">Ver Perfil</button>
          <button class="logout-btn" id="logout-btn">Cerrar sesión</button>
        `;
        
        // Agregar evento al botón de perfil
        const profileBtn = loginBox.querySelector('#profile-btn');
        if (profileBtn) {
          profileBtn.addEventListener('click', () => {
            // Detectar la ruta actual para ajustar la navegación
            const currentPath = window.location.pathname;
            const profilePath = currentPath.includes('/auth/') ? '../public/perfil.html' : 'public/perfil.html';
            window.location.href = profilePath;
          });
        }
        
        // Agregar evento al botón de cerrar sesión
        const logoutBtn = loginBox.querySelector('#logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', async () => {
            try {
              await auth.signOut();
              window.location.reload();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          });
        }
      } else {
        // Usuario no autenticado
        const currentPath = window.location.pathname;
        const authPath = currentPath.includes('/auth/') ? '' : 'auth/';
        
        loginBox.innerHTML = `
          <p class="login-text">Aún no has iniciado sesión</p>
          <p class="login-links">
            <a href="${authPath}login.html">Iniciar sesión</a> o <a href="${authPath}register.html">Registrarse</a>
          </p>
        `;
      }
    });
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
  updateAuthUI();
}

export { updateAuthUI };
