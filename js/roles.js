// roles.js - Utilidades para mostrar insignias de usuario

const BADGE_IMAGE_BASE_PATH = 'img/';
const BADGE_REGISTRY = new Map();
const USER_ROLE_MAP = new Map();

const MEDIA_DB_POLL_INTERVAL = 500;
const DETECTION_TIMEOUT = 6000;

let mediaDetectionScheduled = false;
let likeroDetectionScheduled = false;
let comentorDetectionScheduled = false;

let likeroDetectionCompleted = false;
let comentorDetectionCompleted = false;
let badgeStylesInjected = false;

const DEFAULT_BADGE_DATA = {
    creator: {
        roleId: 'creator',
        title: 'Creador',
        desc: 'usuario con videos subidos a la web',
        image: 'https://files.catbox.moe/uf2f5q.jpeg',
        size: {
            width: '60px',
            height: '20px'
        }
    },
    likero: {
        roleId: 'likero',
        title: 'Likero',
        desc: 'usuario que ha dado más likes a los videos',
        image: 'https://files.catbox.moe/7lmngp.jpeg',
        size: {
            width: '60px',
            height: '20px'
        }
    },
    comentor: {
        roleId: 'comentor',
        title: 'Comentor',
        desc: 'usuario que ha comentado más videos',
        image: 'https://files.catbox.moe/7lmngp.jpeg',
        size: {
            width: '60px',
            height: '20px'
        }
    }
};

/**
 * Registra una nueva insignia en el sistema.
 * @param {string} roleId Identificador único del rol/insignia.
 * @param {Object} options Configuración de la insignia.
 * @param {string} options.image Nombre o ruta del archivo dentro de la carpeta img/.
 * @param {string} [options.alt] Texto alternativo para accesibilidad.
 * @param {string} [options.title] Tooltip que se mostrará al pasar el cursor.
 * @param {number} [options.size=18] Tamaño en px para width/height.
 */
function registerBadge(roleId, { image, alt = '', title = '', size = 18, desc = '', width, height } = {}) {
    if (!roleId || !image) {
        console.warn('[roles.js] roleId e image son obligatorios para registrar una insignia.');
        return;
    }

    BADGE_REGISTRY.set(roleId, {
        image: image.startsWith('http') ? image : `${BADGE_IMAGE_BASE_PATH}${image}`,
        alt,
        title: title || alt || roleId,
        description: desc,
        size: sanitizeSize(size, width, height)
    });
}

function sanitizeSize(size, width, height) {
    if (typeof size === 'object' && size !== null) {
        return {
            width: size.width || size.w || '18px',
            height: size.height || size.h || '18px'
        };
    }

    if (width || height) {
        return {
            width: width || height || '18px',
            height: height || width || '18px'
        };
    }

    const normalized = Number(size);
    if (!Number.isNaN(normalized)) {
        return {
            width: `${normalized}px`,
            height: `${normalized}px`
        };
    }

    const parsed = parseCssSize(size);
    return parsed || { width: '18px', height: '18px' };
}

function parseCssSize(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (/^\d+(px|em|rem|%)$/.test(trimmed)) {
        return { width: trimmed, height: trimmed };
    }

    if (/^\d+$/g.test(trimmed)) {
        return { width: `${trimmed}px`, height: `${trimmed}px` };
    }

    return null;
}

/**
 * Asigna un conjunto de roles/insignias a un usuario, reemplazando los existentes.
 * @param {string} username Nombre del usuario.
 * @param {string[]} roles Lista de identificadores de roles.
 */
function setUserRoles(username, roles = []) {
    if (!username) {
        return;
    }

    const normalizedRoles = Array.isArray(roles)
        ? roles.filter(role => BADGE_REGISTRY.has(role))
        : [];

    const uniqueRoles = Array.from(new Set(normalizedRoles));
    USER_ROLE_MAP.set(username.toLowerCase(), uniqueRoles);
}

/**
 * Agrega uno o varios roles a un usuario sin eliminar los actuales.
 * @param {string} username Nombre del usuario.
 * @param {string[]} roles Lista de roles a agregar.
 */
