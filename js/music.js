// ========================================
// SCRIPT DE MÚSICA TRIPGORE
// ========================================

class TripGoreMusic {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3; // Volumen por defecto (30%)
        this.isMuted = false;
        this.originalVolume = 0.3;
        this.isInitialized = false;
        
        // Configuración de la música
        this.musicConfig = {
            src: 'other/gorex.mp3',
            loop: true,
            preload: 'auto',
            volume: this.volume
        };
        
        this.init();
    }

    // Inicializar el reproductor de música
    init() {
        try {
            // Crear elemento de audio
            this.audio = new Audio();
            this.audio.src = this.musicConfig.src;
            this.audio.loop = this.musicConfig.loop;
            this.audio.preload = this.musicConfig.preload;
            this.audio.volume = this.volume;
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Crear controles de música
            this.createMusicControls();
            
            this.isInitialized = true;
            console.log('🎵 TripGore Music inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la música:', error);
        }
    }

    // Configurar eventos del audio
    setupEventListeners() {
        if (!this.audio) return;

        // Evento cuando la música se puede reproducir
        this.audio.addEventListener('canplaythrough', () => {
            console.log('🎵 Música cargada y lista para reproducir');
        });

        // Evento cuando hay error al cargar
        this.audio.addEventListener('error', (e) => {
            console.error('❌ Error al cargar la música:', e);
            this.showMusicError();
        });

        // Evento cuando la música termina
        this.audio.addEventListener('ended', () => {
            if (this.musicConfig.loop) {
                this.audio.currentTime = 0;
                this.audio.play().catch(e => console.error('Error al reiniciar música:', e));
            }
        });

        // Evento cuando la música se pausa
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        // Evento cuando la música se reproduce
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });
    }

    // Crear controles de música en la interfaz
    createMusicControls() {
        // Verificar si ya existen los controles
        if (document.getElementById('music-controls')) return;

        const controlsHTML = `
            <div id="music-controls" class="music-controls">
                <div class="music-info">
                    <i class="fa-solid fa-music"></i>
                    <span class="music-title">GOREX</span>
                </div>
                <div class="music-buttons">
                    <button id="play-pause-btn" class="music-btn" title="Reproducir/Pausar">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button id="mute-btn" class="music-btn" title="Silenciar/Activar">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <div class="volume-control">
                        <input type="range" id="volume-slider" min="0" max="100" value="30" title="Volumen">
                    </div>
                </div>
            </div>
        `;

        // Insertar controles en el body
        document.body.insertAdjacentHTML('beforeend', controlsHTML);

        // Agregar estilos CSS
        this.addMusicStyles();

        // Configurar eventos de los controles
        this.setupControlEvents();
    }

    // Agregar estilos CSS para los controles
    addMusicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .music-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border: 2px solid #444;
                border-radius: 15px;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .music-controls:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
            }

            .music-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #fff;
                font-weight: bold;
                font-size: 14px;
            }

            .music-info i {
                color: #ff0000;
                font-size: 16px;
            }

            .music-buttons {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .music-btn {
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                color: white;
                border: none;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .music-btn:hover {
                background: linear-gradient(135deg, #cc0000 0%, #990000 100%);
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
            }

            .music-btn:active {
                transform: scale(0.95);
            }

            .volume-control {
                display: flex;
                align-items: center;
            }

            .volume-control input[type="range"] {
                width: 80px;
                height: 4px;
                background: #444;
                outline: none;
                border-radius: 2px;
                cursor: pointer;
                -webkit-appearance: none;
            }

            .volume-control input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: #ff0000;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            .volume-control input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: #ff0000;
                border-radius: 50%;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .music-controls {
                    bottom: 10px;
                    right: 10px;
                    padding: 12px 15px;
                    gap: 10px;
                }

                .music-info {
                    font-size: 12px;
                }

                .music-btn {
                    width: 30px;
                    height: 30px;
                    font-size: 12px;
                }

                .volume-control input[type="range"] {
                    width: 60px;
                }
            }

            @media (max-width: 480px) {
                .music-controls {
                    flex-direction: column;
                    gap: 8px;
                    padding: 10px;
                }

                .music-buttons {
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Configurar eventos de los controles
    setupControlEvents() {
        // Botón play/pause
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Botón mute/unmute
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Control de volumen
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseInt(e.target.value) / 100);
            });
        }
    }

    // Reproducir música
    play() {
        if (!this.audio || !this.isInitialized) return;

        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButton();
            console.log('🎵 Música iniciada');
        }).catch(error => {
            console.error('❌ Error al reproducir música:', error);
            this.showMusicError();
        });
    }

    // Pausar música
    pause() {
        if (!this.audio) return;

        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        console.log('⏸️ Música pausada');
    }

    // Alternar reproducción/pausa
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    // Silenciar/activar sonido
    toggleMute() {
        if (!this.audio) return;

        if (this.isMuted) {
            this.audio.volume = this.originalVolume;
            this.isMuted = false;
            document.getElementById('volume-slider').value = this.originalVolume * 100;
        } else {
            this.originalVolume = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
            document.getElementById('volume-slider').value = 0;
        }

        this.updateMuteButton();
        console.log(this.isMuted ? '🔇 Música silenciada' : '🔊 Música activada');
    }

    // Establecer volumen
    setVolume(volume) {
        if (!this.audio) return;

        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        
        if (this.volume > 0) {
            this.isMuted = false;
            this.originalVolume = this.volume;
        }

        this.updateMuteButton();
    }

    // Actualizar botón de play/pause
    updatePlayButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (!playPauseBtn) return;

        const icon = playPauseBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fa-solid fa-pause';
            playPauseBtn.title = 'Pausar música';
        } else {
            icon.className = 'fa-solid fa-play';
            playPauseBtn.title = 'Reproducir música';
        }
    }

    // Actualizar botón de mute
    updateMuteButton() {
        const muteBtn = document.getElementById('mute-btn');
        if (!muteBtn) return;

        const icon = muteBtn.querySelector('i');
        if (this.isMuted || this.volume === 0) {
            icon.className = 'fa-solid fa-volume-mute';
            muteBtn.title = 'Activar sonido';
        } else if (this.volume < 0.5) {
            icon.className = 'fa-solid fa-volume-low';
            muteBtn.title = 'Silenciar música';
        } else {
            icon.className = 'fa-solid fa-volume-high';
            muteBtn.title = 'Silenciar música';
        }
    }

    // Mostrar error de música
    showMusicError() {
        const controls = document.getElementById('music-controls');
        if (controls) {
            controls.style.background = 'linear-gradient(135deg, #8B0000 0%, #2d2d2d 100%)';
            controls.style.borderColor = '#ff0000';
            
            const musicTitle = controls.querySelector('.music-title');
            if (musicTitle) {
                musicTitle.textContent = 'Musica';
                musicTitle.style.color = '#ff0000';
            }
        }
    }

    // Obtener estado de la música
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            volume: this.volume,
            isMuted: this.isMuted,
            isInitialized: this.isInitialized
        };
    }

    // Destruir el reproductor
    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio = null;
        }

        const controls = document.getElementById('music-controls');
        if (controls) {
            controls.remove();
        }

        this.isPlaying = false;
        this.isInitialized = false;
        console.log('🎵 Reproductor de música destruido');
    }
}

