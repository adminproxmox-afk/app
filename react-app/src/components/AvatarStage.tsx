import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { starterWardrobeByGender, wardrobeOptionMap } from '../data';
import { useAppStore } from '../store';
import type { WardrobeSlot } from '../types';

type PreviewSelection = Partial<Record<WardrobeSlot, string>>;

type AvatarStageProps = {
  previewSelection?: PreviewSelection;
  accentColor?: string;
  compact?: boolean;
};

type StageRuntime = {
  scene: any;
  camera: any;
  renderer: any;
  world: any;
  avatarRoot: any;
  halo: any;
  orbs: any[];
  pointerTarget: number;
  pointerOffset: number;
  isDragging: boolean;
  lastPointerX: number;
};

function makeRoundedBox(width: number, height: number, depth: number, radius: number, smoothness = 4) {
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

function clearGroup(group: any) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((node: any) => {
      const mesh = node as any;
      mesh.geometry?.dispose?.();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material: any) => material.dispose?.());
      } else {
        mesh.material?.dispose?.();
      }
    });
  }
}

function getColor(id: string, fallback: string) {
  return wardrobeOptionMap[id]?.color || fallback;
}

function buildAvatar(root: any, selection: Record<WardrobeSlot, string>, gender: 'male' | 'female') {
  clearGroup(root);

  const skinColor = getColor(selection.skin, '#f2bb7b');
  const hairColor = getColor(selection.hair, '#95694b');
  const shirtColor = getColor(selection.shirt, '#8a2d31');
  const pantsColor = getColor(selection.pants, '#27323e');
  const shoesColor = getColor(selection.shoes, '#151d25');
  const auraColor = getColor(selection.aura, '#77d1a8');

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.76, metalness: 0.08 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.78, metalness: 0.02 });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.88, metalness: 0.01 });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.82, metalness: 0.05 });
  const shoeMaterial = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.74, metalness: 0.1 });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: auraColor,
    transparent: true,
    opacity: selection.aura === 'extra-soft' ? 0.08 : 0.22,
    blending: THREE.AdditiveBlending
  });

  const auraBack = new THREE.Mesh(new THREE.RingGeometry(1.16, 1.88, 64), glowMaterial);
  auraBack.position.set(0, 0.18, -0.96);
  root.add(auraBack);

  const torso = new THREE.Mesh(makeRoundedBox(1.16, 1.42, 0.56, 0.22), bodyMaterial);
  torso.position.set(0, -0.24, 0);
  torso.rotation.x = 0.06;
  root.add(torso);

  const hips = new THREE.Mesh(makeRoundedBox(0.94, 0.34, 0.5, 0.14), pantsMaterial);
  hips.position.set(0, -0.98, 0);
  root.add(hips);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 42, 42), skinMaterial);
  head.scale.set(0.92, 1, 0.92);
  head.position.set(0, 0.88, 0.02);
  root.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(gender === 'female' ? 0.7 : 0.62, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.68),
    hairMaterial
  );
  hair.position.set(0, 1.14, -0.04);
  hair.rotation.x = 0.16;
  hair.scale.set(gender === 'female' ? 1.12 : 1.02, gender === 'female' ? 0.78 : 0.64, 0.92);
  root.add(hair);

  if (gender === 'female') {
    [-0.46, 0.46].forEach((x) => {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), hairMaterial);
      lock.scale.set(0.74, 1.5, 0.7);
      lock.position.set(x, 0.7, -0.02);
      root.add(lock);
    });
  }

  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x203041 });
  [-0.18, 0.18].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), eyeMaterial);
    eye.position.set(x, 0.88, 0.54);
    root.add(eye);
  });

  const mouth = new THREE.Mesh(
    makeRoundedBox(0.24, 0.08, 0.03, 0.03),
    new THREE.MeshBasicMaterial({ color: gender === 'female' ? 0x8f4a74 : 0x285690 })
  );
  mouth.position.set(0, 0.6, 0.56);
  root.add(mouth);

  [-0.84, 0.84].forEach((x) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.82, 8, 18), bodyMaterial);
    arm.position.set(x, -0.34, 0.02);
    arm.rotation.z = x < 0 ? 0.22 : -0.22;
    root.add(arm);
  });

  [-0.3, 0.3].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.92, 8, 18), pantsMaterial);
    leg.position.set(x, -1.32, 0);
    root.add(leg);

    const shoe = new THREE.Mesh(makeRoundedBox(0.44, 0.18, 0.52, 0.08), shoeMaterial);
    shoe.position.set(x, -1.92, 0.18);
    root.add(shoe);
  });

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.14, 0.035, 12, 72),
    new THREE.MeshStandardMaterial({
      color: auraColor,
      emissive: auraColor,
      emissiveIntensity: selection.aura === 'extra-soft' ? 0.12 : 0.42,
      roughness: 0.4,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    })
  );
  orbitRing.rotation.x = Math.PI / 2;
  orbitRing.position.y = -0.34;
  root.add(orbitRing);
}

