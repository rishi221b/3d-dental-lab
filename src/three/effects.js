import * as THREE from 'three';

/**
 * Checks if WebGL is supported by the current browser/hardware.
 */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Creates ambient particle field.
 */
export function createAmbientDust() {
  const count = 48;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const baseColor = new THREE.Color(0x38BDF8);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 7.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5.5;

    baseColor.toArray(colors, i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    update: (delta) => {
      points.rotation.y += delta * 0.03;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}
