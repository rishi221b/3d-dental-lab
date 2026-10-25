import * as THREE from 'three';

/**
 * Canvas textures for laboratory monitor displays.
 */
export function createScreenTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(0, 0, 512, 320);

  // Top header bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 512, 36);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('SCULPTED SMILES // DIGITAL LAB OS v4.2', 16, 23);

  // Status indicator
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(488, 18, 5, 0, Math.PI * 2);
  ctx.fill();

  if (type === 'scanner') {
    // Optical scanner telemetry
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('INTRAORAL SCAN STREAM: ACTIVE', 24, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('SCAN RATE: 4,800 FPS | POINT DENSITY: 1.4M/cm²', 24, 100);
    ctx.fillText('ACCURACY: ±8µm | FORMAT: OPEN PLY/STL', 24, 120);

    // Waveform grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 24; x < 488; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 140);
      ctx.lineTo(x, 270);
      ctx.stroke();
    }
    for (let y = 140; y < 280; y += 30) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(488, y);
      ctx.stroke();
    }

    // Sine scan contour
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 24; x < 488; x += 4) {
      const y = 205 + Math.sin(x * 0.04) * 35 + Math.cos(x * 0.08) * 15;
      if (x === 24) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.fillText('STATUS: MARGIN VERIFIED // READY FOR CAD INGESTION', 24, 298);

  } else if (type === 'cad') {
    // CAD workstation
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('CAD/CAM RESTORATIVE WORKBENCH', 24, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('PREPARATION: MANDIBULAR MOLAR #19', 24, 100);
    ctx.fillText('OCCLUSAL CLEARANCE: 1.50mm | MARGIN: 0.12mm', 24, 120);

    // Wireframe graphic box
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 140, 220, 130);

    ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctx.fillRect(30, 140, 220, 130);

    // Coordinate crosshairs
    ctx.strokeStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(140, 150);
    ctx.lineTo(140, 260);
    ctx.moveTo(40, 205);
    ctx.lineTo(240, 205);
    ctx.stroke();

    // Clearance telemetry
    ctx.fillStyle = '#10B981';
    ctx.fillText('CUSP CONTACTS: 4/4 STABLE', 270, 160);
    ctx.fillText('EMERGENCE PROFILE: OPTIMAL', 270, 185);
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('PATH OF INSERTION: 3.2° DIVERGENCE', 270, 210);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('CEMENT GAP: 25µm UNIFORM', 270, 235);
    ctx.fillText('AUTO-CHECK: ALL CRITERIA PASSED', 270, 260);

  } else if (type === 'milling') {
    // 5-Axis Milling telemetry
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('5-AXIS PRECISION MILLING // UNIT 02', 24, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('MATERIAL: MULTI-LAYERED ZIRCONIA (4Y-PSZ)', 24, 100);
    ctx.fillText('DISC LOT: SS-ZR-9942 | TRANSLUCENCY: 49%', 24, 120);

    // Tool progress bars
    const tools = [
      { name: 'BUR T01 (2.5mm Rough)', pct: 1.0 },
      { name: 'BUR T02 (1.0mm Semi-Finish)', pct: 1.0 },
      { name: 'BUR T03 (0.6mm Detail)', pct: 0.82 },
      { name: 'BUR T04 (0.3mm Fissure)', pct: 0.45 }
    ];

    tools.forEach((t, i) => {
      const y = 145 + i * 30;
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(t.name, 24, y);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(240, y - 10, 200, 12);

      ctx.fillStyle = i === 2 ? '#38BDF8' : i === 3 ? '#F59E0B' : '#10B981';
      ctx.fillRect(240, y - 10, 200 * t.pct, 12);
    });

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('SPINDLE: 48,000 RPM | FEED: 1,800 mm/min | COOLANT: OPTIMAL', 24, 295);

  } else if (type === 'printer') {
    // 3D printer telemetry
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('ADDITIVE DLP 3D MANUFACTURING', 24, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('BIO-RESIN: CLASS IIa DENTAL SPLINT CLEAR', 24, 100);
    ctx.fillText('SLICING RESOLUTION: 50µm | VAT TEMP: 28.5°C', 24, 120);

    // Slicing progress circle
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(100, 205, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(100, 205, 50, -Math.PI * 0.5, Math.PI * 0.95);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('72%', 100, 212);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#F59E0B';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('LAYER: 462 OF 640', 180, 185);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('REMAINING: 00:14:20', 180, 210);
    ctx.fillStyle = '#10B981';
    ctx.fillText('BUILD PLATFORM: LEVEL OK', 180, 235);

  } else if (type === 'qc') {
    // Quality control screen
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('METROLOGY & OPTICAL QC INSPECTION', 24, 75);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('LASER MICROMETER TOLERANCE VERIFICATION', 24, 100);
    ctx.fillText('STANDARD: ISO 13485 MEDICAL RESTORATIONS', 24, 120);

    // Check table
    const checks = [
      { param: 'Cervical Margin Seal', val: '7.8 µm', status: 'PASS (Spec < 20µm)' },
      { param: 'Internal Fit / Trueness', val: '12.4 µm', status: 'PASS (Spec < 35µm)' },
      { param: 'Occlusal Anatomy Height', val: '± 0.02 mm', status: 'PASS (Spec ± 0.05mm)' },
      { param: 'Surface Roughness (Ra)', val: '0.14 µm', status: 'PASS (Glazed Spec)' }
    ];

    checks.forEach((c, i) => {
      const y = 160 + i * 26;
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(c.param, 24, y);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(c.val, 230, y);
      ctx.fillStyle = '#10B981';
      ctx.fillText(c.status, 310, y);
    });

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('BATCH VERDICT: APPROVED FOR DISPATCH', 24, 295);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