function addRolesToUser(username, roles = []) {
    if (!username || !Array.isArray(roles) || roles.length === 0) {
        return;
    }

    const normalized = username.toLowerCase();
    const existing = new Set(USER_ROLE_MAP.get(normalized) || []);

    roles.forEach(role => {
        if (BADGE_REGISTRY.has(role)) {
            existing.add(role);
        }
    });

    USER_ROLE_MAP.set(normalized, Array.from(existing));
}

/**
 * Obtiene las insignias registradas para un usuario.
 * @param {string} username Nombre del usuario.
 * @returns {Array<{roleId: string, image: string, alt: string, title: string, size: number}>}
 */
function getUserBadges(username) {
    if (!username) {
        return [];
    }

    const roles = USER_ROLE_MAP.get(username.toLowerCase()) || [];
    return roles
        .map(roleId => {
            const badge = BADGE_REGISTRY.get(roleId);
            return badge ? { roleId, ...badge } : null;
        })
        .filter(Boolean);
}

/**
 * Genera un fragmento de documento con el nombre del usuario y sus insignias.
 * @param {string} username Nombre del usuario a mostrar.
 * @param {Object} [options]
 * @param {boolean} [options.includeName=true] Si se debe incluir el nombre del usuario.
 * @returns {DocumentFragment}
 */
function createUserBadgeFragment(username, { includeName = true } = {}) {
    ensureBadgeStyles();

    const fragment = document.createDocumentFragment();

    const badges = getUserBadges(username);

    if (includeName && username) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'badge-username';
        nameSpan.textContent = username;
        fragment.appendChild(nameSpan);

        if (badges.length > 0) {
            fragment.appendChild(document.createTextNode(' '));
        }
    }

    badges.forEach(({ roleId, image, alt, title, size }) => {
        const wrapper = document.createElement('span');
        wrapper.className = `user-badge badge-${roleId}`;

        const img = document.createElement('img');
        img.src = image;
        img.alt = alt || roleId;
        img.title = title || alt || roleId;
        img.loading = 'lazy';

        if (size && typeof size === 'object') {
            if (size.width) img.style.width = size.width;
            if (size.height) img.style.height = size.height;
        }

        wrapper.appendChild(img);
        fragment.appendChild(wrapper);
    });

    return fragment;
}

function ensureBadgeStyles() {
    if (badgeStylesInjected || typeof document === 'undefined') {
        return;
    }

    const style = document.createElement('style');
    style.id = 'user-badge-styles';
    style.textContent = `
        .user-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            vertical-align: middle;
        }

        .badge-username {
            font-weight: inherit;
            vertical-align: middle;
        }

        .user-badge img {
            display: block;
            border-radius: 3px;
            object-fit: cover;
        }

        .badge-username + .user-badge {
            margin-left: 6px;
        }

        .user-badge + .user-badge {
            margin-left: 6px;
        }
    `;

    document.head.appendChild(style);
    badgeStylesInjected = true;
}

/**
 * Inserta el nombre y las insignias del usuario dentro de un elemento del DOM.
 * @param {HTMLElement} target Elemento donde se agregarán las insignias.
 * @param {string} username Nombre del usuario.
 * @param {Object} [options]
 * @param {boolean} [options.includeName=true]
 */
function applyUserBadges(target, username, options = {}) {
    if (!target) {
        return;
    }

    const fragment = createUserBadgeFragment(username, options);
    target.innerHTML = '';
    target.appendChild(fragment);
}

/**
 * Busca elementos con un atributo específico y les aplica las insignias de usuario.
 * Ejemplo: <span data-user-badge="tripgore"></span>
 * @param {string} [attribute='data-user-badge']
 * @param {Object} [options]
 */
function decorateElementsWithBadges(attribute = 'data-user-badge', options = {}) {
    if (typeof document === 'undefined') {
        return;
    }

    const elements = document.querySelectorAll(`[${attribute}]`);

    elements.forEach(element => {
        const username = element.getAttribute(attribute);
        if (!username) {
            return;
        }

        applyUserBadges(element, username, options);
    });
}

