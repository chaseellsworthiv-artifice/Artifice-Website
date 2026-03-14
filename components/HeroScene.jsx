"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Plane } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
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
  const topLight = useRef(null);

  useFrame((state) => {
    if (!topLight.current || reduced) return;
    topLight.current.position.x = THREE.MathUtils.lerp(topLight.current.position.x, state.pointer.x * 0.35, 0.04);
    topLight.current.position.y = THREE.MathUtils.lerp(topLight.current.position.y, 3.4 + state.pointer.y * 0.18, 0.04);
  });

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#090708", reduced ? 5.6 : 6.8, reduced ? 11.4 : 13.4]} />

      <ambientLight intensity={0.12} color="#381116" />
      <spotLight
        ref={topLight}
        position={[0, 3.4, 4.8]}
        intensity={reduced ? 10 : 14}
        angle={0.52}
        penumbra={1}
        color="#d4ab71"
      />
      <directionalLight position={[0, 4.6, 4]} intensity={reduced ? 0.12 : 0.16} color="#f0dcc0" />
      <pointLight position={[0, -1.9, 2.2]} intensity={reduced ? 0.22 : 0.35} distance={8} color="#2b0c11" />

      <StageAtmosphere reduced={reduced} />
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
