/* ═══════════════════════════════════════════════════════════════
   GOOD GUYS GOLF — App JavaScript
   Minimal, performant, accessible
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Globals ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const backToTop = document.querySelector('.back-to-top');
  let ticking = false;
  let statsAnimated = false;

  // ── Lucide Icons ──
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ── Seamless Video Loop ──
  const heroVideo = document.querySelector('.hero__bg video');
  if (heroVideo) {
    // Remove native loop — we handle it manually
    heroVideo.removeAttribute('loop');

    heroVideo.addEventListener('timeupdate', () => {
      // Start fading out 0.8s before the video ends
      if (heroVideo.duration - heroVideo.currentTime < 0.8) {
        heroVideo.style.opacity = '0';
      }
    });

    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play();
      // Small delay then fade back in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          heroVideo.style.opacity = '1';
        });
      });
    });
  }

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  });

  // ── Mobile Menu ──
  function openMobileMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // ── Unified Scroll Handler ──
  function onScroll() {
    const scrollY = window.scrollY;

    // Sticky nav
    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 50);
    }

    // Back to top
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 500);
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  onScroll();

  // Back to top click
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // ── Scroll Animations (IntersectionObserver) ──
  if (!prefersReducedMotion) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animObserver.observe(el);
    });
  } else {
    // Show everything immediately
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('animated');
    });
  }

  // ── Stats Counter ──
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 2000;
      const startTime = performance.now();

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.round(easedProgress * target);

        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target.toLocaleString();
        }
      }

      if (prefersReducedMotion) {
        counter.textContent = target.toLocaleString();
      } else {
        requestAnimationFrame(update);
      }
    });
  }

  // ── Toast System ──
  function createToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.createToast = createToast;

  // ── Cart ──
  const cart = [];

  function addToCart(name, price) {
    cart.push({ name, price: parseFloat(price) });
    updateCartCount();
    createToast(`${name} added to cart!`, 'success');
  }

  function updateCartCount() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = cart.length;
      badge.style.display = cart.length > 0 ? 'flex' : 'none';
    }
  }

  // Expose globally for inline handlers
  window.addToCart = addToCart;

  // Wire up data-attribute buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.productName || 'Item';
      const price = btn.dataset.productPrice || '0';
      addToCart(name, price);
    });
  });

  // ── Donation Amount Selection ──
  const donationBtns = document.querySelectorAll('.donate__amount');
  const customAmountInput = document.getElementById('custom-amount');

  donationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      donationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.amount === 'custom') {
        if (customAmountInput) {
          customAmountInput.style.display = 'block';
          customAmountInput.focus();
        }
      } else {
        if (customAmountInput) {
          customAmountInput.style.display = 'none';
        }
      }
    });
  });

  // ── Form Validation & Handling ──
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleForm(formId, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check required fields
      const requiredInputs = form.querySelectorAll('[required]');
      let valid = true;

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = '#D42B2B';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      // Check email fields
      const emailInputs = form.querySelectorAll('input[type="email"]');
      emailInputs.forEach(input => {
        if (input.value && !isValidEmail(input.value)) {
          valid = false;
          input.style.borderColor = '#D42B2B';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) {
        createToast('Please fill in all required fields correctly.', 'error');
        return;
      }

      createToast(successMessage, 'success');
      form.reset();

      // Reset donation buttons
      if (formId === 'donation-form') {
        donationBtns.forEach(b => b.classList.remove('active'));
        if (customAmountInput) customAmountInput.style.display = 'none';
      }
    });
  }

  handleForm('registration-form', 'Registration submitted! We\'ll be in touch soon.');
  handleForm('contact-form', 'Message sent! We\'ll get back to you shortly.');
  handleForm('donation-form', 'Thank you for your generous donation!');

  // ── Newsletter ──
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && isValidEmail(emailInput.value)) {
        createToast('Subscribed! You\'ll hear from us soon.', 'success');
        newsletterForm.reset();
      } else {
        createToast('Please enter a valid email address.', 'error');
      }
    });
  }
});
