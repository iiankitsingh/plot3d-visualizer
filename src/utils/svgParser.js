/**
 * SVG 2D layout parser for floor plans and plot boundaries
 */
import { computePolygonArea, computePolygonPerimeter } from './geojson';

export function parseSVG(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');

  const buildings = [];
  const boundaries = [];

  // Helper to parse point strings "x1,y1 x2,y2 ..."
  const parsePointsString = (str) => {
    return str
      .trim()
      .split(/[\s,]+/)
      .reduce((acc, val, idx, arr) => {
        if (idx % 2 === 0 && idx + 1 < arr.length) {
          acc.push([parseFloat(val), parseFloat(arr[idx + 1])]);
        }
        return acc;
      }, []);
  };

  // 1. Extract <polygon> and <polyline>
  const polygons = doc.querySelectorAll('polygon, polyline');
  polygons.forEach((el, index) => {
    const pointsAttr = el.getAttribute('points');
    if (!pointsAttr) return;
    const ring = parsePointsString(pointsAttr);
    if (ring.length >= 3) {
      // Close ring if not closed
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([...ring[0]]);
      }
      buildings.push({
        outerRing: ring,
        innerHoles: [],
        area: computePolygonArea(ring),
        perimeter: computePolygonPerimeter(ring),
        properties: { name: el.id || `SVG Polygon ${index + 1}` },
        defaultFloors: 2,
        floorHeight: 3.0,
      });
    }
  });

  // 2. Extract <rect>
  const rects = doc.querySelectorAll('rect');
  rects.forEach((rect, index) => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    if (width > 0 && height > 0) {
      const ring = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
        [x, y]
      ];
      buildings.push({
        outerRing: ring,
        innerHoles: [],
        area: width * height,
        perimeter: 2 * (width + height),
        properties: { name: rect.id || `SVG Room/Block ${index + 1}` },
        defaultFloors: 2,
        floorHeight: 3.0,
      });
    }
  });

  // 3. Simple fallback for <path> elements with M, L, Z commands
  const paths = doc.querySelectorAll('path');
  paths.forEach((path, index) => {
    const d = path.getAttribute('d');
    if (!d) return;
    const matches = d.match(/[MLHVZmlhvz][^MLHVZmlhvz]*/g);
    if (!matches) return;

    const ring = [];
    let curX = 0, curY = 0;
    for (const seg of matches) {
      const cmd = seg[0];
      const numbers = seg.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
      if (cmd === 'M' || cmd === 'L') {
        if (numbers.length >= 2) {
          curX = numbers[0];
          curY = numbers[1];
          ring.push([curX, curY]);
        }
      } else if (cmd === 'm' || cmd === 'l') {
        if (numbers.length >= 2) {
          curX += numbers[0];
          curY += numbers[1];
          ring.push([curX, curY]);
        }
      } else if (cmd === 'H') {
        if (numbers.length >= 1) { curX = numbers[0]; ring.push([curX, curY]); }
      } else if (cmd === 'V') {
        if (numbers.length >= 1) { curY = numbers[0]; ring.push([curX, curY]); }
      } else if (cmd === 'Z' || cmd === 'z') {
        if (ring.length > 0) {
          ring.push([...ring[0]]);
        }
      }
    }

    if (ring.length >= 3) {
      buildings.push({
        outerRing: ring,
        innerHoles: [],
        area: computePolygonArea(ring),
        perimeter: computePolygonPerimeter(ring),
        properties: { name: path.id || `SVG Path ${index + 1}` },
        defaultFloors: 2,
        floorHeight: 3.0,
      });
    }
  });

  if (buildings.length === 0) {
    throw new Error('No valid polygon, rect, or linear path elements found in SVG.');
  }

  // Calculate bounding box and scale to reasonable real-world meter range (e.g. 20-50m)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  buildings.forEach(b => {
    b.outerRing.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
  });

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const maxSpan = Math.max(spanX, spanY);

  // Normalize scale: target ~30 meters bounding span for typical real estate plots
  const scale = maxSpan > 100 ? (30 / maxSpan) : 1;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const normalizeRing = ring => ring.map(([x, y]) => [
    (x - centerX) * scale,
    // Note: SVG Y is downwards, flip so Y-axis maps upwards in ground plane
    -(y - centerY) * scale
  ]);

  const normalizedBuildings = buildings.map(b => ({
    ...b,
    outerRing: normalizeRing(b.outerRing),
    innerHoles: b.innerHoles.map(normalizeRing),
    area: b.area * scale * scale,
    perimeter: b.perimeter * scale,
  }));

  const totalFootprintArea = normalizedBuildings.reduce((sum, b) => sum + b.area, 0);
  const totalPerimeter = normalizedBuildings.reduce((sum, b) => sum + b.perimeter, 0);

  return {
    name: 'Imported SVG Floor Plan',
    description: 'Procedurally extracted 2D SVG vector geometry',
    buildings: normalizedBuildings,
    boundaries,
    bounds: {
      minX: (minX - centerX) * scale,
      maxX: (maxX - centerX) * scale,
      minY: -(maxY - centerY) * scale,
      maxY: -(minY - centerY) * scale,
      width: spanX * scale,
      depth: spanY * scale,
    },
    totalFootprintArea,
    totalPerimeter,
    properties: { scaleApplied: scale }
  };
}
