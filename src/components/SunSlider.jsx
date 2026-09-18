import React, { useEffect } from 'react';
import { Sun, Play, Pause, Sunrise, Sunset, Clock } from 'lucide-react';
import { computeSunParameters } from '../utils/sunCalc';

export default function SunSlider({
  timeOfDay,
  setTimeOfDay,
  isPlaying,
  setIsPlaying,
}) {
  const sunParams = computeSunParameters(timeOfDay);

  // Auto-advance sun when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeOfDay((prev) => {
        let next = prev + 0.05;
        if (next > 18) next = 6;
        return parseFloat(next.toFixed(2));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, setTimeOfDay]);

  const presets = [
    { label: 'Sunrise', time: 6.5, icon: Sunrise },
    { label: 'Morning', time: 9.5, icon: Sun },
    { label: 'Noon', time: 12.0, icon: Sun },
    { label: 'Afternoon', time: 15.0, icon: Sun },
    { label: 'Golden Hr', time: 17.2, icon: Sunset },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-xl space-y-3">
      {/* Header with Title and Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Sun className="w-4 h-4 animate-spin-slow" />
          <span>Sun-Path Simulation</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950/40 border border-amber-500/30 rounded-full text-amber-300 font-mono text-xs font-medium">
          <Clock className="w-3 h-3" />
          <span>{sunParams.formattedTime}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="6.0"
          max="18.0"
          step="0.1"
          value={timeOfDay}
          onChange={(e) => {
            setIsPlaying(false);
            setTimeOfDay(parseFloat(e.target.value));
          }}
          className="w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>6 AM</span>
          <span>9 AM</span>
          <span>12 PM</span>
          <span>3 PM</span>
          <span>6 PM</span>
        </div>
      </div>

      {/* Solar Coordinates Readout */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
        <div className="text-slate-400">
          Elevation: <span className="text-slate-200 font-semibold">{sunParams.elevationDeg}°</span>
        </div>
        <div className="text-slate-400">
          Azimuth: <span className="text-slate-200 font-semibold">{sunParams.azimuthDeg}°</span>
        </div>
      </div>

      {/* Presets & Animation Controls */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setIsPlaying(false);
                setTimeOfDay(p.time);
              }}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                Math.abs(timeOfDay - p.time) < 0.6
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title={isPlaying ? 'Pause Sun Orbit' : 'Play Solar Cycle'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