function removeRoleFromAll(roleId) {
    USER_ROLE_MAP.forEach((roles, username) => {
        const filtered = roles.filter(role => role !== roleId);
        if (filtered.length === 0) {
            USER_ROLE_MAP.delete(username);
        } else if (filtered.length !== roles.length) {
            USER_ROLE_MAP.set(username, filtered);
        }
    });
}

function getAvailableMediaDB() {
    if (typeof window === 'undefined') {
        return null;
    }

    if (Array.isArray(window.mediaDB)) {
        return window.mediaDB;
    }

    if (typeof window.getMediaDB === 'function') {
        const db = window.getMediaDB();
        if (Array.isArray(db)) {
            return db;
        }
    }

    return null;
}

function detectCreatorRoles() {
    const media = getAvailableMediaDB();
    if (!Array.isArray(media) || media.length === 0) {
        return false;
    }

    const creators = new Set();

    media.forEach(video => {
        if (!video || !video.autor) {
            return;
        }

        const author = String(video.autor).trim();
        if (!author) {
            return;
        }

        if (/^tripgore$/i.test(author)) {
            return;
        }

        creators.add(author);
    });

    if (creators.size > 0) {
        creators.forEach(author => addRolesToUser(author, ['creator']));
        refreshBadgeDecorations();
    }

    return true;
}

async function detectLikeroRoles(limit = 5) {
    const media = getAvailableMediaDB();
    const vf = window.videoFunctions;

    if (!Array.isArray(media) || media.length === 0 || !vf || typeof vf.getLikes !== 'function') {
        return false;
    }

    const likeCounters = new Map();

    for (const video of media) {
        if (!video || !video.id || video.categoria === 'OCULTO') {
            continue;
        }

        const likesData = await fetchVideoLikes(video.id).catch(() => null);
        if (!likesData || !Array.isArray(likesData.likes)) {
            continue;
        }

        likesData.likes.forEach(like => {
            if (!like || !like.username) {
                return;
            }
            incrementRoleCounter(likeCounters, like.username);
        });
    }

    const top = extractTopUsers(likeCounters, limit);

    if (top.length === 0) {
        return false;
    }

    removeRoleFromAll('likero');
    top.forEach(({ display }) => addRolesToUser(display, ['likero']));
    refreshBadgeDecorations();

    return true;
}

async function detectComentorRoles(limit = 5) {
    const media = getAvailableMediaDB();
    const vf = window.videoFunctions;

    if (!Array.isArray(media) || media.length === 0 || !vf || typeof vf.getComments !== 'function') {
        return false;
    }

    const commentCounters = new Map();

    for (const video of media) {
        if (!video || !video.id || video.categoria === 'OCULTO') {
            continue;
        }

        const comments = await fetchVideoComments(video.id).catch(() => null);
        if (!Array.isArray(comments)) {
            continue;
        }

        comments.forEach(comment => {
            if (!comment || !comment.autor) {
                return;
            }
            incrementRoleCounter(commentCounters, comment.autor);
        });
    }

    const top = extractTopUsers(commentCounters, limit);

    if (top.length === 0) {
        return false;
    }

    removeRoleFromAll('comentor');
    top.forEach(({ display }) => addRolesToUser(display, ['comentor']));
    refreshBadgeDecorations();

    return true;
}

function refreshBadgeDecorations(attribute = 'data-user-badge', options = {}) {
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => decorateElementsWithBadges(attribute, options));
    } else {
        decorateElementsWithBadges(attribute, options);
    }
}

function scheduleCreatorDetection() {
    if (mediaDetectionScheduled) {
        return;
    }

    mediaDetectionScheduled = true;

    const attemptDetection = () => {
        const success = detectCreatorRoles();
        if (success) {
            mediaDetectionScheduled = false;
            return;
        }

        setTimeout(attemptDetection, MEDIA_DB_POLL_INTERVAL);
    };

    attemptDetection();
}

function refreshCreatorBadges() {
    const success = detectCreatorRoles();
    if (!success) {
        scheduleCreatorDetection();
    }
}

