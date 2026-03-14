"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Plane } from "@react-three/drei";
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

function createVelvetTextures() {
  const size = 1024;

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const colorCtx = colorCanvas.getContext("2d");

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext("2d");

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext("2d");

  if (!colorCtx || !bumpCtx || !roughCtx) {
    return {};
  }

  const baseGradient = colorCtx.createLinearGradient(0, 0, 0, size);
  baseGradient.addColorStop(0, "#5f111b");
  baseGradient.addColorStop(0.4, "#6d1621");
  baseGradient.addColorStop(0.72, "#531019");
  baseGradient.addColorStop(1, "#2f090f");
  colorCtx.fillStyle = baseGradient;
  colorCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 2200; i += 1) {
    const x = Math.random() * size;
    const width = 1 + Math.random() * 3.2;
    const alpha = 0.02 + Math.random() * 0.06;
    const hueShift = Math.floor(Math.random() * 18);
    colorCtx.fillStyle = `rgba(${112 + hueShift}, ${18 + Math.floor(hueShift / 4)}, ${28 + Math.floor(hueShift / 5)}, ${alpha})`;
    colorCtx.fillRect(x, 0, width, size);
  }

  const highlight = colorCtx.createRadialGradient(size * 0.5, size * 0.2, 0, size * 0.5, size * 0.2, size * 0.7);
  highlight.addColorStop(0, "rgba(210, 164, 112, 0.12)");
  highlight.addColorStop(0.45, "rgba(133, 29, 44, 0.05)");
  highlight.addColorStop(1, "rgba(20, 5, 8, 0)");
  colorCtx.fillStyle = highlight;
  colorCtx.fillRect(0, 0, size, size);

  const bumpGradient = bumpCtx.createLinearGradient(0, 0, size, 0);
  bumpGradient.addColorStop(0, "#787878");
  bumpGradient.addColorStop(0.5, "#b8b8b8");
  bumpGradient.addColorStop(1, "#5c5c5c");
  bumpCtx.fillStyle = bumpGradient;
  bumpCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 320; i += 1) {
    const x = (i / 320) * size;
    const band = 0.5 + Math.sin((i / 320) * Math.PI * 20) * 0.5;
    bumpCtx.fillStyle = `rgba(255,255,255,${0.03 + band * 0.08})`;
    bumpCtx.fillRect(x, 0, 1 + band * 7, size);
  }

  roughCtx.fillStyle = "#e6e6e6";
  roughCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * size;
    const alpha = 0.012 + Math.random() * 0.04;
    roughCtx.fillStyle = `rgba(0,0,0,${alpha})`;
    roughCtx.fillRect(x, 0, 1 + Math.random() * 4, size);
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);

  [colorMap, bumpMap, roughnessMap].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.35, 1.6);
    texture.needsUpdate = true;
  });

  return { colorMap, bumpMap, roughnessMap };
}

function CurtainHalf({ side = "left", reduced }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const foldCount = reduced ? 22 : 32;
  const textures = useMemo(() => createVelvetTextures(), []);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(5.15, 8.8, foldCount, reduced ? 72 : 140);
  }, [foldCount, reduced]);

  useEffect(() => {
    const position = geometry.attributes.position;
    const direction = side === "left" ? -1 : 1;
    const foldMultiplier = reduced ? 7 : 10;

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const normalizedX = (x + 2.575) / 5.15;
      const normalizedY = (y + 4.4) / 8.8;
      const primaryFold = Math.sin(normalizedX * Math.PI * foldMultiplier) * 0.3;
      const secondaryFold = Math.sin(normalizedX * Math.PI * (foldMultiplier * 2) + 0.4) * 0.08;
      const depth = primaryFold + secondaryFold;
      const edgeWeight = side === "left" ? 1 - normalizedX : normalizedX;
      const centerWeight = side === "left" ? normalizedX : 1 - normalizedX;
      const topGather = Math.pow(1 - normalizedY, 1.6) * 0.18;
      const bottomFall = Math.pow(normalizedY, 1.5) * 0.12;
      const horizontalPull = direction * (0.22 + edgeWeight * 0.35 - centerWeight * 0.12);
      const drape = Math.sin((normalizedY * Math.PI * 2.2) + normalizedX * 1.4) * 0.04;

      position.setZ(i, depth * (0.95 - normalizedY * 0.22) + drape - bottomFall * 0.08);
      position.setX(i, x + horizontalPull * (0.85 - normalizedY * 0.35));
      position.setY(i, y - topGather + Math.abs(primaryFold) * 0.06);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [geometry, reduced, side]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const pointerX = state.pointer.x;
    const sway = Math.sin(state.clock.elapsedTime * 0.18 + (side === "left" ? 0.1 : 0.8)) * (reduced ? 0.008 : 0.016);
    meshRef.current.rotation.z = side === "left" ? -0.032 + sway : 0.032 - sway;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      reduced ? (side === "left" ? 0.05 : -0.05) : (side === "left" ? 0.06 : -0.06) + pointerX * 0.03,
      0.04
    );
    meshRef.current.position.x = side === "left" ? -2.58 : 2.58;
    materialRef.current.sheen = 1;
    materialRef.current.sheenRoughness = 0.72;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[side === "left" ? -2.58 : 2.58, 0, 0.18]}>
      <meshPhysicalMaterial
        ref={materialRef}
        map={textures.colorMap}
        bumpMap={textures.bumpMap}
        roughnessMap={textures.roughnessMap}
        color={side === "left" ? "#5d131e" : "#671520"}
        roughness={0.94}
        metalness={0.02}
        clearcoat={0.08}
        reflectivity={0.18}
        emissive={side === "left" ? "#22080d" : "#2a0910"}
        emissiveIntensity={0.18}
        bumpScale={0.12}
        sheen={1}
        sheenColor="#f2d8c0"
        sheenRoughness={0.72}
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
  const leftLight = useRef(null);
  const rightLight = useRef(null);

  useFrame((state) => {
    if (reduced) return;
    if (leftLight.current) {
      leftLight.current.position.x = THREE.MathUtils.lerp(leftLight.current.position.x, -3.8 + state.pointer.x * 0.45, 0.05);
      leftLight.current.position.y = THREE.MathUtils.lerp(leftLight.current.position.y, 2.8 + state.pointer.y * 0.22, 0.05);
    }
    if (rightLight.current) {
      rightLight.current.position.x = THREE.MathUtils.lerp(rightLight.current.position.x, 3.8 + state.pointer.x * 0.35, 0.05);
      rightLight.current.position.y = THREE.MathUtils.lerp(rightLight.current.position.y, 2.9 + state.pointer.y * 0.18, 0.05);
    }
  });

  return (
    <>
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", reduced ? 5.6 : 6.4, reduced ? 11.2 : 12.6]} />

      <ambientLight intensity={0.16} color="#4f151d" />
      <spotLight
        ref={leftLight}
        position={[-3.9, 2.9, 5.1]}
        intensity={reduced ? 28 : 40}
        angle={0.34}
        penumbra={1}
        color="#d9b177"
      />
      <spotLight
        ref={rightLight}
        position={[3.85, 3, 5.1]}
        intensity={reduced ? 22 : 32}
        angle={0.3}
        penumbra={1}
        color="#b45e4a"
      />
      <directionalLight position={[0, 4.6, 4]} intensity={reduced ? 0.28 : 0.38} color="#f4debd" />
      <pointLight position={[0, -1.7, 2.4]} intensity={reduced ? 0.7 : 1} distance={8} color="#391015" />

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
