# Sculpted Smiles | Digital Dental Laboratory

An interactive 3D digital dental laboratory web application built with **Three.js** and **Vite**, showcasing CAD/CAM workflows, intraoral scan processing, 3D additive resin printing, and precision zirconia ceramic restorations.

---

## 🚀 Quick Start (Running the Project)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18 or higher recommended).

### 2. Install Dependencies
Open your terminal in the project root directory and run:

```bash
npm install
```

### 3. Start Development Server
To run the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:5173
```
*(or the network URL displayed in your terminal)*

---

## 📜 All Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server on port `5173` |
| `npm run build` | Compiles and bundles assets into the `dist/` directory for production |
| `npm run preview` | Locally serves the production build in `dist/` to verify before deployment |

---

## 🛠️ Tech Stack

- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **UI & Styling**: Vanilla CSS & Modern Responsive Design
- **Interactions**: Custom Three.js viewport controls, journey stations, HUD telemetry, and case submission workflow

---

## 📁 Project Structure

```
dentail-lab-3d/
├── dist/               # Production build output (after running npm run build)
├── public/             # Static public assets and textures
├── src/
│   ├── three/          # Three.js 3D scene, materials, lighting, models & animations
│   ├── ui/             # Navigation, form handlers, HUD and micro-animations
│   ├── main.js         # Application bootstrap & 3D viewer initialization
│   └── style.css       # Core design system, layout, and component styles
├── index.html          # Main HTML entry point
├── package.json        # Project metadata and script configurations
├── vite.config.js      # Vite dev server and build configuration
└── README.md           # Documentation & running instructions
```

---

## 🌐 Browser Requirements
- Any modern WebGL 2.0 compatible browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- Hardware acceleration enabled for optimal 60 FPS 3D rendering.