// ========================================
// INICIALIZACIÓN GLOBAL
// ========================================

// Variable global para el reproductor
let tripGoreMusic = null;

// Función para inicializar la música
function initTripGoreMusic() {
    if (!tripGoreMusic) {
        tripGoreMusic = new TripGoreMusic();
    }
    return tripGoreMusic;
}

// Función para obtener el reproductor
function getTripGoreMusic() {
    return tripGoreMusic;
}

// Función para reproducir música automáticamente
function autoPlayMusic() {
    if (tripGoreMusic) {
        // Esperar un poco para que la página se cargue completamente
        setTimeout(() => {
            tripGoreMusic.play();
        }, 1000);
    }
}

// Función para pausar música
function pauseMusic() {
    if (tripGoreMusic) {
        tripGoreMusic.pause();
    }
}

// Función para alternar música
function toggleMusic() {
    if (tripGoreMusic) {
        tripGoreMusic.togglePlayPause();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el reproductor
    initTripGoreMusic();
    
    // Reproducir automáticamente después de 2 segundos
    setTimeout(() => {
        autoPlayMusic();
    }, 2000);
});

// Pausar música cuando la página se oculta (opcional)
document.addEventListener('visibilitychange', function() {
    if (tripGoreMusic) {
        if (document.hidden) {
            // Opcional: pausar cuando la página no está visible
            // tripGoreMusic.pause();
        } else {
            // Opcional: reanudar cuando la página vuelve a ser visible
            // tripGoreMusic.play();
        }
    }
});

// Exportar funciones globales
window.TripGoreMusic = TripGoreMusic;
window.initTripGoreMusic = initTripGoreMusic;
window.getTripGoreMusic = getTripGoreMusic;
window.autoPlayMusic = autoPlayMusic;
window.pauseMusic = pauseMusic;
window.toggleMusic = toggleMusic;
