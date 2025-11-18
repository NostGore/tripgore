
document.addEventListener('DOMContentLoaded', function() {
  // Manejo de likes
  const likeBtn = document.querySelector('.like-btn');
  const dislikeBtn = document.querySelector('.dislike-btn');
  
  likeBtn.addEventListener('click', function() {
    const count = this.querySelector('.like-count');
    let currentCount = parseInt(count.textContent);
    count.textContent = currentCount + 1;
    this.style.backgroundColor = '#d00000';
    this.style.color = '#ffffff';
    this.style.borderColor = '#d00000';
  });
  
  dislikeBtn.addEventListener('click', function() {
    const count = this.querySelector('.dislike-count');
    let currentCount = parseInt(count.textContent);
    count.textContent = currentCount + 1;
    this.style.backgroundColor = '#666';
    this.style.color = '#ffffff';
    this.style.borderColor = '#666';
  });

  // Manejo del botón compartir
  const shareBtn = document.querySelector('.share-btn');
  shareBtn.addEventListener('click', function() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: document.querySelector('.video-title').textContent,
        url: url
      });
    } else {
      // Copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        alert('URL copiada al portapapeles');
      });
    }
  });

  // Manejo de comentarios
  const submitCommentBtn = document.querySelector('.submit-comment-btn');
  const commentInput = document.querySelector('.comment-input');
  const commentsList = document.querySelector('.comments-list');
  
  submitCommentBtn.addEventListener('click', function() {
    const commentText = commentInput.value.trim();
    if (commentText) {
      const newComment = createCommentElement('Tú', 'Justo ahora', commentText);
      commentsList.insertBefore(newComment, commentsList.firstChild);
      commentInput.value = '';
      
      // Actualizar contador
      const countElement = document.querySelector('.comment-count');
      const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
      countElement.textContent = `(${currentCount + 1})`;
    }
  });

  // Función para crear elemento de comentario
  function createCommentElement(author, date, text) {
    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = `
      <img src="https://files.catbox.moe/4c4g7d.jpg" alt="Avatar" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${author}</span>
          <span class="comment-date">${date}</span>
        </div>
        <p class="comment-text">${text}</p>
        <div class="comment-actions">
          <button class="comment-like">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            0
          </button>
          <button class="comment-reply">Responder</button>
        </div>
      </div>
    `;
    
    // Agregar evento al botón de like del nuevo comentario
    const likeBtn = comment.querySelector('.comment-like');
    likeBtn.addEventListener('click', function() {
      const count = this.querySelector('svg').nextSibling;
      let currentCount = parseInt(count.textContent.trim());
      count.textContent = ' ' + (currentCount + 1);
      this.style.color = '#d00000';
    });
    
    return comment;
  }

  // Manejo de likes en comentarios existentes
  const commentLikeBtns = document.querySelectorAll('.comment-like');
  commentLikeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const count = this.querySelector('svg').nextSibling;
      let currentCount = parseInt(count.textContent.trim());
      count.textContent = ' ' + (currentCount + 1);
      this.style.color = '#d00000';
    });
  });
});
