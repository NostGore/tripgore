
// Base de datos de novedades y anuncios
const novedadesDB = [
  {
    id: "nueva actualizacion",
    titulo: "Nueva Actualizacion en TripGore",
    descripcion: [
      "¡Hola a toda la comunidad de TRIPGORE!",
      "Nos complace anunciar que tenemos una nueva actualizacion en la pagina, como pueden notar, se agregaron mas opciones las cuales son fundamentales para la plataforma.",
      "Cosas agregadas:",
      " 1. Se agrego un submenu de categorias.",
      " 2. Se creo un servidor de discord. ( https://discord.com/invite/6AKMHVRxmH )",
      " 3. Se agrego un sistema de novedades",
      "Muchas gracias a toda la comunidad de TripGore, seguiremos trabajando para mantener activa la pagina.",
    ],
    imagen_url: "",
    fecha: "09/07/2025",
    autor: "TripGore"
  },
];

// Función para obtener todas las novedades ordenadas por fecha
export function getAllNovedades() {
  return novedadesDB.sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-')));
}

// Función para obtener novedad por ID
export function getNovedadById(id) {
  return novedadesDB.find(novedad => novedad.id === id);
}

// Función para detectar enlaces en texto
export function detectLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" class="novedad-link">$1</a>');
}

// Función para agregar nueva novedad (para admin)
export function addNovedad(titulo, descripcion, imagenUrl, autor) {
  const newNovedad = {
    id: titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    titulo: titulo,
    descripcion: descripcion,
    imagen_url: imagenUrl,
    fecha: new Date().toLocaleDateString('es-ES'),
    autor: autor
  };

  novedadesDB.unshift(newNovedad);
  return newNovedad;
}

export default novedadesDB;
