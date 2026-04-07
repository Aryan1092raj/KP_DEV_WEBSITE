/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";

import kpLogo from "../../assets/kp-logo.png";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 24], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI * 0.35} />
        <directionalLight intensity={2} position={[3, 3, 3]} />
        <Band gravity={gravity} isMobile={isMobile} />
        <Environment blur={0.75}>
          <Lightformer
            color="white"
            intensity={2}
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ gravity = [0, -40, 0], isMobile = false }) {
  const band = useRef();
  const cardGroup = useRef();
  const cardAnchor = useRef(new THREE.Vector3(0, 3.7, 0));
  const cardPosition = useRef(new THREE.Vector3(1.8, 1.6, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  const vec = useMemo(() => new THREE.Vector3(), []);
  const pointerTarget = useRef(null);

  const logo = useTexture(kpLogo);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);

  const strapTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f97316";
    for (let x = 0; x < canvas.width; x += 24) {
      ctx.fillRect(x, 0, 10, canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(-4, 1);
    return texture;
  }, []);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }

    document.body.style.cursor = "auto";
    return undefined;
  }, [hovered, dragged]);

  useFrame((state) => {
    if (!dragged) {
      pointerTarget.current = null;
    } else {
      vec.set(state.pointer.x, state.pointer.y, 0.6).unproject(state.camera);
      pointerTarget.current = vec.clone();
    }
  });

  useFrame((state, delta) => {
    const grav = new THREE.Vector3(...gravity).multiplyScalar(0.01);
    const defaultTarget = new THREE.Vector3(
      1.85 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12,
      1.55 + Math.cos(state.clock.elapsedTime * 1.15) * 0.08,
      Math.sin(state.clock.elapsedTime * 0.9) * 0.2,
    );
    const target = pointerTarget.current ?? defaultTarget;

    const spring = target.clone().sub(cardPosition.current).multiplyScalar(8.5 * delta);
    velocity.current.add(spring);
    velocity.current.add(grav.clone().multiplyScalar(delta));
    velocity.current.multiplyScalar(0.92);
    cardPosition.current.add(velocity.current.clone().multiplyScalar(delta * 60));

    if (cardGroup.current) {
      cardGroup.current.position.copy(cardPosition.current);
      cardGroup.current.rotation.z = THREE.MathUtils.clamp(-velocity.current.x * 0.3, -0.45, 0.45);
      cardGroup.current.rotation.x = THREE.MathUtils.clamp(velocity.current.y * 0.2, -0.25, 0.25);
      cardGroup.current.rotation.y = THREE.MathUtils.clamp(velocity.current.x * 0.2, -0.35, 0.35);
    }

    const p0 = cardAnchor.current;
    const p3 = cardPosition.current.clone().add(new THREE.Vector3(0, 1.1, 0));
    const midY = Math.min(p0.y, p3.y) - 0.85;
    const p1 = new THREE.Vector3((p0.x * 2 + p3.x) / 3, midY, (p0.z * 2 + p3.z) / 3);
    const p2 = new THREE.Vector3((p0.x + p3.x * 2) / 3, midY - 0.1, (p0.z + p3.z * 2) / 3);

    curve.points[0].copy(p0);
    curve.points[1].copy(p1);
    curve.points[2].copy(p2);
    curve.points[3].copy(p3);
    band.current?.geometry?.setPoints(curve.getPoints(isMobile ? 18 : 36));

    if (dragged) {
      velocity.current.multiplyScalar(0.85);
    }
  });

  curve.curveType = "chordal";

  return (
    <>
      <mesh position={[0, 3.7, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.25} />
      </mesh>

      <group
        onPointerDown={(event) => {
          event.target.setPointerCapture(event.pointerId);
          setDragged(true);
        }}
        onPointerOut={() => setHovered(false)}
        onPointerOver={() => setHovered(true)}
        onPointerUp={(event) => {
          event.target.releasePointerCapture(event.pointerId);
          setDragged(false);
        }}
        ref={cardGroup}
      >
        <mesh castShadow>
          <boxGeometry args={[3.2, 4.4, 0.26]} />
          <meshPhysicalMaterial
            clearcoat={isMobile ? 0 : 1}
            clearcoatRoughness={0.15}
            map={logo}
            map-anisotropy={16}
            metalness={0.25}
            roughness={0.75}
          />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.24, 24]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          lineWidth={1}
          map={strapTexture}
          repeat={[-4, 1]}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
        />
      </mesh>
    </>
  );
}
