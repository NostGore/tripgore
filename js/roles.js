
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

// Función para obtener el rol basado en puntos
function getRoleByPoints(points) {
    // Ordenar roles por puntos requeridos (de mayor a menor)
    const rolesOrdenados = [
        ROLES.demoniaco,
        ROLES.abismal,
        ROLES.caotico,
        ROLES.desquiciado,
        ROLES.maniaco,
        ROLES.macabro,
        ROLES.lunatico,
        ROLES.sadico,
        ROLES.psicopata,
        ROLES.inestable,
        ROLES.perturbado
    ];

    // Encontrar el rol correspondiente
    for (const role of rolesOrdenados) {
        if (points >= role.puntos) {
            return role;
        }
    }

    // Si no tiene suficientes puntos, devolver null
    return null;
}

// Función para generar el HTML del badge del rol
function getRoleBadgeHTML(role) {
    if (!role) return '';
    
    return `<img src="${role.img}" alt="${role.name}" class="role-badge" title="${role.name}" style="width: ${role.width}px; height: ${role.height}px; margin-right: 0.3rem; vertical-align: middle;">`;
}

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ROLES, getRoleByPoints, getRoleBadgeHTML };
}
