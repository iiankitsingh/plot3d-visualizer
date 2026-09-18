/**
 * GeoJSON parsing, coordinate projection, normalization, and area calculation
 */

// Compute polygon signed area using Shoelace formula
export function computePolygonArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
}

// Compute perimeter of polygon ring
export function computePolygonPerimeter(ring) {
  let perimeter = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const dx = ring[i + 1][0] - ring[i][0];
    const dy = ring[i + 1][1] - ring[i][1];
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

// Check if coordinates appear to be geographic (degrees)
function isGeographic(coords) {
  return coords.every(([x, y]) => Math.abs(x) <= 180 && Math.abs(y) <= 90);
}

// Convert geographic coordinates to local meters centered at first point
function projectGeographicToMeters(rings) {
  if (!rings.length || !rings[0].length) return rings;
  const [refLng, refLat] = rings[0][0];
  const rad = Math.PI / 180;
  const earthRadius = 6378137; // WGS84 major axis
  const cosLat = Math.cos(refLat * rad);

  return rings.map(ring =>
    ring.map(([lng, lat]) => [
      (lng - refLng) * rad * earthRadius * cosLat,
      (lat - refLat) * rad * earthRadius
    ])
  );
}

/**
 * Parses GeoJSON object or string
 * Returns normalized shapes for building extrusion and boundary lines
 */
export function parseGeoJSON(geojsonData) {
  let parsed = typeof geojsonData === 'string' ? JSON.parse(geojsonData) : geojsonData;

  let features = [];
  if (parsed.type === 'FeatureCollection') {
    features = parsed.features || [];
  } else if (parsed.type === 'Feature') {
    features = [parsed];
  } else if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') {
    features = [{ type: 'Feature', properties: {}, geometry: parsed }];
  }

  const buildings = [];
  const boundaries = [];

  for (const feature of features) {
    if (!feature.geometry) continue;
    const geom = feature.geometry;
    const props = feature.properties || {};
    const isBoundary = props.type === 'boundary' || props.category === 'lot' || props.category === 'boundary';

    let polygonList = [];
    if (geom.type === 'Polygon') {
      polygonList = [geom.coordinates];
    } else if (geom.type === 'MultiPolygon') {
      polygonList = geom.coordinates;
    }

    for (const poly of polygonList) {
      if (!poly || poly.length === 0) continue;
      
      // Check if coordinates are in degrees, convert to meters if needed
      let processedRings = poly;
      const flatCoords = poly.flat();
      if (flatCoords.length > 0 && isGeographic(flatCoords)) {
        processedRings = projectGeographicToMeters(poly);
      }

      const outerRing = processedRings[0];
      const innerHoles = processedRings.slice(1);

      const area = computePolygonArea(outerRing);
      const perimeter = computePolygonPerimeter(outerRing);

      const item = {
        outerRing,
        innerHoles,
        area,
        perimeter,
        properties: props,
        defaultFloors: props.defaultFloors || 2,
        floorHeight: props.floorHeight || 3.0,
      };

      if (isBoundary) {
        boundaries.push(item);
      } else {
        buildings.push(item);
      }
    }
  }

  // If no building was found but boundaries exist, treat the primary boundary as building
  if (buildings.length === 0 && boundaries.length > 0) {
    buildings.push(...boundaries);
  }

  // Calculate overall bounding box to center at origin (0, 0)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const allRings = [
    ...buildings.map(b => b.outerRing),
    ...boundaries.map(b => b.outerRing)
  ];

  for (const ring of allRings) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (minX === Infinity) {
    minX = -10; maxX = 10; minY = -10; maxY = 10;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = Math.max(maxX - minX, 1);
  const depth = Math.max(maxY - minY, 1);

  // Normalize rings by subtracting center point
  const normalizeRing = ring => ring.map(([x, y]) => [x - centerX, y - centerY]);

  const normalizedBuildings = buildings.map(b => ({
    ...b,
    outerRing: normalizeRing(b.outerRing),
    innerHoles: b.innerHoles.map(normalizeRing),
  }));

  const normalizedBoundaries = boundaries.map(b => ({
    ...b,
    outerRing: normalizeRing(b.outerRing),
    innerHoles: b.innerHoles.map(normalizeRing),
  }));

  const totalFootprintArea = normalizedBuildings.reduce((sum, b) => sum + b.area, 0);
  const totalPerimeter = normalizedBuildings.reduce((sum, b) => sum + b.perimeter, 0);

  return {
    name: parsed.name || 'Custom Spatial Plot',
    description: parsed.description || 'Imported layout geometry',
    buildings: normalizedBuildings,
    boundaries: normalizedBoundaries,
    bounds: { minX: minX - centerX, maxX: maxX - centerX, minY: minY - centerY, maxY: maxY - centerY, width, depth },
    totalFootprintArea,
    totalPerimeter,
    properties: parsed.properties || {}
  };
}
