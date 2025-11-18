import { mediaDB } from './database/mediaDB.js';
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { app } from './js/firebase.js';

// Inicializar servicios
const db = getDatabase(app);

// Configuración de paginación
const VIDEOS_POR_PAGINA = 12;
let paginaActual = obtenerPaginaDeURL();
let totalPaginas = 1;
let todosLosVideos = [...mediaDB]; // Empezar con los videos locales

// Función para obtener el número de página de la URL
function obtenerPaginaDeURL() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  return page ? parseInt(page, 10) : 1;
}

// Función para actualizar la URL con el número de página
function actualizarURL(numeroPagina) {
  const url = new URL(window.location);
  if (numeroPagina === 1) {
    url.searchParams.delete('page');
  } else {
    url.searchParams.set('page', numeroPagina);
  }
  window.history.pushState({}, '', url);
}

// Función para convertir fecha DD/MM/YYYY a objeto Date
function parsearFecha(fechaStr) {
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0-11
    const año = parseInt(partes[2], 10);
    return new Date(año, mes, dia);
  }
  return new Date(0); // Fecha por defecto si hay error
}

// Función para ordenar videos por fecha (más recientes primero)
function ordenarVideosPorFecha(videos) {
  return [...videos].sort((a, b) => {
    const fechaA = parsearFecha(a.fecha);
    const fechaB = parsearFecha(b.fecha);
    return fechaB - fechaA; // Orden descendente (más reciente primero)
  });
}

// Función para cargar videos de Firebase
function cargarVideosFirebase() {
  const videosRef = ref(db, 'videos');

  onValue(videosRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      // Convertir el objeto de Firebase a un array de videos
      const videosFirebase = Object.values(data);

      // Combinar videos de mediaDB y Firebase, evitando duplicados por ID
      const idsExistentes = new Set(mediaDB.map(v => v.id));
      const videosNuevos = videosFirebase.filter(v => !idsExistentes.has(v.id));

      todosLosVideos = [...mediaDB, ...videosNuevos];

      console.log('Videos cargados:', todosLosVideos.length);

      // Re-renderizar con todos los videos
      renderizarVideos();
      renderizarVideosFamosos();
      actualizarContadores();
      renderizarVideosColaboradores();
      renderizarTodosLosColaboradores();
    }
  }, (error) => {
    console.error('Error al cargar videos de Firebase:', error);
  });
}

// Función para renderizar videos en la página
function renderizarVideos() {
  const videosGrid = document.querySelector('.videos-grid');
  if (!videosGrid) return;

  // Limpiar grid
  videosGrid.innerHTML = '';

  // Ordenar videos por fecha
  const videosOrdenados = ordenarVideosPorFecha(todosLosVideos);

  // Calcular índices para la página actual
  const inicio = (paginaActual - 1) * VIDEOS_POR_PAGINA;
  const fin = inicio + VIDEOS_POR_PAGINA;
  const videosParaMostrar = videosOrdenados.slice(inicio, fin);

  // Renderizar cada video
  videosParaMostrar.forEach(video => {
    const videoCard = crearTarjetaVideo(video);
    videosGrid.appendChild(videoCard);
  });

  // Actualizar paginación
  actualizarPaginacion();
}

// Función para crear una tarjeta de video
function crearTarjetaVideo(video) {
  const card = document.createElement('div');
  card.className = 'video-card';

  card.innerHTML = `
    <img src="${video.portada}" alt="${video.titulo}">
    <h3>${video.titulo}</h3>
    <div class="video-meta">
      <span class="date">${video.fecha}</span>
      <span class="author">${video.autor}${video.autor === 'TripGore' ? ' <span style="display: inline-flex; align-items: center; justify-content: center; width: 10px; height: 10px; background-color: #d00000; border-radius: 50%; margin-left: 3px; vertical-align: middle;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : ''}</span>
    </div>
  `;

  // Agregar evento click para abrir la página del video
  // Usar el campo 'id' del video, no el key de Firebase
  card.addEventListener('click', () => {
    window.location.href = `video.html?id=${video.id}`;
  });

  return card;
}

