
// Contraseña secreta para acceso al panel de moderación
export const MODERATION_PASSWORD = "tgoreñ159";

// Función para validar la contraseña
export const validateModerationPassword = (inputPassword) => {
    return inputPassword === MODERATION_PASSWORD;
};

// Función para verificar si el usuario ya está autenticado para moderación
export const isModerationAuthorized = () => {
    return localStorage.getItem('moderationAuth') === 'true';
};

// Función para autorizar acceso de moderación
export const authorizeModerationAccess = () => {
    localStorage.setItem('moderationAuth', 'true');
};

// Función para revocar acceso de moderación
export const revokeModerationAccess = () => {
    localStorage.removeItem('moderationAuth');
};
