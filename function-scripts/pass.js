// Sistema de autenticación para moderación - SOLO para data.html
// Este archivo no debe ser importado en ninguna otra página

// Verificar que solo se use en data.html
if (typeof window !== 'undefined' && window.location.pathname !== '/data.html' && !window.location.pathname.endsWith('/data.html')) {
    console.warn('pass.js solo debe usarse en data.html');
}

// Constantes del sistema de moderación
const MODERATION_PASSWORD = 'developerstrip';
const MODERATION_AUTH_KEY = 'moderationAuthorized';
const SESSION_TIMEOUT = 3600000; // 1 hora en milisegundos

// Funciones del sistema de moderación
export function validateModerationPassword(inputPassword) {
    if (typeof inputPassword !== 'string') {
        return false;
    }
    return inputPassword === MODERATION_PASSWORD;
}

export function isModerationAuthorized() {
    const authData = localStorage.getItem(MODERATION_AUTH_KEY);

    if (!authData) {
        return false;
    }

    try {
        const { authorized, timestamp } = JSON.parse(authData);
        const now = Date.now();

        // Verificar si la sesión ha expirado
        if (now - timestamp > SESSION_TIMEOUT) {
            revokeModerationAccess();
            return false;
        }

        return authorized === true;
    } catch (error) {
        // Si hay error parseando, revocar acceso
        revokeModerationAccess();
        return false;
    }
}

export function authorizeModerationAccess() {
    const authData = {
        authorized: true,
        timestamp: Date.now()
    };

    localStorage.setItem(MODERATION_AUTH_KEY, JSON.stringify(authData));
}

export function revokeModerationAccess() {
    localStorage.removeItem(MODERATION_AUTH_KEY);
}

// Función para verificar si la sesión está por expirar
export function getSessionTimeRemaining() {
    const authData = localStorage.getItem(MODERATION_AUTH_KEY);

    if (!authData) {
        return 0;
    }

    try {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();
        const remaining = SESSION_TIMEOUT - (now - timestamp);

        return Math.max(0, remaining);
    } catch (error) {
        return 0;
    }
}

// Función para extender la sesión
export function extendModerationSession() {
    if (isModerationAuthorized()) {
        authorizeModerationAccess(); // Esto actualiza el timestamp
    }
}