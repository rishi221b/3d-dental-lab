import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Creates the procedural anatomical molar tooth geometry.
 * Represents a human mandibular first molar with 4 distinct cusps,
 * central fossa, developmental grooves, cervical margin, and dual anatomical roots.
 */
function createProceduralMolarGeometry() {
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  const rings = 44;
  const segments = 56;

  // Axial surface rings
  for (let i = 0; i <= rings; i++) {
    const v = i / rings; // 0 (occlusal rim) to 1 (root apices)
    const y = 1.25 - v * 2.95; // 1.25 down to -1.70

    for (let j = 0; j <= segments; j++) {
      const u = j / segments;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      let x = 0;
      let yOffset = 0;
      let z = 0;

      if (v < 0.36) {
        // CROWN WALLS (v = 0 to 0.36, y = 1.25 to 0.19)
        const crownT = v / 0.36; // 0 at occlusal rim, 1 at cervical margin
        // Molar cross-section (wider mesiodistally along X)
        const rx = 0.94 + 0.12 * Math.sin(crownT * Math.PI);
        const rz = 0.86 + 0.10 * Math.sin(crownT * Math.PI);
        const modR = 1.0 + 0.06 * Math.abs(cosA * sinA);

        x = cosA * rx * modR;
        z = sinA * rz * modR;

        // Cusp heights near occlusal surface
        if (crownT < 0.45) {
          const cuspFactor = (1.0 - crownT / 0.45);
          // 4 Cusps: MB (45°), DB (135°), DL (225°), ML (315°)
          const cuspMB = Math.exp(-Math.pow((angle - Math.PI * 0.25) / 0.45, 2)) * 0.28;
          const cuspDB = Math.exp(-Math.pow((angle - Math.PI * 0.75) / 0.45, 2)) * 0.22;
          const cuspDL = Math.exp(-Math.pow((angle - Math.PI * 1.25) / 0.45, 2)) * 0.20;
          const cuspML = Math.exp(-Math.pow((angle - Math.PI * 1.75) / 0.45, 2)) * 0.30;

          yOffset += (cuspMB + cuspDB + cuspDL + cuspML) * cuspFactor;

          // Buccal and lingual developmental groove indentations
          const grooveB = Math.exp(-Math.pow((angle - Math.PI * 0.5) / 0.25, 2)) * 0.14;
          const grooveL = Math.exp(-Math.pow((angle - Math.PI * 1.5) / 0.25, 2)) * 0.14;
          yOffset -= (grooveB + grooveL) * cuspFactor;
        }
      } else if (v < 0.52) {
        // CERVICAL MARGIN & ROOT TRUNK (v = 0.36 to 0.52, y = 0.19 to -0.28)
        const trunkT = (v - 0.36) / 0.16;
        const rx = 0.84 - trunkT * 0.12;
        const rz = 0.78 - trunkT * 0.10;
        x = cosA * rx;
        z = sinA * rz;
      } else {
        // DUAL ROOTS (v = 0.52 to 1.0, y = -0.28 to -1.70)
        const rootT = (v - 0.52) / 0.48; // 0 at bifurcation, 1 at apices
        const isMesial = (cosA < 0);
        const rootCenterX = isMesial ? (-0.38 - rootT * 0.22) : (0.38 + rootT * 0.18);
        const rootRadius = (1.0 - rootT * 0.78) * 0.40;

        const localAngle = isMesial ? angle - Math.PI : angle;
        x = rootCenterX + Math.cos(localAngle) * rootRadius;
        z = Math.sin(localAngle) * rootRadius * (1.0 - rootT * 0.25);

        // Furcation arch between the roots
        if (Math.abs(cosA) < 0.28) {
          yOffset += (1.0 - Math.abs(cosA) / 0.28) * 0.18 * (1.0 - rootT);
        }
      }

      positions.push(x, y + yOffset, z);
      uvs.push(u, v);
    }
  }

  // Axial indices
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = (i + 1) * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + (j + 1);
      const d = i * (segments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // Occlusal Table (Top Cap with central fossa & fissure grooves)
  const capCenterIndex = positions.length / 3;
  // Central fossa center point
  positions.push(0, 1.02, 0); // Fossa pit
  uvs.push(0.5, 0.5);

  const capRings = 4;
  const startCapIndex = positions.length / 3;

  for (let cr = 1; cr <= capRings; cr++) {
    const crRatio = cr / capRings;
    const radX = crRatio * 0.90;
    const radZ = crRatio * 0.82;

    for (let j = 0; j <= segments; j++) {
      const u = j / segments;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Cusp ridges sloping down to central pit
      const cuspMB = Math.exp(-Math.pow((angle - Math.PI * 0.25) / 0.5, 2)) * 0.32;
      const cuspDB = Math.exp(-Math.pow((angle - Math.PI * 0.75) / 0.5, 2)) * 0.26;
      const cuspDL = Math.exp(-Math.pow((angle - Math.PI * 1.25) / 0.5, 2)) * 0.24;
      const cuspML = Math.exp(-Math.pow((angle - Math.PI * 1.75) / 0.5, 2)) * 0.34;
      const cuspElevation = (cuspMB + cuspDB + cuspDL + cuspML) * crRatio;

      const fossaDepth = (1.0 - crRatio) * -0.15;
      const capY = 1.06 + cuspElevation + fossaDepth;

      positions.push(cosA * radX, capY, sinA * radZ);
      uvs.push(0.5 + cosA * crRatio * 0.45, 0.5 + sinA * crRatio * 0.45);
    }
  }

  // Connect center to innermost cap ring
  const innerRingStart = startCapIndex;
  for (let j = 0; j < segments; j++) {
    indices.push(capCenterIndex, innerRingStart + j + 1, innerRingStart + j);
  }

  // Connect cap rings together
  for (let cr = 0; cr < capRings - 1; cr++) {
    const r1 = startCapIndex + cr * (segments + 1);
    const r2 = startCapIndex + (cr + 1) * (segments + 1);
    for (let j = 0; j < segments; j++) {
      indices.push(r1 + j, r2 + j, r1 + j + 1);
      indices.push(r2 + j, r2 + j + 1, r1 + j + 1);
    }
  }

  // Connect outermost cap ring to top axial ring (ring 0)
  const outerRingStart = startCapIndex + (capRings - 1) * (segments + 1);
  for (let j = 0; j < segments; j++) {
    indices.push(outerRingStart + j, outerRingStart + j + 1, j);
    indices.push(outerRingStart + j + 1, j + 1, j);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

/**
 * Creates the cervical margin curve line (CAD preparation finish line).
 */
function createMarginLine() {
  const points = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const angle = u * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const rx = 0.86;
    const rz = 0.80;
    // Scalloped contour: higher proximally (mesial/distal), lower buccally/lingually
    const y = 0.22 + 0.08 * Math.cos(2 * angle);

    points.push(new THREE.Vector3(cosA * rx, y, sinA * rz));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x00F0FF,
    linewidth: 2,
    transparent: true,
    opacity: 0.85
  });

  return new THREE.Line(geometry, material);
}

/**
 * Creates occlusal contact marker points for CAD mode.
 */
function createOcclusalContacts() {
  const group = new THREE.Group();
  group.name = 'occlusal-contacts';

  // 4 cusp contact spots
  const contactSpots = [
    { x: -0.45, y: 1.48, z: 0.40, color: 0x10B981, label: 'MB 15µm' },
    { x: 0.45, y: 1.42, z: 0.40, color: 0x38BDF8, label: 'DB 12µm' },
    { x: -0.42, y: 1.52, z: -0.40, color: 0xF59E0B, label: 'ML 18µm' },
    { x: 0.42, y: 1.38, z: -0.40, color: 0x10B981, label: 'DL 14µm' }
  ];

  const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);

  contactSpots.forEach((spot) => {
    const mat = new THREE.MeshBasicMaterial({
      color: spot.color,
      transparent: true,
      opacity: 0.9
    });
    const marker = new THREE.Mesh(markerGeo, mat);
    marker.position.set(spot.x, spot.y, spot.z);

    // Pulsing halo ring around each contact
    const ringGeo = new THREE.RingGeometry(0.06, 0.085, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: spot.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5;
    marker.add(ring);

    group.add(marker);
  });

  return group;
}

/**
 * Creates the holographic laser scan sweep plane.
 */
function createLaserScanner() {
  const group = new THREE.Group();
  group.name = 'laser-scanner';

  // Outer scanning ring
  const ringGeo = new THREE.RingGeometry(1.25, 1.32, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00F0FF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI * 0.5;
  group.add(ring);

  // Soft glowing beam disc
  const discGeo = new THREE.CircleGeometry(1.25, 48);
  const discMat = new THREE.MeshBasicMaterial({
    color: 0x0EA5E9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = Math.PI * 0.5;
  group.add(disc);

  return group;
}

/**
 * Creates the precision CAD build platform grid beneath the tooth.
 */
function createBuildPlatform() {
  const group = new THREE.Group();
  group.name = 'build-platform';
  group.position.y = -2.1;

  // Circular base ring
  const baseRingGeo = new THREE.RingGeometry(1.6, 1.68, 64);
  const baseRingMat = new THREE.MeshBasicMaterial({
    color: 0x38BDF8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35
  });
  const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  baseRing.rotation.x = Math.PI * 0.5;
  group.add(baseRing);

  // Subtle coordinate grid
  const gridHelper = new THREE.GridHelper(3.2, 16, 0x0EA5E9, 0x1E293B);
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.22;
  group.add(gridHelper);

  return group;
}

/**
 * Main Tooth Manager class.
 * Handles procedural and GLTF loading, material transitions between workflow stages,
 * and animation loops.
 */
export class ToothSceneManager {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'tooth-root';

    this.currentMode = 'finish';
    this.targetMode = 'finish';
    this.modeTransitionProgress = 1.0;

    this.scanSweepY = 1.4;
    this.scanDirection = -1;

    // Materials dictionary
    this.materials = this.initMaterials();

    // Build models
    this.initModel();
  }

  initMaterials() {
    return {
      // Scan material
      scan: new THREE.MeshStandardMaterial({
        color: 0x0B192C,
        metalness: 0.8,
        roughness: 0.3,
        wireframe: false,
        emissive: 0x0284C7,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.85
      }),

      // CAD design material
      design: new THREE.MeshStandardMaterial({
        color: 0xCBD5E1,
        metalness: 0.15,
        roughness: 0.45,
        wireframe: false,
        transparent: true,
        opacity: 0.95
      }),

      // 3D printed resin material
      print: new THREE.MeshPhysicalMaterial({
        color: 0xF59E0B,
        metalness: 0.05,
        roughness: 0.25,
        transmission: 0.45,
        thickness: 0.8,
        ior: 1.48,
        transparent: true,
        opacity: 0.88,
        emissive: 0xD97706,
        emissiveIntensity: 0.12
      }),

      // Glazed zirconia ceramic material
      finish: new THREE.MeshPhysicalMaterial({
        color: 0xFDFBF7,
        metalness: 0.02,
        roughness: 0.16,
        clearcoat: 0.95,
        clearcoatRoughness: 0.08,
        transmission: 0.15,
        thickness: 0.6,
        ior: 1.54,
        sheen: 0.35,
        sheenColor: 0xFFFBEB,
        transparent: false,
        opacity: 1.0
      })
    };
  }

  initModel() {
    this.geometry = createProceduralMolarGeometry();

    // Main Solid Tooth Mesh
    this.mesh = new THREE.Mesh(this.geometry, this.materials.finish);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.root.add(this.mesh);

    // Wireframe Overlay Mesh (for CAD & Scan modes)
    this.wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      wireframe: true,
      transparent: true,
      opacity: 0.0
    });
    this.wireframeMesh = new THREE.Mesh(this.geometry, this.wireframeMat);
    this.wireframeMesh.scale.setScalar(1.001);
    this.root.add(this.wireframeMesh);

    // Laser Scanner Ring
    this.laserScanner = createLaserScanner();
    this.laserScanner.visible = false;
    this.root.add(this.laserScanner);

    // Margin Line
    this.marginLine = createMarginLine();
    this.marginLine.visible = false;
    this.root.add(this.marginLine);

    // Occlusal Contacts
    this.occlusalContacts = createOcclusalContacts();
    this.occlusalContacts.visible = false;
    this.root.add(this.occlusalContacts);

    // Build Platform Grid
    this.buildPlatform = createBuildPlatform();
    this.root.add(this.buildPlatform);

    // Initial scale and posture
    this.root.position.set(0, 0.2, 0);
    this.root.rotation.x = 0.15; // Gentle tilt forward to display occlusal anatomy
    this.root.rotation.y = -0.35; // Three-quarter clinical view

    // Try loading external model silently if available
    this.tryLoadExternalGLB();
  }

  async tryLoadExternalGLB() {
    try {
      const loader = new GLTFLoader();
      const modelUrl = `${import.meta.env.BASE_URL || '/'}models/tooth.glb`.replace(/\/+/g, '/');
      loader.load(
        modelUrl,
        (gltf) => {
          let foundMesh = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !foundMesh) {
              foundMesh = child;
            }
          });

          if (foundMesh && foundMesh.geometry) {
            // Apply external geometry seamlessly
            foundMesh.geometry.center();
            foundMesh.geometry.computeVertexNormals();
            this.geometry.dispose();
            this.geometry = foundMesh.geometry;
            this.mesh.geometry = this.geometry;
            this.wireframeMesh.geometry = this.geometry;
          }
        },
        undefined,
        () => {
          // Fallback procedural model is already active and pristine
        }
      );
    } catch {
      // Procedural fallback active
    }
  }

  /**
   * Sets the active dental workflow stage.
   * Modes: 'scan' | 'design' | 'print' | 'finish'
   */
  setMode(mode) {
    if (!this.materials[mode]) return;
    this.currentMode = mode;

    switch (mode) {
      case 'scan':
        this.mesh.material = this.materials.scan;
        this.wireframeMat.color.setHex(0x00F0FF);
        this.wireframeMat.opacity = 0.55;
        this.laserScanner.visible = true;
        this.marginLine.visible = false;
        this.occlusalContacts.visible = false;
        this.buildPlatform.visible = true;
        break;

      case 'design':
        this.mesh.material = this.materials.design;
        this.wireframeMat.color.setHex(0x0284C7);
        this.wireframeMat.opacity = 0.28;
        this.laserScanner.visible = false;
        this.marginLine.visible = true;
        this.occlusalContacts.visible = true;
        this.buildPlatform.visible = true;
        break;

      case 'print':
        this.mesh.material = this.materials.print;
        this.wireframeMat.color.setHex(0xF59E0B);
        this.wireframeMat.opacity = 0.12;
        this.laserScanner.visible = false;
        this.marginLine.visible = false;
        this.occlusalContacts.visible = false;
        this.buildPlatform.visible = true;
        break;

      case 'finish':
      default:
        this.mesh.material = this.materials.finish;
        this.wireframeMat.opacity = 0.0;
        this.laserScanner.visible = false;
        this.marginLine.visible = false;
        this.occlusalContacts.visible = false;
        this.buildPlatform.visible = true;
        break;
    }
  }

  update(delta, time) {
    // Animate laser scanner sweep in scan mode
    if (this.laserScanner && this.laserScanner.visible) {
      this.scanSweepY += this.scanDirection * delta * 1.4;
      if (this.scanSweepY > 1.45) {
        this.scanSweepY = 1.45;
        this.scanDirection = -1;
      } else if (this.scanSweepY < -1.8) {
        this.scanSweepY = -1.8;
        this.scanDirection = 1;
      }
      this.laserScanner.position.y = this.scanSweepY;
    }

    // Gentle pulse on occlusal contacts in design mode
    if (this.occlusalContacts && this.occlusalContacts.visible) {
      const pulse = 1.0 + 0.12 * Math.sin(time * 4);
      this.occlusalContacts.children.forEach((child) => {
        child.scale.setScalar(pulse);
      });
    }

    // Subtle build platform rotation
    if (this.buildPlatform) {
      this.buildPlatform.rotation.y = time * 0.05;
    }
  }

  dispose() {
    if (this.geometry) this.geometry.dispose();
    Object.values(this.materials).forEach((m) => m.dispose());
    if (this.wireframeMat) this.wireframeMat.dispose();
  }
}
