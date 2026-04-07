/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function AntigravityInner({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = "#FF9FFC",
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10,
}) {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastMoveTime = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const virtualMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event) {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      lastMoveTime.current = Date.now();
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const particles = useMemo(() => {
    const temp = [];
    const width = viewport.width || 100;
    const height = viewport.height || 100;

    for (let index = 0; index < count; index += 1) {
      const t = Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;

      temp.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      });
    }

    return temp;
  }, [count, viewport.height, viewport.width]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const idleFor = Date.now() - lastMoveTime.current;
    let destinationX = (pointer.current.x * state.viewport.width) / 2;
    let destinationY = (pointer.current.y * state.viewport.height) / 2;

    if (autoAnimate && idleFor > 1800) {
      const time = state.clock.getElapsedTime();
      destinationX = Math.sin(time * 0.5) * (state.viewport.width / 4);
      destinationY = Math.cos(time) * (state.viewport.height / 5);
    }

    virtualMouse.current.x += (destinationX - virtualMouse.current.x) * 0.05;
    virtualMouse.current.y += (destinationY - virtualMouse.current.y) * 0.05;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    particles.forEach((particle, index) => {
      particle.t += particle.speed / 2;

      const projectionFactor = 1 - particle.cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;
      const dx = particle.mx - projectedTargetX;
      const dy = particle.my - projectedTargetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let targetPosition = {
        x: particle.mx,
        y: particle.my,
        z: particle.mz * depthFactor,
      };

      if (distance < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(particle.t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = particle.randomRadiusOffset * (5 / (fieldStrength + 0.1));
        const currentRingRadius = ringRadius + wave + deviation;

        targetPosition = {
          x: projectedTargetX + currentRingRadius * Math.cos(angle),
          y: projectedTargetY + currentRingRadius * Math.sin(angle),
          z:
            particle.mz * depthFactor +
            Math.sin(particle.t) * waveAmplitude * depthFactor,
        };
      }

      particle.cx += (targetPosition.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPosition.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPosition.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistance = Math.sqrt(
        (particle.cx - projectedTargetX) ** 2 + (particle.cy - projectedTargetY) ** 2
      );
      const distanceFromRing = Math.abs(currentDistance - ringRadius);
      let scaleFactor = 1 - distanceFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale =
        scaleFactor *
        (0.8 + Math.sin(particle.t * pulseSpeed) * 0.2 * particleVariance) *
        particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, count]} frustumCulled={false} ref={meshRef}>
      {particleShape === "capsule" && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === "sphere" && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === "box" && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === "tetrahedron" && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

export default function Antigravity(props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 50], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <AntigravityInner {...props} />
    </Canvas>
  );
}
