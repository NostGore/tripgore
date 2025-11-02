document.addEventListener('DOMContentLoaded', () => {
    // Función para obtener la lista de anuncios ocultados desde localStorage
    function getHiddenPopupAds() {
        const stored = localStorage.getItem('hiddenPopupAds');
        return stored ? JSON.parse(stored) : [];
    }

    // Función para agregar un anuncio a la lista de ocultados
    function addHiddenPopupAd(adId) {
        const hiddenAds = getHiddenPopupAds();
        if (!hiddenAds.includes(adId)) {
            hiddenAds.push(adId);
            localStorage.setItem('hiddenPopupAds', JSON.stringify(hiddenAds));
            console.log(`Anuncio "${adId}" agregado a la lista de ocultados.`);
        }
    }

    // Verificar si la base de datos de anuncios emergentes existe
    if (typeof popupAds === 'undefined' || popupAds.length === 0) {
        console.log('No hay anuncios emergentes para mostrar.');
        return;
    }

    // Filtrar anuncios que el usuario ya ha decidido ocultar
    const hiddenAds = getHiddenPopupAds();
    const adsToShow = popupAds.filter(ad => !hiddenAds.includes(ad.id));

    // Si no hay anuncios para mostrar, salir
    if (adsToShow.length === 0) {
        console.log('Todos los anuncios emergentes han sido ocultados por el usuario.');
        return;
    }

    console.log(`${adsToShow.length} de ${popupAds.length} anuncios se mostrarán.`);

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

        // Mostrar solo los anuncios que el usuario aún no ha ocultado
        adsToShow.forEach(ad => {
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

        // Mostrar el overlay solo si hay anuncios para mostrar
        if (adsToShow.length > 0) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
        }
    }

    // Eventos para los botones de control
    closeAllBtn.addEventListener('click', closeAllAds);

    dontShowAgainBtn.addEventListener('click', () => {
        // Agregar todos los anuncios mostrados a la lista de ocultados
        adsToShow.forEach(ad => {
            addHiddenPopupAd(ad.id);
        });
        closeAllAds();
    });

    // Mostrar los anuncios al cargar la página
    showAds();
});