// puntos.js - Sistema de puntos y recompensas

import { getDatabase, ref as dbRef, get, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Obtener la base de datos desde el contexto global (ya inicializada en firebase.js)
let db;

// Función para obtener la base de datos
function getDatabaseInstance() {
    // Intentar obtener desde el contexto global
    if (typeof window !== 'undefined' && window.db) {
        return window.db;
    }
    
    // Si no está disponible, esperar un momento e intentar de nuevo
    return null;
}

// Inicializar db cuando esté disponible
function initializeDb() {
    db = getDatabaseInstance();
    if (!db) {
        // Esperar un poco más si Firebase aún no está listo
        setTimeout(initializeDb, 100);
    }
}

// Intentar inicializar inmediatamente
initializeDb();

/**
 * Obtiene el nombre de usuario del usuario actual
 * @returns {string|null} Nombre de usuario o null si no está logueado
 */
function getCurrentUsername() {
    if (typeof window.getCurrentUser === 'function') {
        const user = window.getCurrentUser();
        if (user && user.email) {
            return user.email.split('@')[0];
        }
    }
    return null;
}

/**
 * Agrega puntos a un usuario en Firebase
 * @param {string} username Nombre de usuario
 * @param {number} points Cantidad de puntos a agregar (por defecto 1)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function addPointsToUser(username, points = 1) {
    if (!username) {
        return { success: false, error: 'Usuario no válido' };
    }

    // Intentar obtener la base de datos si no está disponible
    if (!db) {
        db = getDatabaseInstance();
    }

    if (!db) {
        console.error('Base de datos no disponible');
        return { success: false, error: 'Base de datos no disponible' };
    }

    try {
        const puntosRef = dbRef(db, `puntos/${username}`);
        
        // Obtener el valor actual
        const snapshot = await get(puntosRef);
        
        if (snapshot.exists()) {
            // Si el usuario ya tiene puntos, incrementar
            const currentPoints = snapshot.val().puntos || 0;
            const newPoints = Math.max(0, currentPoints + points); // No permitir puntos negativos
            await set(puntosRef, {
                username: username,
                puntos: newPoints
            });
        } else {
            // Si es la primera vez, crear el registro
            const newPoints = Math.max(0, points); // No permitir puntos negativos
            await set(puntosRef, {
                username: username,
                puntos: newPoints
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error al agregar puntos:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Quita puntos a un usuario en Firebase
 * @param {string} username Nombre de usuario
 * @param {number} points Cantidad de puntos a quitar (por defecto 1)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function removePointsFromUser(username, points = 1) {
    if (!username) {
        return { success: false, error: 'Usuario no válido' };
    }

    // Intentar obtener la base de datos si no está disponible
    if (!db) {
        db = getDatabaseInstance();
    }

    if (!db) {
        console.error('Base de datos no disponible');
        return { success: false, error: 'Base de datos no disponible' };
    }

    try {
        const puntosRef = dbRef(db, `puntos/${username}`);
        
        // Obtener el valor actual
        const snapshot = await get(puntosRef);
        
        if (snapshot.exists()) {
            const currentPoints = snapshot.val().puntos || 0;
            const newPoints = Math.max(0, currentPoints - points); // No permitir puntos negativos
            await set(puntosRef, {
                username: username,
                puntos: newPoints
            });
        } else {
            // Si no existe el registro, crear con 0 puntos
            await set(puntosRef, {
                username: username,
                puntos: 0
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error al quitar puntos:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene los puntos de un usuario
 * @param {string} username Nombre de usuario
 * @returns {Promise<{success: boolean, puntos?: number, error?: string}>}
 */
async function getUserPoints(username) {
    if (!username) {
        return { success: false, error: 'Usuario no válido' };
    }

    // Intentar obtener la base de datos si no está disponible
    if (!db) {
        db = getDatabaseInstance();
    }

    if (!db) {
        console.error('Base de datos no disponible');
        return { success: false, error: 'Base de datos no disponible' };
    }

    try {
        const puntosRef = dbRef(db, `puntos/${username}`);
        const snapshot = await get(puntosRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            return { success: true, puntos: data.puntos || 0 };
        } else {
            return { success: true, puntos: 0 };
        }
    } catch (error) {
        console.error('Error al obtener puntos:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Agrega un punto al usuario actual por interactuar con un video
 * @param {string} action Tipo de acción ('comment', 'like', 'dislike')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function addPointsForInteraction(action = 'interactuar') {
    const username = getCurrentUsername();
    
    if (!username) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    // Agregar el punto
    const result = await addPointsToUser(username, 1);
    
    if (result.success) {
        // Mostrar notificación flotante
        showPointsNotification(1);
    }
    
    return result;
}

/**
 * Muestra una notificación flotante cuando se obtienen o pierden puntos
 * @param {number} points Cantidad de puntos (positivo para ganar, negativo para perder)
 * @param {string} action Tipo de acción ('gained' o 'lost')
 */
function showPointsNotification(points = 1, action = 'gained') {
    // Crear el elemento de notificación si no existe
    let notification = document.getElementById('points-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'points-notification';
        document.body.appendChild(notification);
    }

    // Estilos para la notificación
    if (!document.getElementById('points-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'points-notification-styles';
        style.textContent = `
            #points-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(255, 0, 0, 0.4);
                z-index: 10000;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease-out;
                border: 2px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            #points-notification .points-icon {
                font-size: 24px;
                animation: pulse 1s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }

            #points-notification.hide {
                animation: slideOutRight 0.3s ease-out forwards;
            }

            @media (max-width: 768px) {
                #points-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    padding: 15px 20px;
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Actualizar el contenido y estilo según si se ganó o perdió
    const pointsAbs = Math.abs(points);
    const isGained = action === 'gained' && points > 0;
    
    if (isGained) {
        notification.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
        notification.innerHTML = `
            <i class="fa-solid fa-star points-icon"></i>
            <span>Haz obtenido ${pointsAbs} punto${pointsAbs > 1 ? 's' : ''} por interactuar en este video</span>
        `;
    } else {
        notification.style.background = 'linear-gradient(135deg, #666666 0%, #444444 100%)';
        notification.innerHTML = `
            <i class="fa-solid fa-star points-icon"></i>
            <span>Se te ha quitado ${pointsAbs} punto${pointsAbs > 1 ? 's' : ''} por cancelar la interacción</span>
        `;
    }

    // Mostrar la notificación
    notification.classList.remove('hide');
    notification.style.display = 'flex';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

/**
 * Función helper para agregar puntos cuando se comenta
 */
async function addPointsForComment() {
    return await addPointsForInteraction('comment');
}

/**
 * Función helper para agregar puntos cuando se da like
 */
async function addPointsForLike() {
    const username = getCurrentUsername();
    
    if (!username) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    const result = await addPointsToUser(username, 1);
    
    if (result.success) {
        showPointsNotification(1, 'gained');
    }
    
    return result;
}

/**
 * Función helper para quitar puntos cuando se quita like
 */
async function removePointsForLike() {
    const username = getCurrentUsername();
    
    if (!username) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    const result = await removePointsFromUser(username, 1);
    
    if (result.success) {
        showPointsNotification(-1, 'lost');
    }
    
    return result;
}

/**
 * Función helper para agregar puntos cuando se da dislike
 */
async function addPointsForDislike() {
    const username = getCurrentUsername();
    
    if (!username) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    const result = await addPointsToUser(username, 1);
    
    if (result.success) {
        showPointsNotification(1, 'gained');
    }
    
    return result;
}

/**
 * Función helper para quitar puntos cuando se quita dislike
 */
async function removePointsForDislike() {
    const username = getCurrentUsername();
    
    if (!username) {
        return { success: false, error: 'Usuario no autenticado' };
    }

    const result = await removePointsFromUser(username, 1);
    
    if (result.success) {
        showPointsNotification(-1, 'lost');
    }
    
    return result;
}

// Exportar funciones al contexto global
window.addPointsToUser = addPointsToUser;
window.removePointsFromUser = removePointsFromUser;
window.getUserPoints = getUserPoints;
window.addPointsForInteraction = addPointsForInteraction;
window.addPointsForComment = addPointsForComment;
window.addPointsForLike = addPointsForLike;
window.removePointsForLike = removePointsForLike;
window.addPointsForDislike = addPointsForDislike;
window.removePointsForDislike = removePointsForDislike;
window.showPointsNotification = showPointsNotification;
window.getCurrentUsername = getCurrentUsername;

// Esperar a que Firebase esté listo antes de usar la base de datos
if (typeof window !== 'undefined') {
    // Usar un listener para cuando Firebase esté listo
    const waitForFirebase = setInterval(() => {
        if (window.db && !db) {
            db = window.db;
            clearInterval(waitForFirebase);
            console.log('Base de datos de puntos conectada');
        }
        
        // Timeout después de 10 segundos
        if (Date.now() > (window.firebaseInitTime || 0) + 10000) {
            clearInterval(waitForFirebase);
            if (!db) {
                console.warn('Base de datos de puntos no disponible después de 10 segundos');
            }
        }
    }, 100);
    
    // Si Firebase ya está listo
    if (window.db) {
        db = window.db;
        clearInterval(waitForFirebase);
    }
}

console.log('Sistema de puntos cargado');