function scheduleLikeroDetection() {
    if (likeroDetectionScheduled || likeroDetectionCompleted) {
        return;
    }

    likeroDetectionScheduled = true;

    const attempt = async () => {
        const success = await detectLikeroRoles().catch(() => false);
        if (success) {
            likeroDetectionCompleted = true;
            likeroDetectionScheduled = false;
            return;
        }

        setTimeout(attempt, MEDIA_DB_POLL_INTERVAL);
    };

    attempt();
}

function scheduleComentorDetection() {
    if (comentorDetectionScheduled || comentorDetectionCompleted) {
        return;
    }

    comentorDetectionScheduled = true;

    const attempt = async () => {
        const success = await detectComentorRoles().catch(() => false);
        if (success) {
            comentorDetectionCompleted = true;
            comentorDetectionScheduled = false;
            return;
        }

        setTimeout(attempt, MEDIA_DB_POLL_INTERVAL);
    };

    attempt();
}

async function refreshLikeroBadges(limit = 5) {
    const success = await detectLikeroRoles(limit).catch(() => false);
    if (!success) {
        scheduleLikeroDetection();
    } else {
        likeroDetectionCompleted = true;
    }
}

async function refreshComentorBadges(limit = 5) {
    const success = await detectComentorRoles(limit).catch(() => false);
    if (!success) {
        scheduleComentorDetection();
    } else {
        comentorDetectionCompleted = true;
    }
}

function incrementRoleCounter(map, username) {
    if (!username) {
        return;
    }

    const normalized = String(username).trim();
    if (!normalized || /^tripgore$/i.test(normalized)) {
        return;
    }

    const key = normalized.toLowerCase();
    const entry = map.get(key) || { display: normalized, count: 0 };
    entry.count += 1;
    entry.display = normalized;
    map.set(key, entry);
}

function extractTopUsers(map, limit) {
    return Array.from(map.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .filter(entry => entry.count > 0);
}

function fetchVideoLikes(videoId) {
    return new Promise((resolve, reject) => {
        if (!window.videoFunctions || typeof window.videoFunctions.getLikes !== 'function') {
            resolve(null);
            return;
        }

        let settled = false;
        const unsubscribe = window.videoFunctions.getLikes(videoId, (data) => {
            if (settled) {
                return;
            }
            settled = true;
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
            resolve(data);
        });

        setTimeout(() => {
            if (!settled) {
                settled = true;
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
                reject(new Error('fetchVideoLikes timeout'));
            }
        }, DETECTION_TIMEOUT);
    });
}

function fetchVideoComments(videoId) {
    return new Promise((resolve, reject) => {
        if (!window.videoFunctions || typeof window.videoFunctions.getComments !== 'function') {
            resolve(null);
            return;
        }

        let settled = false;
        const unsubscribe = window.videoFunctions.getComments(videoId, (comments) => {
            if (settled) {
                return;
            }
            settled = true;
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
            resolve(comments);
        });

        setTimeout(() => {
            if (!settled) {
                settled = true;
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
                reject(new Error('fetchVideoComments timeout'));
            }
        }, DETECTION_TIMEOUT);
    });
}

Object.values(DEFAULT_BADGE_DATA).forEach((badge) => {
    registerBadge(badge.roleId, {
        image: badge.image,
        alt: badge.title,
        title: badge.title,
        desc: badge.desc,
        size: badge.size
    });
});

scheduleCreatorDetection();

// Exportar funciones al contexto global
window.registerBadge = registerBadge;
window.setUserRoles = setUserRoles;
window.getUserBadges = getUserBadges;
window.applyUserBadges = applyUserBadges;
window.decorateElementsWithBadges = decorateElementsWithBadges;
window.createUserBadgeFragment = createUserBadgeFragment;
window.addRolesToUser = addRolesToUser;
window.refreshBadgeDecorations = refreshBadgeDecorations;
window.refreshCreatorBadges = refreshCreatorBadges;
window.refreshLikeroBadges = refreshLikeroBadges;
window.refreshComentorBadges = refreshComentorBadges;

document.addEventListener('DOMContentLoaded', () => {
    decorateElementsWithBadges();
    refreshCreatorBadges();
    refreshLikeroBadges();
    refreshComentorBadges();
});

