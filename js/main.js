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

	// Initialize the page only if grid elements exist
	if (document.querySelector('.grid')) {
		const DOM = {
			grid: document.querySelector('.grid'),
			content: document.querySelector('.grid').parentNode,
			gridItems: Array.from(document.querySelectorAll('.grid__item'))
		};

		// Create items for each grid element
		const items = DOM.gridItems.map(item => new Item(item));
		DOM.details = new Details();
	}

	// Load navigation component
	document.addEventListener('DOMContentLoaded', function() {
		console.log('DOM Content Loaded');
		
		// Get the current page path
		const currentPath = window.location.pathname;
		let basePath = '';
		
		// If we're in a page under /pages/, set basePath to go up one level
		if (currentPath.includes('/pages/')) {
			basePath = '../';
		}
		
		console.log('Current path:', currentPath);
		console.log('Base path:', basePath);
		
		fetch(basePath + 'components/nav.html')
			.then(response => response.text())
			.then(data => {
				// Create a temporary container to manipulate the HTML
				const tempContainer = document.createElement('div');
				tempContainer.innerHTML = data;
				
				// Fix the paths in the navigation HTML
				if (currentPath.includes('/pages/')) {
					// Update logo path
					const logo = tempContainer.querySelector('.nav-logo img');
					if (logo) {
						logo.src = '../img/gpr-logo.png';
					}
					
					// Update navigation links
					const links = tempContainer.querySelectorAll('.nav-links a');
					links.forEach(link => {
						const href = link.getAttribute('href');
						if (href === 'index.html') {
							link.href = '../index.html';
						} else if (href.startsWith('pages/')) {
							// Remove 'pages/' prefix when we're already in the pages directory
							link.href = href.replace('pages/', '');
						}
					});
				}
				
				// Insert the modified navigation
				document.body.insertAdjacentHTML('afterbegin', tempContainer.innerHTML);
			})
			.catch(error => {
				console.error('Error loading navigation:', error);
				// Fallback navigation
				const fallbackNav = `
					<nav class="main-nav">
						<div class="nav-container">
							<a href="${basePath}index.html" class="nav-logo">
								<img src="${basePath}img/gpr-logo.png" alt="Global Path Recruitment Logo">
							</a>
							<ul class="nav-links">
								<li><a href="${basePath}index.html">Home</a></li>
								<li><a href="${currentPath.includes('/pages/') ? 'recruitment.html' : 'pages/recruitment.html'}">Recruitment</a></li>
								<li><a href="${currentPath.includes('/pages/') ? 'training.html' : 'pages/training.html'}">Training</a></li>
								<li><a href="${currentPath.includes('/pages/') ? 'about.html' : 'pages/about.html'}">About</a></li>
								<li><a href="${currentPath.includes('/pages/') ? 'contact.html' : 'pages/contact.html'}">Contact</a></li>
							</ul>
						</div>
					</nav>
				`;
				document.body.insertAdjacentHTML('afterbegin', fallbackNav);
			});
	});
}


