import { adsDB } from '../database/adsDB.js';
import { uservips } from '../database/uservips.js';
import { app } from './firebase.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Ejecuta los scripts de anuncios definidos en adsDB.ads
function loadScriptAds() {
  if (!adsDB || !Array.isArray(adsDB.ads)) return;

  adsDB.ads.forEach(ad => {
    try {
      const temp = document.createElement('div');
      temp.innerHTML = ad.html.trim();

      const scriptTag = temp.querySelector('script');
      if (!scriptTag) return;

      const newScript = document.createElement('script');

      for (const attr of scriptTag.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }

      if (!scriptTag.src) {
        newScript.textContent = scriptTag.textContent;
      }

      document.body.appendChild(newScript);
    } catch (e) {
      console.error('Error al cargar anuncio', ad.id, e);
    }
  });
}

// Configura los directLinks para que se abra un enlace aleatorio en el primer clic
function setupDirectLinks() {
  if (!adsDB || !Array.isArray(adsDB.directLinks) || adsDB.directLinks.length === 0) return;

  let lastOpened = 0;

  function onClick(event) {
    const target = event.target;

    const inHeader = target.closest('header');
    const inLoginBox = target.closest('.login-box');
    const inSearchBox = target.closest('.search-box');
    const inSearchResultItem = target.closest('.search-result-item');
    const inAssistantWidget = target.closest('#assistant-widget');
    const inMobileMenu = target.closest('.mobile-menu') || target.closest('#mobileMenu');
    const inMobileMenuOverlay = target.closest('.mobile-menu-overlay') || target.closest('#mobileMenuOverlay');
    const inAgeModalOverlay = target.closest('#age-modal-overlay');
    const inAgeModal = target.closest('.age-modal');

    // No disparar anuncios cuando se hace clic en el header o en el cuadro de sesión
    // En el buscador, sólo bloquear si NO se ha hecho clic en un resultado
    // En el asistente (#assistant-widget) nunca disparar anuncios
    // En el menú móvil (panel u overlay) tampoco disparar anuncios
    if (inHeader || inLoginBox || inAssistantWidget || inMobileMenu || inMobileMenuOverlay || inAgeModalOverlay || inAgeModal || (inSearchBox && !inSearchResultItem)) {
      return;
    }

    const now = Date.now();
    if (now - lastOpened < 2000) return; // cooldown de 2 segundos

    lastOpened = now;

    const links = adsDB.directLinks;
    const randomIndex = Math.floor(Math.random() * links.length);
    const url = links[randomIndex];

    try {
      // Crear un enlace oculto para mejorar compatibilidad en móviles
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);

      anchor.click();

      // Intentar devolver el foco a la página actual (popunder)
      if (typeof window.focus === 'function') {
        window.focus();
      }

      document.body.removeChild(anchor);
    } catch (e) {
      console.error('Error al abrir directLink', e);
    }
  }

  // Usar fase de captura para que este handler se ejecute antes que otros (por ejemplo, los que navegan al video)
  document.addEventListener('click', onClick, true);
}

// Determinar si el usuario actual es VIP según la base de datos local uservips
function isVipUser(user) {
  try {
    if (!user || !user.email) return false;
    if (!Array.isArray(uservips)) return false;

    const emailKey = user.email.split('@')[0];
    return uservips.some(entry => entry && entry.username === emailKey && entry.rol === 'vip');
  } catch (e) {
    console.error('Error al comprobar usuario VIP:', e);
    return false;
  }
}

let adsInitialized = false;

function startAdsIfNeededForUser(user) {
  if (adsInitialized) return;

  const isVip = isVipUser(user);
  if (isVip) {
    // Usuario VIP: no cargar anuncios ni directLinks
    adsInitialized = true;
    return;
  }

  loadScriptAds();

  const path = window.location.pathname || '';
  const isVideoPage = path.endsWith('/video.html') || path.endsWith('video.html');
  const isArisPage = path.endsWith('/aris.html') || path.endsWith('aris.html');

  if (!isVideoPage && !isArisPage) {
    setupDirectLinks();
  }
  adsInitialized = true;
}

function initAdsWithAuth() {
  const auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    startAdsIfNeededForUser(user);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdsWithAuth);
} else {
  initAdsWithAuth();
}
