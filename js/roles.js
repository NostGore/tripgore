// roles.js - Sistema de roles simple y directo

// ============================================
// ASIGNACIÓN MANUAL DE MODERADORES
// Agrega aquí los nombres de usuario que quieres que tengan el rol de Moderador
// ============================================
const MODERATORS = [
    'tripgore-moderator',
    // Agrega más moderadores aquí separados por comas
];

// Roles hardcodeados
const ROLES = {
    colaborator: {
        id: 'colaborator',
        name: 'Colaborador',
        img: 'img/colab.png',
        width: 25,
        height: 25
    },
    moderator: {
        id: 'moderator',
        name: 'Moderador',
        img: 'img/mod.png',
        width: 25,
        height: 25
    },
    // Roles basados en puntos (ordenados de menor a mayor requerimiento)
    perturbado: {
        id: 'perturbado',
        name: 'Perturbado',
        img: 'img/perturbado.png',
        width: 100,
        height: 25,
        puntos: 50
    },
    inestable: {
        id: 'inestable',
        name: 'Inestable',
        img: 'img/inestable.png',
        width: 100,
        height: 25,
        puntos: 100
    },
    psicopata: {
        id: 'psicopata',
        name: 'Psicópata',
        img: 'img/psicopta.png',
        width: 100,
        height: 25,
        puntos: 200
    },
    sadico: {
        id: 'sadico',
        name: 'Sádico',
        img: 'img/sadico.png',
        width: 100,
        height: 25,
        puntos: 300
    },
    lunatico: {
        id: 'lunatico',
        name: 'Lunático',
        img: 'img/lunatico.png',
        width: 100,
        height: 25,
        puntos: 400
    },
    macabro: {
        id: 'macabro',
        name: 'Macabro',
        img: 'img/macabro.png',
        width: 100,
        height: 25,
        puntos: 500
    },
    maniaco: {
        id: 'maniaco',
        name: 'Maniaco',
        img: 'img/maniaco.png',
        width: 100,
        height: 25,
        puntos: 600
    },
    desquiciado: {
        id: 'desquiciado',
        name: 'Desquiciado',
        img: 'img/desquiciado.png',
        width: 100,
        height: 25,
        puntos: 700
    },
    caotico: {
        id: 'caotico',
        name: 'Caótico',
        img: 'img/caotico.png',
        width: 100,
        height: 25,
        puntos: 800
    },
    abismal: {
        id: 'abismal',
        name: 'Abismal',
        img: 'img/abismal.png',
        width: 100,
        height: 25,
        puntos: 900
    },
    demoniaco: {
        id: 'demoniaco',
        name: 'Demoniaco',
        img: 'img/demoniaco.png',
        width: 100,
        height: 25,
        puntos: 1000
    }
};

// Función para verificar si un usuario es moderador
function isModerator(username) {
    if (!username) return false;
    const normalizedUsername = username.trim().toLowerCase();
    return MODERATORS.some(mod => mod.trim().toLowerCase() === normalizedUsername);
}

// Función para verificar si un usuario es colaborador (tiene videos subidos)
async function isCollaborator(username) {
    if (!username) return false;
    
    // Buscar en mediaDB
    if (typeof mediaDB !== 'undefined' && Array.isArray(mediaDB)) {
        const hasVideosInMediaDB = mediaDB.some(video => {
            if (video.autor === 'TripGore') return false;
            const videoAuthor = video.autor || '';
            if (videoAuthor.includes('@')) {
                return videoAuthor.split('@')[0].toLowerCase() === username.toLowerCase();
            }
            return videoAuthor.toLowerCase() === username.toLowerCase();
        });
        if (hasVideosInMediaDB) return true;
    }
    
    // Buscar en Firebase
    if (typeof window.getApprovedVideosOnce === 'function') {
        try {
            const firebaseVideos = await window.getApprovedVideosOnce();
            if (Array.isArray(firebaseVideos)) {
                const hasVideosInFirebase = firebaseVideos.some(video => {
                    if (!video.autor) return false;
                    const videoAuthor = video.autor || '';
                    if (videoAuthor.includes('@')) {
                        return videoAuthor.split('@')[0].toLowerCase() === username.toLowerCase();
                    }
                    return videoAuthor.toLowerCase() === username.toLowerCase();
                });
                if (hasVideosInFirebase) return true;
            }
        } catch (error) {
            console.error('Error al verificar colaborador en Firebase:', error);
        }
    }
    
    return false;
}

