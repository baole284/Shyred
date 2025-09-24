// Particle Effects System
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.maxParticles = 50;
        this.init();
    }

    init() {
        this.createParticles();
        this.animateParticles();
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random animation properties
        const animationDelay = Math.random() * 2 + 's';
        const animationDuration = (2 + Math.random() * 3) + 's';
        
        particle.style.animationDelay = animationDelay;
        particle.style.animationDuration = animationDuration;
        
        this.container.appendChild(particle);
        this.particles.push({
            element: particle,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    animateParticles() {
        setInterval(() => {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Boundary check
                if (particle.x < 0 || particle.x > window.innerWidth) {
                    particle.vx *= -1;
                }
                if (particle.y < 0 || particle.y > window.innerHeight) {
                    particle.vy *= -1;
                }
                
                // Keep within bounds
                particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
                particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
                
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
            });
        }, 50);
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// Button hover effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
            }, 100);
        });
    });
}

// Sidebar letter effects
function initSidebarEffects() {
    const letters = document.querySelectorAll('.sidebar-letter');
    
    letters.forEach(letter => {
        letter.addEventListener('click', function() {
            // Add glow effect on click
            this.style.textShadow = '0 0 20px var(--cyber-glow)';
            this.style.color = 'var(--cyber-glow)';
            
            setTimeout(() => {
                this.style.textShadow = '';
                this.style.color = '';
            }, 1000);
        });
    });
}

// Character image glow effect on hover
function initCharacterEffects() {
    const characterWrapper = document.querySelector('.character-image-wrapper');
    const characterGlow = document.querySelector('.character-outer-glow');
    
    if (characterWrapper && characterGlow) {
        characterWrapper.addEventListener('mouseenter', function() {
            characterGlow.style.filter = 'blur(32px)';
            characterGlow.style.opacity = '1';
        });
        
        characterWrapper.addEventListener('mouseleave', function() {
            characterGlow.style.filter = 'blur(24px)';
            characterGlow.style.opacity = '0.7';
        });
    }
}

// Statistics counter animation
function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = target.textContent;
                const number = parseInt(finalNumber.replace(/[^\d]/g, ''));
                const suffix = finalNumber.replace(/[\d]/g, '');
                
                animateNumber(target, 0, number, suffix, 2000);
                observer.unobserve(target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateNumber(element, start, end, suffix, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Handle window resize
function handleResize() {
    window.addEventListener('resize', () => {
        // Recreate particles for new window size
        const particleSystem = new ParticleSystem();
    });
}

// Loading animation
function initLoadingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const actionButtons = document.querySelector('.action-buttons');
    const characterWrapper = document.querySelector('.character-image-wrapper');
    
    // Initially hide elements
    [heroTitle, heroDescription, actionButtons, characterWrapper].forEach(el => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
        }
    });
    
    // Animate elements in sequence
    setTimeout(() => {
        if (heroTitle) {
            heroTitle.style.transition = 'all 0.8s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }
    }, 200);
    
    setTimeout(() => {
        if (heroDescription) {
            heroDescription.style.transition = 'all 0.8s ease';
            heroDescription.style.opacity = '1';
            heroDescription.style.transform = 'translateY(0)';
        }
    }, 400);
    
    setTimeout(() => {
        if (actionButtons) {
            actionButtons.style.transition = 'all 0.8s ease';
            actionButtons.style.opacity = '1';
            actionButtons.style.transform = 'translateY(0)';
        }
    }, 600);
    
    setTimeout(() => {
        if (characterWrapper) {
            characterWrapper.style.transition = 'all 1s ease';
            characterWrapper.style.opacity = '1';
            characterWrapper.style.transform = 'translateY(0)';
        }
    }, 800);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all systems
    const particleSystem = new ParticleSystem();
    initSmoothScrolling();
    initButtonEffects();
    initSidebarEffects();
    initCharacterEffects();
    animateCounters();
    handleResize();
    initLoadingAnimation();
    
    console.log('MIZI website initialized successfully!');
});

// Add some interactive features
document.addEventListener('click', function(e) {
    // Create ripple effect on click
    if (e.target.classList.contains('btn')) {
        createRipple(e);
    }
});

function createRipple(event) {
    const button = event.target;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Add ripple CSS if not exists
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}