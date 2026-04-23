import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store.js';

function makeRoundedBox(width, height, depth, radius, smoothness = 4) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: radius / 2,
    bevelThickness: radius / 2
  });
}

export default function AvatarStage() {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const wardrobe = useAppStore((state) => state.wardrobe);
  const gender = useAppStore((state) => state.gender);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    modelRef.current = group;
    scene.add(group);

    const light = new THREE.HemisphereLight(0xe7f2ff, 0x233019, 2.1);
    scene.add(light);
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(2, 4, 4);
    scene.add(key);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.9, 0.42, 64),
      new THREE.MeshStandardMaterial({ color: 0x4d5255, roughness: 0.82, metalness: 0.08 })
    );
    platform.position.y = -1.72;
    group.add(platform);

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: wardrobe.shirt, roughness: 0.75 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf2bb7b, roughness: 0.78 });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: wardrobe.hair, roughness: 0.9 });
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: wardrobe.pants, roughness: 0.85 });
    const shoeMaterial = new THREE.MeshStandardMaterial({ color: wardrobe.shoes, roughness: 0.8 });

    const torso = new THREE.Mesh(makeRoundedBox(1.12, 1.32, 0.52, 0.2), bodyMaterial);
    torso.position.y = -0.28;
    torso.rotation.x = 0.08;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 38, 38), skinMaterial);
    head.scale.set(0.92, 1, 0.9);
    head.position.y = 0.77;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(gender === 'female' ? 0.66 : 0.6, 38, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMaterial);
    hair.scale.set(gender === 'female' ? 1.08 : 1, gender === 'female' ? 0.76 : 0.62, 0.9);
    hair.position.set(0, 1.04, -0.02);
    hair.rotation.x = 0.14;
    group.add(hair);

    if (gender === 'female') {
      const leftLock = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 18), hairMaterial);
      leftLock.scale.set(0.7, 1.4, 0.7);
      leftLock.position.set(-0.46, 0.72, -0.02);
      group.add(leftLock);
      const rightLock = leftLock.clone();
      rightLock.position.x = 0.46;
      group.add(rightLock);
    }

    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x263743 });
    [-0.19, 0.19].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), eyeMaterial);
      eye.position.set(x, 0.8, 0.52);
      group.add(eye);
    });

    const mouth = new THREE.Mesh(
      makeRoundedBox(0.28, 0.08, 0.02, 0.03),
      new THREE.MeshBasicMaterial({ color: gender === 'female' ? 0x8b3a78 : 0x285690 })
    );
    mouth.position.set(0, 0.56, 0.54);
    group.add(mouth);

    [-0.82, 0.82].forEach((x) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.78, 8, 18), bodyMaterial);
      arm.position.set(x, -0.34, 0);
      arm.rotation.z = x < 0 ? 0.12 : -0.12;
      group.add(arm);
    });

    [-0.28, 0.28].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.92, 8, 18), pantsMaterial);
      leg.position.set(x, -1.15, 0);
      group.add(leg);

      const shoe = new THREE.Mesh(makeRoundedBox(0.42, 0.16, 0.48, 0.06), shoeMaterial);
      shoe.position.set(x, -1.72, 0.16);
      group.add(shoe);
    });

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      group.rotation.y = Math.sin(time * 0.7) * 0.12;
      group.position.y = Math.sin(time * 1.3) * 0.05;
      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
      renderer.domElement.remove();
      modelRef.current = null;
    };
  }, [wardrobe, gender]);

  return <div className="avatar-stage" ref={mountRef} aria-label="3D персонаж" />;
}
