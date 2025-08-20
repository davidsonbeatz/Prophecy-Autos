// Main JavaScript for Prophecy Autos
// Updated version with improved functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Change icon based on menu state
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        const icon = mobileMenuBtn.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    });
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Scroll to top button
    const scrollTopBtn = document.createElement('div');
    scrollTopBtn.classList.add('scroll-top');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Add CSS for scroll to top button
    const style = document.createElement('style');
    style.textContent = `
        .scroll-top {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            background-color: #1e3a8a;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }
        
        .scroll-top.show {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-top:hover {
            background-color: #152a60;
        }
    `;
    document.head.appendChild(style);
});

// Inventory Filter and Search Functionality (for inventory.html)
function initInventoryFilters() {
    const filterForm = document.getElementById('filter-form');
    const searchInput = document.getElementById('search-input');
    const carItems = document.querySelectorAll('.car-item');
    
    if (filterForm && carItems.length > 0) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterCars();
        });
        
        // Filter on change for select elements
        const selectFilters = filterForm.querySelectorAll('select');
        selectFilters.forEach(filter => {
            filter.addEventListener('change', filterCars);
        });
        
        // Filter on input for range elements
        const rangeFilters = filterForm.querySelectorAll('input[type="range"]');
        rangeFilters.forEach(filter => {
            filter.addEventListener('input', function() {
                const valueDisplay = document.getElementById(`${filter.id}-value`);
                if (valueDisplay) {
                    if (filter.id === 'price-range') {
                        valueDisplay.textContent = `$${filter.value},000`;
                    } else {
                        valueDisplay.textContent = filter.value;
                    }
                }
            });
            
            filter.addEventListener('change', filterCars);
        });
        
        // Search on input
        if (searchInput) {
            searchInput.addEventListener('input', filterCars);
        }
        
        function filterCars() {
            const make = document.getElementById('make-filter')?.value || 'all';
            const model = document.getElementById('model-filter')?.value || 'all';
            const year = document.getElementById('year-filter')?.value || 'all';
            const condition = document.getElementById('condition-filter')?.value || 'all';
            const priceRange = document.getElementById('price-range')?.value || 100;
            const searchTerm = searchInput?.value.toLowerCase() || '';
            
            let visibleCount = 0;
            
            carItems.forEach(car => {
                const carMake = car.dataset.make;
                const carModel = car.dataset.model;
                const carYear = car.dataset.year;
                const carCondition = car.dataset.condition;
                const carPrice = parseInt(car.dataset.price);
                const carTitle = car.querySelector('.car-title')?.textContent.toLowerCase() || '';
                const carDescription = car.querySelector('.car-description')?.textContent.toLowerCase() || '';
                
                // Check if car matches all filters
                const matchesMake = make === 'all' || carMake === make;
                const matchesModel = model === 'all' || carModel === model;
                const matchesYear = year === 'all' || carYear === year;
                const matchesCondition = condition === 'all' || carCondition === condition;
                const matchesPrice = carPrice <= priceRange * 1000;
                const matchesSearch = searchTerm === '' || 
                                     carTitle.includes(searchTerm) || 
                                     carDescription.includes(searchTerm) ||
                                     carMake.toLowerCase().includes(searchTerm) ||
                                     carModel.toLowerCase().includes(searchTerm);
                
                // Show/hide car based on filter matches
                if (matchesMake && matchesModel && matchesYear && matchesCondition && matchesPrice && matchesSearch) {
                    car.style.display = 'block';
                    visibleCount++;
                } else {
                    car.style.display = 'none';
                }
            });
            
            // Show message if no cars match filters
            const noResultsMessage = document.getElementById('no-results');
            if (noResultsMessage) {
                if (visibleCount === 0) {
                    noResultsMessage.style.display = 'block';
                } else {
                    noResultsMessage.style.display = 'none';
                }
            }
            
            // Update count of visible cars
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = visibleCount;
            }
        }
    }
}

// Initialize inventory filters if on inventory page
if (window.location.pathname.includes('inventory')) {
    document.addEventListener('DOMContentLoaded', initInventoryFilters);
}

// Car Details Page Image Gallery
function initCarGallery() {
    const mainImage = document.getElementById('main-car-image');
    const thumbnails = document.querySelectorAll('.car-thumbnail');
    
    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image
                const newSrc = this.getAttribute('src');
                mainImage.src = newSrc;
                
                // Update active thumbnail
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Initialize car gallery if on car details page
if (window.location.pathname.includes('car-details')) {
    document.addEventListener('DOMContentLoaded', initCarGallery);
}

// Contact Form Validation
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            // Reset error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            
            // Validate name
            if (!name.value.trim()) {
                showError(name, 'Please enter your name');
                isValid = false;
            }
            
            // Validate email
            if (!email.value.trim()) {
                showError(email, 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate message
            if (!message.value.trim()) {
                showError(message, 'Please enter your message');
                isValid = false;
            }
            
            // Submit form if valid
            if (isValid) {
                // In a real application, you would send the form data to a server
                // For now, we'll just show a success message
                const formElements = contactForm.elements;
                for (let i = 0; i < formElements.length; i++) {
                    if (formElements[i].type !== 'submit') {
                        formElements[i].value = '';
                    }
                }
                
                const successMessage = document.createElement('div');
                successMessage.classList.add('success-message');
                successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                contactForm.appendChild(successMessage);
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
    }
    
    function showError(input, message) {
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = message;
        input.parentNode.appendChild(errorMessage);
        input.classList.add('error');
        
        // Remove error on input focus
        input.addEventListener('focus', function() {
            this.classList.remove('error');
            const error = this.parentNode.querySelector('.error-message');
            if (error) {
                error.remove();
            }
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize contact form if on contact page
if (window.location.pathname.includes('contact')) {
    document.addEventListener('DOMContentLoaded', initContactForm);
}