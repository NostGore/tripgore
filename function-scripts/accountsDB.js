
// Base de datos de cuentas de moderadores
const accountsDB = [
  {
    id: "mod001",
    correo: "tripgore@admin.com",
    contra: "admin123",
    nombre: "admin2025",
    role: "moderator"
  },
  {
    id: "mod002", 
    correo: "moderador1@tripgore.com",
    contra: "mod123",
    nombre: "Moderador 1",
    role: "moderator"
  },
  {
    id: "mod003",
    correo: "moderador2@tripgore.com", 
    contra: "mod456",
    nombre: "Moderador 2",
    role: "moderator"
  }
];

// Función para validar credenciales
export const validateCredentials = (correo, contra) => {
  const account = accountsDB.find(acc => 
    acc.correo === correo && acc.contra === contra
  );
  return account || null;
};

// Función para obtener cuenta por correo
export const getAccountByEmail = (correo) => {
  return accountsDB.find(acc => acc.correo === correo) || null;
};

// Exportar la base de datos
export default accountsDB;
