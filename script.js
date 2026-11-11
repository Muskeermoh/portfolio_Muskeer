// ==================== NAVIGATION ====================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollProgress = document.querySelector('.scroll-progress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggle = document.getElementById('themeToggle');
const desktopMotionEnabled = window.innerWidth > 968 && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const pageSections = [...document.querySelectorAll('section[id]')];
const parallaxElements = document.querySelectorAll('.hero-bg');
let scrollFrame = 0;

function setTheme(theme, persist = true) {
    const activeTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = activeTheme;
    const nextThemeLabel = activeTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle?.setAttribute('aria-label', nextThemeLabel);
    themeToggle?.setAttribute('title', nextThemeLabel);
    themeToggle?.setAttribute('aria-pressed', String(activeTheme === 'light'));

    if (persist) {
        try {
            localStorage.setItem('portfolio-theme', activeTheme);
        } catch (error) {
            console.warn('Theme preference could not be saved.', error);
        }
    }
}

setTheme(document.documentElement.dataset.theme, false);
themeToggle?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function updateScrollMotion() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        scrollProgress?.style.setProperty('transform', `scaleX(${progress})`);
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
        backToTopButton?.classList.toggle('visible', window.scrollY > 500);

        if (desktopMotionEnabled) {
            const offset = `${Math.min(window.scrollY * 0.12, 72)}px`;
            parallaxElements.forEach(element => element.style.setProperty('--parallax-offset', offset));
        }
    });
}

window.addEventListener('scroll', updateScrollMotion, { passive: true });
window.addEventListener('resize', updateScrollMotion, { passive: true });
updateScrollMotion();

// Mobile menu toggle
hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') !== 'true';
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navMenu?.classList.toggle('active', isOpen);
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
        navMenu?.classList.remove('active');
    });
});

if ('IntersectionObserver' in window) {
    const sectionNavObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(link => {
                const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
                link.classList.toggle('active', isCurrent);
                if (isCurrent) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
    pageSections.forEach(section => sectionNavObserver.observe(section));
}

// ==================== TYPING EFFECT ====================
const typingText = document.querySelector('.typing-text');
const roles = [
    'Full-Stack Software Developer',
    'Frontend Systems Specialist',
    'Backend Automation Engineer',
    '3D Spatial UI Builder',
    'Automation Problem Solver'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;

function typeRole() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 150;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500; // Pause before next word
    }

    setTimeout(typeRole, typingSpeed);
}

// Start typing effect
if (typingText) {
    if (prefersReducedMotion) {
        typingText.textContent = roles[0];
    } else {
        setTimeout(typeRole, 1000);
    }
}

// ==================== ANIMATION ON SCROLL ====================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries, revealObserver) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions) : null;

// Reduced-motion visitors get all content immediately without waiting for scroll.
document.documentElement.classList.add('motion-ready');
const revealElements = document.querySelectorAll('[data-aos]');
if (prefersReducedMotion || !observer) {
    revealElements.forEach(element => element.classList.add('aos-animate'));
} else {
    revealElements.forEach(element => {
        const delay = Math.min(Number(element.dataset.aosDelay) || 0, 500);
        element.style.setProperty('--reveal-delay', `${delay}ms`);
        observer.observe(element);
    });
}

// ==================== COUNTER ANIMATION ====================
const counters = document.querySelectorAll('.counter');
let hasCountered = false;

const aboutSection = document.querySelector('.about-stats');
function showCounters() {
    if (hasCountered) return;
    hasCountered = true;
    counters.forEach(counter => {
        const target = Number(counter.getAttribute('data-target')) || 0;
        if (prefersReducedMotion) {
            counter.textContent = String(target);
            return;
        }

        const startedAt = performance.now();
        const duration = 1400;
        const updateCounter = now => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            counter.textContent = String(Math.round(target * easedProgress));
            if (progress < 1) requestAnimationFrame(updateCounter);
        };
        requestAnimationFrame(updateCounter);
    });
}

if (aboutSection && (prefersReducedMotion || !('IntersectionObserver' in window))) {
    showCounters();
} else if (aboutSection) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        showCounters();
        observer.disconnect();
    }, { threshold: 0.5 });
    counterObserver.observe(aboutSection);
}

// ==================== SKILL BARS ANIMATION ====================
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target.getAttribute('data-progress');
            entry.target.style.width = progress + '%';
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 }) : null;

skillBars.forEach(bar => skillObserver ? skillObserver.observe(bar) : bar.style.setProperty('width', `${bar.dataset.progress || 0}%`));

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        }
    });
});

// ==================== BACK TO TOP BUTTON ====================
const backToTopButton = document.getElementById('backToTop');

backToTopButton?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
});

// ==================== CONTACT FORM ====================
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

contactForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.reset();
        } else {
            showNotification('Failed to send message. Please try again or email me directly.', 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again or email me directly.', 'error');
        console.error('Form submission error:', error);
    } finally {
        // Re-enable button and restore original text
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '30px',
        background: type === 'success' ? '#151315' : '#541d2a',
        color: '#f0ece8',
        padding: '16px 28px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 8px 30px rgba(43, 41, 39, 0.08)',
        zIndex: '10000',
        animation: 'slideInRight 0.5s ease',
        maxWidth: '400px'
    });

    // Add keyframes for animation
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Pointer motion is event-driven and only enabled for desktop mouse input.
const spatialCards = document.querySelectorAll(
    '.featured-project-card, .project-card-small, .skill-category, .timeline-content, .stat-item, .tech-item, .contact-item, .hero-text'
);
spatialCards.forEach(card => card.classList.add('spatial-card'));

