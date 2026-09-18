import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function DimensionTool({
  isActive,
  unit, // 'm' or 'ft'
  measurements,
  setMeasurements,
}) {
  const [startPoint, setStartPoint] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  const { raycaster, scene } = useThree();

  const toDisplayUnit = (distMeters) => {
    if (unit === 'ft') {
      const feet = distMeters * 3.28084;
      return `${feet.toFixed(2)} ft`;
    }
    return `${distMeters.toFixed(2)} m`;
  };

  const handlePointerDown = (e) => {
    if (!isActive) return;
    // Prevent event bubbling so OrbitControls doesn't rotate while clicking points
    e.stopPropagation();

    const point = e.point.clone();
    // Lift slightly above surface to prevent clipping
    point.y += 0.05;

    if (!startPoint) {
      setStartPoint(point);
      setHoverPoint(point);
    } else {
      const distance = startPoint.distanceTo(point);
      if (distance > 0.05) {
        setMeasurements((prev) => [
          ...prev,
          {
            id: Date.now(),
            start: startPoint,
            end: point,
            distance,
          },
        ]);
      }
      setStartPoint(null);
      setHoverPoint(null);
    }
  };

  const handlePointerMove = (e) => {
    if (!isActive || !startPoint) return;
    const point = e.point.clone();
    point.y += 0.05;
    setHoverPoint(point);
  };

  const currentDistance =
    startPoint && hoverPoint ? startPoint.distanceTo(hoverPoint) : 0;
  const currentMidpoint =
    startPoint && hoverPoint
      ? new THREE.Vector3().addVectors(startPoint, hoverPoint).multiplyScalar(0.5)
      : null;

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* Invisible broad raycast plane on ground when measuring */}
      {isActive && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[500, 500]} />
          <meshBasicMaterial />
        </mesh>
      )}

      {/* Completed measurements */}
      {measurements.map((m) => {
        const mid = new THREE.Vector3()
          .addVectors(m.start, m.end)
          .multiplyScalar(0.5);

        return (
          <group key={m.id}>
            {/* Dimension line */}
            <Line
              points={[m.start, m.end]}
              color="#38bdf8"
              lineWidth={3}
              dashed={false}
            />

            {/* End point caps */}
            <mesh position={m.start}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
            <mesh position={m.end}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>

            {/* 3D Measurement Label Overlay */}
            <Html position={mid} center distanceFactor={25}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/95 text-sky-300 font-mono text-xs font-semibold rounded-md border border-sky-500/40 shadow-xl backdrop-blur-md pointer-events-auto select-none">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span>{toDisplayUnit(m.distance)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMeasurements((prev) => prev.filter((item) => item.id !== m.id));
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove measurement"
                >
                  ✕
                </button>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Active in-progress measurement line */}
      {startPoint && hoverPoint && (
        <group>
          <Line
            points={[startPoint, hoverPoint]}
            color="#f59e0b"
            lineWidth={2}
            dashed
            dashScale={50}
            dashSize={0.5}
            gapSize={0.25}
          />
          <mesh position={startPoint}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          <mesh position={hoverPoint}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>

          {currentMidpoint && (
            <Html position={currentMidpoint} center distanceFactor={25}>
              <div className="px-2.5 py-1 bg-amber-950/90 text-amber-300 font-mono text-xs font-semibold rounded-md border border-amber-500/50 shadow-lg backdrop-blur-sm pointer-events-none select-none">
                Measuring: {toDisplayUnit(currentDistance)}
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
}
