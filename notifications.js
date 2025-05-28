
// Sistema de notificaciones para el panel de moderación
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const realtimeDb = getDatabase();

export class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.listeners = [];
        this.init();
    }

    init() {
        this.createNotificationUI();
        this.startListening();
    }

    createNotificationUI() {
        // Verificar si ya existe un contenedor de notificaciones
        const existingContainer = document.querySelector('.notification-container');
        if (existingContainer) {
            return; // Ya existe, no crear otro
        }

        // Solo mostrar notificaciones en el panel de moderación
        if (!window.location.pathname.includes('data.html')) {
            return;
        }

        // Buscar el header para ubicar la campanita
        const header = document.querySelector('.header .nav-menu');
        if (!header) return;

        const notificationContainer = document.createElement('li');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: relative;
            display: inline-block;
        `;

        const bellIcon = document.createElement('span');
        bellIcon.className = 'notification-bell nav-link';
        bellIcon.innerHTML = `
            <i class="fa-solid fa-bell"></i>
            <span class="notification-badge">0</span>
        `;
        bellIcon.style.cssText = `
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
        `;

        const badge = bellIcon.querySelector('.notification-badge');
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #DC143C;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            display: none;
        `;

        const notificationPanel = document.createElement('div');
        notificationPanel.className = 'notification-panel';
        notificationPanel.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 400px;
            max-height: 500px;
            background: linear-gradient(145deg, #2a0000, #1a0000);
            border: 2px solid rgba(139, 0, 0, 0.3);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: none;
            overflow: hidden;
        `;

        const panelHeader = document.createElement('div');
        panelHeader.innerHTML = `
            <div style="padding: 20px; border-bottom: 1px solid rgba(139, 0, 0, 0.3); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #DC143C; margin: 0; font-size: 16px;">
                    <i class="fa-solid fa-bell"></i> Notificaciones
                </h3>
                <button class="clear-all-btn" style="
                    background: none;
                    border: 1px solid rgba(139, 0, 0, 0.5);
                    color: #FFB6C1;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Limpiar Todo
                </button>
            </div>
        `;

        const notificationList = document.createElement('div');
        notificationList.className = 'notification-list';
        notificationList.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            padding: 10px;
        `;

        notificationPanel.appendChild(panelHeader);
        notificationPanel.appendChild(notificationList);
        notificationContainer.appendChild(bellIcon);
        
        // Insertar en el header
        header.appendChild(notificationContainer);
        
        // Insertar el panel en el body para que sea fijo
        document.body.appendChild(notificationPanel);

        // Event listeners
        bellIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });

        document.addEventListener('click', (e) => {
            if (!notificationContainer.contains(e.target)) {
                this.closePanel();
            }
        });

        panelHeader.querySelector('.clear-all-btn').addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // Estilos hover para el botón de limpiar
        const clearBtn = panelHeader.querySelector('.clear-all-btn');
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = 'rgba(139, 0, 0, 0.3)';
            clearBtn.style.color = 'white';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = 'none';
            clearBtn.style.color = '#FFB6C1';
        });

        // Estilos hover para la campana
        bellIcon.addEventListener('mouseenter', () => {
            bellIcon.style.color = '#DC143C';
            bellIcon.style.transform = 'translateY(-2px)';
        });
        bellIcon.addEventListener('mouseleave', () => {
            bellIcon.style.color = '';
            bellIcon.style.transform = 'translateY(0)';
        });

        this.bellIcon = bellIcon;
        this.notificationPanel = notificationPanel;
        this.notificationList = notificationList;
        this.badge = badge;
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.notificationPanel.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            this.markAllAsRead();
            // Ocultar el badge cuando se abren las notificaciones
            this.badge.style.display = 'none';
        }
    }

    closePanel() {
        this.isOpen = false;
        this.notificationPanel.style.display = 'none';
    }

    startListening() {
        // Escuchar comentarios nuevos
        this.listenToComments();
        // Escuchar likes/dislikes
        this.listenToLikes();
        // Escuchar videos pendientes
        this.listenToPendingVideos();
    }

    listenToComments() {
        const commentsRef = ref(realtimeDb, 'comments');
        const listener = onValue(commentsRef, (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((videoSnapshot) => {
                    const videoId = videoSnapshot.key;
                    videoSnapshot.forEach((commentSnapshot) => {
                        const comment = commentSnapshot.val();
                        const commentId = commentSnapshot.key;
                        
                        // Verificar si es un comentario nuevo (últimos 5 minutos)
                        if (this.isRecentActivity(comment.timestamp)) {
                            this.getVideoData(videoId, (videoData) => {
                                if (videoData) {
                                    this.addNotification({
                                        id: `comment_${commentId}`,
                                        type: 'comment',
                                        message: `${comment.autor} ha comentado: "${comment.texto.substring(0, 50)}${comment.texto.length > 50 ? '...' : ''}" en el video "${videoData.titulo}"`,
                                        timestamp: comment.timestamp,
                                        videoId: videoId,
                                        thumbnail: videoData.portada,
                                        icon: 'fa-comment'
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
        this.listeners.push(listener);
    }

    listenToLikes() {
        const likesRef = ref(realtimeDb, 'likes');
        const listener = onValue(likesRef, (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((videoSnapshot) => {
                    const videoId = videoSnapshot.key;
                    videoSnapshot.forEach((likeSnapshot) => {
                        const like = likeSnapshot.val();
                        const likeId = likeSnapshot.key;
                        
                        // Verificar si es un like/dislike nuevo (últimos 5 minutos)
                        if (this.isRecentActivity(like.timestamp)) {
                            this.getVideoData(videoId, (videoData) => {
                                if (videoData) {
                                    const action = like.type === 'like' ? 'le ha gustado' : 'no le ha gustado';
                                    const icon = like.type === 'like' ? 'fa-thumbs-up' : 'fa-thumbs-down';
                                    
                                    this.addNotification({
                                        id: `like_${likeId}`,
                                        type: 'like',
                                        message: `A ${like.username} ${action} el video "${videoData.titulo}"`,
                                        timestamp: like.timestamp,
                                        videoId: videoId,
                                        thumbnail: videoData.portada,
                                        icon: icon
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
        this.listeners.push(listener);
    }

    listenToPendingVideos() {
        const pendingRef = ref(realtimeDb, 'pending_videos');
        const listener = onValue(pendingRef, (snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((videoSnapshot) => {
                    const video = videoSnapshot.val();
                    const videoId = videoSnapshot.key;
                    
                    // Verificar si es un video nuevo pendiente (últimos 10 minutos)
                    if (this.isRecentActivity(video.timestamp, 10)) {
                        this.addNotification({
                            id: `pending_${videoId}`,
                            type: 'pending',
                            message: `${video.autor} ha subido un video "${video.titulo}" - ir a aprobarlo`,
                            timestamp: video.timestamp,
                            videoId: videoId,
                            thumbnail: video.portada,
                            icon: 'fa-clock',
                            clickable: true
                        });
                    }
                });
            }
        });
        this.listeners.push(listener);
    }

    isRecentActivity(timestamp, minutesAgo = 5) {
        const now = Date.now();
        const timeLimit = minutesAgo * 60 * 1000; // 5 minutos en milisegundos
        return (now - timestamp) <= timeLimit;
    }

    getVideoData(videoId, callback) {
        const videoRef = ref(realtimeDb, `approved_videos/${videoId}`);
        onValue(videoRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                // Si no está en videos aprobados, buscar en pendientes
                const pendingRef = ref(realtimeDb, `pending_videos/${videoId}`);
                onValue(pendingRef, (pendingSnapshot) => {
                    if (pendingSnapshot.exists()) {
                        callback(pendingSnapshot.val());
                    } else {
                        callback(null);
                    }
                }, { once: true });
            }
        }, { once: true });
    }

    addNotification(notification) {
        // Evitar duplicados
        const exists = this.notifications.find(n => n.id === notification.id);
        if (exists) return;

        this.notifications.unshift(notification);
        this.updateUI();
        this.updateBadge();
    }

    updateUI() {
        if (!this.notificationList) return;

        if (this.notifications.length === 0) {
            this.notificationList.innerHTML = `
                <div style="text-align: center; color: #FFB6C1; padding: 20px; font-style: italic;">
                    No hay notificaciones nuevas
                </div>
            `;
            return;
        }

        this.notificationList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item" data-id="${notification.id}" data-video-id="${notification.videoId || ''}" style="
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(139, 0, 0, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            ">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    ${notification.thumbnail ? `
                        <img src="${notification.thumbnail}" alt="Video thumbnail" style="
                            width: 60px;
                            height: 45px;
                            border-radius: 6px;
                            object-fit: cover;
                            border: 1px solid rgba(139, 0, 0, 0.3);
                        " onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <i class="fa-solid ${notification.icon}" style="
                            color: #DC143C;
                            font-size: 16px;
                            margin-top: 2px;
                            min-width: 16px;
                            display: none;
                        "></i>
                    ` : `
                        <i class="fa-solid ${notification.icon}" style="
                            color: #DC143C;
                            font-size: 16px;
                            margin-top: 2px;
                            min-width: 16px;
                        "></i>
                    `}
                    <div style="flex: 1;">
                        <p style="
                            color: #FFB6C1;
                            margin: 0 0 8px 0;
                            line-height: 1.4;
                            font-size: 14px;
                        ">${notification.message}</p>
                        <span style="
                            color: rgba(255, 182, 193, 0.7);
                            font-size: 12px;
                        ">${this.formatTimestamp(notification.timestamp)}</span>
                    </div>
                    <button class="remove-notification" data-id="${notification.id}" style="
                        background: none;
                        border: none;
                        color: rgba(255, 182, 193, 0.5);
                        cursor: pointer;
                        padding: 2px;
                        border-radius: 3px;
                        transition: color 0.3s ease;
                    ">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Agregar event listeners
        this.notificationList.querySelectorAll('.notification-item').forEach(item => {
            const notification = this.notifications.find(n => n.id === item.dataset.id);
            
            item.addEventListener('click', (e) => {
                // Evitar navegación si se hace clic en el botón de eliminar
                if (e.target.closest('.remove-notification')) {
                    return;
                }

                if (notification) {
                    if (notification.type === 'pending') {
                        // Scroll hasta la sección de videos pendientes
                        const pendingSection = document.querySelector('.videos-grid');
                        if (pendingSection) {
                            pendingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                        this.closePanel();
                    } else if (notification.videoId && (notification.type === 'comment' || notification.type === 'like')) {
                        // Navegar al video para comentarios y likes
                        window.open(`video.html?id=${notification.videoId}`, '_blank');
                        this.closePanel();
                    }
                }
            });

            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(139, 0, 0, 0.2)';
                item.style.borderColor = '#DC143C';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(0, 0, 0, 0.4)';
                item.style.borderColor = 'rgba(139, 0, 0, 0.3)';
            });
        });

        // Event listeners para botones de eliminar
        this.notificationList.querySelectorAll('.remove-notification').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeNotification(btn.dataset.id);
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.color = '#DC143C';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.color = 'rgba(255, 182, 193, 0.5)';
            });
        });
    }

    updateBadge() {
        const unreadCount = this.notifications.length;
        
        if (unreadCount > 0) {
            this.badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
            this.badge.style.display = 'flex';
        } else {
            this.badge.style.display = 'none';
        }
    }

    markAllAsRead() {
        // Ocultar el badge cuando el usuario abre las notificaciones
        this.badge.style.display = 'none';
    }

    removeNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUI();
        this.updateBadge();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.updateUI();
        this.updateBadge();
    }

    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `hace ${minutes}m`;
        if (hours < 24) return `hace ${hours}h`;
        return `hace ${days}d`;
    }

    destroy() {
        // Limpiar listeners
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners = [];
    }
}

// Exportar instancia global
export const notificationSystem = new NotificationSystem();
