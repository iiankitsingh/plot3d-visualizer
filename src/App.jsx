import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import { parseGeoJSON } from './utils/geojson';
import { parseSVG } from './utils/svgParser';
import { BUNDLED_SAMPLES } from './data/samples';
import { Ruler, Sparkles, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [plotData, setPlotData] = useState(() => {
    try {
      return parseGeoJSON(BUNDLED_SAMPLES.villa);
    } catch {
      return null;
    }
  });
  const [selectedSample, setSelectedSample] = useState('villa');
  const [floors, setFloors] = useState(2);
  const [floorHeight, setFloorHeight] = useState(3.2);
  const [wireframe, setWireframe] = useState(false);
  const [materialStyle, setMaterialStyle] = useState('clay');
  const [timeOfDay, setTimeOfDay] = useState(10.5); // 10:30 AM
  const [isPlayingSun, setIsPlayingSun] = useState(false);
  const [cameraView, setCameraView] = useState('perspective');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [unit, setUnit] = useState('m');
  const [measurements, setMeasurements] = useState([]);
  const [notification, setNotification] = useState(null);
  const canvasRef = useRef(null);

  // Show temporary toast notification
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load sample plot data
  const loadSample = async (sampleId) => {
    try {
      if (BUNDLED_SAMPLES[sampleId]) {
        const parsed = parseGeoJSON(BUNDLED_SAMPLES[sampleId]);
        setPlotData(parsed);
        setSelectedSample(sampleId);
        if (parsed.buildings && parsed.buildings[0]) {
          setFloors(parsed.buildings[0].defaultFloors || 3);
          setFloorHeight(parsed.buildings[0].floorHeight || 3.2);
        }
        setMeasurements([]);
        showToast(`Loaded "${parsed.name}"`);
        return;
      }

      const fileNameMap = {
        villa: 'samples/villa-plot.json',
        commercial: 'samples/commercial-tower.json',
        penthouse: 'samples/penthouse-floorplan.json',
      };
      const basePath = import.meta.env.BASE_URL || './';
      const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
      const path = `${cleanBase}${fileNameMap[sampleId] || fileNameMap.villa}`;
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const parsed = parseGeoJSON(data);
      setPlotData(parsed);
      setSelectedSample(sampleId);

      if (parsed.buildings && parsed.buildings[0]) {
        setFloors(parsed.buildings[0].defaultFloors || 3);
        setFloorHeight(parsed.buildings[0].floorHeight || 3.2);
      }
      setMeasurements([]);
      showToast(`Loaded "${parsed.name}"`);
    } catch (err) {
      console.error('Failed to load sample plot:', err);
      showToast(`Failed to load plot: ${err.message}`, 'error');
    }
  };

  // Initial load
  useEffect(() => {
    if (!plotData) {
      loadSample('villa');
    }
  }, []);

  // Handle file uploads (GeoJSON or SVG)
  const handleFileUpload = async (file) => {
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let parsed = null;

        if (fileName.endsWith('.svg')) {
          parsed = parseSVG(text);
          parsed.name = file.name.replace(/\.[^/.]+$/, '');
        } else {
          // JSON or GeoJSON
          parsed = parseGeoJSON(text);
          parsed.name = file.name.replace(/\.[^/.]+$/, '');
        }

        setPlotData(parsed);
        setSelectedSample('custom');
        setMeasurements([]);
        if (parsed.buildings && parsed.buildings[0]) {
          setFloors(parsed.buildings[0].defaultFloors || 2);
          setFloorHeight(parsed.buildings[0].floorHeight || 3.0);
        }
        showToast(`Successfully imported "${parsed.name}"!`);
      } catch (err) {
        console.error('File parsing error:', err);
        showToast(`Import error: ${err.message}`, 'error');
      }
    };

    reader.onerror = () => {
      showToast('Error reading file.', 'error');
    };

    reader.readAsText(file);
  };

  // Capture canvas screenshot
  const handleCaptureScreenshot = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `plot3d-${plotData?.name ? plotData.name.toLowerCase().replace(/\s+/g, '-') : 'scene'}-${Date.now()}.png`;
      a.click();
      showToast('Snapshot downloaded!');
    } catch (err) {
      console.error('Screenshot error:', err);
      showToast('Could not save screenshot', 'error');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Scene */}
      <Scene
        plotData={plotData}
        floors={floors}
        floorHeight={floorHeight}
        wireframe={wireframe}
        materialStyle={materialStyle}
        timeOfDay={timeOfDay}
        cameraView={cameraView}
        isMeasuring={isMeasuring}
        unit={unit}
        measurements={measurements}
        setMeasurements={setMeasurements}
        canvasRef={canvasRef}
      />

      {/* Floating Top Bar with Model Name and Help */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/80 shadow-2xl flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold text-white tracking-wide">
            {plotData?.name || 'Loading Plot...'}
          </span>
          {plotData?.properties?.zoning && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {plotData.properties.zoning}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Floating Navigation Hint Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800/80 text-[11px] text-slate-400 pointer-events-none shadow-xl">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          Left Drag: Orbit
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          Right Drag: Pan
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Scroll: Zoom
        </span>
      </div>

      {/* Quick Measurement Mode Indicator Overlay */}
      {isMeasuring && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <Ruler className="w-3.5 h-3.5" />
          <span>Dimensioning active: Click first point, then click second point</span>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-sky-500/50 text-white backdrop-blur-xl px-4 py-2 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 transition-all">
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar Control Panel */}
      <Sidebar
        plotData={plotData}
        selectedSample={selectedSample}
        onSelectSample={loadSample}
        onFileUpload={handleFileUpload}
        floors={floors}
        setFloors={setFloors}
        floorHeight={floorHeight}
        setFloorHeight={setFloorHeight}
        wireframe={wireframe}
        setWireframe={setWireframe}
        materialStyle={materialStyle}
        setMaterialStyle={setMaterialStyle}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        isPlayingSun={isPlayingSun}
        setIsPlayingSun={setIsPlayingSun}
        cameraView={cameraView}
        setCameraView={setCameraView}
        isMeasuring={isMeasuring}
        setIsMeasuring={setIsMeasuring}
        unit={unit}
        setUnit={setUnit}
        measurements={measurements}
        setMeasurements={setMeasurements}
        onCaptureScreenshot={handleCaptureScreenshot}
      />
    </div>
  );
}
