// Sistema de chat social para chat.html únicamente
import { getDatabase, ref, onValue, push, set, remove, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { authFunctions, getUsernameFromEmail } from './firebase.js';

const realtimeDb = getDatabase();

export class ChatPageSystem {
    constructor() {
        this.messages = [];
        this.lastMessageTime = 0;
        this.messageLimit = 3000; // 3 segundos en milisegundos
        this.replyingTo = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar si el usuario está autenticado
        authFunctions.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.startListening();
                this.setupEventListeners();
            }
        });
    }

    setupEventListeners() {
        // Event listeners para el envío de mensajes
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    startListening() {
        const messagesRef = ref(realtimeDb, 'chat_messages');
        onValue(messagesRef, (snapshot) => {
            this.messages = [];
            snapshot.forEach((childSnapshot) => {
                this.messages.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Ordenar por timestamp
            this.messages.sort((a, b) => a.timestamp - b.timestamp);
            this.renderMessages();
        });
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // Verificar cooldown
        const now = Date.now();
        if (now - this.lastMessageTime < this.messageLimit) {
            const remainingTime = Math.ceil((this.messageLimit - (now - this.lastMessageTime)) / 1000);
            this.showCooldown(`Espera ${remainingTime} segundos antes de enviar otro mensaje`);
            return;
        }

        try {
            const messagesRef = ref(realtimeDb, 'chat_messages');
            const newMessageRef = push(messagesRef);

            const username = getUsernameFromEmail(this.currentUser.email);

            const messageData = {
                text: messageText,
                author: username,
                userId: this.currentUser.uid,
                timestamp: Date.now(),
                id: newMessageRef.key
            };

            // Si está respondiendo a un mensaje
            if (this.replyingTo) {
                messageData.replyTo = {
                    id: this.replyingTo.id,
                    author: this.replyingTo.author,
                    text: this.replyingTo.text.substring(0, 50) + (this.replyingTo.text.length > 50 ? '...' : '')
                };
                this.cancelReply();
            }

            await set(newMessageRef, messageData);

            chatInput.value = '';
            this.lastMessageTime = now;
            this.scrollToBottom();

        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    }

    showCooldown(message) {
        const cooldownIndicator = document.getElementById('cooldownIndicator');
        if (cooldownIndicator) {
            cooldownIndicator.textContent = message;
            cooldownIndicator.style.display = 'block';

            setTimeout(() => {
                cooldownIndicator.style.display = 'none';
            }, 3000);
        }
    }

    renderMessages() {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        // Guardar posición de scroll actual
        const wasAtBottom = messagesArea.scrollHeight - messagesArea.scrollTop <= messagesArea.clientHeight + 100;

        // Filtrar mensajes ocultos
        const hiddenMessages = JSON.parse(localStorage.getItem('hiddenChatMessages') || '[]');
        const visibleMessages = this.messages.filter(message => !hiddenMessages.includes(message.id));

        messagesArea.innerHTML = visibleMessages.map(message => {
            const isMyMessage = this.currentUser && message.userId === this.currentUser.uid;
            const messageText = this.escapeHtml(message.text);

            return `
                <div class="message-item ${isMyMessage ? 'my-message' : 'other-message'}" data-id="${message.id}">
                    <div class="message-content">
                        ${message.replyTo ? `
                            <div class="reply-reference">
                                <strong>↳ ${this.escapeHtml(message.replyTo.author)}:</strong> ${this.escapeHtml(message.replyTo.text)}
                            </div>
                        ` : ''}

                        <div class="message-bubble">
                            <div class="message-header">
                                <span class="message-author">${this.escapeHtml(message.author)}</span>
                            </div>

                            <div class="message-text">${messageText}</div>

                            <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                        </div>
                    </div>

                    <div class="message-actions">
                        <button class="message-action-btn reply-btn" data-message-id="${message.id}">
                            <i class="fa-solid fa-reply"></i> Responder
                        </button>

                        ${isMyMessage ? `
                            <button class="message-action-btn delete-btn" data-message-id="${message.id}">
                                <i class="fa-solid fa-trash"></i> Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Agregar event listeners
        this.setupMessageEventListeners();
        
        // Solo hacer scroll al final si el usuario estaba al final
        if (wasAtBottom) {
            setTimeout(() => this.scrollToBottom(), 50);
        }
    }

    setupMessageEventListeners() {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        // Botones de respuesta
        messagesArea.querySelectorAll('.reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = btn.dataset.messageId;
                const message = this.messages.find(m => m.id === messageId);
                if (message) {
                    this.setReplyTo(message);
                }
            });
        });

        // Botones de eliminar
        messagesArea.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const messageId = btn.dataset.messageId;
                this.showDeleteConfirmation(messageId);
            });
        });

        // Los event listeners se configuran una sola vez en init()
    }

    setReplyTo(message) {
        this.replyingTo = message;
        const replyIndicator = document.getElementById('replyIndicator');
        if (replyIndicator) {
            replyIndicator.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-solid fa-reply"></i> Respondiendo a <strong>${message.author}</strong>: ${message.text.substring(0, 30)}${message.text.length > 30 ? '...' : ''}</span>
                    <button class="cancel-reply" style="
                        background: none;
                        border: none;
                        color: #DC143C;
                        cursor: pointer;
                        font-size: 12px;
                        padding: 2px;
                    ">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            `;
            replyIndicator.style.display = 'block';

            // Event listener para cancelar respuesta
            replyIndicator.querySelector('.cancel-reply').addEventListener('click', () => {
                this.cancelReply();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
        }
    }

    cancelReply() {
        this.replyingTo = null;
        const replyIndicator = document.getElementById('replyIndicator');
        if (replyIndicator) {
            replyIndicator.style.display = 'none';
        }
    }

    showDeleteConfirmation(messageId) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: linear-gradient(145deg, #2a0000, #1a0000);
                border: 2px solid rgba(139, 0, 0, 0.3);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                color: white;
                max-width: 400px;
            ">
                <h3 style="color: #DC143C; margin-bottom: 20px;">
                    <i class="fa-solid fa-trash"></i> Eliminar Mensaje
                </h3>
                <p style="color: #FFB6C1; margin-bottom: 30px;">¿Deseas eliminar este mensaje?</p>

                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="delete-for-me" style="
                        background: linear-gradient(135deg, #666, #888);
                        border: none;
                        border-radius: 8px;
                        padding: 12px 20px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Eliminar para mí
                    </button>

                    <button class="delete-for-all" style="
                        background: linear-gradient(135deg, #8B0000, #DC143C);
                        border: none;
                        border-radius: 8px;
                        padding: 12px 20px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Eliminar para todos
                    </button>

                    <button class="cancel-delete" style="
                        background: none;
                        border: 1px solid rgba(139, 0, 0, 0.5);
                        border-radius: 8px;
                        padding: 12px 20px;
                        color: #FFB6C1;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Cancelar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para los botones
        modal.querySelector('.delete-for-me').addEventListener('click', () => {
            this.hideMessage(messageId);
            document.body.removeChild(modal);
        });

        modal.querySelector('.delete-for-all').addEventListener('click', () => {
            this.deleteMessage(messageId);
            document.body.removeChild(modal);
        });

        modal.querySelector('.cancel-delete').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    hideMessage(messageId) {
        // Guardar en localStorage los mensajes ocultos para este usuario
        const hiddenMessages = JSON.parse(localStorage.getItem('hiddenChatMessages') || '[]');
        if (!hiddenMessages.includes(messageId)) {
            hiddenMessages.push(messageId);
            localStorage.setItem('hiddenChatMessages', JSON.stringify(hiddenMessages));
        }
        this.renderMessages();
    }

    async deleteMessage(messageId) {
        try {
            const messageRef = ref(realtimeDb, `chat_messages/${messageId}`);
            await remove(messageRef);
        } catch (error) {
            console.error('Error eliminando mensaje:', error);
        }
    }

    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }

    adjustTextareaHeight() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        }
    }

    setupEventListeners() {
        // Event listeners para el envío de mensajes
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            chatInput.addEventListener('input', () => {
                this.adjustTextareaHeight();
            });
        }
    }

    destroy() {
        // Limpiar listeners y referencias
        this.messages = [];
        this.currentUser = null;
        this.replyingTo = null;
        
        // Remover listeners de Firebase
        if (this.messagesListener) {
            this.messagesListener();
        }
        
        // Limpiar elementos del DOM
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.innerHTML = '';
        }
        
        // Limpiar indicador de respuesta
        const replyIndicator = document.getElementById('replyIndicator');
        if (replyIndicator) {
            replyIndicator.style.display = 'none';
        }
        
        console.log('Sistema de chat destruido');
    }
}