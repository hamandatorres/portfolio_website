// Portfolio Website Responsive JavaScript
// Save this as: portfolio.js

// Smooth scrolling for internal links
function addSmoothScrolling() {
	const links = document.querySelectorAll('a[href^="#"]');
	links.forEach((link) => {
		link.addEventListener("click", function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute("href"));
			if (target) {
				target.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	});
}

// Add loading animation to external links
function addLinkLoadingStates() {
	const externalLinks = document.querySelectorAll(
		'a[href^="http"], a[href^="mailto"]'
	);
	externalLinks.forEach((link) => {
		link.addEventListener("click", function () {
			this.style.opacity = "0.7";
			this.innerHTML += ' <span class="loading">...</span>';

			// Reset after 2 seconds (in case user doesn't navigate away)
			setTimeout(() => {
				this.style.opacity = "1";
				const loading = this.querySelector(".loading");
				if (loading) loading.remove();
			}, 2000);
		});
	});
}

// Responsive navigation for mobile (if you add a nav menu later)
function createMobileMenu() {
	// Create a simple mobile-friendly menu button
	const header = document.querySelector(".intro-box");
	const menuButton = document.createElement("button");
	menuButton.innerHTML = "☰";
	menuButton.className = "mobile-menu-btn";
	menuButton.setAttribute("aria-label", "Toggle mobile menu");

	// Style the button (inline for simplicity)
	menuButton.style.cssText = `
    display: none;
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    border: none;
    padding: 10px 15px;
    font-size: 18px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
  `;

	// Show button on small screens
	function toggleMobileButton() {
		if (window.innerWidth <= 768) {
			menuButton.style.display = "block";
		} else {
			menuButton.style.display = "none";
		}
	}

	window.addEventListener("resize", toggleMobileButton);
	toggleMobileButton(); // Initial check

	document.body.appendChild(menuButton);
}

// Intersection Observer for scroll animations
function addScrollAnimations() {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: "0px 0px -50px 0px",
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.style.opacity = "1";
				entry.target.style.transform = "translateY(0)";
				entry.target.style.transition =
					"opacity 0.6s ease, transform 0.6s ease";
			}
		});
	}, observerOptions);

	// Observe all main sections
	const sections = document.querySelectorAll(
		".bio-box, .projects-box, .contact-box"
	);
	sections.forEach((section) => {
		section.style.opacity = "0";
		section.style.transform = "translateY(30px)";
		observer.observe(section);
	});
}

// Form validation for contact (if you add a contact form later)
function addFormValidation() {
	// This is ready for when you add a contact form
	const forms = document.querySelectorAll("form");
	forms.forEach((form) => {
		form.addEventListener("submit", function (e) {
			const inputs = form.querySelectorAll(
				"input[required], textarea[required]"
			);
			let isValid = true;

			inputs.forEach((input) => {
				if (!input.value.trim()) {
					input.style.borderColor = "#ff6b6b";
					isValid = false;
				} else {
					input.style.borderColor = "#4ecdc4";
				}
			});

			if (!isValid) {
				e.preventDefault();
				alert("Please fill in all required fields.");
			}
		});
	});
}

// Lazy loading for images
function addLazyLoading() {
	const images = document.querySelectorAll("img");

	if ("IntersectionObserver" in window) {
		const imageObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const img = entry.target;
					img.style.transition = "opacity 0.3s";
					img.style.opacity = "1";
					imageObserver.unobserve(img);
				}
			});
		});

		images.forEach((img) => {
			img.style.opacity = "0.7";
			imageObserver.observe(img);
		});
	}
}
// Custom dropdown toggle functionality - FIXED VERSION
function initializeStoryToggle() {
	const toggleButton = document.getElementById("storyToggle");
	const storyContent = document.getElementById("storyContent");
	const toggleIcon = toggleButton.querySelector(".toggle-icon");

	if (!toggleButton || !storyContent) return;

	toggleButton.addEventListener("click", function () {
		const isExpanded = this.getAttribute("aria-expanded") === "true";
		const newState = !isExpanded;

		// Update ARIA attributes
		this.setAttribute("aria-expanded", newState);
		storyContent.setAttribute("aria-hidden", !newState);

		// Toggle content visibility with animation
		if (newState) {
			// Add padding first to measure correct height
			storyContent.classList.add("open");
			// Calculate total height including padding (2rem = 32px on each side = 64px total)
			const totalHeight = storyContent.scrollHeight + 64; // Adding padding
			storyContent.style.maxHeight = totalHeight + "px";
			toggleIcon.textContent = "−";
			toggleIcon.style.transform = "rotate(180deg)";
		} else {
			storyContent.style.maxHeight = "0";
			// Remove padding class after animation
			setTimeout(() => {
				storyContent.classList.remove("open");
			}, 400); // Match the CSS transition duration
			toggleIcon.textContent = "+";
			toggleIcon.style.transform = "rotate(0deg)";
		}

		// Smooth scroll to section when opening
		if (newState) {
			setTimeout(() => {
				toggleButton.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			}, 300);
		}
	});
}
// Responsive text sizing
function adjustTextForViewport() {
	const name = document.querySelector(".name");
	const bioTitle = document.querySelector(".bio-title");

	function adjustSizes() {
		const viewportWidth = window.innerWidth;

		if (viewportWidth <= 480) {
			if (name) name.style.fontSize = "clamp(1.5rem, 4vw, 2.5rem)";
			if (bioTitle) bioTitle.style.fontSize = "clamp(1rem, 3vw, 1.2rem)";
		} else if (viewportWidth <= 768) {
			if (name) name.style.fontSize = "clamp(2rem, 5vw, 3rem)";
			if (bioTitle) bioTitle.style.fontSize = "clamp(1.1rem, 3vw, 1.3rem)";
		}
	}

	window.addEventListener("resize", adjustSizes);
	adjustSizes(); // Initial adjustment
}

// Performance optimization: Debounce resize events
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

// Initialize all functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	addSmoothScrolling();
	addLinkLoadingStates();
	createMobileMenu();
	addScrollAnimations();
	addFormValidation();
	addLazyLoading();
	initializeStoryToggle(); // Updated function name
	adjustTextForViewport();

	console.log("🚀 Portfolio website enhanced with responsive JavaScript!");
});

// Apply debouncing to resize-heavy functions
window.addEventListener(
	"resize",
	debounce(() => {
		console.log("Window resized - adjusting responsive elements");
	}, 250)
);
