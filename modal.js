
// Modal de verificación de edad
class AgeVerificationModal {
    constructor() {
        this.modal = null;
        this.storageKey = 'ageVerificationDismissed';
        this.init();
    }

    init() {
        // Verificar si el usuario ya dismissó el modal
        if (localStorage.getItem(this.storageKey) === 'true') {
            return; // No mostrar el modal
        }

        // Crear el modal
        this.createModal();
        
        // Mostrar el modal después de que la página cargue
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.showModal();
            }, 500);
        });
    }

    createModal() {
        // Crear el HTML del modal
        const modalHTML = `
            <div id="ageVerificationModal" class="age-modal-overlay">
                <div class="age-modal-content">
                    <div class="age-modal-logo">
                        <img src="https://files.catbox.moe/cjmaz9.png" alt="TRIPGORE Logo" class="age-modal-logo-img">
                    </div>
                    
                    <div class="age-modal-text">
                        <p>Estimado/a usuario/a esta página es completamente segura para todos, no nos caracterizamos por ser una página peligrosa, únicamente fomentamos los casos más impactantes de todo internet, por lo que se recomienda ser mayor de 18 años para poder acceder.</p>
                        
                        <div class="age-modal-warning">
                            <i class="fa-solid fa-exclamation-triangle"></i>
                            <strong>RECUERDE QUE TODO LO QUE VEA SERÁ BAJO SU RESPONSABILIDAD</strong>
                        </div>
                    </div>

                    <div class="age-modal-buttons">
                        <button id="ageModalAccept" class="age-btn age-btn-accept">
                            <i class="fa-solid fa-check"></i>
                            Soy mayor de edad
                        </button>
                        <button id="ageModalReject" class="age-btn age-btn-reject">
                            <i class="fa-solid fa-times"></i>
                            No soy mayor de edad
                        </button>
                    </div>

                    <div class="age-modal-checkbox">
                        <label for="dontShowAgain" class="checkbox-label">
                            <input type="checkbox" id="dontShowAgain" class="checkbox-input">
                            <span class="checkbox-custom"></span>
                            No mostrar de nuevo
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Insertar el modal en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Obtener referencia al modal
        this.modal = document.getElementById('ageVerificationModal');
        
        // Agregar event listeners
        this.addEventListeners();
        
        // Agregar estilos CSS
        this.addStyles();
    }

    addEventListeners() {
        const acceptBtn = document.getElementById('ageModalAccept');
        const rejectBtn = document.getElementById('ageModalReject');
        const dontShowCheckbox = document.getElementById('dontShowAgain');

        // Botón "Soy mayor de edad"
        acceptBtn.addEventListener('click', () => {
            this.handleAccept(dontShowCheckbox.checked);
        });

        // Botón "No soy mayor de edad"
        rejectBtn.addEventListener('click', () => {
            this.handleReject(dontShowCheckbox.checked);
        });

        // Prevenir que el modal se cierre al hacer clic fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                e.preventDefault();
            }
        });
    }

    handleAccept(dontShowAgain) {
        if (dontShowAgain) {
            localStorage.setItem(this.storageKey, 'true');
        }
        this.hideModal();
    }

    handleReject(dontShowAgain) {
        if (dontShowAgain) {
            localStorage.setItem(this.storageKey, 'true');
        }
        
        // Intentar cerrar la ventana/pestaña o redirigir
        try {
            window.close();
        } catch (e) {
            // Si no se puede cerrar, redirigir a una página en blanco o Google
            window.location.href = 'about:blank';
        }
        
        // Fallback: redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 100);
    }

    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
            
            // Animación de entrada
            setTimeout(() => {
                this.modal.classList.add('age-modal-show');
            }, 10);
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.add('age-modal-hide');
            document.body.style.overflow = ''; // Restaurar scroll
            
            setTimeout(() => {
                this.modal.style.display = 'none';
                this.modal.remove();
            }, 300);
        }
    }

    addStyles() {
        const styles = `
            <style>
                .age-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .age-modal-overlay.age-modal-show {
                    opacity: 1;
                }

                .age-modal-overlay.age-modal-hide {
                    opacity: 0;
                }

                .age-modal-content {
                    background: linear-gradient(145deg, #2a0000, #1a0000);
                    border: 3px solid #DC143C;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(220, 20, 60, 0.4);
                    position: relative;
                    transform: scale(0.7);
                    transition: transform 0.3s ease;
                }

                .age-modal-show .age-modal-content {
                    transform: scale(1);
                }

                .age-modal-hide .age-modal-content {
                    transform: scale(0.7);
                }

                .age-modal-logo {
                    margin-bottom: 30px;
                }

                .age-modal-logo-img {
                    height: 80px;
                    width: auto;
                    filter: drop-shadow(0 0 20px rgba(220, 20, 60, 0.5));
                }

                .age-modal-text {
                    color: #FFB6C1;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                    text-align: justify;
                }

                .age-modal-warning {
                    background: rgba(220, 20, 60, 0.2);
                    border: 2px solid #DC143C;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 25px 0;
                    color: #FF6B6B;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    justify-content: center;
                }

                .age-modal-warning i {
                    font-size: 24px;
                    color: #DC143C;
                    text-shadow: 0 0 10px rgba(220, 20, 60, 0.7);
                }

                .age-modal-buttons {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 25px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .age-btn {
                    padding: 15px 25px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 200px;
                    justify-content: center;
                }

                .age-btn-accept {
                    background: linear-gradient(145deg, #228B22, #32CD32);
                    color: white;
                    border: 2px solid #32CD32;
                }

                .age-btn-accept:hover {
                    background: linear-gradient(145deg, #32CD32, #228B22);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(50, 205, 50, 0.4);
                }

                .age-btn-reject {
                    background: linear-gradient(145deg, #8B0000, #DC143C);
                    color: white;
                    border: 2px solid #DC143C;
                }

                .age-btn-reject:hover {
                    background: linear-gradient(145deg, #DC143C, #8B0000);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(220, 20, 60, 0.4);
                }

                .age-modal-checkbox {
                    margin-top: 20px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #FFB6C1;
                    font-size: 14px;
                    cursor: pointer;
                    user-select: none;
                }

                .checkbox-input {
                    display: none;
                }

                .checkbox-custom {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #DC143C;
                    border-radius: 4px;
                    background: transparent;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .checkbox-input:checked + .checkbox-custom {
                    background: #DC143C;
                    border-color: #DC143C;
                }

                .checkbox-input:checked + .checkbox-custom::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 14px;
                    font-weight: bold;
                }

                .checkbox-custom:hover {
                    border-color: #FF6B6B;
                    box-shadow: 0 0 10px rgba(220, 20, 60, 0.3);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .age-modal-content {
                        padding: 30px 20px;
                        margin: 20px;
                    }

                    .age-modal-text {
                        font-size: 14px;
                    }

                    .age-modal-warning {
                        font-size: 16px;
                        padding: 15px;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .age-modal-buttons {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .age-btn {
                        min-width: 100%;
                        padding: 12px 20px;
                        font-size: 14px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Inicializar el modal cuando se carga el script
new AgeVerificationModal();
