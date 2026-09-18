import React, { useRef, useState } from 'react';
import {
  Layers,
  Upload,
  Ruler,
  Eye,
  Camera,
  Download,
  Building2,
  Box,
  Compass,
  Maximize2,
  Info,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SunSlider from './SunSlider';

export default function Sidebar({
  plotData,
  selectedSample,
  onSelectSample,
  onFileUpload,
  floors,
  setFloors,
  floorHeight,
  setFloorHeight,
  wireframe,
  setWireframe,
  materialStyle,
  setMaterialStyle,
  timeOfDay,
  setTimeOfDay,
  isPlayingSun,
  setIsPlayingSun,
  cameraView,
  setCameraView,
  isMeasuring,
  setIsMeasuring,
  unit,
  setUnit,
  measurements,
  setMeasurements,
  onCaptureScreenshot,
}) {
  const fileInputRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const samplePlots = [
    { id: 'villa', name: 'Suburban Villa & Lot', file: 'samples/villa-plot.json' },
    { id: 'commercial', name: 'Metropolitan Commercial Block', file: 'samples/commercial-tower.json' },
    { id: 'penthouse', name: 'Penthouse Floor Plan', file: 'samples/penthouse-floorplan.json' },
  ];

  const materials = [
    { id: 'clay', name: 'Clay/Concrete', color: 'bg-slate-200' },
    { id: 'glass', name: 'Glass Curtain', color: 'bg-sky-400' },
    { id: 'blueprint', name: 'Blueprint', color: 'bg-sky-700' },
    { id: 'amber', name: 'Zoning Envelope', color: 'bg-amber-500' },
  ];

  const cameraPresets = [
    { id: 'perspective', label: '3D Orbit' },
    { id: 'top', label: 'Top (Plan)' },
    { id: 'front', label: 'Front' },
    { id: 'isometric', label: 'Axonometric' },
  ];

  // Stats calculations
  const footprintM2 = plotData ? plotData.totalFootprintArea : 0;
  const footprintSqFt = footprintM2 * 10.7639;
  const gfaM2 = footprintM2 * floors;
  const gfaSqFt = gfaM2 * 10.7639;
  const perimeterM = plotData ? plotData.totalPerimeter : 0;
  const perimeterFt = perimeterM * 3.28084;
  const totalHeightM = floors * floorHeight;
  const totalHeightFt = totalHeightM * 3.28084;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      {/* Floating Toggle Button when Sidebar is Collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute top-4 left-4 z-40 p-2.5 bg-slate-900/90 text-sky-400 hover:text-white rounded-xl border border-slate-700/80 shadow-2xl backdrop-blur-md transition-transform hover:scale-105"
          title="Open Control Panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-80 md:w-96 bg-slate-950/95 border-r border-slate-800 shadow-2xl backdrop-blur-xl transition-transform duration-300 flex flex-col ${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Plot3D Visualizer
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded">
                  v2.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                WebGL Spatial & Massing Studio
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Controls Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* 1. Plot Source Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-sky-400" />
              Plot / Floor Plan Source
            </label>

            <div className="grid grid-cols-1 gap-1.5">
              {samplePlots.map((plot) => (
                <button
                  key={plot.id}
                  onClick={() => onSelectSample(plot.id)}
                  className={`px-3 py-2 text-left rounded-lg text-xs transition-all border ${
                    selectedSample === plot.id
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/50 font-medium shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {plot.name}
                </button>
              ))}
            </div>

            {/* Drag & Drop File Upload */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 border-2 border-dashed border-slate-800 hover:border-sky-500/60 hover:bg-sky-500/5 rounded-xl p-3 text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.geojson,.svg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <Upload className="w-4 h-4 mx-auto text-slate-400 group-hover:text-sky-400 transition-colors mb-1" />
              <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                Import GeoJSON or SVG
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Drop .geojson, .json, or .svg file here
              </p>
            </div>
          </div>

          {/* 2. Procedural Extrusion Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Building Massing & Floors
            </label>

            {/* Floor Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Number of Floors:</span>
                <span className="text-sky-400 font-mono font-semibold">
                  {floors} {floors === 1 ? 'Floor' : 'Floors'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={floors}
                onChange={(e) => setFloors(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Floor Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Floor-to-Floor Height:</span>
                <span className="text-sky-400 font-mono font-semibold">
                  {unit === 'ft'
                    ? `${(floorHeight * 3.28084).toFixed(1)} ft`
                    : `${floorHeight.toFixed(1)} m`}
                </span>
              </div>
              <input
                type="range"
                min="2.5"
                max="5.0"
                step="0.1"
                value={floorHeight}
                onChange={(e) => setFloorHeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Material Style & Wireframe */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-slate-400">Facade / Massing Style:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {materials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setMaterialStyle(mat.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                      materialStyle === mat.id
                        ? 'bg-slate-800 border-sky-500/70 text-white font-medium'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full border border-slate-600 ${mat.color}`} />
                    <span>{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wireframe View Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Wireframe View:</span>
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  wireframe ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    wireframe ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Interactive Dimensioning Tool */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-400" />
                Measurement Tool
              </label>

              {/* Unit Toggle */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                <button
                  onClick={() => setUnit('m')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    unit === 'm' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Meters
                </button>
                <button
                  onClick={() => setUnit('ft')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    unit === 'ft' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  Feet
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMeasuring(!isMeasuring)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border ${
                  isMeasuring
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md animate-pulse'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                {isMeasuring ? 'Click 2 Points to Measure...' : 'Activate Tape Measure'}
              </button>

              {measurements.length > 0 && (
                <button
                  onClick={() => setMeasurements([])}
                  className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition-colors"
                  title="Clear all measurements"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isMeasuring && (
              <p className="text-[11px] text-amber-300/80 italic bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                Click anywhere on the building, edges, or ground to measure setbacks or spans.
              </p>
            )}
          </div>

          {/* 4. Sun-Path Simulation */}
          <div className="pt-2 border-t border-slate-800/80">
            <SunSlider
              timeOfDay={timeOfDay}
              setTimeOfDay={setTimeOfDay}
              isPlaying={isPlayingSun}
              setIsPlaying={setIsPlayingSun}
            />
          </div>

          {/* 5. Camera View Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              Camera View Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {cameraPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setCameraView(preset.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                    cameraView === preset.id
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-medium'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Spatial Statistics & Building Metrics */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Plot & Zoning Metrics
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Footprint</span>
                <span className="text-slate-200 font-semibold">
                  {unit === 'ft'
                    ? `${footprintSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`
                    : `${footprintM2.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Gross Floor Area</span>
                <span className="text-sky-400 font-semibold">
                  {unit === 'ft'
                    ? `${gfaSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`
                    : `${gfaM2.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Total Height</span>
                <span className="text-slate-200 font-semibold">
                  {unit === 'ft' ? `${totalHeightFt.toFixed(1)} ft` : `${totalHeightM.toFixed(1)} m`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Perimeter</span>
                <span className="text-slate-200 font-semibold">
                  {unit === 'ft' ? `${perimeterFt.toFixed(1)} ft` : `${perimeterM.toFixed(1)} m`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/80">
          <button
            onClick={onCaptureScreenshot}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </aside>
    </>
  );
}
