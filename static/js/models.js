document.addEventListener('DOMContentLoaded', function() {
    // Animate chart bars on load
    const chartBars = document.querySelectorAll('.chart-bar');
    
    setTimeout(() => {
        chartBars.forEach((bar, index) => {
            const height = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = height;
            }, index * 200);
        });
    }, 1000);
    
    // Model detail buttons
    const modelBtns = document.querySelectorAll('.model-btn');
    modelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modelName = this.closest('.model-card').querySelector('h3').textContent;
            alert(`${modelName} details would open here!`);
        });
    });
    
    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Staggered animation for model cards
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
});
