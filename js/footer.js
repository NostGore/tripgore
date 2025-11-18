
document.addEventListener('DOMContentLoaded', function() {
  const footerHTML = `
    <div class="container">
      <div class="footer-content">
        <p class="copyright">© TRIPGORE - 2025</p>
        <div class="footer-stats">
          <span>Videos: <span id="video-count">12</span></span>
          <span>Colaboradores: <span id="colaborador-count">8</span></span>
        </div>
        <div class="footer-social">
          <a href="https://t.me/perritogoree" class="social-link">Telegram</a>
          <a href="https://discord.gg/pS7qvjP4S5" class="social-link">Discord</a>
        </div>
      </div>
    </div>
  `;

  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = footerHTML;
  }
});
