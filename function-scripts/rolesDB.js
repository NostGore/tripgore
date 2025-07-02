
// Base de datos de roles de usuarios
const rolesDB = [
  {
    rol: "moderador",
    etiqueta: "https://img.icons8.com/fluent/600/discord-moderator-program-alumni-badge.png",
    tamaño: {
      ancho: "19px",
      alto: "19px"
    },
    usuarios: [
      "tripgore",
    ]
  },
  {
    rol: "sponsored",
    etiqueta: "https://files.catbox.moe/p05jfb.png",
    tamaño: {
      ancho: "60px",
      alto: "22px"
    },
    usuarios: [
      "tripgore-modera",
    ]
  },
  {
    rol: "colaborador",
    etiqueta: "https://files.catbox.moe/r21pno.png",
    tamaño: {
      ancho: "45px",
      alto: "18px"
    },
    usuarios: [
      "tripgore-mode",
      "usuariovip2"
    ]
  },
  {
    rol: "influencer",
    etiqueta: "https://files.catbox.moe/1zi201.png",
    tamaño: {
      ancho: "55px",
      alto: "20px"
    },
    usuarios: [
      "collab1",
      "collab2"
    ]
  }
];

// Función para obtener el rol de un usuario
export const getUserRole = (username) => {
  if (!username) return null;

  const userRole = rolesDB.find(role =>
    role.usuarios.includes(username.toLowerCase())
  );

  return userRole || null;
};

// Función para obtener la etiqueta de un usuario
export const getUserRoleTag = (username) => {
  const role = getUserRole(username);
  return role ? role.etiqueta : null;
};

// Función para obtener la etiqueta con tamaño personalizado
export const getUserRoleTagWithSize = (username) => {
  const role = getUserRole(username);
  if (!role) return null;
  
  return {
    etiqueta: role.etiqueta,
    ancho: role.tamaño.ancho,
    alto: role.tamaño.alto
  };
};

// Función para verificar si un usuario tiene un rol específico
export const hasRole = (username, roleName) => {
  const role = getUserRole(username);
  return role && role.rol === roleName;
};

// Función para agregar usuario a un rol
export const addUserToRole = (username, roleName) => {
  const roleIndex = rolesDB.findIndex(role => role.rol === roleName);
  if (roleIndex !== -1 && !rolesDB[roleIndex].usuarios.includes(username.toLowerCase())) {
    rolesDB[roleIndex].usuarios.push(username.toLowerCase());
    return true;
  }
  return false;
};

// Función para remover usuario de un rol
export const removeUserFromRole = (username, roleName) => {
  const roleIndex = rolesDB.findIndex(role => role.rol === roleName);
  if (roleIndex !== -1) {
    const userIndex = rolesDB[roleIndex].usuarios.indexOf(username.toLowerCase());
    if (userIndex !== -1) {
      rolesDB[roleIndex].usuarios.splice(userIndex, 1);
      return true;
    }
  }
  return false;
};

// Función para obtener todos los roles
export const getAllRoles = () => {
  return rolesDB;
};

// Exportar la base de datos
export default rolesDB;
