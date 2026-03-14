"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Plane, useTexture } from "@react-three/drei";
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

function CurtainHalf({ side = "left", reduced }) {
  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const shadowTexture = useTexture("/assets/images/chase-headshot.jpg");
  const foldCount = reduced ? 18 : 28;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(4.6, 8.4, foldCount, reduced ? 48 : 88);
  }, [foldCount, reduced]);

  useEffect(() => {
    const position = geometry.attributes.position;
    const direction = side === "left" ? -1 : 1;

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const normalizedX = (x + 2.3) / 4.6;
      const foldWave = Math.sin(normalizedX * Math.PI * (reduced ? 6 : 8));
      const pinch = Math.pow(Math.abs(normalizedX - 0.5) * 2, 1.2);
      const depth = foldWave * 0.18 - pinch * 0.1;
      const sidePull = direction * (0.12 + pinch * 0.24);
      const verticalGather = Math.sin((y + 4.2) * 0.45) * 0.04;

      position.setZ(i, depth + verticalGather);
      position.setX(i, x + sidePull * (0.4 - Math.abs(y) / 12));
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [geometry, reduced, side]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const sway = Math.sin(state.clock.elapsedTime * 0.2 + (side === "left" ? 0 : 0.7)) * (reduced ? 0.01 : 0.018);
    meshRef.current.rotation.z = side === "left" ? -0.02 + sway : 0.02 - sway;
    meshRef.current.position.x = side === "left" ? -2.24 : 2.24;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[side === "left" ? -2.24 : 2.24, 0, 0.15]}>
      <meshStandardMaterial
        color={side === "left" ? "#58131d" : "#671722"}
        roughness={0.92}
        metalness={0.02}
        emissive="#1f080c"
        emissiveIntensity={0.16}
        bumpMap={shadowTexture}
        bumpScale={0.014}
      />
    </mesh>
  );
}

function Valance({ reduced }) {
  const topGeometry = useMemo(() => new THREE.PlaneGeometry(9.8, reduced ? 1.1 : 1.35, reduced ? 24 : 42, 24), [reduced]);

  useEffect(() => {
    const position = topGeometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const swag = Math.cos((x / 4.9) * Math.PI * 2) * 0.24;
      position.setZ(i, swag * 0.36 + Math.sin((y + 0.6) * 4) * 0.04);
      position.setY(i, y - Math.abs(Math.sin((x / 4.9) * Math.PI * 2)) * 0.18);
    }
    position.needsUpdate = true;
    topGeometry.computeVertexNormals();
  }, [topGeometry]);

  return (
    <mesh geometry={topGeometry} position={[0, 3.3, 0.4]}>
      <meshStandardMaterial color="#4d0f18" roughness={0.88} metalness={0.03} emissive="#190508" emissiveIntensity={0.12} />
    </mesh>
  );
}

function StageAtmosphere({ reduced }) {
  const hazeRef = useRef(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!hazeRef.current) return;
    hazeRef.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.24) * 0.01;
    hazeRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.08;
  });

  return (
    <>
      <Plane args={[viewport.width * 1.8, viewport.height * 1.6]} position={[0, 0, -1.4]} ref={hazeRef}>
        <meshBasicMaterial color="#1a090c" transparent opacity={0.12} />
      </Plane>
      {!reduced && (
        <mesh position={[0, -4.6, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 5]} />
          <meshStandardMaterial color="#120d0e" roughness={0.95} metalness={0.02} />
        </mesh>
      )}
    </>
  );
}

function SceneContent() {
  const reduced = useReducedMode();

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", reduced ? 5.8 : 6.6, reduced ? 11.8 : 13]} />

      <ambientLight intensity={0.22} color="#5f232c" />
      <spotLight position={[-3.6, 2.6, 4.8]} intensity={reduced ? 22 : 34} angle={0.42} penumbra={1} color="#d7b173" />
      <spotLight position={[3.6, 2.8, 4.8]} intensity={reduced ? 18 : 28} angle={0.38} penumbra={1} color="#b67058" />
      <directionalLight position={[0, 4.2, 3.5]} intensity={reduced ? 0.32 : 0.42} color="#f1dcc0" />
      <pointLight position={[0, -1.8, 2.6]} intensity={reduced ? 0.8 : 1.2} distance={8} color="#421117" />

      <StageAtmosphere reduced={reduced} />
      <CurtainHalf side="left" reduced={reduced} />
      <CurtainHalf side="right" reduced={reduced} />
      <Valance reduced={reduced} />

      <Environment resolution={32}>
        <mesh position={[0, 0, -4]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#14090b" />
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
