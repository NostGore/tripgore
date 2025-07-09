
class DonationsModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.addEventListeners();
    }

    createModal() {
        const modalHTML = `
            <div id="donationsModal" class="donations-modal-overlay" style="display: none;">
                <div class="donations-modal-content">
                    <div class="donations-header">
                        <h2>DONACIONES TRIPGORE</h2>
                        <button class="close-donations-modal" id="closeDonationsModal">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="donations-body">
                        <div class="donations-message">
                            <p>Tu apoyo nos ayuda a mantener TRIPGORE funcionando y a seguir trayéndote el mejor contenido de horror.</p>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-header">
                                <span class="progress-label">Meta mensual</span>
                                <span class="progress-amount">$15/$100</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 15%;"></div>
                            </div>
                            <div class="progress-status">
                                <span class="progress-percentage">15% completado</span>
                            </div>
                        </div>
                        
                        <div class="donation-info">
                            <p>Recuerda que tu donación es totalmente voluntaria y opcional.</p>
                        </div>
                        
                        <div class="donation-actions">
                            <a href="https://paypal.me/tripgore" target="_blank" class="donate-btn">
                                <i class="fa-brands fa-paypal"></i>
                                Donar Aquí
                            </a>
                        </div>
                        
                        <div class="donation-benefits">
                            <h4>Beneficios de donar:</h4>
                            <ul>
                                <li><i class="fa-solid fa-check"></i> Apoyas el mantenimiento del servidor</li>
                                <li><i class="fa-solid fa-check"></i> Ayudas a mejorar la calidad del contenido</li>
                                <li><i class="fa-solid fa-check"></i> Contribuyes al desarrollo de nuevas funciones</li>
                                <li><i class="fa-solid fa-check"></i> Formas parte de la comunidad TRIPGORE</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('donationsModal');
        this.addStyles();
    }

    addEventListeners() {
        // Botón para cerrar el modal
        document.getElementById('closeDonationsModal').addEventListener('click', () => {
            this.hideModal();
        });

        // Cerrar al hacer clic fuera del modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.hideModal();
            }
        });
    }

    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                this.modal.classList.add('donations-modal-show');
            }, 10);
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('donations-modal-show');
            this.modal.classList.add('donations-modal-hide');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                this.modal.style.display = 'none';
                this.modal.classList.remove('donations-modal-hide');
            }, 300);
        }
    }

    addStyles() {
        const styles = `
            <style>
                .donations-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .donations-modal-overlay.donations-modal-show {
                    opacity: 1;
                }

                .donations-modal-overlay.donations-modal-hide {
                    opacity: 0;
                }

                .donations-modal-content {
                    background: linear-gradient(145deg, #2a0000, #1a0000);
                    border: 3px solid #DC143C;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(220, 20, 60, 0.4);
                    position: relative;
                    transform: scale(0.7);
                    transition: transform 0.3s ease;
                }

                .donations-modal-show .donations-modal-content {
                    transform: scale(1);
                }

                .donations-modal-hide .donations-modal-content {
                    transform: scale(0.7);
                }

                .donations-header {
                    background: linear-gradient(90deg, #8B0000, #DC143C);
                    color: white;
                    padding: 20px;
                    border-radius: 17px 17px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .donations-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: bold;
                }

                .close-donations-modal {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .close-donations-modal:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: rotate(90deg);
                }

                .donations-body {
                    padding: 30px;
                }

                .donations-message {
                    color: #FFB6C1;
                    text-align: center;
                    margin-bottom: 25px;
                    font-size: 16px;
                    line-height: 1.5;
                }

                .progress-container {
                    margin: 25px 0;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .progress-label {
                    color: #FFB6C1;
                    font-size: 14px;
                    font-weight: 600;
                }

                .progress-amount {
                    color: #00CED1;
                    font-size: 16px;
                    font-weight: bold;
                }

                .progress-bar {
                    width: 100%;
                    height: 25px;
                    background: #1a0000;
                    border-radius: 15px;
                    border: 2px solid #00CED1;
                    overflow: hidden;
                    position: relative;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00CED1, #20B2AA);
                    border-radius: 13px;
                    transition: width 0.5s ease;
                    position: relative;
                }

                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: progressShine 2s infinite;
                }

                @keyframes progressShine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-status {
                    margin-top: 8px;
                    text-align: center;
                }

                .progress-percentage {
                    color: #00CED1;
                    font-size: 14px;
                    font-weight: 600;
                }

                .donation-info {
                    background: rgba(0, 206, 209, 0.1);
                    border: 1px solid rgba(0, 206, 209, 0.3);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 25px 0;
                    color: #FFB6C1;
                    text-align: center;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .donation-actions {
                    text-align: center;
                    margin: 30px 0;
                }

                .donate-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #0070ba, #003087);
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 112, 186, 0.3);
                }

                .donate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 112, 186, 0.4);
                    background: linear-gradient(135deg, #003087, #0070ba);
                }

                .donate-btn i {
                    font-size: 20px;
                }

                .donation-benefits {
                    background: rgba(139, 0, 0, 0.2);
                    border: 1px solid rgba(139, 0, 0, 0.3);
                    border-radius: 10px;
                    padding: 20px;
                    margin-top: 25px;
                }

                .donation-benefits h4 {
                    color: #FFB6C1;
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    text-align: center;
                }

                .donation-benefits ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .donation-benefits li {
                    color: #FFB6C1;
                    padding: 8px 0;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .donation-benefits li i {
                    color: #DC143C;
                    font-size: 12px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .donations-modal-content {
                        margin: 20px;
                        max-width: none;
                        width: calc(100% - 40px);
                    }

                    .donations-header {
                        padding: 15px;
                    }

                    .donations-header h2 {
                        font-size: 18px;
                    }

                    .donations-body {
                        padding: 20px;
                    }

                    .donations-message {
                        font-size: 14px;
                    }

                    .donate-btn {
                        padding: 12px 25px;
                        font-size: 16px;
                    }

                    .progress-amount {
                        font-size: 14px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Función global para mostrar el modal de donaciones
window.showDonationsModal = function() {
    if (!window.donationsModalInstance) {
        window.donationsModalInstance = new DonationsModal();
    }
    window.donationsModalInstance.showModal();
};

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    if (!window.donationsModalInstance) {
        window.donationsModalInstance = new DonationsModal();
    }
});
