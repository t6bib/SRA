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

	// Load navigation component first, before any other functionality
	document.addEventListener('DOMContentLoaded', function() {
		// Determine if we're in the pages directory
		const isInPagesDirectory = window.location.pathname.includes('/pages/');
		console.log('Is in pages directory:', isInPagesDirectory);
		console.log('Current pathname:', window.location.pathname);

		// Update the fetch path based on location
		fetch(isInPagesDirectory ? '../components/nav.html' : 'components/nav.html')
			.then(response => {
				if (!response.ok) throw new Error('Navigation fetch failed');
				return response.text();
			})
			.then(data => {
				const tempContainer = document.createElement('div');
				tempContainer.innerHTML = data;
				
				// Fix logo path - always point to root index.html
				const logo = tempContainer.querySelector('.nav-logo');
				if (logo) {
					const logoPath = isInPagesDirectory ? '../index.html' : 'index.html';
					console.log('Logo path:', logoPath);
					logo.href = logoPath;
					
					const logoImg = logo.querySelector('img');
					if (logoImg) {
						const imgPath = isInPagesDirectory ? '../img/gpr-logo.png' : 'img/gpr-logo.png';
						console.log('Logo image path:', imgPath);
						logoImg.src = imgPath;
					}
				}

				// Fix navigation links
				tempContainer.querySelectorAll('.nav-links a').forEach(link => {
					const text = link.textContent.trim().toLowerCase();
					let newPath;
					if (text === 'home') {
						newPath = isInPagesDirectory ? '../index.html' : 'index.html';
					} else {
						newPath = isInPagesDirectory ? `${text}.html` : `pages/${text}.html`;
					}
					console.log(`Link "${text}" path:`, newPath);
					link.href = newPath;
				});

				// Safe DOM insertion
				const existingNav = document.querySelector('.main-nav');
				if (existingNav) existingNav.remove();
				document.body.insertAdjacentHTML('afterbegin', tempContainer.innerHTML);
			})
			.catch(error => {
				console.error('Navigation error:', error);
				// Log the error and fall back to static navigation
				console.log('Falling back to static navigation');
			});
	});

	// 6. Safely handle Details class and grid functionality
	if (document.querySelector('.grid')) {
		try {
			const DOM = {
				grid: document.querySelector('.grid'),
				content: document.querySelector('.grid').parentNode,
				gridItems: Array.from(document.querySelectorAll('.grid__item'))
			};

			// Only initialize if all required elements exist
			if (DOM.grid && DOM.content && DOM.gridItems.length > 0) {
				const items = DOM.gridItems.map(item => new Item(item));
				DOM.details = new Details();
			}
		} catch (error) {
			console.error('Grid initialization error:', error);
		}
	}

	// Navigation HTML template
	const navTemplate = `
		<nav class="main-nav">
			<div class="nav-container">
				<a href="/" class="nav-logo">
					<img src="/img/gpr-logo.png" alt="Global Path Recruitment">
				</a>
				<div class="hamburger-menu">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<ul class="nav-links">
					<li><a href="/">Home</a></li>
					<li><a href="/pages/about.html">About</a></li>
					<li><a href="/pages/businesses.html">Businesses</a></li>
					<li><a href="/pages/candidates.html">Candidates</a></li>
					<li><a href="/pages/recruitment.html">Recruitment</a></li>
					<li><a href="/pages/training.html">Training</a></li>
					<li><a href="/pages/contact.html">Contact</a></li>
				</ul>
			</div>
		</nav>
	`;

	// Load navigation
	document.body.insertAdjacentHTML('afterbegin', navTemplate);

	// Mobile navigation functionality /* Added 27/02/2024 - Mobile Navigation JavaScript Implementation */
	document.addEventListener('DOMContentLoaded', function() {
		const hamburger = document.querySelector('.hamburger-menu');
		const navLinks = document.querySelector('.nav-links');
		const spans = document.querySelectorAll('.hamburger-menu span');
		const body = document.body;

		if (hamburger && navLinks) {
			// Toggle menu on hamburger click
			hamburger.addEventListener('click', (e) => {
				e.stopPropagation(); // Prevent document click from immediately closing
				navLinks.classList.toggle('active');
				body.classList.toggle('menu-open');
				spans.forEach(span => span.classList.toggle('active'));
			});

			// Close menu when clicking a link
			navLinks.querySelectorAll('a').forEach(link => {
				link.addEventListener('click', () => {
					navLinks.classList.remove('active');
					body.classList.remove('menu-open');
					spans.forEach(span => span.classList.remove('active'));
				});
			});

			// Close menu when clicking outside
			document.addEventListener('click', (e) => {
				if (navLinks.classList.contains('active') && 
					!e.target.closest('.nav-links') && 
					!e.target.closest('.hamburger-menu')) {
					navLinks.classList.remove('active');
					body.classList.remove('menu-open');
					spans.forEach(span => span.classList.remove('active'));
				}
			});

			// Prevent menu from staying open on window resize
			window.addEventListener('resize', () => {
				if (window.innerWidth > 768) {
					navLinks.classList.remove('active');
					body.classList.remove('menu-open');
					spans.forEach(span => span.classList.remove('active'));
				}
			});
		}
	});

	// Update current year in footer
	document.querySelector('.tm-current-year').textContent = new Date().getFullYear();
}


