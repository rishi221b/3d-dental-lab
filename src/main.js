import './style.css';
import { SculptedSmilesViewer } from './three/scene.js';
import { initNavigation } from './ui/navigation.js';
import { initAnimations } from './ui/animations.js';
import { initCaseForm } from './ui/form.js';

document.addEventListener('DOMContentLoaded', () => {
  // Preloader elements
  const preloader = document.getElementById('app-preloader');
  const stageLabel = document.getElementById('viewport-stage-label');
  const hudAngle = document.getElementById('hud-angle-val');
  const btnToggleRotate = document.getElementById('btn-toggle-rotate');
  const btnResetView = document.getElementById('btn-reset-view');

  // Hotspot Tooltip elements
  const hotspotTooltip = document.getElementById('hotspot-tooltip');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');

  // Canvas container (Full-screen background 3D laboratory canvas)
  const canvasContainer = document.getElementById('lab-canvas-container') || document.getElementById('tooth-canvas-container');

  // Initialize 3D Continuous Dental Laboratory Viewer
  let viewer = null;
  if (canvasContainer) {
    viewer = new SculptedSmilesViewer(canvasContainer, {
      onTelemetry: (data) => {
        if (hudAngle) {
          hudAngle.textContent = `${String(data.angle).padStart(3, '0')}°`;
        }
        if (stageLabel) {
          const modeLabels = {
            scan: 'DIGITAL INTRAORAL SCAN',
            design: 'CAD / OCCLUSAL MARGIN',
            print: 'ADDITIVE 3D RESIN',
            finish: 'ZIRCONIA CERAMIC GLAZE'
          };
          stageLabel.textContent = modeLabels[data.mode] || 'INTERACTIVE 3D CAD';
        }
      },

      onHotspotHover: (data) => {
        if (!hotspotTooltip) return;
        if (data) {
          if (tooltipTitle) tooltipTitle.textContent = data.title;
          if (tooltipDesc) tooltipDesc.textContent = data.description;
          hotspotTooltip.classList.add('visible');
          hotspotTooltip.setAttribute('aria-hidden', 'false');
        } else {
          hotspotTooltip.classList.remove('visible');
          hotspotTooltip.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Auto-rotate toggle button
    if (btnToggleRotate) {
      btnToggleRotate.addEventListener('click', () => {
        const isAuto = viewer.toggleAutoRotate();
        btnToggleRotate.classList.toggle('active', isAuto);
      });
      btnToggleRotate.classList.toggle('active', viewer.autoRotate);
    }

    // Reset camera orientation button
    if (btnResetView) {
      btnResetView.addEventListener('click', () => {
        viewer.resetView();
      });
    }

    // Follow mouse for hotspot tooltip
    window.addEventListener('mousemove', (e) => {
      if (hotspotTooltip && hotspotTooltip.classList.contains('visible')) {
        const x = Math.min(e.clientX + 16, window.innerWidth - 280);
        const y = Math.min(e.clientY + 16, window.innerHeight - 100);
        hotspotTooltip.style.transform = `translate(${x}px, ${y}px)`;
      }
    }, { passive: true });


  }

  // Initialize UI systems
  initNavigation();
  initAnimations(viewer);
  initCaseForm();

  // Preloader Dismissal
  const dismissPreloader = () => {
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
        preloader.setAttribute('aria-busy', 'false');
      }, 500);
    }
  };

  window.requestAnimationFrame(() => {
    setTimeout(dismissPreloader, 400);
  });
});
