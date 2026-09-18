import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Compass & Orientation Gizmo
 * True North is -Z in Three.js coordinates
 * East is +X, South is +Z, West is -X
 */
export default function CompassGizmo({ radius = 24 }) {
  const directions = [
    { label: 'N', position: [0, 0.15, -radius], color: 'text-rose-500 font-bold', bg: 'bg-rose-950/80 border-rose-500/50' },
    { label: 'E', position: [radius, 0.15, 0], color: 'text-emerald-400 font-bold', bg: 'bg-slate-900/80 border-slate-700' },
    { label: 'S', position: [0, 0.15, radius], color: 'text-sky-400 font-bold', bg: 'bg-slate-900/80 border-slate-700' },
    { label: 'W', position: [-radius, 0.15, 0], color: 'text-amber-400 font-bold', bg: 'bg-slate-900/80 border-slate-700' },
  ];

  return (
    <group position={[0, 0.05, 0]}>
      {/* Outer compass circular boundary ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[radius - 0.2, radius, 64]} />
        <meshBasicMaterial color="#475569" transparent opacity={0.35} />
      </mesh>

      {/* Subtle cross axes */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0.02, -radius, 0, 0.02, radius]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </line>

      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-radius, 0.02, 0, radius, 0.02, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </line>

      {/* North arrow triangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -radius + 1.2]}>
        <coneGeometry args={[0.8, 2.2, 3]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Cardinal direction labels */}
      {directions.map((dir) => (
        <group key={dir.label} position={dir.position}>
          <Html center distanceFactor={40} className="pointer-events-none select-none">
            <div className={`px-2 py-0.5 rounded text-xs border shadow-sm backdrop-blur-sm ${dir.bg} ${dir.color}`}>
              {dir.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
