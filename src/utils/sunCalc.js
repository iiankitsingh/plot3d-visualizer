/**
 * Solar position and lighting simulation calculations
 */

export function computeSunParameters(timeOfDayHours) {
  // Time ranges from 6.0 (6:00 AM) to 18.0 (6:00 PM)
  // Normalized progress from 0 (sunrise) to 1 (sunset)
  const progress = Math.max(0, Math.min(1, (timeOfDayHours - 6) / 12));

  // Sun elevation angle: 0 at sunrise/sunset, peaks at ~65 degrees at solar noon (12:00)
  const elevationRad = Math.sin(progress * Math.PI) * (65 * Math.PI / 180);
  
  // Sun azimuth angle: traverses from East (morning, -X) across South (+Z) to West (evening, +X)
  // East is -90 deg (-pi/2), South is 0 deg, West is +90 deg (+pi/2)
  const azimuthRad = (progress - 0.5) * Math.PI;

  const sunDistance = 45; // Distance from center
  const x = Math.sin(azimuthRad) * Math.cos(elevationRad) * sunDistance;
  const y = Math.max(1.5, Math.sin(elevationRad) * sunDistance);
  const z = Math.cos(azimuthRad) * Math.cos(elevationRad) * sunDistance;

  // Color temperature & lighting progression
  let sunColor = '#ffffff';
  let ambientColor = '#8ba4c9';
  let sunIntensity = 1.4;
  let ambientIntensity = 0.45;

  if (progress < 0.2) {
    // Early morning: Warm golden hour
    const t = progress / 0.2;
    sunColor = '#ffaa5e';
    ambientColor = '#4a5b78';
    sunIntensity = 0.8 + t * 0.5;
    ambientIntensity = 0.25 + t * 0.15;
  } else if (progress > 0.8) {
    // Late afternoon / Dusk: Warm amber-red sunset
    const t = (progress - 0.8) / 0.2;
    sunColor = '#ff8243';
    ambientColor = '#504c6e';
    sunIntensity = 1.3 - t * 0.6;
    ambientIntensity = 0.4 - t * 0.2;
  } else {
    // Midday: Crisp daylight
    sunColor = '#fffdfa';
    ambientColor = '#a5c0e8';
    sunIntensity = 1.5;
    ambientIntensity = 0.5;
  }

  // Format time of day for UI display
  const totalMinutes = Math.round(timeOfDayHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedTime = `${displayHours}:${displayMinutes} ${period}`;

  return {
    position: [x, y, z],
    elevationDeg: Math.round((elevationRad * 180) / Math.PI),
    azimuthDeg: Math.round(((azimuthRad * 180) / Math.PI + 180) % 360),
    sunColor,
    ambientColor,
    sunIntensity,
    ambientIntensity,
    formattedTime
  };
}
