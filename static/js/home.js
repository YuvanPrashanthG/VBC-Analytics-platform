document.addEventListener('DOMContentLoaded', function() {
    // Add staggered animation delay for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add interactive hover effects for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Demo button functionality
    const demoBtn = document.querySelector('.btn-secondary');
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            alert('Demo video would open here!');
        });
    }
});
