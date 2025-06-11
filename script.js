document.addEventListener('DOMContentLoaded', function() {
    // Dropdown functionality removed

    

    // Card hover effects
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#DC143C';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(139, 0, 0, 0.3)';
        });
        
        card.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px)';
            }, 100);
        });
    });

    // Dynamic background effect
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const header = document.querySelector('.header');
        const xPercent = mouseX / window.innerWidth;
        const yPercent = mouseY / window.innerHeight;
        
        header.style.background = `linear-gradient(${135 + xPercent * 30}deg, 
            rgba(139, 0, 0, ${0.8 + yPercent * 0.2}), 
            rgba(220, 20, 60, ${0.9 + xPercent * 0.1}))`;
    });

    // Add loading animation
    window.addEventListener('load', function() {
        const cards = document.querySelectorAll('.content-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });
});