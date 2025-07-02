
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
    rol: "colaborador",
    etiqueta: "https://qu.ax/kWdjx.png",
    tamaño: {
      ancho: "19px",
      alto: "19px"
    },
    usuarios: [
      "usuario01",
    ]
  },
  {
    rol: "tiktok",
    etiqueta: "https://qu.ax/RtcSt.png",
    tamaño: {
      ancho: "19px",
      alto: "19px"
    },
    usuarios: [
      "tripgore-mode",
      "usuariovip2"
    ]
  },
  {
    rol: "youtube",
    etiqueta: "https://qu.ax/gqbLi.png",
    tamaño: {
      ancho: "19px",
      alto: "19px"
    },
    usuarios: [
      "collab1",
      "collab2"
    ]
  },
  {
    rol: "facebook",
    etiqueta: "https://qu.ax/hdttX.png",
    tamaño: {
      ancho: "19px",
      alto: "19px"
    },
    usuarios: [
      "collab1",
      "collab2"
    ]
  },
  {
    rol: "verificado",
    etiqueta: "https://qu.ax/Xeqee.gif",
    tamaño: {
      ancho: "19px",
      alto: "19px"
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
