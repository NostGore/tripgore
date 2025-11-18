
import { mediaDB } from '../database/mediaDB.js';
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
import { app } from './firebase.js';

const db = getDatabase(app);
let todosLosVideos = [...mediaDB];

// Cargar videos de Firebase al inicio
async function cargarVideosFirebase() {
  try {
    const videosRef = ref(db, 'videos');
    const snapshot = await get(videosRef);
    
    if (snapshot.exists()) {
      const videosFirebase = Object.values(snapshot.val());
      const idsExistentes = new Set(mediaDB.map(v => v.id));
      const videosNuevos = videosFirebase.filter(v => !idsExistentes.has(v.id));
      todosLosVideos = [...mediaDB, ...videosNuevos];
    }
  } catch (error) {
    console.error('Error al cargar videos de Firebase:', error);
  }
}

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Función para buscar videos
function buscarVideos(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryNormalizado = normalizarTexto(query.trim());
  
  const resultados = todosLosVideos.filter(video => {
    const tituloNormalizado = normalizarTexto(video.titulo);
    const autorNormalizado = normalizarTexto(video.autor);
    const categoriaNormalizada = normalizarTexto(video.categoria || '');
    
    return tituloNormalizado.includes(queryNormalizado) ||
           autorNormalizado.includes(queryNormalizado) ||
           categoriaNormalizada.includes(queryNormalizado);
  });

  // Retornar máximo 5 resultados
  return resultados.slice(0, 5);
}

// Función para mostrar resultados
function mostrarResultados(resultados, contenedor) {
  contenedor.innerHTML = '';
  
  if (resultados.length === 0) {
    contenedor.innerHTML = '<div class="search-no-results">No se encontraron videos</div>';
    contenedor.classList.add('active');
    return;
  }

  resultados.forEach(video => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <img src="${video.portada}" alt="${video.titulo}" class="search-result-thumbnail">
      <div class="search-result-info">
        <div class="search-result-title">${video.titulo}</div>
        <div class="search-result-meta">
          <span class="search-result-author">${video.autor}</span>
          <span class="search-result-date">${video.fecha}</span>
        </div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      window.location.href = `video.html?id=${video.id}`;
    });
    
    contenedor.appendChild(item);
  });
  
  contenedor.classList.add('active');
}

// Inicializar buscador
function inicializarBuscador() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(input => {
    const searchBox = input.parentElement;
    let resultsContainer = searchBox.querySelector('.search-results');
    
    // Crear contenedor de resultados si no existe
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'search-results';
      searchBox.appendChild(resultsContainer);
    }
    
    // Evento de escritura
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      
      if (query.trim().length < 2) {
        resultsContainer.classList.remove('active');
        return;
      }
      
      const resultados = buscarVideos(query);
      mostrarResultados(resultados, resultsContainer);
    });
    
    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!searchBox.contains(e.target)) {
        resultsContainer.classList.remove('active');
      }
    });
    
    // Abrir resultados al hacer focus si hay texto
    input.addEventListener('focus', (e) => {
      if (e.target.value.trim().length >= 2) {
        const resultados = buscarVideos(e.target.value);
        mostrarResultados(resultados, resultsContainer);
      }
    });
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  await cargarVideosFirebase();
  inicializarBuscador();
});

export { buscarVideos, inicializarBuscador };