if (desktopMotionEnabled) {
    const magneticButtons = document.querySelectorAll('.btn');
    const pointerCards = '.spatial-card';
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let followerX = 0;
    let followerY = 0;
    let activeCard = null;

    const cursor = document.createElement('span');
    const cursorFollower = document.createElement('span');
    cursor.className = 'custom-cursor';
    cursorFollower.className = 'cursor-follower';
    cursor.setAttribute('aria-hidden', 'true');
    cursorFollower.setAttribute('aria-hidden', 'true');

    const cursorEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (cursorEnabled) {
        document.body.classList.add('elite-cursor-enabled');
        document.body.append(cursor, cursorFollower);
    }

    const heroImage = document.querySelector('.hero-image');
    heroImage?.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const bounds = heroImage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroImage.style.setProperty('--portrait-tilt-y', `${-5 + x * 8}deg`);
        heroImage.style.setProperty('--portrait-tilt-x', `${1 - y * 6}deg`);
    });
    heroImage?.addEventListener('pointerleave', () => {
        heroImage.style.removeProperty('--portrait-tilt-y');
        heroImage.style.removeProperty('--portrait-tilt-x');
    });

    function renderPointer() {
        pointerFrame = 0;
        if (cursorEnabled) {
            followerX += (pointerX - followerX) * 0.24;
            followerY += (pointerY - followerY) * 0.24;
            cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        }

        if (activeCard) {
            const bounds = activeCard.getBoundingClientRect();
            const x = (pointerX - bounds.left) / bounds.width;
            const y = (pointerY - bounds.top) / bounds.height;
            activeCard.style.setProperty('--spot-x', `${x * 100}%`);
            activeCard.style.setProperty('--spot-y', `${y * 100}%`);
            activeCard.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
            activeCard.style.setProperty('--tilt-y', `${(x - 0.5) * 7}deg`);
        }
    }

    function schedulePointerRender() {
        if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointer);
    }

    document.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        schedulePointerRender();

        const hoveredCard = event.target.closest(pointerCards);
        if (hoveredCard !== activeCard) {
            activeCard?.classList.remove('is-pointer-active');
            activeCard?.style.removeProperty('--tilt-x');
            activeCard?.style.removeProperty('--tilt-y');
            activeCard = hoveredCard;
            activeCard?.classList.add('is-pointer-active');
        }
    }, { passive: true });

    document.addEventListener('pointerover', event => {
        if (event.pointerType !== 'mouse' || !cursorEnabled) return;
        if (event.target.closest('a, button, input, textarea')) cursorFollower.classList.add('is-hovering');
    });

    document.addEventListener('pointerout', event => {
        if (event.pointerType !== 'mouse' || !cursorEnabled) return;
        if (!event.relatedTarget?.closest?.('a, button, input, textarea')) cursorFollower.classList.remove('is-hovering');
    });

    magneticButtons.forEach(button => {
        button.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse') return;
            const bounds = button.getBoundingClientRect();
            const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
            const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
            button.style.setProperty('--magnetic-x', `${x * 7}px`);
            button.style.setProperty('--magnetic-y', `${y * 5}px`);
        });
        button.addEventListener('pointerleave', () => {
            button.style.removeProperty('--magnetic-x');
            button.style.removeProperty('--magnetic-y');
        });
    });

    document.addEventListener('pointerout', event => {
        if (!activeCard || activeCard.contains(event.relatedTarget)) return;
        activeCard.style.removeProperty('--spot-x');
        activeCard.style.removeProperty('--spot-y');
        activeCard.style.removeProperty('--tilt-x');
        activeCard.style.removeProperty('--tilt-y');
        activeCard.classList.remove('is-pointer-active');
        activeCard = null;
    });
}

// ==================== PRELOADER (OPTIONAL) ====================
window.addEventListener('load', () => {
    // Hide preloader if it exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }

    // Trigger initial animations
    document.body.classList.add('loaded');
});

// ==================== LAZY LOADING IMAGES ====================
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
}, { rootMargin: '50px' });

images.forEach(img => {
    imageObserver.observe(img);
});

// ==================== CONSOLE MESSAGE ====================
console.log('%cHello Developer!', 'color: #c83d50; font-size: 20px; font-weight: bold;');
console.log('%cInterested in the code? Check out my GitHub!', 'color: #b8aeaa; font-size: 14px;');
console.log('%chttps://github.com/muskeermhm', 'color: #f0ece8; font-size: 14px;');

// ==================== EASTER EGG ====================
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showNotification('🎮 Konami Code Activated! You found the easter egg!', 'success');
        document.body.style.animation = 'rainbow 5s infinite';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
});

// ==================== FORM INPUT ANIMATIONS ====================
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.parentElement.classList.remove('focused');
        }
    });
});

// ==================== PERFORMANCE MONITORING ====================
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`%cPage Load Time: ${pageLoadTime}ms`, 'color: #43e97b; font-weight: bold;');
    });
}
window.addEventListener('pageshow', updateScrollMotion);
