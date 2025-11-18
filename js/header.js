document.addEventListener('DOMContentLoaded', async function() {
  const headerHTML = `
    <div class="container">
      <div class="logo-container">
        <a href="../index.html"><img src="https://files.catbox.moe/j5v5s8.png" alt="TripGore Logo" class="logo"></a>
      </div>
      <div class="mobile-buttons">
        <button class="menu-toggle" id="menuToggle">EXPLORAR</button>
        <button class="mobile-auth-btn" id="mobileAuthBtn">INICIAR SESIÓN</button>
      </div>
      <p class="tagline">Los casos más impactantes de todo internet</p>
      <nav>
        <ul>
          <li><a href="../index.html" class="inicio-btn">INICIO</a></li>
          <li><a href="#" id="colaboradores-link">Colaboradores</a></li>
          <li><a href="../public/aris.html">Aris</a></li>
          <li><a href="mailto:colabmc.net@gmail.com?subject=Soporte&body=Hola,%20necesito%20ayuda%20con:%20">Soporte</a></li>
          <li><a href="https://t.me/perritogoree">Telegram</a></li>
          <li><a href="../public/roles.html">Roles</a></li>
          <li class="upload-btn-container"><a href="../public/subir.html" class="upload-btn">SUBIR VIDEO</a></li>
          <li class="upload-btn-container"><a href="../public/vip.html" class="upload-btn">VIP</a></li>
        </ul>
      </nav>
    </div>
  `;

  const mobileMenuHTML = `
    <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-header">
        <span class="mobile-menu-title">MENÚ</span>
        <button class="mobile-menu-close" id="mobileMenuClose">&times;</button>
      </div>
      <div class="mobile-menu-user-section" id="mobileMenuUserSection">
        <!-- Se llenará dinámicamente -->
      </div>
      <nav>
        <ul>
          <li><a href="../index.html" class="inicio-btn">INICIO</a></li>
          <li><a href="#" id="colaboradores-link-mobile">Colaboradores</a></li>
          <li><a href="../public/aris.html">Aris</a></li>
          <li><a href="mailto:colabmc.net@gmail.com?subject=Soporte&body=Hola,%20necesito%20ayuda%20con:%20">Soporte</a></li>
          <li><a href="https://t.me/perritogoree">Telegram</a></li>
          <li><a href="../public/roles.html">Roles</a></li>
          <li><a href="../public/subir.html" class="inicio-btn">SUBIR VIDEO</a></li>
          <li><a href="../public/vip.html" class="inicio-btn">VIP</a></li>
        </ul>
      </nav>
    </div>
  `;

  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = headerHTML;
    document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);

    // Agregar evento click al enlace de colaboradores del header
    const colaboradoresLink = document.getElementById('colaboradores-link');
    if (colaboradoresLink) {
      colaboradoresLink.addEventListener('click', function(e) {
        e.preventDefault();
        const colaboradoresSection = document.querySelector('.all-colaboradores-section');
        if (colaboradoresSection) {
          colaboradoresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Agregar evento click al enlace de colaboradores del menú móvil
    const colaboradoresLinkMobile = document.getElementById('colaboradores-link-mobile');
    if (colaboradoresLinkMobile) {
      colaboradoresLinkMobile.addEventListener('click', function(e) {
        e.preventDefault();
        const colaboradoresSection = document.querySelector('.all-colaboradores-section');
        if (colaboradoresSection) {
          colaboradoresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Funcionalidad del menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    function openMenu() {
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', openMenu);
    }

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', closeMenu);
    }

    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener('click', closeMenu);
    }

    // Cerrar menú al hacer click en un enlace
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Actualizar botón de autenticación móvil
    await updateMobileAuthButton();

    // Actualizar sección de usuario en el menú móvil
    await updateMobileMenuUserSection();
  }
});

// Función para actualizar la sección de usuario en el menú móvil
async function updateMobileMenuUserSection() {
  const mobileMenuUserSection = document.getElementById('mobileMenuUserSection');
  if (!mobileMenuUserSection) return;

  try {
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');
    const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
    const { app } = await import('./firebase.js');
    const { uservips } = await import('../database/uservips.js');

    const auth = getAuth(app);
    const database = getDatabase(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario autenticado - obtener datos completos
        try {
          const emailKey = user.email.split('@')[0];
          const userRef = ref(database, `puntos/${emailKey}`);
          const snapshot = await get(userRef);

          let username = emailKey;
          let points = 0;
          let role = null;

          if (snapshot.exists()) {
            const data = snapshot.val();
            username = data.username || emailKey;
            points = data.puntos || 0;
          }

          // Esperar a que el script de roles esté cargado
          if (typeof getRoleByPoints !== 'undefined' && typeof getRoleBadgeHTML !== 'undefined') {
            role = getRoleByPoints(points);
          }

          // Crear HTML de la sección de usuario
          const roleBadgeHTML = role ? getRoleBadgeHTML(role) : '';

          const isVip = Array.isArray(uservips) && uservips.some(entry => entry && entry.username === emailKey && entry.rol === 'vip');
          const usernameClass = isVip ? 'mobile-user-name rgb-username' : 'mobile-user-name';

          mobileMenuUserSection.innerHTML = `
            <div class="mobile-menu-user-info">
              <p class="${usernameClass}">${username}</p>
              ${roleBadgeHTML ? `<div class="mobile-user-role">${roleBadgeHTML}</div>` : ''}
              <p class="mobile-user-points">Pts: <span>${points}</span></p>
              <div class="mobile-user-buttons">
                <button class="mobile-logout-btn" id="mobileLogoutBtn">Logout</button>
                <button class="mobile-profile-btn" id="mobileProfileBtn">Perfil</button>
              </div>
            </div>
          `;

          // Agregar eventos a los botones
          const logoutBtn = document.getElementById('mobileLogoutBtn');
          const profileBtn = document.getElementById('mobileProfileBtn');

          if (logoutBtn) {
            logoutBtn.onclick = async () => {
              await auth.signOut();
              window.location.href = '../index.html';
            };
          }

          if (profileBtn) {
            profileBtn.onclick = () => {
              const currentPath = window.location.pathname;
              const profilePath = currentPath.includes('/auth/') ? '../public/perfil.html' : 'public/perfil.html';
              window.location.href = profilePath;
            };
          }

        } catch (error) {
          console.error('Error al obtener datos del usuario para menú móvil:', error);
          mobileMenuUserSection.innerHTML = '';
        }
      } else {
        // Usuario no autenticado - no mostrar nada
        mobileMenuUserSection.innerHTML = '';
      }
    });
  } catch (error) {
    console.error('Error al configurar sección de usuario del menú móvil:', error);
  }
}

// Función para actualizar el botón de autenticación móvil
async function updateMobileAuthButton() {
  const mobileAuthBtn = document.getElementById('mobileAuthBtn');
  if (!mobileAuthBtn) return;

  try {
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');
    const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js');
    const { app } = await import('./firebase.js');

    const auth = getAuth(app);
    const database = getDatabase(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario autenticado - obtener nombre de usuario
        try {
          const emailKey = user.email.split('@')[0];
          const userRef = ref(database, `puntos/${emailKey}`);
          const snapshot = await get(userRef);

          let username = emailKey;
          if (snapshot.exists()) {
            const data = snapshot.val();
            username = data.username || emailKey;
          }

          // Mostrar nombre de usuario (truncado si es muy largo)
          const displayName = username.length > 10 ? username.substring(0, 10) + '...' : username;
          mobileAuthBtn.textContent = displayName;
          mobileAuthBtn.classList.add('logged-in');

          // Redirigir al perfil al hacer click
          mobileAuthBtn.onclick = () => {
            const currentPath = window.location.pathname;
            const profilePath = currentPath.includes('/auth/') ? '../public/perfil.html' : 'public/perfil.html';
            window.location.href = profilePath;
          };
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          const displayName = user.email.split('@')[0];
          mobileAuthBtn.textContent = displayName.length > 10 ? displayName.substring(0, 10) + '...' : displayName;
          mobileAuthBtn.classList.add('logged-in');
        }
      } else {
        // Usuario no autenticado - mostrar "INICIAR SESIÓN"
        mobileAuthBtn.textContent = 'INICIAR SESIÓN';
        mobileAuthBtn.classList.remove('logged-in');

        // Redirigir al login al hacer click
        mobileAuthBtn.onclick = () => {
          const currentPath = window.location.pathname;
          const loginPath = currentPath.includes('/auth/') ? 'login.html' : 'auth/login.html';
          window.location.href = loginPath;
        };
      }
    });
  } catch (error) {
    console.error('Error al configurar botón de autenticación móvil:', error);
  }
}