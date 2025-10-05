document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ha pedido no volver a ver los anuncios
    if (localStorage.getItem('hidePopupAds') === 'true') {
        console.log('Anuncios emergentes ocultos por preferencia del usuario.');
        return;
    }

    // Verificar si la base de datos de anuncios emergentes existe
    if (typeof popupAds === 'undefined' || popupAds.length === 0) {
        console.log('No hay anuncios emergentes para mostrar.');
        return;
    }

    const overlay = document.getElementById('popup-ads-overlay');
    const container = document.getElementById('popup-ads-container');
    const closeAllBtn = document.getElementById('closeAllAdsBtn');
    const dontShowAgainBtn = document.getElementById('dontShowAgainBtn');

    if (!overlay || !container || !closeAllBtn || !dontShowAgainBtn) {
        console.error('No se encontraron los elementos necesarios para los anuncios emergentes.');
        return;
    }

    // Función para cerrar todos los anuncios
    function closeAllAds() {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }

    // Función para cerrar un anuncio específico
    function closeSingleAd(adId) {
        const adCard = document.getElementById(`ad-card-${adId}`);
        if (adCard) {
            adCard.remove();
        }
        // Si no quedan más anuncios, cerrar el overlay
        if (container.children.length === 0) {
            closeAllAds();
        }
    }

    // Crear y mostrar los anuncios
    function showAds() {
        container.innerHTML = ''; // Limpiar contenedor

        popupAds.forEach(ad => {
            const adCard = document.createElement('div');
            adCard.className = 'popup-ad-card';
            adCard.id = `ad-card-${ad.id}`;

            adCard.innerHTML = `
                <button class="popup-ad-close-btn">&times;</button>
                <a href="${ad.direccion}" target="_blank">
                    <img src="${ad.imagen}" alt="Anuncio">
                </a>
            `;

            // Evento para el botón de cerrar individual
            adCard.querySelector('.popup-ad-close-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el clic se propague al enlace
                closeSingleAd(ad.id);
            });

            container.appendChild(adCard);
        });

        // Mostrar el overlay
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
    }

    // Eventos para los botones de control
    closeAllBtn.addEventListener('click', closeAllAds);

    dontShowAgainBtn.addEventListener('click', () => {
        localStorage.setItem('hidePopupAds', 'true');
        closeAllAds();
    });

    // Mostrar los anuncios al cargar la página
    showAds();
});