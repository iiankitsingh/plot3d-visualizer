import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import PlotExtruder from './PlotExtruder';
import CompassGizmo from './CompassGizmo';
import DimensionTool from './DimensionTool';
import { computeSunParameters } from '../utils/sunCalc';

// Camera view preset controller
function CameraController({ cameraView }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (!cameraView) return;

    if (cameraView === 'top') {
      camera.position.set(0, 55, 0.01);
      camera.lookAt(0, 0, 0);
    } else if (cameraView === 'front') {
      camera.position.set(0, 10, 45);
      camera.lookAt(0, 5, 0);
    } else if (cameraView === 'isometric') {
      camera.position.set(35, 35, 35);
      camera.lookAt(0, 5, 0);
    } else if (cameraView === 'perspective') {
      camera.position.set(28, 22, 28);
      camera.lookAt(0, 4, 0);
    }
  }, [cameraView, camera]);

  return null;
}

// Lighting setup with dynamic sun trajectory
function Lighting({ timeOfDay }) {
  const sunParams = computeSunParameters(timeOfDay);
  const dirLightRef = useRef();

  return (
    <>
      {/* Ambient Fill Light */}
      <ambientLight
        color={sunParams.ambientColor}
        intensity={sunParams.ambientIntensity}
      />

      {/* Hemisphere Light for soft ground bounce */}
      <hemisphereLight
        skyColor={sunParams.sunColor}
        groundColor="#1e293b"
        intensity={0.35}
      />

      {/* Directional Sun Light */}
      <directionalLight
        ref={dirLightRef}
        position={sunParams.position}
        color={sunParams.sunColor}
        intensity={sunParams.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* Visual Sun Orb in the sky */}
      <mesh position={sunParams.position}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color={sunParams.sunColor} />
      </mesh>
    </>
  );
}

export default function Scene({
  plotData,
  floors,
  floorHeight,
  wireframe,
  materialStyle,
  timeOfDay,
  cameraView,
  isMeasuring,
  unit,
  measurements,
  setMeasurements,
  canvasRef,
}) {
  return (
    <Canvas
      ref={canvasRef}
      shadows
      camera={{ position: [28, 22, 28], fov: 45 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      className="w-full h-full bg-slate-950"
    >
      <CameraController cameraView={cameraView} />
      <Lighting timeOfDay={timeOfDay} />

      {/* 3D Massing Extrusion */}
      <PlotExtruder
        plotData={plotData}
        floors={floors}
        floorHeight={floorHeight}
        wireframe={wireframe}
        materialStyle={materialStyle}
      />

      {/* Ground Grid with Soft Shadows */}
      <Grid
        position={[0, -0.01, 0]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#334155"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#475569"
        fadeDistance={70}
        fadeStrength={1.5}
      />

      {/* Ground Shadow Receiver Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 120]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      {/* 3D Orientation Compass */}
      <CompassGizmo radius={22} />

      {/* Dimensioning / Measurement Tool */}
      <DimensionTool
        isActive={isMeasuring}
        unit={unit}
        measurements={measurements}
        setMeasurements={setMeasurements}
      />

      {/* Orbit Controls (disabled while actively placing measurement points) */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
        minDistance={5}
        maxDistance={120}
      />
    </Canvas>
  );
}
