/* ================================================================
   TOWN & COUNTRY MARKET — JAVASCRIPT
   Navbar scroll, mobile menu, and scroll reveal animations
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---- Mobile menu toggle ----
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ---- Scroll reveal animations (disabled on mobile via CSS) ----
  const revealElements = document.querySelectorAll(
    '.dept-card, .special-card, .contact-card, .about-text, .about-image, .section-header'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Stagger animation for grid items ----
  const staggerGroups = [
    document.querySelectorAll('.special-card'),
    document.querySelectorAll('.dept-card'),
    document.querySelectorAll('.contact-card')
  ];

  staggerGroups.forEach(group => {
    group.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });


  // ---- PWA: Register Service Worker ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('🔄 New content available — refresh for updates.');
            }
          });
        });
      })
      .catch((err) => console.warn('Service Worker registration failed:', err));
  }

  // ---- PWA: Install prompt ----
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) return;

    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-inner">
        <span class="pwa-install-icon">🏪</span>
        <div class="pwa-install-text">
          <strong>Install T&C Market</strong>
          <span>Add to your home screen for quick access</span>
        </div>
        <button class="pwa-install-btn" id="pwa-install-btn">Install</button>
        <button class="pwa-install-close" id="pwa-install-close" aria-label="Dismiss">&times;</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });
    });

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      deferredPrompt = null;
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 400);
    });

    document.getElementById('pwa-install-close').addEventListener('click', () => {
      sessionStorage.setItem('pwa-install-dismissed', 'true');
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 400);
    });
  }

  // Detect standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('pwa-standalone');
    console.log('📱 Running as installed PWA');
  }

});
