# 🏙️ Plot3D Visualizer

[![Deploy to GitHub Pages](https://github.com/iiankitsingh/plot3d-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/iiankitsingh/plot3d-visualizer/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-brightgreen?style=flat&logo=github)](https://iiankitsingh.github.io/plot3d-visualizer/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)

> **Interactive 3D real estate and spatial plot visualizer for land plots, floor plans, and zoning blocks in WebGL with procedural extrusion, interactive dimensioning, and real-time sun-path shadow analysis.**

🔗 **Live Demo:** [https://iiankitsingh.github.io/plot3d-visualizer/](https://iiankitsingh.github.io/plot3d-visualizer/)

---

## ✨ Features

### 🏢 1. Procedural Floor Plan & Plot Extrusion
- **Instant Demo Load**: Bundled with 3 architectural presets (Suburban Villa with setbacks, Metropolitan Commercial Tower, Luxury Penthouse floor plan).
- **Universal 2D Import**: Drag-and-drop or upload custom `.geojson`, `.json`, or `.svg` floor plan layouts.
- **Dynamic Floor Control**: Parametric height adjustment (1 to 24 floors, 2.5m to 5.0m floor-to-floor height).
- **Floor Slab Visualization**: Distinct architectural floor-slab divider bands generated at each floor level.
- **Setback & Property Lines**: Real-world boundary line overlays rendered on the ground plane.
- **Styling Presets**: Architectural Clay/Concrete, Glass Curtain Wall, Blueprint Cyan, and Zoning Envelope Amber.
- **Wireframe Toggle**: Instant switch between solid shaded render and CAD wireframe modes.

### 📐 2. Interactive Dimensioning Tool
- **2-Point Tape Measure**: Click any two points on building surfaces, corners, or ground to measure real-world distance.
- **Dynamic 3D Badges**: Floating dimension labels anchored in 3D space with tick caps and endpoint markers.
- **Dual Units**: Seamless toggle between Metric (**meters**) and Imperial (**feet**).
- **Automated Spatial Statistics**: Real-time calculation of Building Footprint ($m^2$ / $sq\ ft$), Gross Floor Area ($GFA$), Perimeter, and Height.

### ☀️ 3. Real-Time Sun-Path Simulation & Shadows
- **Interactive Solar Arc**: Time-of-day slider (6:00 AM to 6:00 PM) recalculating sun position, azimuth, and elevation in real time.
- **Dynamic Lighting & Color Temperature**: Dawn/dusk warm amber tones transition smoothly into crisp midday sunlight.
- **High-Resolution Soft Shadows**: PCF shadow mapping with realistic cast shadows on building masses and ground grids.
- **3D Compass Gizmo**: Cardinal orientation indicators (North, South, East, West) to align building orientation with solar angles.
- **Solar Animation**: Play/pause solar cycle to watch shadows sweep across the massing model.

### 📸 4. High-Res Snapshot Export
- One-click snapshot capture downloading a clean PNG image of the current 3D viewport.

---

## 🛠️ Tech Stack

| Technology | Role |
| :--- | :--- |
| **React 19** | Component-driven user interface and reactive state management |
| **Three.js** | Core WebGL 3D rendering engine, shaders, and shadow mapping |
| **@react-three/fiber** | Declarative Three.js scene graph in React |
| **@react-three/drei** | Camera controls, 3D HTML overlays, CAD edges, line rendering |
| **Tailwind CSS** | Responsive architectural dark UI and layout |
| **Lucide Icons** | Clean vector iconography |
| **Vite** | Next-generation frontend tooling and static site bundling |
| **GitHub Actions** | Automated CI/CD deployment to GitHub Pages |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/iiankitsingh/plot3d-visualizer.git
cd plot3d-visualizer

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
plot3d-visualizer/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Actions deployment to gh-pages
├── public/
│   ├── favicon.svg               # Isometric cube SVG favicon
│   └── samples/
│       ├── villa-plot.json       # Residential lot with setback & courtyard
│       ├── commercial-tower.json # High-density commercial zoning block
│       └── penthouse-floorplan.json # Multi-room residential floor plan
├── src/
│   ├── components/
│   │   ├── Scene.jsx             # Three.js Canvas, lighting, soft shadows, ground grid
│   │   ├── PlotExtruder.jsx      # Procedural 3D massing, floor slabs, materials
│   │   ├── DimensionTool.jsx     # Interactive 2-point tape measure with 3D tags
│   │   ├── SunSlider.jsx         # Solar time-of-day slider, solar coords & presets
│   │   ├── CompassGizmo.jsx      # 3D cardinal orientation gizmo (N/S/E/W)
│   │   └── Sidebar.jsx           # Tailwind UI controls, file upload, stats panel
│   ├── data/
│   │   └── samples.js            # Inlined sample plot data for instant zero-latency load
│   ├── utils/
│   │   ├── geojson.js            # GeoJSON parsing, projection, normalization, area/perimeter
│   │   ├── svgParser.js          # SVG 2D path, polygon, rect parser
│   │   ├── extrusion.js          # Three.js Shape and ExtrudeGeometry generator
│   │   └── sunCalc.js            # Solar azimuth and elevation calculations
│   ├── App.jsx                   # Main layout and coordinator
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Tailwind directives & dark UI styles
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js                # Configured with relative base for GitHub Pages
└── README.md
```

---

## 🧭 Controls Guide

- **Rotate / Orbit**: Left-click and drag
- **Pan View**: Right-click and drag (or two-finger drag)
- **Zoom**: Scroll wheel or pinch-to-zoom
- **Measure Distance**: Click "Activate Tape Measure", then click any two points
- **Change View**: Use camera presets in the sidebar (3D Orbit, Top Plan, Front, Axonometric)

---

## 📄 License

MIT License © 2026 Ankit Singh.
