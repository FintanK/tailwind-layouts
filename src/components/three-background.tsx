// src/components/three-background.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const theme = useTheme(); // Get theme info

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current; // Capture mount point

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Enable alpha for transparency
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for screen density
    currentMount.appendChild(renderer.domElement);

    // Determine colors based on theme
    const particleColor = theme.resolvedTheme === 'dark' ? 0x0d9488 : 0x0d9488; // Teal in both, could adjust lightness/saturation for dark
    const backgroundColor = theme.resolvedTheme === 'dark' ? 0x1f2937 : 0xf9fafb; // Dark/Light BG

    // Set renderer clear color (background) - use CSS for actual page background
    renderer.setClearColor(backgroundColor, 0); // Set alpha to 0

    // Geometry - Particles
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 10; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 10; // z

      velocities[i3] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

      color.setHex(particleColor);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3)); // Store velocity

    // Material
    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true, // Use colors attribute
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true, // Points smaller further away
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 5;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Particle movement
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const velocityAttribute = geometry.getAttribute('velocity') as THREE.BufferAttribute;
      const positionArray = positionAttribute.array as Float32Array;
      const velocityArray = velocityAttribute.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
         const i3 = i * 3;
         positionArray[i3] += velocityArray[i3];
         positionArray[i3 + 1] += velocityArray[i3 + 1];
         positionArray[i3 + 2] += velocityArray[i3 + 2];

         // Boundary checks (wrap around)
         if (positionArray[i3] > 5 || positionArray[i3] < -5) velocityArray[i3] *= -1;
         if (positionArray[i3 + 1] > 5 || positionArray[i3 + 1] < -5) velocityArray[i3 + 1] *= -1;
         if (positionArray[i3 + 2] > 5 || positionArray[i3 + 2] < -5) velocityArray[i3 + 2] *= -1;
      }
      positionAttribute.needsUpdate = true;


      // Subtle camera rotation based on mouse
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position); // Ensure camera always points toward the center


      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
       if (currentMount && renderer.domElement) {
          try {
             currentMount.removeChild(renderer.domElement);
          } catch (e) {
             console.warn("Failed to remove canvas, it might already be gone.", e);
          }
       }
       // Dispose Three.js objects to free memory
       geometry.dispose();
       material.dispose();
       // scene.dispose() might not be necessary if children are disposed
       renderer.dispose();
    };
  }, [theme.resolvedTheme]); // Re-run effect if theme changes

  // Use a div with fixed positioning and negative z-index
  return <div id="bg-canvas" ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

export default ThreeBackground;

