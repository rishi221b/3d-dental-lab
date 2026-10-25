/**
 * Navigation module: handles sticky header blur, mobile hamburger menu,
 * and keyboard accessible smooth scrolling.
 */
export function initNavigation() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link, .nav-action-btn');

  // Sticky header background transition on scroll
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('is-open', !isExpanded);
      navToggle.classList.toggle('is-active', !isExpanded);
      document.body.classList.toggle('menu-locked', !isExpanded);
    });

    // Close menu when clicking links
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        document.body.classList.remove('menu-locked');
      });
    });

    // Close menu on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        document.body.classList.remove('menu-locked');
        navToggle.focus();
      }
    });
  }

  // Active section spy
  const sections = document.querySelectorAll('section[id]');
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else if (link.getAttribute('href')?.startsWith('#')) {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { rootMargin: '-25% 0px -65% 0px' }
  );

  sections.forEach((sec) => spyObserver.observe(sec));
}
