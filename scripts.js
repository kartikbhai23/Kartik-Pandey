// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Toggle icon
        const icon = this.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navigation
let lastScroll = 0;
const nav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.style.boxShadow = 'none';
    } else {
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation on page load
window.addEventListener('load', () => {
    const animateElements = document.querySelectorAll(
        '.about-text, .stats-box, .skill-column, .info-item, ' +
        '.timeline-item, .skill-category, .cert-card, ' +
        '.project-card, .featured-card, .contact-card'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});

// Skill bars animation
const skillBars = document.querySelectorAll('.skill-progress');
if (skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
                skillObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

// Form validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add active class to current page link
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Prevent forms from actually submitting (for demo purposes)
document.querySelectorAll('form').forEach(form => {
    if (!form.id || form.id !== 'contactForm') {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted (demo mode)');
        });
    }
});

// --- ALTERNATING TYPING ANIMATION LOGIC ---
const typingTextElement = document.querySelector('.tagline');
if (typingTextElement && typingTextElement.dataset.typing === 'true') {
    // Get the full text and clear the HTML content
    const fullText = typingTextElement.textContent.trim();
    typingTextElement.textContent = ''; 
    
    // Find the split point
    const breakPoint = fullText.indexOf('|'); 
    
    // Split the text into two parts
    const texts = [
        fullText.substring(0, breakPoint).trim(), // "AI/ML Engineer"
        fullText.substring(breakPoint + 1).trim()  // "Building Intelligent Systems"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseEnd = 2000; // Pause at end of text
    const pauseBeforeDelete = 1500; // Pause before deleting
    
    // Add blinking cursor style
    const style = document.createElement('style');
    style.innerHTML = `
        .blinking-cursor {
            font-weight: bold;
            color: var(--primary-color);
            animation: blink 1s step-end infinite;
        }
        @keyframes blink {
            from, to { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    function type() {
        const currentText = texts[textIndex];
        
        if (!isDeleting && charIndex <= currentText.length) {
            // Typing
            typingTextElement.innerHTML = currentText.substring(0, charIndex) + '<span class="blinking-cursor">|</span>';
            charIndex++;
            setTimeout(type, typingSpeed);
        } else if (!isDeleting && charIndex > currentText.length) {
            // Finished typing, pause before deleting
            setTimeout(() => {
                isDeleting = true;
                type();
            }, pauseBeforeDelete);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            typingTextElement.innerHTML = currentText.substring(0, charIndex - 1) + '<span class="blinking-cursor">|</span>';
            charIndex--;
            setTimeout(type, deletingSpeed);
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting, move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        }
    }
    
    // Start typing after initial delay
    setTimeout(type, 500);
}
// --- END OF TYPING ANIMATION LOGIC ---

// Animate stats when in viewport
const statElements = document.querySelectorAll('.stat h3');
if (statElements.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (!isNaN(number)) {
                    animateCounter(entry.target, number, 2000);
                    statsObserver.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.5 });

    statElements.forEach(stat => statsObserver.observe(stat));
}

// Console message (optional)
console.log('%c👋 Hello there!', 'font-size: 20px; color: #00d4ff; font-weight: bold;');
console.log('%cThanks for checking out the console! If you have any questions, feel free to reach out.', 'font-size: 14px; color: #a8b2d1;');