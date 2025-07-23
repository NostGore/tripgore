
// Music Background System
class MusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.currentTrack = null;
        this.tracks = [
            'music/gores.mp3'
        ];
        this.init();
    }

    init() {
        this.createAudioElement();
        this.createControls();
        this.setupEventListeners();
    }

    createAudioElement() {
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        this.audio.autoplay = true; // Intentar autoplay nativo
        this.audio.muted = false; // Asegurar que no esté silenciado

        // Configurar atributos adicionales para compatibilidad
        this.audio.setAttribute('autoplay', 'true');
        this.audio.setAttribute('loop', 'true');

        // Usar el archivo local gores.mp3
        this.currentTrack = 'music/gores.mp3';
        this.audio.src = this.currentTrack;
        
        // Intentar cargar inmediatamente
        this.audio.load();
    }

    createControls() {
        // Crear controles de música flotantes
        const musicControls = document.createElement('div');
        musicControls.className = 'music-controls';
        musicControls.innerHTML = `
            <div class="music-control-btn" id="musicToggle">
                <i class="fas fa-music" id="musicIcon"></i>
                <span class="music-text">Activar Música</span>
            </div>
        `;

        // Agregar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .music-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                background: rgba(139, 0, 0, 0.9);
                border: 2px solid #DC143C;
                border-radius: 25px;
                padding: 12px 18px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
            }

            .music-controls:hover {
                background: rgba(139, 0, 0, 1);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(220, 20, 60, 0.4);
            }

            .music-control-btn {
                cursor: pointer;
                color: #ffffff;
                font-size: 16px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                user-select: none;
            }

            .music-control-btn:hover {
                color: #FFB6C1;
                transform: scale(1.05);
            }

            .music-text {
                font-weight: 500;
                font-size: 14px;
                white-space: nowrap;
            }

            #musicIcon {
                font-size: 18px;
                transition: all 0.3s ease;
            }

            .music-control-btn.playing #musicIcon {
                color: #32CD32;
                animation: pulse 2s infinite;
            }

            .music-control-btn.paused #musicIcon {
                color: #DC143C;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .music-controls {
                    bottom: 15px;
                    right: 15px;
                    padding: 10px 15px;
                }

                .music-control-btn {
                    font-size: 14px;
                }

                .music-text {
                    font-size: 13px;
                }

                #musicIcon {
                    font-size: 16px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(musicControls);
    }

    setupEventListeners() {
        const musicToggle = document.getElementById('musicToggle');
        const musicIcon = document.getElementById('musicIcon');
        const musicText = document.querySelector('.music-text');

        // Toggle play/pause
        musicToggle.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
                musicIcon.className = 'fas fa-volume-mute';
                musicText.textContent = 'Activar Música';
                musicToggle.classList.remove('playing');
                musicToggle.classList.add('paused');
            } else {
                this.play();
                musicIcon.className = 'fas fa-music';
                musicText.textContent = 'Música Activa';
                musicToggle.classList.remove('paused');
                musicToggle.classList.add('playing');
            }
        });

        // Audio events
        this.audio.addEventListener('loadstart', () => {
            console.log('Cargando música de fondo...');
        });

        this.audio.addEventListener('canplaythrough', () => {
            console.log('Música lista para reproducir:', this.currentTrack);
        });

        this.audio.addEventListener('loadeddata', () => {
            console.log('Datos de música cargados correctamente');
        });

        this.audio.addEventListener('error', (e) => {
            console.log('Error al cargar música:', e);
            console.log('Intentando cargar archivo:', this.currentTrack);
            // Intentar recargar el archivo después de un breve delay
            setTimeout(() => {
                console.log('Reintentando cargar música...');
                this.audio.load();
            }, 1000);
        });

        this.audio.addEventListener('ended', () => {
            if (!this.audio.loop) {
                this.playNext();
            }
        });
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            console.log('Reproduciendo música de fondo');
        } catch (error) {
            console.log('Error al reproducir música:', error);
            // Intentar con una pista de respaldo
            this.useFallbackTrack();
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        console.log('Música pausada');
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
    }

    useFallbackTrack() {
        // Si no se puede cargar la música externa, usar un tono generado
        this.createSilentAmbient();
    }

    createSilentAmbient() {
        // Crear un contexto de audio para generar sonido ambiente
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.1;
            gainNode.connect(audioContext.destination);

            // Generar un sonido ambiente muy sutil
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
            oscillator.connect(gainNode);

            if (this.isPlaying) {
                oscillator.start();
            }
        } catch (error) {
            console.log('Audio context no disponible');
        }
    }

    playNext() {
        const currentIndex = this.tracks.indexOf(this.currentTrack);
        const nextIndex = (currentIndex + 1) % this.tracks.length;
        this.currentTrack = this.tracks[nextIndex];
        this.audio.src = this.currentTrack;
        if (this.isPlaying) {
            this.play();
        }
    }

    // Auto-start inmediato
    autoStart() {
        // Marcar como "playing" desde el inicio
        this.isPlaying = true;
        
        // Intentar reproducir inmediatamente múltiples veces
        this.attemptAutoPlay();
        
        // Configurar fallback para el mínimo movimiento
        this.setupMinimalInteraction();
    }

    async attemptAutoPlay() {
        // Intentar reproducir inmediatamente
        try {
            await this.audio.play();
            console.log('Música iniciada automáticamente');
            return;
        } catch (error) {
            console.log('Primera tentativa falló, reintentando...');
        }

        // Segundo intento después de un breve delay
        setTimeout(async () => {
            try {
                await this.audio.play();
                console.log('Música iniciada en segundo intento');
                return;
            } catch (error) {
                console.log('Segundo intento falló, configurando detección mínima...');
            }
        }, 500);

        // Tercer intento después de 1 segundo
        setTimeout(async () => {
            try {
                await this.audio.play();
                console.log('Música iniciada en tercer intento');
            } catch (error) {
                console.log('Esperando mínima interacción...');
            }
        }, 1000);
    }

    setupMinimalInteraction() {
        let musicStarted = false;

        const startMusic = async () => {
            if (musicStarted) return;
            
            try {
                await this.audio.play();
                musicStarted = true;
                console.log('Música iniciada con interacción mínima');
                
                // Remover todos los listeners
                document.removeEventListener('mousemove', startMusic);
                document.removeEventListener('mouseenter', startMusic);
                document.removeEventListener('touchstart', startMusic);
                document.removeEventListener('click', startMusic);
                document.removeEventListener('scroll', startMusic);
                document.removeEventListener('keydown', startMusic);
            } catch (error) {
                console.log('Error al iniciar música:', error);
            }
        };

        // Solo movimiento de mouse y entrada de mouse (lo más pasivo posible)
        document.addEventListener('mousemove', startMusic, { once: true });
        document.addEventListener('mouseenter', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true });
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('scroll', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
    }
}

// Inicializar el reproductor de música
let musicPlayer;

function initMusicPlayer() {
    if (!musicPlayer) {
        musicPlayer = new MusicPlayer();

        // Auto-start inmediatamente
        musicPlayer.autoStart();
    }
}

// Inicializar automáticamente tan pronto como sea posible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMusicPlayer();
    });
} else {
    // Si el DOM ya está cargado, inicializar inmediatamente
    initMusicPlayer();
}

// También intentar inicializar cuando se carga el script
setTimeout(() => {
    if (!musicPlayer) {
        initMusicPlayer();
    }
}, 100);

// Exportar para uso global
window.MusicPlayer = MusicPlayer;
window.initMusicPlayer = initMusicPlayer;
window.musicPlayer = musicPlayer;

export { MusicPlayer, initMusicPlayer };
