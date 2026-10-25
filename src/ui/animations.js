/**
 * UI Animations & Interactions module.
 * Scroll reveals, 3D card tilt, tech journey step synchronization, and timeline progress.
 */

export function initAnimations(viewer) {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initScrollReveals(isReducedMotion);
  initServiceCardTilts(isReducedMotion);
  initTechJourneySync(viewer);
  initProcessTimeline();
}

/**
 * Scroll reveal animations using IntersectionObserver.
 */
function initScrollReveals(isReducedMotion) {
  const revealElements = document.querySelectorAll(
    '.reveal-on-scroll, .service-card, .tech-stage-card, .feature-card, .timeline-step, .stat-badge-card'
  );

  if (isReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
}

/**
 * Subtle 3D perspective tilt on service cards for desktop.
 */
function initServiceCardTilts(isReducedMotion) {
  if (isReducedMotion || window.innerWidth < 1024) return;

  const cards = document.querySelectorAll('.service-card');

  cards.forEach((card) => {
    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = mouseX / bounds.width - 0.5;
      const yPct = mouseY / bounds.height - 0.5;

      const rotateY = xPct * 8; // Max 4 deg tilt
      const rotateX = -yPct * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    };

    const onMouseLeave = () => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

/**
 * Synchronizes Technology Journey steps with the 3D Tooth Viewer.
 */
function initTechJourneySync(viewer) {
  const stageCards = document.querySelectorAll('.tech-stage-card');
  const heroModePills = document.querySelectorAll('.stage-pill-btn');
  const stageConnectorLine = document.querySelector('.tech-connector-glow');

  function activateStage(modeName) {
    if (!modeName) return;

    // Update stage cards
    stageCards.forEach((card) => {
      const isMatch = card.dataset.stage === modeName;
      card.classList.toggle('active', isMatch);
      card.setAttribute('aria-selected', String(isMatch));
    });

    // Update Hero 3D pills
    heroModePills.forEach((pill) => {
      const isMatch = pill.dataset.mode === modeName;
      pill.classList.toggle('active', isMatch);
      pill.setAttribute('aria-pressed', String(isMatch));
    });

    // Move connector progress bar if present
    if (stageConnectorLine) {
      const stageMap = { scan: '12%', design: '38%', print: '65%', finish: '95%' };
      stageConnectorLine.style.width = stageMap[modeName] || '95%';
    }

    // Switch 3D Model Mode
    if (viewer) {
      viewer.setMode(modeName);
    }
  }

  // Bind clicks on tech stage cards
  stageCards.forEach((card) => {
    card.addEventListener('click', () => {
      const stage = card.dataset.stage;
      activateStage(stage);
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateStage(card.dataset.stage);
      }
    });
  });

  // Bind clicks on hero 3D viewer stage pills
  heroModePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const mode = pill.dataset.mode;
      activateStage(mode);
    });
  });
}

/**
 * Process timeline scroll highlighting.
 */
function initProcessTimeline() {
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const progressLine = document.querySelector('.timeline-progress-fill');

  if (!timelineSteps.length || !progressLine) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('step-active');
          const stepIndex = parseInt(entry.target.dataset.stepIndex || '1', 10);
          const percent = ((stepIndex - 1) / (timelineSteps.length - 1)) * 100;
          progressLine.style.width = `${percent}%`;
          progressLine.style.height = `${percent}%`;
        }
      });
    },
    { threshold: 0.4 }
  );

  timelineSteps.forEach((step, idx) => {
    step.dataset.stepIndex = String(idx + 1);
    observer.observe(step);

    step.addEventListener('click', () => {
      timelineSteps.forEach((s) => s.classList.remove('step-active'));
      step.classList.add('step-active');
      const stepIndex = idx + 1;
      const percent = ((stepIndex - 1) / (timelineSteps.length - 1)) * 100;
      progressLine.style.width = `${percent}%`;
      progressLine.style.height = `${percent}%`;
    });
  });
}
