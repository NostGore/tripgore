import { app } from './firebase.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const auth = getAuth(app);
let currentUsername = '';

// Escuchar el estado de autenticación para obtener el username
onAuthStateChanged(auth, (user) => {
  if (user && user.email) {
    const emailKey = user.email.split('@')[0];
    currentUsername = user.displayName || emailKey;
  } else {
    currentUsername = '';
  }
});

function setupVipButton() {
  const buyButton = document.querySelector('.buy-button');
  if (!buyButton) return;

  buyButton.addEventListener('click', (e) => {
    e.preventDefault();

    const username = currentUsername || 'desconocido';
    const phone = '628999963714'; // +62 8999963714 sin símbolos
    const message = `Hola, quiero adquirir el plan VIP de TRIPGORE mi username es ${username}`;
    const encodedMessage = encodeURIComponent(message);

    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupVipButton);
} else {
  setupVipButton();
}
