import * as THREE from 'three';

/**
 * Creates a THREE.Shape from an outer ring and inner holes
 * The 2D coordinates [x, y] are mapped to Three.js Shape coordinates (x, y)
 * which when extruded along Z become (x, y, z) in local space,
 * and we rotate the mesh -90 deg on X so that Z becomes the Up-axis (Y in Three.js world)!
 */
export function createThreeShape(outerRing, innerHoles = []) {
  if (!outerRing || outerRing.length < 3) return null;

  const shape = new THREE.Shape();
  shape.moveTo(outerRing[0][0], outerRing[0][1]);

  for (let i = 1; i < outerRing.length; i++) {
    shape.lineTo(outerRing[i][0], outerRing[i][1]);
  }
  shape.closePath();

  // Add inner holes (courtyards, light wells, stairwells)
  if (innerHoles && innerHoles.length > 0) {
    for (const holeRing of innerHoles) {
      if (!holeRing || holeRing.length < 3) continue;
      const holePath = new THREE.Path();
      holePath.moveTo(holeRing[0][0], holeRing[0][1]);
      for (let j = 1; j < holeRing.length; j++) {
        holePath.lineTo(holeRing[j][0], holeRing[j][1]);
      }
      holePath.closePath();
      shape.holes.push(holePath);
    }
  }

  return shape;
}

/**
 * Generates horizontal floor level divider lines for BIM/architectural appearance
 */
export function generateFloorSlabLines(rings, floors, floorHeight) {
  const linePoints = [];

  for (let floor = 1; floor < floors; floor++) {
    const yLevel = floor * floorHeight;
    for (const ring of rings) {
      for (let i = 0; i < ring.length - 1; i++) {
        // In 3D world: X is X, Y is Up (height), Z is -Y from 2D plane
        linePoints.push(
          new THREE.Vector3(ring[i][0], yLevel, -ring[i][1]),
          new THREE.Vector3(ring[i + 1][0], yLevel, -ring[i + 1][1])
        );
      }
    }
  }

  return linePoints;
}

/**
 * Generates ground footprint outline points (Y = 0.03 to avoid z-fighting with grid)
 */
export function generateGroundOutline(ring, yOffset = 0.03) {
  const points = [];
  for (let i = 0; i < ring.length; i++) {
    points.push(new THREE.Vector3(ring[i][0], yOffset, -ring[i][1]));
  }
  return points;
}