// Función para obtener el rol más alto que un usuario ha alcanzado basado en sus puntos
// Retorna el objeto del rol o null si no ha alcanzado ningún rol
async function getHighestRoleByPoints(username) {
    if (!username) return null;
    
    // Verificar si el usuario tiene puntos
    if (typeof window.getUserPoints === 'function') {
        try {
            const result = await window.getUserPoints(username);
            if (result.success && result.puntos !== undefined) {
                const puntosUsuario = result.puntos;
                
                // Array de roles basados en puntos (ordenados de menor a mayor)
                const rolesPorPuntos = [
                    'perturbado', 'inestable', 'psicopata', 'sadico', 'lunatico',
                    'macabro', 'maniaco', 'desquiciado', 'caotico', 'abismal', 'demoniaco'
                ];
                
                // Encontrar el rol más alto que el usuario ha alcanzado
                let highestRole = null;
                for (let i = rolesPorPuntos.length - 1; i >= 0; i--) {
                    const roleId = rolesPorPuntos[i];
                    const role = ROLES[roleId];
                    if (role && role.puntos && puntosUsuario >= role.puntos) {
                        highestRole = role;
                        break;
                    }
                }
                
                return highestRole;
            }
        } catch (error) {
            console.error('Error al verificar puntos para roles:', error);
        }
    }
    
    return null;
}

