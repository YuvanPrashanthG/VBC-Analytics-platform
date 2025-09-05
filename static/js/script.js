// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Set active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes(currentPage) || (currentPage === 'index' && href.includes('home'))) {
            link.classList.add('active');
        }
    });
    
    // Login/Logout functionality
    const loginBtn = document.getElementById('loginBtn');
    const loginStatus = document.getElementById('loginStatus');
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Set initial login state
    updateLoginState();
    
    loginBtn.addEventListener('click', function() {
        isLoggedIn = !isLoggedIn;
        localStorage.setItem('isLoggedIn', isLoggedIn);
        updateLoginState();
    });
    
    function updateLoginState() {
        if (isLoggedIn) {
            loginStatus.textContent = 'Logged In';
            loginStatus.classList.add('logged-in');
            loginBtn.textContent = 'Logout';
            loginBtn.classList.add('logout');
        } else {
            loginStatus.textContent = 'Logged Out';
            loginStatus.classList.remove('logged-in');
            loginBtn.textContent = 'Login';
            loginBtn.classList.remove('logout');
        }
    }
    
    // Smooth animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
});
