import * as THREE from 'three';
import { ToothSceneManager } from './tooth.js';
import { DentalLabEnvironment } from './labEnvironment.js';
import { isWebGLAvailable, createAmbientDust } from './effects.js';

export class SculptedSmilesViewer {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    this.isRunning = false;
    this.autoRotate = true;
    this.isDragging = false;
    this.prevPointerPos = { x: 0, y: 0 };
    this.pointer = { x: 0, y: 0 };
    this.targetPointer = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.008 };

    // Camera waypoint trajectory system
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.currentCamPos = new THREE.Vector3(0, 1.85, 11.2);
    this.targetCamPos = new THREE.Vector3(0, 1.85, 11.2);

    this.currentLookAt = new THREE.Vector3(0, 1.5, 0);
    this.targetLookAt = new THREE.Vector3(0, 1.5, 0);

    // Raycasting for interactive lab hotspots
    this.raycaster = new THREE.Raycaster();
    this.mouseNDC = new THREE.Vector2(-999, -999);
    this.hoveredHotspot = null;

    // Callbacks
    this.onTelemetryUpdate = options.onTelemetry || null;
    this.onStationChange = options.onStationChange || null;
    this.onHotspotHover = options.onHotspotHover || null;

    // Reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      this.autoRotate = false;
    }

    if (!isWebGLAvailable()) {
      this.renderFallback();
      return;
    }

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF8FAFC);
    this.scene.fog = new THREE.FogExp2(0xEEF2F6, 0.016);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 75);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('aria-label', 'Interactive 3D dental laboratory walkthrough');
    this.canvas.setAttribute('role', 'img');
    this.canvas.className = 'three-lab-canvas';
    this.container.appendChild(this.canvas);

    // Studio Lighting
    this.initLighting();

    // Tooth Object Manager
    this.toothManager = new ToothSceneManager();

    // Laboratory Environment
    this.labEnvironment = new DentalLabEnvironment(this.toothManager);
    this.scene.add(this.labEnvironment.root);

    // Ambient Dust Particles
    this.dust = createAmbientDust();
    this.scene.add(this.dust.points);

    // Event Handlers
    this.bindEvents();

    // Scroll Position Sync
    this.handleScroll();

    // Animation Loop
    this.clock = new THREE.Clock();
    this.isRunning = true;
    this.animate();
  }

  initLighting() {
    // Ambient soft medical fill
    const ambientLight = new THREE.AmbientLight(0xF1F5F9, 1.5);
    this.scene.add(ambientLight);

    // Main Overhead Directional Light
    const mainSun = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    mainSun.position.set(4, 12, 5);
    this.scene.add(mainSun);

    // Secondary Soft Azure Fill
    const fillLight = new THREE.DirectionalLight(0x08A9D6, 0.65);
    fillLight.position.set(-6, 8, -15);
    this.scene.add(fillLight);

    // Station Spotlights (Cleanroom downlights focused on each alternating zone)
    const stationLights = [
      { x: 1.15, y: 3.8, z: 8.4, color: 0xFFFFFF, intensity: 2.8 },   // 01 Hero Tooth Showcase
      { x: 3.2, y: 4.2, z: 0.0, color: 0x08A9D6, intensity: 2.4 },   // 02 Scanner (Right)
      { x: -3.2, y: 4.2, z: -8.5, color: 0x08A9D6, intensity: 2.4 },  // 03 CAD Suite (Left)
      { x: 3.6, y: 4.2, z: -17.0, color: 0xF59E0B, intensity: 2.6 }, // 04 3D Print (Right)
      { x: -3.6, y: 4.2, z: -22.5, color: 0x08A9D6, intensity: 2.6 },// 05 Zirconia Mill (Left)
      { x: 3.2, y: 4.2, z: -30.0, color: 0x38BDF8, intensity: 2.2 }, // 06 QC Bay (Right)
      { x: -2.4, y: 4.2, z: -42.0, color: 0x08A9D6, intensity: 2.2 } // 07 Dispatch (Left)
    ];

    stationLights.forEach((sl) => {
      const spot = new THREE.PointLight(sl.color, sl.intensity, 9.0, 1.2);
      spot.position.set(sl.x, sl.y, sl.z);
      this.scene.add(spot);
    });
  }

  bindEvents() {
    this.onResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.onScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    // Pointer move / Parallax / Raycasting
    this.onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const isOverToothArea = e.target && !!e.target.closest('.hero-viewport-column, .three-viewport-card, .three-canvas-mount, #tooth-canvas-container');

      // Camera parallax
      /*
      if (!isOverToothArea) {
        this.targetPointer.x = (clientX / window.innerWidth) * 2 - 1;
        this.targetPointer.y = -(clientY / window.innerHeight) * 2 - 1;
        this.mouseNDC.x = this.targetPointer.x;
        this.mouseNDC.y = this.targetPointer.y;
      } else {
        this.targetPointer.x = 0;
        this.targetPointer.y = 0;
        this.mouseNDC.x = -9999;
        this.mouseNDC.y = -9999;
      }
      */
      this.targetPointer.x = 0;
      this.targetPointer.y = 0;
      this.mouseNDC.x = isOverToothArea ? -9999 : (clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = isOverToothArea ? -9999 : -(clientY / window.innerHeight) * 2 - 1;

      // Update tooth rotation during drag
      if (this.isDragging && this.toothManager) {
        const deltaX = clientX - this.prevPointerPos.x;
        const deltaY = clientY - this.prevPointerPos.y;
        this.prevPointerPos = { x: clientX, y: clientY };

        this.toothManager.root.rotation.y += deltaX * 0.009;
        this.toothManager.root.rotation.x += deltaY * 0.007;

        this.rotationVelocity.y = deltaX * 0.003;
        this.rotationVelocity.x = deltaY * 0.002;
      }
    };

    // Pointer down / drag start
    this.onPointerDown = (e) => {
      // Don't start drag if interacting with buttons, inputs, links or tabs
      if (e.target && e.target.closest('button, a, input, select, textarea, label, [role="tab"], [role="button"], .journey-node-btn')) {
        return;
      }

      // Only check raycast click if outside the hero tooth card
      const isOverToothArea = e.target && !!e.target.closest('.hero-viewport-column, .three-viewport-card, .three-canvas-mount, #tooth-canvas-container');
      if (!isOverToothArea) {
        this.checkRaycastClick(e);
      }

      this.isDragging = true;
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      this.prevPointerPos = { x: clientX, y: clientY };
    };

    this.onPointerUp = () => {
      this.isDragging = false;
    };

    window.addEventListener('mousemove', this.onPointerMove, { passive: true });
    window.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mouseup', this.onPointerUp);

    // Touch support
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });
    window.addEventListener('touchstart', this.onPointerDown, { passive: true });
    window.addEventListener('touchend', this.onPointerUp);
  }

  handleScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.targetScrollProgress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    if (width < 640) {
      this.camera.fov = 52;
    } else {
      this.camera.fov = 45;
    }
    this.camera.updateProjectionMatrix();

    if (this.labEnvironment) {
      const isStacked = width < 1024;
      this.labEnvironment.updateLayout(isStacked);
    }

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  }

  /**
   * Calculates camera position and look-at target based on scroll progress [0, 1].
   * Creates a continuous architectural journey through the laboratory.
   */
  updateCameraPath(progress) {
    if (this.reducedMotion) {
      // Gentle stationary viewpoint for reduced motion
      this.targetCamPos.set(0, 1.85, 11.2 - progress * 15);
      this.targetLookAt.set(0, 1.4, -progress * 15);
      return;
    }

    // Camera path scroll positions

    let stationIndex = 0;
    const isStacked = (this.container.clientWidth || window.innerWidth) < 1024;

    if (progress < 0.14) {
      // 01 Entrance & Hero
      const t = progress / 0.14;
      const startLookX = isStacked ? 0.0 : 0.32;
      const startCamX = isStacked ? 0.0 : -0.15;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(startCamX, -0.8, t),
        THREE.MathUtils.lerp(1.82, 1.72, t),
        THREE.MathUtils.lerp(11.2, 5.5, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(startLookX, 1.8, t),
        THREE.MathUtils.lerp(1.55, 1.48, t),
        THREE.MathUtils.lerp(8.4, 3.0, t)
      );
      stationIndex = 0;

    } else if (progress < 0.28) {
      // 02 Scanning Bay (Content on Left, 3D Scanner on RIGHT)
      const t = (progress - 0.14) / 0.14;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(-0.8, -1.3, t),
        THREE.MathUtils.lerp(1.72, 1.68, t),
        THREE.MathUtils.lerp(5.5, -0.5, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(1.8, 2.7, t),
        THREE.MathUtils.lerp(1.48, 1.45, t),
        THREE.MathUtils.lerp(3.0, 0.0, t)
      );
      stationIndex = 1;

    } else if (progress < 0.44) {
      // 03 CAD Design Suite (Content on Right, 3D CAD on LEFT)
      const t = (progress - 0.28) / 0.16;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(-1.3, 1.3, t),
        THREE.MathUtils.lerp(1.68, 1.68, t),
        THREE.MathUtils.lerp(-0.5, -7.0, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(2.7, -2.7, t),
        THREE.MathUtils.lerp(1.45, 1.45, t),
        THREE.MathUtils.lerp(0.0, -8.5, t)
      );
      stationIndex = 2;

    } else if (progress < 0.60) {
      // 04 3D Printing (Content on Left, 3D Printer on RIGHT)
      const t = (progress - 0.44) / 0.16;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(1.3, -1.3, t),
        THREE.MathUtils.lerp(1.68, 1.68, t),
        THREE.MathUtils.lerp(-7.0, -15.5, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(-2.7, 2.7, t),
        THREE.MathUtils.lerp(1.45, 1.48, t),
        THREE.MathUtils.lerp(-8.5, -17.0, t)
      );
      stationIndex = 3;

    } else if (progress < 0.76) {
      // 05 Zirconia Mill (Content on Right, 3D Mill on LEFT)
      const t = (progress - 0.60) / 0.16;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(-1.3, 1.3, t),
        THREE.MathUtils.lerp(1.68, 1.68, t),
        THREE.MathUtils.lerp(-15.5, -21.0, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(2.7, -2.7, t),
        THREE.MathUtils.lerp(1.48, 1.48, t),
        THREE.MathUtils.lerp(-17.0, -22.5, t)
      );
      stationIndex = 4;

    } else if (progress < 0.90) {
      // 06 Quality QC (Content on Left, 3D QC on RIGHT)
      const t = (progress - 0.76) / 0.14;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(1.3, -1.3, t),
        THREE.MathUtils.lerp(1.68, 1.68, t),
        THREE.MathUtils.lerp(-21.0, -28.0, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(-2.7, 2.7, t),
        THREE.MathUtils.lerp(1.48, 1.45, t),
        THREE.MathUtils.lerp(-22.5, -30.0, t)
      );
      stationIndex = 5;

    } else {
      // 07 Case Dispatch (Content on Right, 3D Dispatch on LEFT)
      const t = (progress - 0.90) / 0.10;
      this.targetCamPos.set(
        THREE.MathUtils.lerp(-1.3, 1.1, t),
        THREE.MathUtils.lerp(1.68, 1.65, t),
        THREE.MathUtils.lerp(-28.0, -39.0, t)
      );
      this.targetLookAt.set(
        THREE.MathUtils.lerp(2.7, -1.8, t),
        THREE.MathUtils.lerp(1.45, 1.48, t),
        THREE.MathUtils.lerp(-30.0, -42.0, t)
      );
      stationIndex = 6;
    }

    if (this.onStationChange) {
      this.onStationChange(stationIndex, progress);
    }
  }

  checkRaycasting() {
    if (!this.labEnvironment || !this.labEnvironment.interactiveObjects.length) return;

    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const intersects = this.raycaster.intersectObjects(this.labEnvironment.interactiveObjects, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredHotspot !== hit) {
        this.hoveredHotspot = hit;
        this.canvas.style.cursor = 'pointer';
        if (this.onHotspotHover) {
          this.onHotspotHover(hit.userData);
        }
      }
    } else {
      if (this.hoveredHotspot !== null) {
        this.hoveredHotspot = null;
        this.canvas.style.cursor = 'default';
        if (this.onHotspotHover) {
          this.onHotspotHover(null);
        }
      }
    }
  }

  checkRaycastClick(e) {
    if (!this.hoveredHotspot) return;
    const stationId = this.hoveredHotspot.userData.stationId;

    if (stationId === 'tooth') {
      // Cycle through tooth modes on click
      const modes = ['scan', 'design', 'print', 'finish'];
      const nextMode = modes[(modes.indexOf(this.toothManager.currentMode) + 1) % modes.length];
      this.setMode(nextMode);
    }
  }

  setMode(mode) {
    if (this.toothManager) {
      this.toothManager.setMode(mode);
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  resetView() {
    if (!this.toothManager) return;
    this.toothManager.root.rotation.x = 0.15;
    this.toothManager.root.rotation.y = -0.35;
    this.rotationVelocity = { x: 0, y: 0.008 };
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate.bind(this));

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Scroll Interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    this.updateCameraPath(this.scrollProgress);

    // Camera position & lookAt
    /*
    this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.05;
    */

    // Camera position & lookAt lerp along scroll path
    this.currentCamPos.lerp(this.targetCamPos, 0.08);
    this.currentLookAt.lerp(this.targetLookAt, 0.08);

    this.camera.position.copy(this.currentCamPos);

    /*
    const finalLookAt = this.currentLookAt.clone();
    if (!this.reducedMotion) {
      finalLookAt.x += this.pointer.x * 0.45;
      finalLookAt.y += this.pointer.y * 0.3;
    }
    this.camera.lookAt(finalLookAt);
    */

    this.camera.lookAt(this.currentLookAt);

    // Update Tooth Manager
    if (this.toothManager) {
      if (!this.isDragging) {
        if (this.autoRotate && !this.reducedMotion) {
          this.toothManager.root.rotation.y += 0.006;
        } else {
          this.toothManager.root.rotation.y += this.rotationVelocity.y;
          this.toothManager.root.rotation.x += this.rotationVelocity.x;
          this.rotationVelocity.y *= 0.94;
          this.rotationVelocity.x *= 0.94;
        }
      }
      this.toothManager.update(delta, time);
    }

    // Update Lab Environment
    if (this.labEnvironment) {
      this.labEnvironment.update(delta, time);
    }

    // Update Ambient Dust
    if (this.dust) {
      this.dust.update(delta);
    }

    // Equipment Hotspot Raycasting
    this.checkRaycasting();

    // HUD Telemetry
    if (this.onTelemetryUpdate && this.toothManager) {
      const rotDeg = Math.round(((this.toothManager.root.rotation.y % (Math.PI * 2)) * 180) / Math.PI);
      const normalizedAngle = rotDeg < 0 ? rotDeg + 360 : rotDeg;
      this.onTelemetryUpdate({
        angle: normalizedAngle,
        mode: this.toothManager.currentMode,
        fps: Math.round(1 / (delta || 0.016))
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  renderFallback() {
    this.container.innerHTML = `
      <div class="webgl-fallback-card" role="region" aria-label="Digital Dental CAD Preview">
        <div class="fallback-telemetry-badge">CAD PREVIEW • OPTICAL FALLBACK</div>
        <div class="fallback-graphics">
          <svg viewBox="0 0 240 240" class="fallback-tooth-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="100" stroke="#0284C7" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.4"/>
            <path d="M70 85C70 65 85 55 102 55C112 55 117 60 120 65C123 60 128 55 138 55C155 55 170 65 170 85C170 115 160 145 150 175C145 190 132 195 125 185C121 180 120 165 120 155C120 165 119 180 115 185C108 195 95 190 90 175C80 145 70 115 70 85Z" fill="#0284C7"/>
          </svg>
        </div>
        <div class="fallback-info">
          <h3>Precision Zirconia Restoration</h3>
          <p>Hardware 3D acceleration inactive. Showing verified digital clinical representation.</p>
        </div>
      </div>
    `;
  }

  dispose() {
    this.isRunning = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    if (this.toothManager) this.toothManager.dispose();
    if (this.labEnvironment) this.labEnvironment.dispose();
    if (this.dust) this.dust.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }
}

export const DentalForgeViewer = SculptedSmilesViewer;
