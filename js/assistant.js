
// Assistant.js - Asistente flotante para TripGore con API de razonamiento

class AssistantWidget {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadConversationHistory();
  }

  // Cargar historial de conversación desde localStorage
  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('aris_conversation');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      this.conversationHistory = [];
    }
  }

  // Guardar historial de conversación
  saveConversationHistory() {
    try {
      // Mantener solo los últimos 20 mensajes para no saturar localStorage
      const recentHistory = this.conversationHistory.slice(-20);
      localStorage.setItem('aris_conversation', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error al guardar historial:', error);
    }
  }

  // Obtener contexto de la base de datos
  async getContextData() {
    try {
      // Cargar roles
      let roles = {};
      if (typeof window.ROLES !== 'undefined') {
        roles = window.ROLES;
      }

      // Información de cómo conseguir puntos (extraída de roles.html)
      const pointsMethods = {
        subirVideos: { puntos: 5, descripcion: "Cada video aprobado otorga 5 puntos" },
        comentar: { puntos: 3, descripcion: "Cada comentario en un video otorga 3 puntos" },
        reaccionar: { puntos: 1, descripcion: "Cada like o dislike otorga 1 punto" }
      };

      // Links importantes
      const links = {
        telegram: "https://t.me/perritogoree",
        discord: "https://discord.gg/pS7qvjP4S5"
      };

      return { roles, pointsMethods, links };
    } catch (error) {
      console.error('Error al obtener contexto:', error);
      return { roles: {}, pointsMethods: {}, links: {} };
    }
  }

  // Construir el prompt del sistema con contexto
  async buildSystemPrompt() {
    const context = await this.getContextData();
    
    return `Eres ARIS, una asistente virtual femenina de TripGore, una plataforma de videos de contenido extremo e impactante.

IDENTIDAD:
- Nombre: ARIS
- Género: Femenino
- Personalidad: Amigable, servicial, pero profesional
- Propósito: Ayudar a los usuarios a entender el sistema de puntos y roles, y navegar la plataforma

SISTEMA DE ROLES:
Los roles disponibles son:
${Object.entries(context.roles).filter(([key, role]) => role.puntos).map(([key, role]) => `- ${role.name}: Requiere ${role.puntos} puntos`).join('\n')}

Roles especiales (otorgados por administración):
- Colaborador: Miembros distinguidos que contribuyen activamente
- Moderador: Encargados de mantener el orden

CÓMO CONSEGUIR PUNTOS:
- Subir videos aprobados: +5 puntos
- Comentar en videos: +3 puntos
- Reaccionar a videos (like/dislike): +1 punto

ENLACES IMPORTANTES:
- Telegram: ${context.links.telegram}
- Discord: ${context.links.discord}

REGLAS IMPORTANTES:
1. NUNCA proporciones códigos de acceso. Los usuarios deben dártelos a ti para verificarlos
2. NUNCA des información sobre el panel de administración o cómo acceder a él
3. NUNCA reveles información confidencial de administradores
4. NO tienes acceso a la base de datos de videos. Si alguien pregunta por un video específico, indícale que use el buscador de la página
5. Sé amable pero mantén los límites de seguridad
6. Si no sabes algo, admítelo honestamente
7. NUNCA recomiendes bloqueadores de anuncios cuando los usuarios se quejen de los anuncios
8. Cuando los usuarios pregunten sobre anuncios o cómo quitarlos, explícales que:
   - Los anuncios son necesarios para cubrir los gastos de mantenimiento de la plataforma
   - Si desean una experiencia sin anuncios, pueden adquirir el acceso VIP de TripGore
   - El acceso VIP ofrece navegación sin publicidad y otros beneficios exclusivos
9. Si preguntan por contenido oculto o restringido, indícales que pueden usar el verificador de códigos
10. Si preguntan por un video específico o búsqueda de videos, recomiéndales usar el buscador de la página

FORMATO DE RESPUESTA:
- Sé concisa pero informativa
- Usa emojis cuando sea apropiado
- Mantén un tono amigable y profesional
- Si te preguntan por videos específicos, recomienda usar el buscador de la página`;
  }

  

  createWidget() {
    const widgetHTML = `
      <div id="assistant-widget" class="assistant-widget">
        <!-- Botón flotante -->
        <button id="assistant-toggle" class="assistant-toggle" aria-label="Abrir asistente">
          <img src="../img/aris.png" alt="ARIS" class="assistant-icon">
          <span class="assistant-badge">1</span>
        </button>

        <!-- Panel del chat -->
        <div id="assistant-panel" class="assistant-panel">
          <div class="assistant-header">
            <div class="assistant-header-info">
              <img src="../img/aris.png" alt="ARIS" class="assistant-avatar">
              <div>
                <h3>ARIS</h3>
                <p class="assistant-status">
                  <span class="status-dot"></span>
                  En línea
                </p>
              </div>
            </div>
            <button id="assistant-close" class="assistant-close-btn" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="assistant-messages" id="assistant-messages">
            <div class="assistant-message assistant-ai">
              <img src="../img/aris.png" alt="ARIS" class="message-avatar">
              <div class="message-bubble">
                <p>¡Hola! Soy ARIS, tu asistente de TripGore. 👋</p>
                <p>Estoy aquí para ayudarte con cualquier pregunta sobre la plataforma.</p>
                <p>¿Tienes un código de acceso para contenido restringido?</p>
                <p class="message-options">
                  <button class="quick-reply access-restricted-btn" data-action="restricted">🔒 Acceder a Contenido Restringido</button>
                </p>
              </div>
            </div>
          </div>

          <div class="typing-indicator" id="typing-indicator" style="display: none;">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>

          <div class="assistant-input-area">
            <input 
              type="text" 
              id="assistant-input" 
              class="assistant-input" 
              placeholder="Escribe tu mensaje..."
              autocomplete="off"
            >
            <button id="assistant-send" class="assistant-send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    const styles = `
      <style>
        .assistant-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: 'Oswald', sans-serif;
        }

        .assistant-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d00000 0%, #b30000 100%);
          border: 3px solid #1f1f1f;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(208, 0, 0, 0.4);
          transition: all 0.3s ease;
          position: relative;
          padding: 0;
          overflow: hidden;
        }

        .assistant-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(208, 0, 0, 0.6);
        }

        .assistant-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .assistant-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #00ff00;
          color: #1f1f1f;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          border: 2px solid #1f1f1f;
        }

        .assistant-panel {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          max-width: calc(100vw - 40px);
          height: 550px;
          background-color: #ffffff;
          border-radius: 12px;
          border: 3px solid #d00000;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .assistant-panel.active {
          display: flex;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .assistant-header {
          background-color: #1f1f1f;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #d00000;
        }

        .assistant-header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .assistant-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          border: 2px solid #d00000;
          object-fit: cover;
        }

        .assistant-header h3 {
          margin: 0;
          color: #d00000;
          font-size: 1.2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .assistant-status {
          margin: 0;
          color: #cccccc;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background-color: #00ff00;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .assistant-close-btn {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.3s ease;
        }

        .assistant-close-btn:hover {
          color: #d00000;
        }

        .assistant-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .assistant-message {
          display: flex;
          gap: 0.75rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .assistant-message.assistant-user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          flex-shrink: 0;
          object-fit: cover;
        }

        .assistant-user .message-avatar {
          background-color: #1f1f1f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .message-bubble {
          background-color: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 75%;
          border: 2px solid #d00000;
        }

        .assistant-user .message-bubble {
          background-color: #1f1f1f;
          color: #ffffff;
        }

        .message-bubble p {
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        .message-bubble p:last-child {
          margin-bottom: 0;
        }

        .message-bubble a {
          color: #d00000;
          font-weight: 600;
          text-decoration: none;
        }

        .message-bubble a:hover {
          text-decoration: underline;
        }

        .assistant-user .message-bubble a {
          color: #FFD700;
        }

        .message-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .quick-reply {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          font-family: 'Oswald', sans-serif;
          font-size: 0.85rem;
          color: #1f1f1f;
        }

        .quick-reply:hover {
          background-color: #d00000;
          border-color: #d00000;
          color: white;
        }

        .typing-indicator {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: #ffffff;
          border-radius: 12px;
          width: fit-content;
          margin-left: 45px;
          border: 2px solid #d00000;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #d00000;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        .assistant-input-area {
          padding: 1rem;
          background-color: #ffffff;
          border-top: 2px solid #e0e0e0;
          display: flex;
          gap: 0.5rem;
        }

        .assistant-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-family: 'Oswald', sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.3s ease;
        }

        .assistant-input:focus {
          outline: none;
          border-color: #d00000;
        }

        .assistant-send-btn {
          background-color: #d00000;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .assistant-send-btn:hover {
          background-color: #b30000;
        }

        .assistant-messages::-webkit-scrollbar {
          width: 6px;
        }

        .assistant-messages::-webkit-scrollbar-track {
          background: #f5f5f5;
        }

        .assistant-messages::-webkit-scrollbar-thumb {
          background: #d00000;
          border-radius: 3px;
        }

        @media (max-width: 480px) {
          .assistant-panel {
            width: calc(100vw - 40px);
            height: calc(100vh - 140px);
          }
        }
      </style>
    `;

    document.body.insertAdjacentHTML('beforeend', styles + widgetHTML);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('assistant-toggle');
    const closeBtn = document.getElementById('assistant-close');
    const sendBtn = document.getElementById('assistant-send');
    const input = document.getElementById('assistant-input');
    const messagesContainer = document.getElementById('assistant-messages');

    toggleBtn.addEventListener('click', () => this.togglePanel());
    closeBtn.addEventListener('click', () => this.closePanel());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    messagesContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-reply')) {
        const action = e.target.dataset.action;
        if (action === 'restricted') {
          window.location.href = '../public/aris.html';
        } else {
          const message = e.target.dataset.message;
          this.handleQuickReply(message);
        }
      }
    });
  }

  togglePanel() {
    const panel = document.getElementById('assistant-panel');
    const badge = document.querySelector('.assistant-badge');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      panel.classList.add('active');
      if (badge) badge.style.display = 'none';
    } else {
      panel.classList.remove('active');
    }
  }

  closePanel() {
    const panel = document.getElementById('assistant-panel');
    panel.classList.remove('active');
    this.isOpen = false;
  }

  async sendMessage() {
    const input = document.getElementById('assistant-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addUserMessage(message);
    input.value = '';
    
    // Mostrar indicador de escritura
    this.showTypingIndicator();
    
    // Agregar mensaje al historial
    this.conversationHistory.push({ role: 'user', content: message });
    
    // Obtener respuesta de la API
    await this.getAIResponse(message);
  }

  addUserMessage(text) {
    const messagesContainer = document.getElementById('assistant-messages');
    const messageHTML = `
      <div class="assistant-message assistant-user">
        <div class="message-avatar">👤</div>
        <div class="message-bubble">
          <p>${this.escapeHtml(text)}</p>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
  }

  addAssistantMessage(text) {
    const messagesContainer = document.getElementById('assistant-messages');
    const messageHTML = `
      <div class="assistant-message assistant-ai">
        <img src="../img/aris.png" alt="ARIS" class="message-avatar">
        <div class="message-bubble">
          <p>${text}</p>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'flex';
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  async getAIResponse(userMessage) {
    try {
      // Construir el contexto completo
      const systemPrompt = await this.buildSystemPrompt();
      
      // Construir el prompt completo con historial
      let fullPrompt = systemPrompt + "\n\n";
      
      // Agregar historial de conversación reciente (últimos 10 mensajes)
      const recentHistory = this.conversationHistory.slice(-10);
      if (recentHistory.length > 0) {
        fullPrompt += "HISTORIAL DE CONVERSACIÓN:\n";
        recentHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'ARIS'}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }
      
      fullPrompt += `Usuario: ${userMessage}\nARIS:`;

      const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: fullPrompt
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();
      
      this.hideTypingIndicator();

      if (data.status === "success") {
        let aiResponse = data.text;
        
        // Agregar respuesta al historial
        this.conversationHistory.push({ role: 'assistant', content: aiResponse });
        this.saveConversationHistory();
        
        this.addAssistantMessage(aiResponse);
      } else {
        throw new Error('Respuesta inválida de la API');
      }
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      this.hideTypingIndicator();
      this.addAssistantMessage("Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo. 😔");
    }
  }

  handleQuickReply(message) {
    this.addUserMessage(message);
    this.showTypingIndicator();
    this.conversationHistory.push({ role: 'user', content: message });
    setTimeout(() => {
      this.getAIResponse(message);
    }, 500);
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('assistant-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inicializar el asistente cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AssistantWidget();
  });
} else {
  new AssistantWidget();
}
