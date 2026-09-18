import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Edges, Line } from '@react-three/drei';
import { createThreeShape, generateFloorSlabLines, generateGroundOutline } from '../utils/extrusion';

export default function PlotExtruder({
  plotData,
  floors = 3,
  floorHeight = 3.0,
  wireframe = false,
  materialStyle = 'clay',
}) {
  const totalHeight = Math.max(0.5, floors * floorHeight);

  // Extrude configuration
  const extrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: totalHeight,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 2,
    }),
    [totalHeight]
  );

  // Material selection
  const material = useMemo(() => {
    switch (materialStyle) {
      case 'glass':
        return (
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.1}
            transmission={0.65}
            transparent
            opacity={0.82}
            ior={1.5}
            wireframe={wireframe}
          />
        );
      case 'blueprint':
        return (
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.4}
            metalness={0.2}
            wireframe={wireframe}
          />
        );
      case 'amber':
        return (
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.3}
            metalness={0.1}
            transparent
            opacity={0.78}
            wireframe={wireframe}
          />
        );
      case 'clay':
      default:
        return (
          <meshStandardMaterial
            color="#f1f5f9"
            roughness={0.65}
            metalness={0.05}
            wireframe={wireframe}
          />
        );
    }
  }, [materialStyle, wireframe]);

  if (!plotData || !plotData.buildings || plotData.buildings.length === 0) {
    return null;
  }

  return (
    <group>
      {/* 1. Building Massings */}
      {plotData.buildings.map((building, idx) => {
        const shape = createThreeShape(building.outerRing, building.innerHoles);
        if (!shape) return null;

        // Generate horizontal floor divider lines
        const ringsToDivide = [building.outerRing, ...(building.innerHoles || [])];
        const floorLines = generateFloorSlabLines(ringsToDivide, floors, floorHeight);

        // Generate ground footprint outline
        const footprintPoints = generateGroundOutline(building.outerRing, 0.04);

        return (
          <group key={`building-${idx}`}>
            {/* Extruded 3D Massing Mesh */}
            {/* Shape is in XY plane, rotated -90 deg around X so extrusion along Z becomes Y (height) */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0, 0]}
              castShadow
              receiveShadow
            >
              <extrudeGeometry args={[shape, extrudeSettings]} />
              {material}
              {!wireframe && <Edges threshold={20} color="#334155" />}
            </mesh>

            {/* Architectural Horizontal Floor Slab Lines */}
            {!wireframe && floorLines.length > 0 && (
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(
                        floorLines.flatMap((pt) => [pt.x, pt.y, pt.z])
                      ),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#64748b" linewidth={1.5} />
              </lineSegments>
            )}

            {/* Building Ground Footprint Outline */}
            <Line
              points={footprintPoints}
              color="#0284c7"
              lineWidth={2}
            />
          </group>
        );
      })}

      {/* 2. Lot Boundaries / Setback Property Lines on Ground */}
      {plotData.boundaries &&
        plotData.boundaries.map((boundary, idx) => {
          const boundaryPoints = generateGroundOutline(boundary.outerRing, 0.02);
          return (
            <group key={`boundary-${idx}`}>
              <Line
                points={boundaryPoints}
                color="#10b981"
                lineWidth={3}
                dashed
                dashScale={40}
                dashSize={0.8}
                gapSize={0.4}
              />
            </group>
          );
        })}
    </group>
  );
}
