
// Contraseña secreta para acceso al panel de moderación
export const MODERATION_PASSWORD = "tgoreñ2025";

// Función para validar la contraseña
export const validateModerationPassword = (inputPassword) => {
    if (!inputPassword || typeof inputPassword !== 'string') {
        console.log('Invalid input type or empty password');
        return false;
    }
    const trimmedInput = inputPassword.trim();
    const trimmedPassword = MODERATION_PASSWORD.trim();
    console.log('Comparing passwords:');
    console.log('Input:', trimmedInput, 'Length:', trimmedInput.length);
    console.log('Expected:', trimmedPassword, 'Length:', trimmedPassword.length);
    console.log('Match:', trimmedInput === trimmedPassword);
    return trimmedInput === trimmedPassword;
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
