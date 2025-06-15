/**
 * English Learning Academy - Main JavaScript File
 * Handles theme switching, language switching, navigation, forms, and interactive features
 */

// Global state management
const AppState = {
    currentLanguage: 'en',
    currentTheme: 'light',
    translations: {},
    isLoading: false
};

// DOM elements cache
const Elements = {
    themeToggle: null,
    langToggle: null,
    hamburger: null,
    navMenu: null,
    contactForm: null,
    filterButtons: null,
    courseCards: null,
    faqItems: null
};

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeTheme();
    initializeLanguage();
    initializeNavigation();
    initializeContactForm();
    initializeCourseFiltering();
    initializeFAQ();
    
    console.log('English Academy app initialized successfully');
});

/**
 * Cache DOM elements for better performance
 */
function initializeElements() {
    Elements.themeToggle = document.getElementById('theme-toggle');
    Elements.langToggle = document.getElementById('lang-toggle');
    Elements.hamburger = document.getElementById('hamburger');
    Elements.navMenu = document.getElementById('nav-menu');
    Elements.contactForm = document.getElementById('contact-form');
    Elements.filterButtons = document.querySelectorAll('.filter-btn');
    Elements.courseCards = document.querySelectorAll('.course-card');
    Elements.faqItems = document.querySelectorAll('.faq-item');
}

/**
 * Theme Management
 */
function initializeTheme() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    AppState.currentTheme = savedTheme;
    
    // Apply theme
    applyTheme(savedTheme);
    
    // Add event listener
    if (Elements.themeToggle) {
        Elements.themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    AppState.currentTheme = newTheme;
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icon
    if (Elements.themeToggle) {
        const icon = Elements.themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
}

/**
 * Language Management
 */
async function initializeLanguage() {
    // Load saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    AppState.currentLanguage = savedLang;
    
    // Load translations
    await loadTranslations(savedLang);
    
    // Apply language
    applyLanguage(savedLang);
    
    // Add event listener
    if (Elements.langToggle) {
        Elements.langToggle.addEventListener('click', toggleLanguage);
    }
}

async function loadTranslations(lang) {
    try {
        AppState.isLoading = true;
        const response = await fetch(`lang/${lang}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${lang}`);
        }
        
        AppState.translations = await response.json();
        AppState.isLoading = false;
    } catch (error) {
        console.error('Error loading translations:', error);
        AppState.isLoading = false;
        
        // Fallback to English if other language fails
        if (lang !== 'en') {
            await loadTranslations('en');
        }
    }
}

