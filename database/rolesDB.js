// Base de datos de roles e insignias para usuarios
// Cada rol tiene un icono, tamaño y lista de usuarios que lo poseen

const rolesDB = {

    "moderador": {
        "id-rol": "moderador",
        "nombre": "Moderador",
        "descripcion": "Usuario que moderó el servidor",
        "icono-rol": "https://files.catbox.moe/uamjcl.gif", // Icono de comentarios
        "tamaño-icono": {
            "ancho": "73px",
            "alto": "27px"
        },
        "usuarios": [
            "danielmdza005",
        ]
    },

    // Rol para usuarios con más videos comentados
    "comentarista": {
        "id-rol": "comentarista",
        "nombre": "Comentarista",
        "descripcion": "Usuario con más videos comentados",
        "icono-rol": "https://files.catbox.moe/uamj.gif", // Icono de comentarios
        "tamaño-icono": {
            "ancho": "73px",
            "alto": "27px"
        },
        "usuarios": [
            "xxxxx",
        ]
    },

    // Rol para usuarios con más videos subidos
    "creador": {
        "id-rol": "creador",
        "nombre": "Creador",
        "descripcion": "Usuario con videos publicados",
        "icono-rol": "https://files.catbox.moe/3zkw2o.gif", // Icono de video
        "tamaño-icono": {
            "ancho": "73px",
            "alto": "27px"
        },
        "usuarios": [
            "normnando256",
            "julio2016oo11",
            "jupasi2009",
            "fl3983630",
            "falcolucas34552",
            "perritogore",
            "mientrastambien509",
            "sicowendynglove",
            "addydmimejoramigohola",
            "mazalucas058",
            "junanitoscolo",
            "josejaome1234",
            "robeetomario863",
            "villarjapa",
            "desconocido777",
            "fabriziolemakochen",
            "inarra.nohaha"
        ]
    },


    // Rol para usuarios con más interacciones totales
    "liker": {
        "id-rol": "liker",
        "nombre": "Liker",
        "descripcion": "Usuario que ha dado mas likes",
        "icono-rol": "https://files.catbox.moe/qp34kc.gif", // Icono de rayo
        "tamaño-icono": {
            "ancho": "73px",
            "alto": "28px"
        },
        "usuarios": [
            "jubaefgaristo",
            "luciahamoodhabibi",
            "angelricardo200716",
            "samuel.catrilef",
            "isaiaspedrohernandezjimenez",
            "cristiandanielvazquez",
            "julio2016oo11",
            "status.sceneries",
            "sacaracortes19",
        ]
    },


};

// Función para obtener todos los roles
function getAllRoles() {
    return rolesDB;
}

// Función para obtener un rol específico por ID
function getRoleById(roleId) {
    return rolesDB[roleId] || null;
}

// Función para obtener roles de un usuario específico
function getUserRoles(username) {
    const userRoles = [];
    
    for (const roleId in rolesDB) {
        const role = rolesDB[roleId];
        if (role.usuarios.includes(username)) {
            userRoles.push({
                ...role,
                "id-rol": roleId
            });
        }
    }
    
    return userRoles;
}

// Función para agregar un usuario a un rol
function addUserToRole(username, roleId) {
    if (rolesDB[roleId] && !rolesDB[roleId].usuarios.includes(username)) {
        rolesDB[roleId].usuarios.push(username);
        return true;
    }
    return false;
}

// Función para remover un usuario de un rol
function removeUserFromRole(username, roleId) {
    if (rolesDB[roleId]) {
        const index = rolesDB[roleId].usuarios.indexOf(username);
        if (index > -1) {
            rolesDB[roleId].usuarios.splice(index, 1);
            return true;
        }
    }
    return false;
}

// Función para verificar si un usuario tiene un rol específico
function userHasRole(username, roleId) {
    return rolesDB[roleId] && rolesDB[roleId].usuarios.includes(username);
}

// Función para obtener el HTML de las insignias de un usuario
function getUserBadgesHTML(username) {
    const userRoles = getUserRoles(username);
    if (userRoles.length === 0) return '';

    // Todas las insignias aparecen después del nombre
    return userRoles.map(role => 
        `<img src="${role['icono-rol']}" 
             alt="${role.nombre}" 
             title="${role.descripcion}"
             style="width: ${role['tamaño-icono'].ancho}; height: ${role['tamaño-icono'].alto}; margin-right: 4px; vertical-align: middle; border-radius: 2px;"
             class="user-badge">`
    ).join('');
}

// Función para obtener estadísticas de roles
function getRoleStats() {
    const stats = {
        totalRoles: Object.keys(rolesDB).length,
        totalUsersWithRoles: new Set(),
        roleDistribution: {}
    };

    for (const roleId in rolesDB) {
        const role = rolesDB[roleId];
        stats.roleDistribution[roleId] = role.usuarios.length;
        role.usuarios.forEach(user => stats.totalUsersWithRoles.add(user));
    }

    stats.totalUsersWithRoles = stats.totalUsersWithRoles.size;
    return stats;
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
    window.rolesDB = rolesDB;
    window.getAllRoles = getAllRoles;
    window.getRoleById = getRoleById;
    window.getUserRoles = getUserRoles;
    window.addUserToRole = addUserToRole;
    window.removeUserFromRole = removeUserFromRole;
    window.userHasRole = userHasRole;
    window.getUserBadgesHTML = getUserBadgesHTML;
    window.getRoleStats = getRoleStats;
}

// Log de inicialización
console.log('🎖️ Base de datos de roles cargada exitosamente');
console.log('📊 Estadísticas:', getRoleStats());