// Estilos para badges
function injectStyles() {
    if (document.getElementById('role-badge-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'role-badge-styles';
    style.textContent = `
        .role-badge {
            display: inline-block;
            margin-left: 6px;
            vertical-align: middle;
        }
        .role-badge img {
            width: 100px;
            height: 100px;
            display: block;
            border-radius: 3px;
        }
        .role-badge-points {
            display: block;
            margin-left: 0;
            margin-bottom: 4px;
            margin-top: 0;
        }
        .role-badge-points img {
            width: auto;
            height: auto;
            max-width: 100px;
            max-height: 30px;
        }
    `;
    document.head.appendChild(style);
}

// Crear badge de rol
function createRoleBadge(role, isPointsBased = false) {
    const span = document.createElement('span');
    span.className = isPointsBased ? 'role-badge role-badge-points' : 'role-badge';
    span.title = role.name;
    
    const img = document.createElement('img');
    img.src = role.img;
    img.alt = role.name;
    img.style.width = role.width + 'px';
    img.style.height = role.height + 'px';
    
    span.appendChild(img);
    return span;
}

// Aplicar rol de colaborador a todos los nombres en la página de colaboradores
function applyColaboratorBadges() {
    // Solo si estamos en colaboradores.html
    if (!document.querySelector('.colaborador-name')) {
        return;
    }
    
    const names = document.querySelectorAll('.colaborador-name');
    console.log('📋 Encontrados', names.length, 'colaboradores');
    
    names.forEach(nameElement => {
        // Ya tiene badge? Saltar
        if (nameElement.querySelector('.role-badge')) {
            return;
        }
        
        // Obtener el nombre del usuario desde el atributo data-user-roles o el texto
        let userName = nameElement.getAttribute('data-user-roles');
        if (!userName) {
            // Si no hay atributo, obtener solo el texto del nodo (sin hijos)
            userName = Array.from(nameElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join('')
                .trim();
        }
        
        if (!userName) {
            // Fallback: obtener todo el texto y limpiarlo
            userName = nameElement.textContent.trim();
            // Remover posibles badges existentes del texto
            userName = userName.replace(/\s+/g, ' ').trim();
        }
        
        const userNameClean = userName.trim();
        
        // En la página de colaboradores, SIEMPRE mostrar badge de colaborador
        // (sin importar otros roles que el usuario pueda tener)
        const badge = createRoleBadge(ROLES.colaborator);
        nameElement.appendChild(badge);
        console.log('✅ Badge de Colaborador agregado a:', userNameClean);
    });
}

// Aplicar badges de moderador y maniaco en comentarios de videos
async function applyModeratorBadgesInComments() {
    // Aplicar a comentarios principales y respuestas
    const commentUsernames = document.querySelectorAll('.comment-username, .reply-author');
    
    for (const nameElement of commentUsernames) {
        // Obtener el nombre del usuario desde el atributo data-user-roles
        let userName = nameElement.getAttribute('data-user-roles');
        if (!userName) {
            // Fallback: obtener del texto
            userName = Array.from(nameElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join('')
                .trim();
        }
        
        if (!userName) continue;
        
        const userNameClean = userName.trim();
        
        // Verificar si es moderador (tiene prioridad sobre todos los roles)
        if (isModerator(userNameClean)) {
            // Limpiar todos los badges de roles por puntos y colaborador si es moderador
            const existingBadges = nameElement.querySelectorAll('.role-badge');
            existingBadges.forEach(badge => {
                const imgAlt = badge.querySelector('img')?.alt;
                if (imgAlt && imgAlt !== 'Moderador') {
                    badge.remove();
                }
            });
            
            const hasModeratorBadge = Array.from(nameElement.querySelectorAll('.role-badge'))
                .some(badge => badge.querySelector('img[alt="Moderador"]'));
            if (!hasModeratorBadge) {
                const badge = createRoleBadge(ROLES.moderator);
                nameElement.appendChild(badge);
                console.log('👮 Badge de Moderador agregado en comentario a:', userNameClean);
            }
        } else {
            // Si no es moderador, verificar y mostrar el rol más alto por puntos
            const highestRole = await getHighestRoleByPoints(userNameClean);
            if (highestRole) {
                // Limpiar badges anteriores de roles por puntos y colaborador
                const existingBadges = nameElement.querySelectorAll('.role-badge');
                existingBadges.forEach(badge => {
                    badge.remove();
                });
                
                // Agregar el badge del rol más alto ARRIBA del nombre
                const badge = createRoleBadge(highestRole, true);
                // Insertar al principio del elemento
                if (nameElement.firstChild) {
                    nameElement.insertBefore(badge, nameElement.firstChild);
                } else {
                    nameElement.appendChild(badge);
                }
                console.log(`🎭 Badge de ${highestRole.name} agregado en comentario a:`, userNameClean);
            } else {
                // Si no tiene rol por puntos, verificar si es colaborador
                const isCollab = await isCollaborator(userNameClean);
                if (isCollab) {
                    const hasColaboratorBadge = Array.from(nameElement.querySelectorAll('.role-badge'))
                        .some(badge => badge.querySelector('img[alt="Colaborador"]'));
                    if (!hasColaboratorBadge) {
                        // Limpiar badges anteriores
                        const existingBadges = nameElement.querySelectorAll('.role-badge');
                        existingBadges.forEach(badge => {
                            badge.remove();
                        });
                        
                        const badge = createRoleBadge(ROLES.colaborator);
                        nameElement.appendChild(badge);
                        console.log('✅ Badge de Colaborador agregado en comentario a:', userNameClean);
                    }
                }
            }
        }
    }
}

// Aplicar badges de moderador y maniaco en el perfil
async function applyModeratorBadgesInProfile() {
    const profileUsernames = document.querySelectorAll('.profile-username');
    
    for (const nameElement of profileUsernames) {
        // Obtener el nombre del usuario desde el atributo data-user-roles
        let userName = nameElement.getAttribute('data-user-roles');
        if (!userName) {
            // Fallback: obtener del texto
            userName = Array.from(nameElement.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join('')
                .trim();
        }
        
        if (!userName) continue;
        
        const userNameClean = userName.trim();
        
        // Verificar si es moderador (tiene prioridad sobre todos los roles)
        if (isModerator(userNameClean)) {
            // Limpiar todos los badges de roles por puntos si es moderador
            const existingBadges = nameElement.querySelectorAll('.role-badge');
            existingBadges.forEach(badge => {
                const imgAlt = badge.querySelector('img')?.alt;
                if (imgAlt && imgAlt !== 'Moderador') {
                    badge.remove();
                }
            });
            
            const hasModeratorBadge = Array.from(nameElement.querySelectorAll('.role-badge'))
                .some(badge => badge.querySelector('img[alt="Moderador"]'));
            if (!hasModeratorBadge) {
                const badge = createRoleBadge(ROLES.moderator);
                nameElement.appendChild(badge);
                console.log('👮 Badge de Moderador agregado en perfil a:', userNameClean);
            }
        } else {
            // Si no es moderador, verificar y mostrar el rol más alto por puntos
            const highestRole = await getHighestRoleByPoints(userNameClean);
            if (highestRole) {
                // Limpiar badges anteriores de roles por puntos
                const existingBadges = nameElement.querySelectorAll('.role-badge');
                existingBadges.forEach(badge => {
                    badge.remove();
                });
                
                // Agregar el badge del rol más alto
                const badge = createRoleBadge(highestRole);
                nameElement.appendChild(badge);
                console.log(`🎭 Badge de ${highestRole.name} agregado en perfil a:`, userNameClean);
            }
        }
    }
}

// Función principal para decorar roles
async function decorateRoles() {
    injectStyles();
    
    // Si estamos en página de colaboradores, aplicar badges de colaborador
    if (window.location.pathname.includes('colaboradores.html') || 
        document.querySelector('.colaborador-name')) {
        applyColaboratorBadges();
    }
    
    // Aplicar badges de moderador y maniaco en comentarios (si estamos en video.html)
    if (window.location.pathname.includes('video.html') || 
        document.querySelector('.comment-username')) {
        await applyModeratorBadgesInComments();
    }
    
    // Aplicar badges de moderador y maniaco en perfil (si estamos en perfil.html)
    if (window.location.pathname.includes('perfil.html') || 
        document.querySelector('.profile-username')) {
        await applyModeratorBadgesInProfile();
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(decorateRoles, 500);
    });
} else {
    setTimeout(decorateRoles, 500);
}

// Observar cambios en el DOM (para elementos dinámicos)
const observer = new MutationObserver(async () => {
    // Observar colaboradores
    if (document.querySelector('.colaborador-name')) {
        applyColaboratorBadges();
    }
    
    // Observar comentarios (se agregan dinámicamente)
    if (document.querySelector('.comment-username')) {
        await applyModeratorBadgesInComments();
    }
    
    // Observar perfil (se carga dinámicamente)
    if (document.querySelector('.profile-username')) {
        await applyModeratorBadgesInProfile();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Función para decorar roles de usuario (compatible con perfil.html)
async function decorateUserRoles(attribute = 'data-user-roles') {
    injectStyles();
    
    // Aplicar badges en perfil
    await applyModeratorBadgesInProfile();
    
    // Aplicar badges en comentarios si estamos en video.html
    if (window.location.pathname.includes('video.html')) {
        await applyModeratorBadgesInComments();
    }
    
    return Promise.resolve();
}

// Función helper para aplicar badges después de renderizar comentarios
// Se puede llamar desde video.js después de renderizar comentarios
async function applyBadgesAfterRender() {
    // Aplicar badges en comentarios si existen
    if (document.querySelector('.comment-username')) {
        await applyModeratorBadgesInComments();
    }
    
    // Aplicar badges en perfil si existe
    if (document.querySelector('.profile-username')) {
        await applyModeratorBadgesInProfile();
    }
}

// Exportar funciones globales
window.decorateRoles = decorateRoles;
window.applyColaboratorBadges = applyColaboratorBadges;
window.applyModeratorBadgesInComments = applyModeratorBadgesInComments;
window.applyModeratorBadgesInProfile = applyModeratorBadgesInProfile;
window.decorateUserRoles = decorateUserRoles;
window.applyBadgesAfterRender = applyBadgesAfterRender;

console.log('✅ Sistema de roles cargado');