async function toggleLanguage() {
    if (AppState.isLoading) return;
    
    const newLang = AppState.currentLanguage === 'en' ? 'th' : 'en';
    
    // Show loading state
    setLoadingState(true);
    
    try {
        await loadTranslations(newLang);
        AppState.currentLanguage = newLang;
        applyLanguage(newLang);
        localStorage.setItem('language', newLang);
    } catch (error) {
        console.error('Error switching language:', error);
        showNotification('Failed to switch language. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

function applyLanguage(lang) {
    // Update language toggle button
    if (Elements.langToggle) {
        const langText = Elements.langToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = lang === 'en' ? 'TH' : 'EN';
        }
    }
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Translate all elements with data-translate attribute
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedTranslation(AppState.translations, key);
        
        if (translation) {
            // Handle different element types
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else if (element.tagName === 'META') {
                element.setAttribute('content', translation);
            } else if (element.tagName === 'TITLE') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update select options if present
    updateSelectOptions();
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

function updateSelectOptions() {
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect && AppState.translations.contact?.form?.subject) {
        const options = subjectSelect.querySelectorAll('option[data-translate]');
        options.forEach(option => {
            const key = option.getAttribute('data-translate');
            const translation = getNestedTranslation(AppState.translations, key);
            if (translation) {
                option.textContent = translation;
            }
        });
    }
}

function setLoadingState(loading) {
    AppState.isLoading = loading;
    document.body.classList.toggle('loading', loading);
}

/**
 * Navigation Management
 */
function initializeNavigation() {
    if (Elements.hamburger && Elements.navMenu) {
        Elements.hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (Elements.navMenu && Elements.navMenu.classList.contains('active')) {
            if (!Elements.navMenu.contains(event.target) && !Elements.hamburger.contains(event.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // Update active nav link based on current page
    updateActiveNavLink();
}

function toggleMobileMenu() {
    if (Elements.hamburger && Elements.navMenu) {
        Elements.hamburger.classList.toggle('active');
        Elements.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = Elements.navMenu.classList.contains('active') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    if (Elements.hamburger && Elements.navMenu) {
        Elements.hamburger.classList.remove('active');
        Elements.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Contact Form Management
 */
function initializeContactForm() {
    if (!Elements.contactForm) return;
    
    Elements.contactForm.addEventListener('submit', handleContactFormSubmit);
    
    // Add real-time validation
    const formInputs = Elements.contactForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

async function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(Elements.contactForm);
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const formMessage = document.getElementById('form-message');
    
    // Validate form before submission
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    loadingSpinner.style.display = 'inline-flex';
    submitBtn.querySelector('span:first-child').style.display = 'none';
    
    try {
        const response = await fetch(Elements.contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showFormMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
            Elements.contactForm.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        loadingSpinner.style.display = 'none';
        submitBtn.querySelector('span:first-child').style.display = 'inline';
    }
}

function validateForm() {
    const requiredFields = Elements.contactForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    // Email validation
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    // Phone validation (optional but if provided should be valid)
    else if (fieldType === 'tel' && value) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number.';
        }
    }
    // Message length validation
    else if (fieldName === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Please provide a more detailed message (at least 10 characters).';
    }
    
    // Show/hide error message
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    // Add/remove error styling
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.toggle('error', !isValid);
        formGroup.classList.toggle('success', isValid && value);
    }
    
    return isValid;
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
    }
    
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
}

/**
 * Course Filtering
 */
function initializeCourseFiltering() {
    if (!Elements.filterButtons.length || !Elements.courseCards.length) return;
    
    Elements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterCourses(filter);
            updateActiveFilter(button);
        });
    });
}

function filterCourses(filter) {
    Elements.courseCards.forEach(card => {
        const cardLevel = card.getAttribute('data-level');
        const shouldShow = filter === 'all' || cardLevel === filter;
        
        card.classList.toggle('hidden', !shouldShow);
        
        // Add animation
        if (shouldShow) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }
    });
}

function updateActiveFilter(activeButton) {
    Elements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

/**
 * FAQ Accordion
 */
function initializeFAQ() {
    if (!Elements.faqItems.length) return;
    
    Elements.faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => toggleFAQItem(item));
        }
    });
}

function toggleFAQItem(item) {
    const isActive = item.classList.contains('active');
    
    // Close all other FAQ items
    Elements.faqItems.forEach(faqItem => {
        faqItem.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        item.classList.add('active');
    }
}

/**
 * Utility Functions
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Smooth Scrolling for Anchor Links
 */
document.addEventListener('click', function(event) {
    const target = event.target.closest('a[href^="#"]');
    if (target) {
        event.preventDefault();
        const href = target.getAttribute('href');
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientPosition().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
});

/**
 * Handle Course Enrollment Buttons
 */
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('course-enroll')) {
        event.preventDefault();
        
        const courseCard = event.target.closest('.course-card');
        const courseTitle = courseCard?.querySelector('.course-title')?.textContent || 'Course';
        
        // In a real application, this would redirect to a payment/enrollment page
        showNotification(`Enrollment for "${courseTitle}" is coming soon! Please contact us for more information.`, 'info');
    }
});

/**
 * Intersection Observer for Animations
 */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .course-card, .team-member, .method-card');
    animatedElements.forEach(el => observer.observe(el));
});

/**
 * Error Handling
 */
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    
    // In production, you might want to send this to an error tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

/**
 * Performance Monitoring
 */
window.addEventListener('load', function() {
    // Log performance metrics
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }
});

// Export functions for potential use in other scripts
window.EnglishAcademy = {
    toggleTheme,
    toggleLanguage,
    showNotification,
    filterCourses
};
