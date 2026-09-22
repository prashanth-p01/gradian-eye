# GuardianEye — AI Disaster Search, Survivor Intelligence & Rescue Decision-Support Platform

GuardianEye is an advanced, offline-first disaster search-and-rescue intelligence platform for earthquakes, building collapses, floods, landslides, industrial accidents, and other large-scale disasters.

## 🚀 Quick Start

Launch both the Node.js Express backend and React Vite frontend dev server:

```bash
node run_all.js
```
or double-click `start.bat`.

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Express Backend APIs**: [http://localhost:5000](http://localhost:5000)

## 🛠️ Architecture

- **Backend**: Node.js + Express.js + WebSockets (`ws`)
- **Frontend**: React 18 + Vite + Tailwind CSS + Leaflet Maps
- **Database**: SQLite (`data/guardianeye.db`) + Supabase Cloud PostgreSQL client
- **AI & Simulation**: Pure JS engines for YOLO simulation, persistent object tracking, multi-modal sensor fusion, disaster risk calculation, explainable priority rationale, route optimizer, and food safety screening.