// Función para actualizar la paginación
function actualizarPaginacion() {
  totalPaginas = Math.ceil(mediaDB.length / VIDEOS_POR_PAGINA);

  const paginationDiv = document.querySelector('.pagination');
  if (!paginationDiv) return;

  paginationDiv.innerHTML = '';

  // Información de página
  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${paginaActual} of ${totalPaginas}`;
  paginationDiv.appendChild(pageInfo);

  // Botón primera página
  if (paginaActual > 1) {
    const firstBtn = crearBotonPagina('« First', 1);
    paginationDiv.appendChild(firstBtn);
  }

  // Botón página anterior
  if (paginaActual > 1) {
    const prevBtn = crearBotonPagina('‹', paginaActual - 1);
    paginationDiv.appendChild(prevBtn);
  }

  // Páginas numeradas
  const rango = obtenerRangoPaginas();
  rango.forEach((numeroPagina, index) => {
    if (numeroPagina === '...') {
      const dots = document.createElement('span');
      dots.className = 'page-dots';
      dots.textContent = '...';
      paginationDiv.appendChild(dots);
    } else {
      const pageBtn = crearBotonPagina(numeroPagina.toString(), numeroPagina);
      if (numeroPagina === paginaActual) {
        pageBtn.classList.add('active');
      }
      paginationDiv.appendChild(pageBtn);
    }
  });

  // Botón página siguiente
  if (paginaActual < totalPaginas) {
    const nextBtn = crearBotonPagina('›', paginaActual + 1);
    paginationDiv.appendChild(nextBtn);
  }

  // Botón última página
  if (paginaActual < totalPaginas) {
    const lastBtn = crearBotonPagina('Last »', totalPaginas);
    paginationDiv.appendChild(lastBtn);
  }
}

// Función para crear un botón de página
function crearBotonPagina(texto, numeroPagina) {
  const btn = document.createElement('a');
  btn.href = numeroPagina === 1 ? 'index.html' : `index.html?page=${numeroPagina}`;
  btn.className = 'page-link';
  btn.textContent = texto;
  btn.onclick = (e) => {
    e.preventDefault();
    paginaActual = numeroPagina;
    actualizarURL(numeroPagina);
    renderizarVideos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return btn;
}

// Función para obtener el rango de páginas a mostrar
function obtenerRangoPaginas() {
  const rango = [];
  const maxBotones = 5;

  if (totalPaginas <= maxBotones + 4) {
    // Mostrar todas las páginas si son pocas
    for (let i = 1; i <= totalPaginas; i++) {
      rango.push(i);
    }
  } else {
    // Siempre mostrar las primeras páginas
    rango.push(1);

    if (paginaActual > 3) {
      rango.push('...');
    }

    // Páginas alrededor de la actual
    const inicio = Math.max(2, paginaActual - 1);
    const fin = Math.min(totalPaginas - 1, paginaActual + 1);

    for (let i = inicio; i <= fin; i++) {
      if (!rango.includes(i)) {
        rango.push(i);
      }
    }

    if (paginaActual < totalPaginas - 2) {
      rango.push('...');
    }

    // Siempre mostrar la última página
    if (!rango.includes(totalPaginas)) {
      rango.push(totalPaginas);
    }
  }

  return rango;
}

// Renderizar videos de "Más Famosos"
function renderizarVideosFamosos() {
  const famousGrid = document.querySelector('.famous-section .videos-grid');
  if (!famousGrid) return;

  famousGrid.innerHTML = '';

  // Importar la base de datos de videos destacados
  import('./database/featuredDB.js').then(module => {
    const featuredDB = module.featuredDB;

    // Obtener videos completos de los IDs destacados
    const videosDestacados = featuredDB
      .map(featured => todosLosVideos.find(video => video.id === featured.id))
      .filter(video => video !== undefined);

    // Si hay más de 4 videos, seleccionar 4 aleatorios
    let videosMostrar;
    if (videosDestacados.length > 8) {
      videosMostrar = [];
      const indicesUsados = new Set();

      while (videosMostrar.length < 8) {
        const indiceAleatorio = Math.floor(Math.random() * videosDestacados.length);
        if (!indicesUsados.has(indiceAleatorio)) {
          indicesUsados.add(indiceAleatorio);
          videosMostrar.push(videosDestacados[indiceAleatorio]);
        }
      }
    } else {
      videosMostrar = videosDestacados;
    }

    // Renderizar los videos seleccionados
    videosMostrar.forEach(video => {
      const videoCard = crearTarjetaVideo(video);
      famousGrid.appendChild(videoCard);
    });
  }).catch(error => {
    console.error('Error cargando videos destacados:', error);
    // Fallback: mostrar videos ordenados por fecha
    const videosOrdenados = ordenarVideosPorFecha(todosLosVideos);
    const videosFamosos = videosOrdenados.slice(0, 8);

    videosFamosos.forEach(video => {
      const videoCard = crearTarjetaVideo(video);
      famousGrid.appendChild(videoCard);
    });
  });
}

// Actualizar contadores en el footer
function actualizarContadores() {
  const videoCount = document.getElementById('video-count');
  const colaboradorCount = document.getElementById('colaborador-count');

  if (videoCount) {
    videoCount.textContent = todosLosVideos.length;
  }

  // Contar colaboradores únicos
  if (colaboradorCount) {
    const autoresUnicos = new Set(todosLosVideos.map(video => video.autor));
    colaboradorCount.textContent = autoresUnicos.size;
  }
}

// Renderizar videos de colaboradores aleatorios
function renderizarVideosColaboradores() {
  const colaboradoresList = document.querySelector('.colaboradores-list');
  if (!colaboradoresList) return;

  // Filtrar videos de colaboradores (excluyendo TripGore)
  const videosColaboradores = todosLosVideos.filter(
    video => video.autor && video.autor !== 'TripGore'
  );

  // Mezclar aleatoriamente y tomar 8
  const videosAleatorios = videosColaboradores
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  // Limpiar la lista actual
  colaboradoresList.innerHTML = '';

  // Renderizar cada video
  videosAleatorios.forEach(video => {
    const colaboradorCard = document.createElement('div');
    colaboradorCard.className = 'colaborador-card';
    colaboradorCard.style.cursor = 'pointer';

    colaboradorCard.innerHTML = `
      <img src="${video.portada}" alt="${video.titulo}">
      <div class="colaborador-info">
        <h3>${video.titulo}</h3>
        <p class="autor">${video.autor}</p>
        <p class="date">${video.fecha}</p>
      </div>
    `;

    // Agregar evento click para ir a la página del video
    colaboradorCard.addEventListener('click', () => {
      window.location.href = `video.html?id=${video.id}`;
    });

    colaboradoresList.appendChild(colaboradorCard);
  });
}

// Renderizar todos los colaboradores con sus estadísticas
function renderizarTodosLosColaboradores() {
  const colaboradoresGrid = document.getElementById('colaboradores-stats-grid');
  if (!colaboradoresGrid) return;

  // Contar videos por autor (excluyendo TripGore)
  const conteoAutores = {};
  todosLosVideos.forEach(video => {
    if (video.autor && video.autor !== 'TripGore') {
      conteoAutores[video.autor] = (conteoAutores[video.autor] || 0) + 1;
    }
  });

  // Convertir a array y ordenar por cantidad de videos (descendente)
  const colaboradores = Object.entries(conteoAutores)
    .map(([autor, cantidad]) => ({ autor, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Limpiar el grid
  colaboradoresGrid.innerHTML = '';

  // Renderizar cada colaborador
  colaboradores.forEach(colaborador => {
    const card = document.createElement('div');
    card.className = 'colaborador-stat-card';

    card.innerHTML = `
      <span class="colaborador-stat-name">${colaborador.autor}</span>
      <span class="colaborador-stat-videos">${colaborador.cantidad} ${colaborador.cantidad === 1 ? 'video' : 'videos'}</span>
    `;

    // Agregar evento click para buscar videos del colaborador
    card.addEventListener('click', () => {
      window.location.href = `index.html?autor=${encodeURIComponent(colaborador.autor)}`;
    });

    colaboradoresGrid.appendChild(card);
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Leer página de la URL
  paginaActual = obtenerPaginaDeURL();

  // Renderizar videos principales (inicialmente con mediaDB)
  renderizarVideos();

  // Renderizar videos famosos
  renderizarVideosFamosos();

  // Actualizar contadores
  actualizarContadores();

  // Renderizar videos de colaboradores (inicialmente con mediaDB)
  renderizarVideosColaboradores();

  // Renderizar todos los colaboradores
  renderizarTodosLosColaboradores();

  // Cargar videos de Firebase (esto actualizará automáticamente la vista)
  cargarVideosFirebase();
});