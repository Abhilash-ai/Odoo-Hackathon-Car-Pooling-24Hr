# 🚗 ODOO COMMUTE — Enterprise Mobility Platform (India Edition)

> **"Turn empty seats into smarter, sustainable commutes across corporate India."**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Web%20App-Vercel-10b981?style=for-the-badge&logo=vercel)](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)
[![Live Backend API](https://img.shields.io/badge/⚙️%20Live%20Backend%20API-Render-000000?style=for-the-badge&logo=render)](https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health)
[![GitHub Repository](https://img.shields.io/badge/📦%20GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 🌐 LIVE DEPLOYMENT LINKS

- **⚡ Live Web Application (Vercel)**: [https://odoo-hackathon-car-pooling-24-hr.vercel.app/](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)
- **⚙️ Live Backend API Service (Render)**: [https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health](https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health)
- **📦 GitHub Source Repository**: [https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git](https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git)

---

## 🔑 1-CLICK JUDGING SANDBOX CREDENTIALS

| Persona Role | Email / Login | Password | Location & Vehicle Context |
|---|---|---|---|
| **Company Administrator** | `admin@odoo.demo` | `password123` | Corporate Command Center • 35-Staff Analytics |
| **Marcus Vance (Driver)** | `driver@odoo.demo` | `password123` | Honda City (`MH-31-FA-9021`, 17.5 km/L Petrol) |
| **Priya Sharma (Women-Only Driver)** | `female.driver@odoo.demo` | `password123` | Tata Nexon EV (`MH-31-EV-8842`, 7.5 km/kWh) • **Women-Only** |
| **Elena Rostova (Passenger)** | `employee@odoo.demo` | `password123` | Senior Designer • Commuter Profile & Bookings |

---

## 📋 FEATURE VERIFICATION MATRIX

| Feature Category | Implementation Status | Technical Highlights & Verification Notes |
|---|---|---|
| **Employee Auth & Registration** | ✅ **Verified** | JWT authentication, BCrypt hashing, 4-digit OTP registration verification |
| **Find Ride Engine** | ✅ **Verified** | Nagpur/Pune route search with date, time, seats, and ₹ INR pricing |
| **Offer Ride Publishing** | ✅ **Verified** | Mileage validation, vehicle selection, polyline route calculation |
| **OSRM Road Routing** | ✅ **Verified** | OpenStreetMap driving engine produces true road polylines (weight: 6, green stroke) |
| **Seat Allocation & Booking** | ✅ **Verified** | Atomic database transaction (`$transaction`), seat decrement, overbooking prevention |
| **Boarding Verification OTP** | ✅ **Verified** | 4-digit Boarding OTP (`4829`) required before driver can initiate live trip tracking |
| **Live Trip Motion Tracking** | ✅ **Verified** | Smooth Leaflet GPS marker animation along road polylines with live ETA countdowns |
| **Women-Only Safety Filter** | ✅ **Verified** | Optional `🔒 WOMEN ONLY` flag with server-side 403 HTTP enforcement for non-female users |
| **Digital Wallet & Top-Up** | ✅ **Verified** | Ledger debit/credit, balance top-up, transaction history, insufficient balance guards |
| **Card & UPI Payment** | ⚠️ **Sandbox / Demo** | Realistic test checkout interface supporting Card details & UPI VPA validation |
| **Cash Payment Option** | ✅ **Verified** | Records `CASH_PENDING` transaction state for direct cash settlement upon trip end |
| **Employee Analytics** | ✅ **Verified** | Click any employee in Admin roster to view 7-day distance charts & cost savings |
| **Organization-Wide Impact** | ✅ **Verified** | Aggregates pooled distance (`151 km`), fuel avoided (`8.6 L`), CO₂ prevented (`29 kg`) |
| **Encrypted Trip Chat** | ✅ **Verified** | Socket.IO realtime trip messaging between driver and passenger |
| **Voice Call Interaction** | ⚠️ **Partial / Demo** | Encrypted voice call modal with Ringing, Connected timer (`00:05`), Mute/Speaker toggles |
| **Saved Places Module** | ✅ **Verified** | Manage Home, Office, and custom locations with quick-select commute integration |
| **Help & Support Module** | ✅ **Verified** | FAQ accordions (Finding/Offering rides, Safety OTP, Payments) + Support contact form |
| **Settings Module** | ✅ **Verified** | Working navigation hub linking to Trips, Vehicles, Payment preferences, History & Support |
| **Light & Dark Mode** | ✅ **Verified** | Global theme switching (`☀️/🌙`) across all screens, Leaflet map tiles, and Recharts graphs |

---

## 🇮🇳 KEY PRODUCT DIFFERENTIATORS

1. **100% Indian Geographic Context**: All map views, seeded data, routes, and live GPS tracking are centered on **India** (Nagpur, Pune, Bengaluru, Mumbai). Zero foreign city placeholders.
2. **OSRM Real Road Geometry**: OpenStreetMap driving routing engine produces actual road polylines (`weight: 6`, `color: #10b981`) following continuous road geometry instead of straight lines.
3. **🔒 Women-Only Safety Enforcement**: Drivers can publish rides with the `🔒 WOMEN ONLY` safety flag enabled. Only verified female employees can view and book seats on these rides. Server-side validation rejects non-eligible requests with HTTP 403.
4. **🔐 Boarding Verification OTP**: A 4-digit Boarding Verification OTP (`4829`) is generated upon booking and must be verified before the driver can start live trip tracking.
5. **💰 Mileage & Fuel Cost Transparency**: All monetary values throughout the app use **₹ INR**. Includes mileage-based fuel cost calculations (`km/L` or `km/kWh`) and configurable Indian fuel rates (`Petrol: ₹101.50/L`, `Diesel: ₹92.00/L`, `CNG: ₹78.00/kg`, `EV: ₹12.00/kWh`).
6. **📊 Interactive Employee Commute Drilldown**: Tapping any employee row in the Admin Roster opens their individual 7-day distance Recharts graph, profile summary, wallet balance, and completed trip log.

---

## 🛠️ TECHNICAL ARCHITECTURE & STACK

```
       ┌────────────────────────────────────────────────────────┐
       │             FE: React 18 + Vite + Tailwind             │
       │    Leaflet Maps (OSRM Routing) + Recharts + Lucide     │
       └───────────────────────────┬────────────────────────────┘
                                   │  HTTP / WebSocket (Socket.IO)
       ┌───────────────────────────▼────────────────────────────┐
       │          BE: Node.js + Express + TypeScript            │
       │     JWT Authentication + Express Router + Cors         │
       └───────────────────────────┬────────────────────────────┘
                                   │  Prisma ORM Client
       ┌───────────────────────────▼────────────────────────────┐
       │             DB: SQLite Relational Engine               │
       │   Users • Vehicles • Rides • Bookings • Trips • Wallet │
       └────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, React-Leaflet, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Socket.IO, BCrypt.js, JsonWebToken
- **Database**: SQLite (via Prisma ORM with seed data for 35 Indian employees, 10 fleet vehicles, 25 completed trips)
- **Mapping Service**: OpenStreetMap + OSRM Driving Engine (`https://router.project-osrm.org/`)

---

## 🎬 QUICK PRESENTATION WORKFLOW

1. Open **[Live Web App](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)**.
2. Click **"1-Click Demo Login -> Marcus Vance (Driver)"**.
3. Open **Live Commute** -> Observe active commute from **Nagpur Railway Station to Dharampeth Tech Campus**.
4. Click **"Start Trip Now"** / **"Simulate GPS Motion"** -> Watch car marker move smoothly along Nagpur route polyline with live ETA countdowns.
5. Click **"Safety & SOS"** -> Show live trip status link copying and emergency alert simulation.
6. Click **Theme Switcher (`☀️/🌙`)** -> Test seamless global Light and Dark mode transitions across all screens, Leaflet map tiles, and analytics.
7. Switch persona to **Priya Sharma (Women-Only Driver)** -> Demonstrate **"Women-Only Ride"** toggle and Tata Nexon EV Max (`7.5 km/kWh`).
8. Switch persona to **Company Admin** -> Review Recharts analytics, department breakdown, and tap any employee row for individual commute & cost drilldown.

---

## 💻 LOCAL DEVELOPMENT INSTRUCTIONS

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9.x` or `v10.x`

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git
cd Odoo-Hackathon-Car-Pooling-24Hr

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Database Setup & Seed
```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Local Dev Servers
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend App (Port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser to access the local application.
