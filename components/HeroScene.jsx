"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import styles from "./hero-experience.module.css";

function useReducedMode() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function FloatingCard({ reduced }) {
  const cardRef = useRef(null);
  const materialRef = useRef(null);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    if (reduced) return undefined;

    function onPointerMove(event) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      pointerTarget.current.x = x;
      pointerTarget.current.y = y;
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reduced]);

  useFrame((state) => {
    if (!cardRef.current || !materialRef.current) return;

    current.current.x = THREE.MathUtils.lerp(current.current.x, pointerTarget.current.x, reduced ? 0.02 : 0.05);
    current.current.y = THREE.MathUtils.lerp(current.current.y, pointerTarget.current.y, reduced ? 0.02 : 0.05);

    cardRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.38) * 0.18 + 0.08;
    cardRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.16) * 0.12;
    cardRef.current.rotation.x = THREE.MathUtils.lerp(
      cardRef.current.rotation.x,
      reduced ? 0.1 : -current.current.y * 0.18,
      0.06
    );
    cardRef.current.rotation.y = THREE.MathUtils.lerp(
      cardRef.current.rotation.y,
      reduced ? -0.2 : current.current.x * 0.24,
      0.06
    );

    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      reduced ? 0.08 : 0.12 + Math.abs(current.current.x) * 0.14,
      0.04
    );

    cardRef.current.position.x = reduced ? viewport.width * 0.08 : current.current.x * 0.18;
  });

  return (
    <Float speed={0.5} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={cardRef} position={[0.55, 0.1, 0]}>
        <RoundedBox args={[1.62, 2.3, 0.05]} radius={0.06} smoothness={6}>
          <meshPhysicalMaterial
            ref={materialRef}
            color="#efe4cc"
            roughness={0.55}
            metalness={0.02}
            clearcoat={0.5}
            reflectivity={0.2}
            emissive="#3b1116"
            emissiveIntensity={0.08}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[1.42, 2.08]} />
          <meshBasicMaterial color="#101012" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <ringGeometry args={[0.22, 0.4, 4]} />
          <meshBasicMaterial color="#c9a86a" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.5, 0.78, 0.032]}>
          <planeGeometry args={[0.14, 0.18]} />
          <meshBasicMaterial color="#e6ddc6" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.5, -0.78, 0.032]} rotation={[0, 0, Math.PI]}>
          <planeGeometry args={[0.14, 0.18]} />
          <meshBasicMaterial color="#e6ddc6" transparent opacity={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

function DustField({ reduced }) {
  const pointsRef = useRef(null);
  const count = reduced ? 60 : 140;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 8;
      array[i * 3 + 1] = (Math.random() - 0.5) * 5;
      array[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return array;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#e6ddc6" size={reduced ? 0.018 : 0.025} transparent opacity={0.22} depthWrite={false} />
    </points>
  );
}

function SceneContent() {
  const reduced = useReducedMode();

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", reduced ? 4.2 : 4.8, reduced ? 8.4 : 10]} />

      <ambientLight intensity={reduced ? 0.42 : 0.36} color="#c9a86a" />
      <directionalLight position={[2.8, 2.4, 3]} intensity={reduced ? 0.9 : 1.1} color="#f3e6c8" />
      <spotLight
        position={[0.8, 2.8, 4]}
        intensity={reduced ? 18 : 28}
        angle={0.33}
        penumbra={0.8}
        color="#c9a86a"
      />
      {!reduced && <pointLight position={[-2, -0.6, 2]} intensity={3} distance={8} color="#4a0f17" />}

      <FloatingCard reduced={reduced} />
      <DustField reduced={reduced} />

      {!reduced && (
        <mesh position={[-1.7, -1.3, -1.7]} rotation={[-0.35, 0.2, 0.25]}>
          <planeGeometry args={[0.45, 1.1]} />
          <meshBasicMaterial color="#55161f" transparent opacity={0.18} />
        </mesh>
      )}

      <Environment resolution={32}>
        <mesh position={[0, 0, -4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#201517" />
        </mesh>
      </Environment>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className={styles.canvasWrap}>
      <Canvas camera={{ position: [0, 0, 5], fov: 34 }} dpr={[1, 1.5]}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
