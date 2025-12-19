# HOMEGENIE AI

An **AI‑driven smart home system** that predicts energy consumption, simulates real‑time sensor data, and autonomously controls household devices using **machine learning + contextual intelligence**.

Built as a **hackathon‑ready, explainable AI system** with clear separation between:
- User dashboard (observability)
- Control dashboard (AI supervision & overrides)

---

## Features

### AI Agent
- Uses a trained ML model for **energy prediction**
- Applies **rule‑based safety & efficiency constraints**
- Refines predictions using **real‑time sensor context**
- Fully **explainable decisions** (why a device changed state)

### Dashboards
#### User Dashboard
- Live device states by room
- Predicted energy usage
- Weather context
- Read‑only, safe for end users

#### Control Dashboard
- Run AI agent manually
- View AI decision logs
- Human‑in‑the‑loop device overrides
- Energy prediction **time‑series graph**
- ML + sensor transparency

### Sensor Simulation
- Time‑based occupancy patterns
- Indoor temperature drift
- AC cooling effects
- Weather‑aware behavior

### Machine Learning
- Trained on real **Kaggle energy dataset**
- Linear regression baseline model
- Runtime predictions refined using live sensor data

---

## System Architecture

```
Kaggle Dataset ──▶ ML Training ──▶ model.json
                                      │
Weather (API / Simulated) ────────────┤
Sensor Simulation ────────────────────┤
Time Context ─────────────────────────┤
                                      ▼
                             AI Agent Engine
                                      │
                       ┌──────────────┴──────────────┐
                       ▼                               ▼
              User Dashboard                    Control Dashboard
```

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts (graphs)

### Backend
- Node.js
- Express
- TypeScript
- In‑memory state stores

### ML
- Custom Linear Regression (TypeScript)
- CSV‑based training pipeline
- JSON‑exported model weights

---

## Project Structure

```
root/
├── client/                # Next.js frontend
│   └── src/app/
│       ├── dashboard/     # User dashboard
│       └── control/       # Control dashboard
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── agent/         # AI agent logic
│   │   ├── ml/            # ML training & inference
│   │   ├── routes/        # API routes
│   │   ├── services/      # Weather & sensor simulation
│   │   ├── store/         # In‑memory data stores
│   │   └── models/        # Type definitions
│   └── data/              # CSV datasets
│
└── README.md
```

---

## Setup Instructions

### Clone the repository
```bash
git clone <repo-url>
cd <repo>
```

### Backend setup
```bash
cd server
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

---

### Frontend setup
```bash
cd client
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

### Environment variables

**client/.env.local**
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

**server/.env** (optional)
```env
OPENWEATHER_API_KEY=your_key_here
```
> If no weather API key is provided, the system automatically uses **simulated weather**.

---

## How Energy Prediction Works

1. **ML Baseline**
   - Predicts appliance‑level energy usage
   - Uses historical dataset patterns

2. **Sensor‑Aware Adjustment**
   - Indoor temperature
   - Room occupancy
   - Real‑time context

3. **Final Output**
   - Adjusted kWh value
   - Risk classification (LOW / MEDIUM / HIGH)
   - Displayed in graph and dashboards

This mirrors **real‑world smart energy systems** where ML is combined with live sensor data.

---

## AI Decision Rules (Simplified)

1. **Safety First**
   - Occupied + very hot → AC must turn ON

2. **Efficiency**
   - Empty room → devices turn OFF

3. **Weather Awareness**
   - Cool outdoor temperature → AC OFF

4. **ML‑Guided Optimization**
   - High predicted energy → increase AC temperature

---