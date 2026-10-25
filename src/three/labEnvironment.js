import * as THREE from 'three';
import { createScreenTexture } from './screenTextures.js';

/**
 * Builds the complete continuous architectural 3D dental laboratory.
 * Designed with clean lines, medical materials, realistic equipment silhouettes,
 * and high performance for mobile and desktop.
 */
export class DentalLabEnvironment {
  constructor(toothManager) {
    this.root = new THREE.Group();
    this.root.name = 'dental-lab-environment';
    this.toothManager = toothManager;

    this.interactiveObjects = [];
    this.animatedElements = [];

    this.initMaterials();
    this.buildArchitecture();
    this.buildEntrance();
    this.buildScanningBay();
    this.buildCADSuite();
    this.buildManufacturingCenter();
    this.buildQualityControlBay();
    this.buildDispatchArea();
    this.buildFloorWaypoints();
  }

  initMaterials() {
    this.materials = {
      floor: new THREE.MeshStandardMaterial({
        color: 0xEEF2F6,
        roughness: 0.32,
        metalness: 0.05
      }),
      floorTrim: new THREE.MeshBasicMaterial({
        color: 0x08A9D6
      }),
      wall: new THREE.MeshStandardMaterial({
        color: 0xF8FAFC,
        roughness: 0.78,
        metalness: 0.02
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.5,
        metalness: 0.22
      }),
      ceiling: new THREE.MeshStandardMaterial({
        color: 0xF1F5F9,
        roughness: 0.88
      }),
      lightPanel: new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xE0F2FE,
        transparent: true,
        opacity: 0.32,
        roughness: 0.06,
        transmission: 0.75,
        thickness: 0.45,
        ior: 1.48
      }),
      brushedMetal: new THREE.MeshStandardMaterial({
        color: 0x94A3B8,
        roughness: 0.22,
        metalness: 0.88
      }),
      deskSurface: new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.18,
        metalness: 0.05
      }),
      cabinetDark: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.38,
        metalness: 0.28
      }),
      cabinetSecondary: new THREE.MeshStandardMaterial({
        color: 0x25344A,
        roughness: 0.42,
        metalness: 0.2
      }),
      glowCyan: new THREE.MeshBasicMaterial({
        color: 0x08A9D6
      }),
      glowAmber: new THREE.MeshBasicMaterial({
        color: 0xF59E0B
      }),
      glowGreen: new THREE.MeshBasicMaterial({
        color: 0x10B981
      }),
      hotspotMarker: new THREE.MeshBasicMaterial({
        color: 0x08A9D6,
        transparent: true,
        opacity: 0.85
      })
    };
  }

  buildArchitecture() {
    const labGroup = new THREE.Group();
    labGroup.name = 'lab-architecture';

    const corridorLength = 62; // Z from 14 to -48
    const corridorWidth = 14;  // X from -7 to +7
    const corridorHeight = 4.8;// Y from 0 to 4.8

    // Floor
    const floorGeo = new THREE.PlaneGeometry(corridorWidth, corridorLength, 1, 1);
    const floor = new THREE.Mesh(floorGeo, this.materials.floor);
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.set(0, 0, -17);
    floor.receiveShadow = true;
    labGroup.add(floor);

    // Center Guide Track (Cyan LED strip along corridor floor)
    const guideGeo = new THREE.PlaneGeometry(0.08, corridorLength);
    const guideLine = new THREE.Mesh(guideGeo, this.materials.floorTrim);
    guideLine.rotation.x = -Math.PI * 0.5;
    guideLine.position.set(0, 0.005, -17);
    labGroup.add(guideLine);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(corridorWidth, corridorLength);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.ceiling);
    ceiling.rotation.x = Math.PI * 0.5;
    ceiling.position.set(0, corridorHeight, -17);
    labGroup.add(ceiling);

    // Recessed Linear Ceiling Lights
    const lightBarGeo = new THREE.BoxGeometry(0.35, 0.05, 3.8);
    for (let z = 10; z >= -44; z -= 7) {
      [-3.2, 3.2].forEach((x) => {
        const light = new THREE.Mesh(lightBarGeo, this.materials.lightPanel);
        light.position.set(x, corridorHeight - 0.03, z);
        labGroup.add(light);
      });
    }

    // Walls
    const wallGeo = new THREE.PlaneGeometry(corridorLength, corridorHeight);
    // Left Wall
    const leftWall = new THREE.Mesh(wallGeo, this.materials.wall);
    leftWall.rotation.y = Math.PI * 0.5;
    leftWall.position.set(-corridorWidth * 0.5, corridorHeight * 0.5, -17);
    leftWall.receiveShadow = true;
    labGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(wallGeo, this.materials.wall);
    rightWall.rotation.y = -Math.PI * 0.5;
    rightWall.position.set(corridorWidth * 0.5, corridorHeight * 0.5, -17);
    rightWall.receiveShadow = true;
    labGroup.add(rightWall);

    // End Wall (Dispatch Doorway)
    const endWallGeo = new THREE.PlaneGeometry(corridorWidth, corridorHeight);
    const endWall = new THREE.Mesh(endWallGeo, this.materials.wallDark);
    endWall.position.set(0, corridorHeight * 0.5, -48);
    labGroup.add(endWall);

    // Structural Columns
    const columnGeo = new THREE.BoxGeometry(0.55, corridorHeight, 0.55);
    const trimGeo = new THREE.BoxGeometry(0.58, 0.08, 0.58);

    for (let z = 8; z >= -42; z -= 10) {
      [-5.5, 5.5].forEach((x) => {
        const col = new THREE.Mesh(columnGeo, this.materials.wall);
        col.position.set(x, corridorHeight * 0.5, z);
        labGroup.add(col);

        // Brushed metal trims at top and bottom
        const trimBottom = new THREE.Mesh(trimGeo, this.materials.brushedMetal);
        trimBottom.position.set(x, 0.04, z);
        labGroup.add(trimBottom);

        const trimTop = new THREE.Mesh(trimGeo, this.materials.brushedMetal);
        trimTop.position.set(x, corridorHeight - 0.04, z);
        labGroup.add(trimTop);
      });
    }

    // Glass Partitions
    const glassPartitionGeo = new THREE.BoxGeometry(4.2, 3.4, 0.08);
    [-4, -14, -26].forEach((z) => {
      const glassL = new THREE.Mesh(glassPartitionGeo, this.materials.glass);
      glassL.position.set(-3.5, 1.7, z);
      labGroup.add(glassL);

      const glassR = new THREE.Mesh(glassPartitionGeo, this.materials.glass);
      glassR.position.set(3.5, 1.7, z);
      labGroup.add(glassR);
    });

    this.root.add(labGroup);
  }

  buildEntrance() {
    const entranceGroup = new THREE.Group();
    entranceGroup.name = 'station-entrance';

    // Architectural Entrance Portal Frame (at Z = 12)
    const portalFrameGeo = new THREE.BoxGeometry(9.0, 4.4, 0.25);
    const portalFrame = new THREE.Mesh(portalFrameGeo, this.materials.wallDark);
    portalFrame.position.set(0, 2.2, 12);

    // Portal Opening cutout (doorway)
    const doorGlassGeo = new THREE.BoxGeometry(5.2, 3.8, 0.08);
    const doorGlass = new THREE.Mesh(doorGlassGeo, this.materials.glass);
    doorGlass.position.set(0, 1.9, 11.9);
    entranceGroup.add(doorGlass);

    // Brand Arch Sign Header
    const signGeo = new THREE.BoxGeometry(5.6, 0.55, 0.12);
    const signMesh = new THREE.Mesh(signGeo, this.materials.wallDark);
    signMesh.position.set(0, 4.0, 11.95);
    entranceGroup.add(signMesh);

    // Glowing Sign Stripe
    const signLightGeo = new THREE.BoxGeometry(5.2, 0.04, 0.14);
    const signLight = new THREE.Mesh(signLightGeo, this.materials.glowCyan);
    signLight.position.set(0, 3.7, 11.97);
    entranceGroup.add(signLight);

    // Hero showcase chamber
    this.heroShowcaseGroup = new THREE.Group();
    this.heroShowcaseGroup.name = 'hero-showcase-chamber';
    this.heroShowcaseGroup.position.set(1.15, 0, 8.4);

    // Pedestal Base (Sleek dark navy precision plinth)
    const baseCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, 1.14, 48),
      this.materials.cabinetDark
    );
    baseCyl.position.y = 0.57;
    baseCyl.receiveShadow = true;
    this.heroShowcaseGroup.add(baseCyl);

    // Brushed metal turntable collar
    const collarMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.32, 0.02, 48),
      this.materials.brushedMetal
    );
    collarMesh.position.y = 1.13;
    this.heroShowcaseGroup.add(collarMesh);

    // Cyan glowing guide ring on pedestal
    const ringLight = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.007, 16, 48),
      this.materials.glowCyan
    );
    ringLight.rotation.x = Math.PI * 0.5;
    ringLight.position.y = 1.14;
    this.heroShowcaseGroup.add(ringLight);

    // Dark turntable platter bed
    const platterBed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.30, 0.30, 0.015, 48),
      this.materials.cabinetSecondary
    );
    platterBed.position.y = 1.145;
    this.heroShowcaseGroup.add(platterBed);

    // Mount Tooth Model
    if (this.toothManager && this.toothManager.root) {
      this.toothManager.root.position.set(0, 1.54, 0);
      this.toothManager.root.scale.setScalar(0.20);
      this.heroShowcaseGroup.add(this.toothManager.root);
    }

    entranceGroup.add(this.heroShowcaseGroup);

    // Reception Tablet / Kiosk on sleek pedestal (offset to left)
    const kioskPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.05, 16),
      this.materials.brushedMetal
    );
    kioskPedestal.position.set(-2.4, 0.525, 9.5);
    entranceGroup.add(kioskPedestal);

    const kioskScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.32, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x08A9D6 })
    );
    kioskScreen.position.set(-2.4, 1.1, 9.5);
    kioskScreen.rotation.x = -0.35;
    entranceGroup.add(kioskScreen);

    this.root.add(entranceGroup);
  }

  buildScanningBay() {
    const group = new THREE.Group();
    group.name = 'station-scanning';
    group.position.set(3.2, 0, 0);

    // Lab Bench
    const desk = this.createLabBench(3.2, 0.95, 1.4);
    group.add(desk);

    // Optical Model Scanner Unit
    const scannerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.75, 0.75),
      this.materials.cabinetDark
    );
    scannerBody.position.set(-0.6, 1.325, 0);
    group.add(scannerBody);

    // Scanner illuminated chamber
    const scannerChamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.35, 32),
      new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.3 })
    );
    scannerChamber.position.set(-0.6, 1.35, 0.05);
    group.add(scannerChamber);

    // Rotating scan turntable
    const turntable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32),
      this.materials.brushedMetal
    );
    turntable.position.set(-0.6, 1.2, 0.05);
    group.add(turntable);

    // Small preparation model on turntable
    const scanModel = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0xFFFBEB, roughness: 0.3 })
    );
    scanModel.position.set(-0.6, 1.29, 0.05);
    group.add(scanModel);

    // Laser Scan Sweeper Line in chamber
    const laserLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.01),
      this.materials.glowCyan
    );
    laserLine.position.set(-0.6, 1.32, 0.22);
    group.add(laserLine);

    this.animatedElements.push({
      update: (time) => {
        turntable.rotation.y = time * 0.8;
        scanModel.rotation.y = time * 0.8;
        laserLine.position.y = 1.25 + Math.sin(time * 3) * 0.12;
      }
    });

    // Handheld Scanner Wand on magnetic dock
    const dockBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16),
      this.materials.brushedMetal
    );
    dockBase.position.set(0.6, 1.01, 0.25);
    group.add(dockBase);

    const scannerWand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.38, 16),
      this.materials.deskSurface
    );
    scannerWand.position.set(0.6, 1.18, 0.25);
    scannerWand.rotation.z = 0.25;
    group.add(scannerWand);

    // Wand glowing tip
    const wandTip = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.04),
      this.materials.glowCyan
    );
    wandTip.position.set(0.64, 1.38, 0.25);
    group.add(wandTip);

    // Overhead Monitor Display
    const monitor = this.createMonitor('scanner', 1.1, 0.65);
    monitor.position.set(-0.2, 1.75, -0.4);
    monitor.rotation.y = -0.2;
    group.add(monitor);

    // Hotspot Beacon
    const hotspot = this.createHotspot(
      'Optical Scanning Station',
      'High-speed digital intraoral acquisition & 3D impression processing',
      'scanner'
    );
    hotspot.position.set(-0.6, 2.0, 0);
    group.add(hotspot);

    this.root.add(group);
  }

  buildCADSuite() {
    const group = new THREE.Group();
    group.name = 'station-cad';
    group.position.set(-3.2, 0, -8.5);

    // CAD Workstation Desk
    const desk = this.createLabBench(3.4, 0.95, 1.4);
    group.add(desk);

    // Dual Curved CAD Monitors
    const monL = this.createMonitor('cad', 1.05, 0.62);
    monL.position.set(-0.55, 1.72, -0.35);
    monL.rotation.y = -0.15;
    group.add(monL);

    const monR = this.createMonitor('cad', 1.05, 0.62);
    monR.position.set(0.55, 1.72, -0.35);
    monR.rotation.y = 0.15;
    group.add(monR);

    // Holographic Wireframe Model
    const cadWireGroup = new THREE.Group();
    cadWireGroup.position.set(0, 1.35, 0.15);

    const archBox = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.05, 16, 32, Math.PI),
      new THREE.MeshBasicMaterial({ color: 0x0284C7, wireframe: true })
    );
    archBox.rotation.x = -Math.PI * 0.5;
    cadWireGroup.add(archBox);

    // Coordinate Ring
    const coordRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.30, 32),
      new THREE.MeshBasicMaterial({ color: 0x38BDF8, side: THREE.DoubleSide })
    );
    coordRing.rotation.x = Math.PI * 0.5;
    cadWireGroup.add(coordRing);

    group.add(cadWireGroup);

    this.animatedElements.push({
      update: (time) => {
        cadWireGroup.rotation.y = time * 0.5;
        cadWireGroup.position.y = 1.35 + Math.sin(time * 2) * 0.03;
      }
    });

    // Technician Chair
    const chair = this.createChair();
    chair.position.set(0, 0, 0.95);
    chair.rotation.y = Math.PI;
    group.add(chair);

    // Hotspot
    const hotspot = this.createHotspot(
      'CAD Design Suite',
      'Computer-aided anatomical modeling, margin ditching & occlusal clearance verification',
      'cad'
    );
    hotspot.position.set(0, 2.0, 0);
    group.add(hotspot);

    this.root.add(group);
  }

  buildManufacturingCenter() {
    const centerGroup = new THREE.Group();
    centerGroup.name = 'station-manufacturing';
    centerGroup.position.set(0, 0, -19.5);

    /* Inspection turntable */
    /*
    const showcaseGroup = new THREE.Group();
    showcaseGroup.name = 'mfg-turntable-chamber';

    // Pedestal Base (Cylindrical brushed metal)
    const baseCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.65, 1.85, 0.85, 48),
      this.materials.cabinetDark
    );
    baseCyl.position.y = 0.425;
    showcaseGroup.add(baseCyl);

    // Illuminated Glowing Ring on Pedestal
    const ringLight = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.04, 16, 48),
      this.materials.glowCyan
    );
    ringLight.rotation.x = Math.PI * 0.5;
    ringLight.position.y = 0.85;
    showcaseGroup.add(ringLight);

    // Transparent Cylindrical Glass Chamber Dome
    const glassDome = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 2.8, 36, 1, true),
      this.materials.glass
    );
    glassDome.position.y = 2.25;
    showcaseGroup.add(glassDome);

    // Top Metal Crown Ring
    const topCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.55, 0.15, 36),
      this.materials.brushedMetal
    );
    topCrown.position.y = 3.65;
    showcaseGroup.add(topCrown);

    // Rotating CAM Turntable Disc with Milled Restorations
    const turntableGroup = new THREE.Group();
    turntableGroup.position.set(0, 1.8, 0);

    const platter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.95, 0.08, 36),
      this.materials.brushedMetal
    );
    turntableGroup.add(platter);

    // Disc Ring coordinate markings
    const platterRing = new THREE.Mesh(
      new THREE.RingGeometry(0.82, 0.86, 36),
      this.materials.glowCyan
    );
    platterRing.rotation.x = -Math.PI * 0.5;
    platterRing.position.y = 0.045;
    turntableGroup.add(platterRing);

    // Sample Milled Restorations on Platter
    [-0.35, 0.35].forEach((offset, idx) => {
      const crownSample = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.32, 16),
        new THREE.MeshPhysicalMaterial({
          color: idx === 0 ? 0xFDFBF7 : 0xF59E0B,
          roughness: 0.15,
          metalness: 0.05,
          clearcoat: 0.8
        })
      );
      crownSample.position.set(offset, 0.2, 0);
      turntableGroup.add(crownSample);
    });

    showcaseGroup.add(turntableGroup);

    this.animatedElements.push({
      update: (time) => {
        turntableGroup.rotation.y = time * 0.3;
      }
    });

    centerGroup.add(showcaseGroup);

    // Showcase interactive hotspot
    const toothHotspot = this.createHotspot(
      'Automated CAM Production Center',
      'Continuous 5-axis zirconia disc milling and additive biocompatible photopolymer resin 3D printing station.',
      'mfg'
    );
    toothHotspot.position.set(0, 3.4, 0);
    centerGroup.add(toothHotspot);
    */

    // Additive 3D Resin Printing Area
    const printerGroup = new THREE.Group();
    printerGroup.position.set(3.6, 0, 2.5);

    const printerBench = this.createLabBench(2.4, 0.95, 1.2);
    printerGroup.add(printerBench);

    // 3D Printer Cabinet
    const printerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.1, 0.8),
      this.materials.cabinetDark
    );
    printerBody.position.set(0, 1.5, 0);
    printerGroup.add(printerBody);

    // Amber UV Acrylic Window
    const uvWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.65, 0.05),
      new THREE.MeshPhysicalMaterial({
        color: 0xF59E0B,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        transmission: 0.5
      })
    );
    uvWindow.position.set(0, 1.6, 0.41);
    printerGroup.add(uvWindow);

    // Inside Build Platform (moving slowly)
    const buildPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.04, 0.35),
      this.materials.brushedMetal
    );
    buildPlate.position.set(0, 1.7, 0.15);
    printerGroup.add(buildPlate);

    // Small printed dental models on plate
    const printedModels = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.08, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.2 })
    );
    printedModels.position.set(0, 1.76, 0.15);
    printerGroup.add(printedModels);

    // Amber UV light beam inside
    const uvLight = new THREE.PointLight(0xF59E0B, 1.5, 2.5);
    uvLight.position.set(0, 1.6, 0.2);
    printerGroup.add(uvLight);

    // Monitor for 3D printer
    const printMon = this.createMonitor('printer', 0.85, 0.52);
    printMon.position.set(-0.85, 1.65, -0.2);
    printMon.rotation.y = 0.3;
    printerGroup.add(printMon);

    const printHotspot = this.createHotspot(
      'Additive 3D Printing System',
      'Precision DLP stereolithography for surgical guides, dental splints & study models',
      'printer'
    );
    printHotspot.position.set(0, 2.3, 0);
    printerGroup.add(printHotspot);

    centerGroup.add(printerGroup);

    // 5-Axis Zirconia Milling Station
    const millGroup = new THREE.Group();
    millGroup.position.set(-3.6, 0, -3.0);

    const millBench = this.createLabBench(2.4, 0.95, 1.2);
    millGroup.add(millBench);

    // CNC Milling Machine Body
    const millBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.15, 0.85),
      this.materials.cabinetDark
    );
    millBody.position.set(0, 1.525, 0);
    millGroup.add(millBody);

    // Glass Inspection Window
    const millWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.55, 0.04),
      this.materials.glass
    );
    millWindow.position.set(0, 1.6, 0.43);
    millGroup.add(millWindow);

    // Zirconia Blank Disc inside
    const zircDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32),
      new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.2 })
    );
    zircDisc.rotation.x = Math.PI * 0.5;
    zircDisc.position.set(0, 1.6, 0.15);
    millGroup.add(zircDisc);

    // High-speed Spindle Head
    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.16, 16),
      this.materials.brushedMetal
    );
    spindle.position.set(0.08, 1.72, 0.15);
    millGroup.add(spindle);

    // Mill Monitor
    const millMon = this.createMonitor('milling', 0.85, 0.52);
    millMon.position.set(0.85, 1.65, -0.2);
    millMon.rotation.y = -0.3;
    millGroup.add(millMon);

    const millHotspot = this.createHotspot(
      '5-Axis Zirconia Milling',
      'Ultra-high-speed wet/dry CNC milling for monolithic crowns, bridges & hybrids',
      'milling'
    );
    millHotspot.position.set(0, 2.3, 0);
    millGroup.add(millHotspot);

    centerGroup.add(millGroup);

    this.root.add(centerGroup);
  }

  buildQualityControlBay() {
    const group = new THREE.Group();
    group.name = 'station-qc';
    group.position.set(3.2, 0, -30.0);

    // Metrology Workstation
    const desk = this.createLabBench(3.4, 0.95, 1.4);
    group.add(desk);

    // Inspection Microscope
    const scopeBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.06, 0.38),
      this.materials.cabinetDark
    );
    scopeBase.position.set(-0.6, 0.98, 0.1);
    group.add(scopeBase);

    const scopePillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.55, 16),
      this.materials.brushedMetal
    );
    scopePillar.position.set(-0.6, 1.28, -0.05);
    group.add(scopePillar);

    const scopeHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.22, 0.26),
      this.materials.cabinetDark
    );
    scopeHead.position.set(-0.6, 1.5, 0.08);
    group.add(scopeHead);

    // Eyepieces
    const epL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 16), this.materials.cabinetDark);
    epL.rotation.x = -0.55;
    epL.position.set(-0.65, 1.68, 0.02);
    group.add(epL);

    const epR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 16), this.materials.cabinetDark);
    epR.rotation.x = -0.55;
    epR.position.set(-0.55, 1.68, 0.02);
    group.add(epR);

    // Ring Light on objective
    const ringLight = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.015, 12, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    );
    ringLight.rotation.x = Math.PI * 0.5;
    ringLight.position.set(-0.6, 1.34, 0.12);
    group.add(ringLight);

    // Restoration Sample Tray with finished crowns
    const trayGeo = new THREE.BoxGeometry(0.55, 0.03, 0.35);
    const tray = new THREE.Mesh(trayGeo, this.materials.glass);
    tray.position.set(0.4, 0.965, 0.1);
    group.add(tray);

    // 4 Finished Crowns on Tray
    for (let c = 0; c < 4; c++) {
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.05, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.15, metalness: 0.05 })
      );
      crown.position.set(0.22 + (c % 2) * 0.18, 1.02, 0.02 + Math.floor(c / 2) * 0.16);
      group.add(crown);
    }

    // Quality Control Metrology Monitor
    const qcMon = this.createMonitor('qc', 1.05, 0.62);
    qcMon.position.set(0.4, 1.72, -0.35);
    group.add(qcMon);

    // Process Checkpoint Pillars
    const checkpointLabels = ['01 SUBMIT', '02 REVIEW', '03 MFG', '04 QC PASS'];
    checkpointLabels.forEach((label, idx) => {
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.22, 16),
        this.materials.cabinetDark
      );
      marker.position.set(1.4, 0.11, -1.2 + idx * 0.8);
      group.add(marker);

      const lightRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.015, 12, 24),
        idx === 3 ? this.materials.glowGreen : this.materials.glowCyan
      );
      lightRing.rotation.x = Math.PI * 0.5;
      lightRing.position.set(1.4, 0.22, -1.2 + idx * 0.8);
      group.add(lightRing);
    });

    const hotspot = this.createHotspot(
      'Technician & Quality Metrology',
      'Optical micrometer inspection for exact marginal fit & biocompatible certification',
      'qc'
    );
    hotspot.position.set(-0.6, 2.0, 0.1);
    group.add(hotspot);

    this.root.add(group);
  }

  buildDispatchArea() {
    const group = new THREE.Group();
    group.name = 'station-dispatch';
    group.position.set(-2.4, 0, -42.0);

    // Dispatch Packaging Bench
    const dispatchBench = this.createLabBench(3.2, 0.95, 1.2);
    dispatchBench.position.set(0, 0, 0);
    group.add(dispatchBench);

    // Sealed Dental Delivery Cases (Precision courier boxes)
    for (let i = 0; i < 3; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.22, 0.32),
        this.materials.cabinetDark
      );
      box.position.set(-0.7 + i * 0.7, 1.06, 0);
      group.add(box);

      // Security seal strip
      const seal = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 0.23),
        this.materials.glowCyan
      );
      seal.position.set(-0.7 + i * 0.7, 1.06, 0.161);
      group.add(seal);
    }

    // Illuminated Exit Gateway Frame
    const exitPortal = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.8, 0.18),
      this.materials.wallDark
    );
    exitPortal.position.set(0, 1.9, -4.8);
    group.add(exitPortal);

    // Deep Navy Atmospheric Glow through exit
    const exitGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.4),
      new THREE.MeshBasicMaterial({ color: 0x0284C7, transparent: true, opacity: 0.25 })
    );
    exitGlow.position.set(0, 1.8, -4.7);
    group.add(exitGlow);

    const hotspot = this.createHotspot(
      'Case Dispatch & Shipping Vault',
      'Sterile temperature-controlled dispatch with clinical courier tracking',
      'dispatch'
    );
    hotspot.position.set(0, 1.8, 0);
    group.add(hotspot);

    this.root.add(group);
  }

  buildFloorWaypoints() {
    // Navigation Waypoint Ring markers on the floor at each alternating station
    const stations = [
      { x: 1.15, z: 8.4 },   // 01 Entrance
      { x: 2.2, z: 0.0 },    // 02 Scanning Bay (Right)
      { x: -2.2, z: -8.5 },  // 03 CAD Design (Left)
      { x: 2.4, z: -17.0 },  // 04 3D Printing (Right)
      { x: -2.4, z: -22.5 }, // 05 Zirconia Mill (Left)
      { x: 2.2, z: -30.0 },  // 06 Quality QC (Right)
      { x: -1.6, z: -42.0 }  // 07 Dispatch (Left)
    ];
    const ringGeo = new THREE.RingGeometry(0.38, 0.44, 32);

    stations.forEach((st) => {
      const ring = new THREE.Mesh(ringGeo, this.materials.hotspotMarker);
      ring.rotation.x = -Math.PI * 0.5;
      ring.position.set(st.x, 0.008, st.z);
      this.root.add(ring);
    });
  }

  createLabBench(width, height, depth) {
    const group = new THREE.Group();

    // Top Work Surface
    const topGeo = new THREE.BoxGeometry(width, 0.08, depth);
    const top = new THREE.Mesh(topGeo, this.materials.deskSurface);
    top.position.y = height;
    top.receiveShadow = true;
    group.add(top);

    // Cabinet Base
    const baseGeo = new THREE.BoxGeometry(width - 0.15, height - 0.08, depth - 0.15);
    const base = new THREE.Mesh(baseGeo, this.materials.cabinetDark);
    base.position.y = (height - 0.08) * 0.5;
    group.add(base);

    // Brushed metal kickplate
    const kickGeo = new THREE.BoxGeometry(width - 0.12, 0.08, depth - 0.12);
    const kick = new THREE.Mesh(kickGeo, this.materials.brushedMetal);
    kick.position.y = 0.04;
    group.add(kick);

    return group;
  }

  createMonitor(type, width, height) {
    const group = new THREE.Group();

    // Bezel
    const bezelGeo = new THREE.BoxGeometry(width, height, 0.04);
    const bezel = new THREE.Mesh(bezelGeo, this.materials.cabinetDark);
    group.add(bezel);

    // Screen with dynamic canvas texture
    const screenGeo = new THREE.PlaneGeometry(width - 0.04, height - 0.04);
    const screenTex = createScreenTexture(type);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.021;
    group.add(screen);

    // Monitor Arm / Stand
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.45, 12),
      this.materials.brushedMetal
    );
    stand.position.set(0, -height * 0.5 - 0.15, -0.05);
    group.add(stand);

    return group;
  }

  createChair() {
    const chairGroup = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.08, 0.46),
      this.materials.cabinetDark
    );
    seat.position.y = 0.52;
    chairGroup.add(seat);

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.48, 0.06),
      this.materials.cabinetDark
    );
    back.position.set(0, 0.82, -0.2);
    chairGroup.add(back);

    // Central post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.48, 12),
      this.materials.brushedMetal
    );
    post.position.y = 0.24;
    chairGroup.add(post);

    return chairGroup;
  }

  createHotspot(title, description, stationId) {
    const group = new THREE.Group();
    group.name = `hotspot-${stationId}`;

    // Outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner glowing sphere
    const sphereGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Invisible hit box for raycasting
    const hitGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { title, description, stationId };
    group.add(hitMesh);

    this.interactiveObjects.push(hitMesh);

    this.animatedElements.push({
      update: (time) => {
        const pulse = 1.0 + 0.18 * Math.sin(time * 3 + group.position.z);
        ring.scale.setScalar(pulse);
      }
    });

    return group;
  }

  updateLayout(isStacked) {
    if (this.heroShowcaseGroup) {
      if (isStacked) {
        this.heroShowcaseGroup.position.set(0, 0, 8.6);
        if (this.toothManager && this.toothManager.root) {
          this.toothManager.root.scale.setScalar(0.16);
        }
      } else {
        this.heroShowcaseGroup.position.set(1.15, 0, 8.4);
        if (this.toothManager && this.toothManager.root) {
          this.toothManager.root.scale.setScalar(0.20);
        }
      }
    }
  }

  update(delta, time) {
    this.animatedElements.forEach((el) => el.update(time));
  }

  dispose() {
    Object.values(this.materials).forEach((m) => m.dispose());
  }
}
