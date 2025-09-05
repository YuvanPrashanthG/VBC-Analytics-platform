document.addEventListener('DOMContentLoaded', function() {
    // Animate progress bars on load
    const progressBars = document.querySelectorAll('.progress-fill');
    
    setTimeout(() => {
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });
    }, 1000);
    
    // Tool button interactions
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const toolName = this.parentElement.querySelector('h4').textContent;
            alert(`${toolName} tool would open here!`);
        });
    });
    
    // Add staggered animation to tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
});
