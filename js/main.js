{
	// Details class handles the modal/popup functionality for product details
	class Details {
		constructor() {
			this.DOM = {};
			this.isAnimating = false;

			// Create details modal structure
			const detailsTmpl = `
				<div class="details__bg details__bg--down">
					<button class="details__close">
						<i class="fas fa-2x fa-times icon--cross tm-fa-close"></i>
					</button>
					<div class="details__description"></div>
				</div>
			`;

			// Initialize and append details modal to the page
			this.DOM.details = document.createElement('div');
			this.DOM.details.className = 'details';
			this.DOM.details.innerHTML = detailsTmpl;
			document.getElementById('tm-wrap').appendChild(this.DOM.details);
			
			this.init();
		}

		init() {
			// Cache DOM elements
			this.DOM.bgDown = this.DOM.details.querySelector('.details__bg--down');
			this.DOM.description = this.DOM.details.querySelector('.details__description');
			this.DOM.close = this.DOM.details.querySelector('.details__close');

			this.initEvents();
		}

		initEvents() {
			// Event handlers for closing the details modal
			document.body.addEventListener('click', () => this.close());
			this.DOM.bgDown.addEventListener('click', (event) => event.stopPropagation());
			this.DOM.close.addEventListener('click', () => this.close());
		}

		fill(info) {
			this.DOM.description.innerHTML = info.description;
		}

		getProductDetailsRect() {
			try {
				return {
					productBgRect: this.DOM.productBg.getBoundingClientRect(),
					detailsBgRect: this.DOM.bgDown.getBoundingClientRect()
				};
			} catch(e) {
				return { productBgRect: 0, detailsBgRect: 0 };
			}
		}

		open(data) {
			if (this.isAnimating) return false;
			this.isAnimating = true;

			// Setup initial state
			this.DOM.details.style.display = 'block';
			this.DOM.details.classList.add('details--open');
			this.DOM.productBg = data.productBg;
			this.DOM.productBg.style.opacity = 0;

			const rect = this.getProductDetailsRect();

			// Initial transform for animation
			this.DOM.bgDown.style.transform = `translateX(${rect.productBgRect.left-rect.detailsBgRect.left}px) 
											 translateY(${rect.productBgRect.top-rect.detailsBgRect.top}px) 
											 scaleX(${rect.productBgRect.width/rect.detailsBgRect.width}) 
											 scaleY(${rect.productBgRect.height/rect.detailsBgRect.height})`;
			this.DOM.bgDown.style.opacity = 1;

			// Animate background
			anime({
				targets: [this.DOM.bgDown],
				duration: (target, index) => index ? 800 : 250,
				easing: (target, index) => index ? 'easeOutElastic' : 'easeOutSine',
				elasticity: 250,
				translateX: 0,
				translateY: 0,
				scaleX: 1,
				scaleY: 1,
				complete: () => this.isAnimating = false
			});

			// Animate content
			anime({
				targets: [this.DOM.description],
				duration: 1000,
				easing: 'easeOutExpo',
				translateY: ['100%', 0],
				opacity: 1
			});

			// Animate close button
			anime({
				targets: this.DOM.close,
				duration: 250,
				easing: 'easeOutSine',
				translateY: ['100%', 0],
				opacity: 1
			});

			this.setCarousel();
			window.addEventListener("resize", this.setCarousel);
		}

		close() {
			if (this.isAnimating) return false;
			this.isAnimating = true;

			this.DOM.details.classList.remove('details--open');

			// Animate elements out
			anime({
				targets: this.DOM.close,
				duration: 250,
				easing: 'easeOutSine',
				translateY: '100%',
				opacity: 0
			});

			anime({
				targets: [this.DOM.description],
				duration: 20,
				easing: 'linear',
				opacity: 0
			});

			// Animate background back to original position
			const rect = this.getProductDetailsRect();
			anime({
				targets: [this.DOM.bgDown],
				duration: 250,
				easing: 'easeOutSine',
				translateX: (target, index) => {
					return index ? rect.productImgRect.left-rect.detailsImgRect.left : rect.productBgRect.left-rect.detailsBgRect.left;
				},
				translateY: (target, index) => {
					return index ? rect.productImgRect.top-rect.detailsImgRect.top : rect.productBgRect.top-rect.detailsBgRect.top;
				},
				scaleX: (target, index) => {
					return index ? rect.productImgRect.width/rect.detailsImgRect.width : rect.productBgRect.width/rect.detailsBgRect.width;
				},
				scaleY: (target, index) => {
					return index ? rect.productImgRect.height/rect.detailsImgRect.height : rect.productBgRect.height/rect.detailsBgRect.height;
				},
				complete: () => {
					this.DOM.bgDown.style.opacity = 0;
					this.DOM.bgDown.style.transform = 'none';
					this.DOM.productBg.style.opacity = 1;
					this.DOM.details.style.display = 'none';
					this.isAnimating = false;
				}
			});
		}

		// Initialize Slick Carousel with responsive settings
		setCarousel() {
			const slider = $('.details .tm-img-slider');
			
			if (!slider.length) return;

			if (slider.hasClass('slick-initialized')) {
				slider.slick('destroy');
			}

			const settings = $(window).width() > 767 
				? {
					dots: true,
					infinite: true,
					slidesToShow: 4,
					slidesToScroll: 3
				}
				: {
					dots: true,
					infinite: true,
					slidesToShow: 2,
					slidesToScroll: 1
				};

			slider.slick(settings);
		}
	}

	// Item class handles individual grid items
	class Item {
		constructor(el) {
			this.DOM = {
				el: el,
				product: el.querySelector('.product'),
				productBg: el.querySelector('.product').querySelector('.product__bg')
			};

			this.info = {
				description: this.DOM.product.querySelector('.product__description').innerHTML
			};

			this.initEvents();
		}

		initEvents() {
			this.DOM.product.addEventListener('click', () => this.open());
		}

		open() {
			DOM.details.fill(this.info);
			DOM.details.open({
				productBg: this.DOM.productBg
			});
		}
	}

	// Navigation and Responsive Setup
	document.addEventListener('DOMContentLoaded', function() {
		// Determine if we're in the pages directory
		const isInPagesDirectory = window.location.pathname.includes('/pages/');
		
		// Navigation HTML template
		const navTemplate = `
			<nav class="main-nav">
				<div class="nav-container">
					<a href="${isInPagesDirectory ? '../index.html' : 'index.html'}" class="nav-logo">
						<img src="${isInPagesDirectory ? '../img/gpr-logo.png' : 'img/gpr-logo.png'}" alt="Global Path Recruitment">
					</a>
					<button class="hamburger-menu" aria-label="Menu">
						<div class="hamburger-box">
							<span class="hamburger-inner"></span>
							<span class="hamburger-inner"></span>
							<span class="hamburger-inner"></span>
						</div>
					</button>
					<ul class="nav-links">
						<li><a href="${isInPagesDirectory ? '../index.html' : 'index.html'}">Home</a></li>
						<li><a href="${isInPagesDirectory ? 'about.html' : 'pages/about.html'}">About</a></li>
						<li><a href="${isInPagesDirectory ? 'recruitment.html' : 'pages/recruitment.html'}">Recruitment</a></li>
						<li><a href="${isInPagesDirectory ? 'training.html' : 'pages/training.html'}">Training</a></li>
						<li><a href="${isInPagesDirectory ? 'contact.html' : 'pages/contact.html'}">Contact</a></li>
					</ul>
				</div>
			</nav>
		`;

		// Remove any existing navigation
		const existingNav = document.querySelector('.main-nav');
		if (existingNav) {
			existingNav.remove();
		}

		// Insert new navigation
		document.body.insertAdjacentHTML('afterbegin', navTemplate);

		// Initialize all functionality
		initializeWebsite();
	});

	function initializeWebsite() {
		setupMobileMenu();
		setupResponsiveHandling();
		updateDeviceClasses();
		initializeDetailsIfNeeded();
	}

	// Mobile Menu Setup
	function setupMobileMenu() {
		const hamburger = document.querySelector('.hamburger-menu');
		const navLinks = document.querySelector('.nav-links');
		const navItems = document.querySelectorAll('.nav-links li');
		const body = document.body;

		if (hamburger && navLinks) {
			// Toggle menu
			hamburger.addEventListener('click', function(e) {
				e.stopPropagation();
				this.classList.toggle('active');
				navLinks.classList.toggle('active');
				body.classList.toggle('menu-open');

				// Animate nav items
				navItems.forEach((item, index) => {
					if (item.style.animation) {
						item.style.animation = '';
					} else {
						item.style.animation = `navItemFade 0.3s ease forwards ${index / 7 + 0.3}s`;
					}
				});
			});

			// Close menu when clicking outside
			document.addEventListener('click', function(e) {
				const isClickInside = navLinks.contains(e.target) || hamburger.contains(e.target);
				
				if (!isClickInside && navLinks.classList.contains('active')) {
					closeMenu(hamburger, navLinks, body, navItems);
				}
			});

			// Close menu when clicking a link
			navLinks.querySelectorAll('a').forEach(link => {
				link.addEventListener('click', () => closeMenu(hamburger, navLinks, body, navItems));
			});

			// Close menu on resize if open
			window.addEventListener('resize', function() {
				if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
					closeMenu(hamburger, navLinks, body, navItems);
				}
			});

			// Handle escape key
			document.addEventListener('keydown', function(e) {
				if (e.key === 'Escape' && navLinks.classList.contains('active')) {
					closeMenu(hamburger, navLinks, body, navItems);
				}
			});
		}
	}

	function closeMenu(hamburger, navLinks, body, navItems) {
		hamburger.classList.remove('active');
		navLinks.classList.remove('active');
		body.classList.remove('menu-open');
		navItems.forEach(item => {
			item.style.animation = '';
		});
	}

	// Device Detection
	const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
	const isSmallMobile = () => window.matchMedia('(max-width: 480px)').matches;

	// Responsive Handling
	function setupResponsiveHandling() {
		let resizeTimer;
		window.addEventListener('resize', function() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(updateDeviceClasses, 250);
		});
	}

	// Update Device-Specific Classes
	function updateDeviceClasses() {
		const body = document.body;
		if (isSmallMobile()) {
			body.classList.remove('desktop', 'mobile');
			body.classList.add('small-mobile');
		} else if (isMobile()) {
			body.classList.remove('desktop', 'small-mobile');
			body.classList.add('mobile');
		} else {
			body.classList.remove('mobile', 'small-mobile');
			body.classList.add('desktop');
		}
	}

	// Handle iOS vh units bug
	function setVhProperty() {
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}

	// Prevent iOS Safari Bounce Effect
	document.body.addEventListener('touchmove', function(e) {
		if (document.body.classList.contains('menu-open')) {
			e.preventDefault();
		}
	}, { passive: false });

	// Initialize Details functionality if needed
	function initializeDetailsIfNeeded() {
		if (document.querySelector('.grid')) {
			try {
				const DOM = {
					grid: document.querySelector('.grid'),
					content: document.querySelector('.grid').parentNode,
					gridItems: Array.from(document.querySelectorAll('.grid__item'))
				};

				if (DOM.grid && DOM.content && DOM.gridItems.length > 0) {
					const items = DOM.gridItems.map(item => new Item(item));
					DOM.details = new Details();
				}
			} catch (error) {
				console.error('Grid initialization error:', error);
			}
		}
	}

	// Add animation keyframes
	const style = document.createElement('style');
	style.textContent = `
		@keyframes navItemFade {
			from {
				opacity: 0;
				transform: translateX(50px);
			}
			to {
				opacity: 1;
				transform: translateX(0);
			}
		}
	`;
	document.head.appendChild(style);

	// Initialize vh property
	window.addEventListener('resize', setVhProperty);
	window.addEventListener('orientationchange', setVhProperty);
	setVhProperty();
}