export default function AvatarStage({ previewSelection, accentColor = '#4e9cff', compact = false }: AvatarStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<StageRuntime | null>(null);
  const character = useAppStore((state) => state.character);

  const selection = useMemo(() => ({
    ...starterWardrobeByGender[character.gender],
    ...character.equipped,
    ...(previewSelection || {})
  }), [character.equipped, character.gender, previewSelection]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, compact ? 1.18 : 1.28, compact ? 6.5 : 7.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    const avatarRoot = new THREE.Group();
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(compact ? 2.2 : 2.5, 0.1, 16, 120),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: 0.45,
        metalness: 0.32,
        roughness: 0.48,
        transparent: true,
        opacity: 0.45
      })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -1.3;

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.92, 2.14, 0.46, 72),
      new THREE.MeshStandardMaterial({ color: 0x485160, roughness: 0.82, metalness: 0.08 })
    );
    platform.position.y = -2.02;

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.94, 0.07, 10, 96),
      new THREE.MeshStandardMaterial({
        color: 0x9abaff,
        emissive: 0x4e9cff,
        emissiveIntensity: 0.4,
        metalness: 0.54,
        roughness: 0.36
      })
    );
    rim.position.y = -1.82;
    rim.rotation.x = Math.PI / 2;

    world.add(platform);
    world.add(rim);
    world.add(halo);
    world.add(avatarRoot);
    scene.add(world);

    const hemi = new THREE.HemisphereLight(0xf4fbff, 0x20311e, 2.4);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(3.2, 5.2, 4.2);
    scene.add(key);

    const fill = new THREE.PointLight(new THREE.Color(accentColor), 2.4, 12);
    fill.position.set(-2.4, 1.8, 2.6);
    scene.add(fill);

    const orbs = Array.from({ length: 8 }, (_, index) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(index % 2 === 0 ? 0.08 : 0.12, 16, 16),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(index % 2 === 0 ? '#8cc6ff' : '#77d1a8'),
          transparent: true,
          opacity: index % 2 === 0 ? 0.32 : 0.22
        })
      );
      scene.add(orb);
      return orb;
    });

    runtimeRef.current = {
      scene,
      camera,
      renderer,
      world,
      avatarRoot,
      halo,
      orbs,
      pointerTarget: 0,
      pointerOffset: 0,
      isDragging: false,
      lastPointerX: 0
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerDown = (event: PointerEvent) => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      runtime.isDragging = true;
      runtime.lastPointerX = event.clientX;
    };

    const onPointerMove = (event: PointerEvent) => {
      const runtime = runtimeRef.current;
      if (!runtime?.isDragging) return;
      const delta = event.clientX - runtime.lastPointerX;
      runtime.lastPointerX = event.clientX;
      runtime.pointerTarget += delta * 0.012;
    };

    const onPointerUp = () => {
      if (!runtimeRef.current) return;
      runtimeRef.current.isDragging = false;
    };

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const runtime = runtimeRef.current;
      if (!runtime) return;

      const time = performance.now() * 0.001;
      runtime.pointerOffset += (runtime.pointerTarget - runtime.pointerOffset) * 0.08;
      runtime.world.rotation.y = runtime.pointerOffset + Math.sin(time * 0.4) * 0.08;
      runtime.world.position.y = Math.sin(time * 1.25) * 0.04;
      runtime.halo.rotation.z += 0.004;

      runtime.orbs.forEach((orb: any, index: number) => {
        const angle = time * (0.3 + index * 0.02) + index * 0.78;
        const radius = 2.2 + (index % 3) * 0.24;
        orb.position.set(
          Math.cos(angle) * radius,
          0.48 + Math.sin(time * 1.4 + index) * 0.35,
          Math.sin(angle) * radius * 0.55 - 1.2
        );
      });

      runtime.renderer.render(runtime.scene, runtime.camera);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointerdown', onPointerDown);
      cancelAnimationFrame(frameId);
      clearGroup(avatarRoot);
      orbs.forEach((orb) => {
        orb.geometry.dispose();
        if (Array.isArray(orb.material)) {
          orb.material.forEach((material: any) => material.dispose());
        } else {
          orb.material.dispose();
        }
        scene.remove(orb);
      });
      renderer.dispose();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, [accentColor, compact]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.halo.material.dispose();
    runtime.halo.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      emissive: new THREE.Color(accentColor),
      emissiveIntensity: 0.45,
      metalness: 0.32,
      roughness: 0.48,
      transparent: true,
      opacity: 0.45
    });

    buildAvatar(runtime.avatarRoot, selection, character.gender);
  }, [accentColor, character.gender, selection]);

  return <div className={`avatar-stage${compact ? ' avatar-stage--compact' : ''}`} ref={mountRef} aria-label="3D персонаж" />;
}
