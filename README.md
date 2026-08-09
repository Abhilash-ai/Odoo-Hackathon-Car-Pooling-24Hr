# 🚗 ODOO COMMUTE — Enterprise Mobility Platform (India Edition)

> **"Turn empty seats into smarter, sustainable commutes across India."**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Web%20App-Vercel-10b981?style=for-the-badge&logo=vercel)](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)
[![Live Backend API](https://img.shields.io/badge/⚙️%20Live%20Backend%20API-Render-000000?style=for-the-badge&logo=render)](https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health)
[![GitHub Repository](https://img.shields.io/badge/📦%20GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git)

---

## 🌐 LIVE DEPLOYMENT LINKS

- **⚡ Live Web Application**: [https://odoo-hackathon-car-pooling-24-hr.vercel.app/](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)
- **⚙️ Live Backend Service**: [https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health](https://odoo-hackathon-car-pooling-24hr.onrender.com/api/health)
- **📦 GitHub Repository**: [https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git](https://github.com/Abhilash-ai/Odoo-Hackathon-Car-Pooling-24Hr.git)

---

## 🔑 1-CLICK JUDGING SANDBOX CREDENTIALS

| Persona Role | Email / Login | Password | Location & Vehicle Context |
|---|---|---|---|
| **Company Administrator** | `admin@odoo.demo` | `password123` | Corporate Operations • Organization-Wide Impact |
| **Marcus Vance (Driver)** | `driver@odoo.demo` | `password123` | Honda City (`MH-31-FA-9021`, 17.5 km/L Petrol) |
| **Priya Sharma (Women-Only Driver)** | `female.driver@odoo.demo` | `password123` | Tata Nexon EV (`MH-31-EV-8842`, 7.5 km/kWh) • **Women-Only** |
| **Elena Rostova (Passenger)** | `employee@odoo.demo` | `password123` | Senior Designer • Passenger Bookings |

---

## 🇮🇳 Features & Architecture Overview

- **100% Indian Geographic Context**: All map views, seeded data, routes, and live GPS tracking are centered on **India** (Nagpur, Pune, Bengaluru, Mumbai). Zero foreign city placeholders.
- **Primary Demo Route**: `Nagpur Railway Station -> Sitabuldi -> Dharampeth Tech Campus` (`4.8 km`, `₹40 / seat`).
- **OSRM Real Road Geometry**: OpenStreetMap driving routing engine produces actual road polylines (`weight: 6`, `color: #10b981`) following continuous road geometry instead of straight lines.
- **₹ INR Currency & Fuel Cost Transparency**: All monetary values throughout the app use **₹ INR**.
- **Vehicle Mileage & Fuel Rates**: Stored mileage (`km/L` or `km/kWh`) and configurable Indian fuel prices (`Petrol: ₹101.50/L`, `Diesel: ₹92.00/L`, `CNG: ₹78.00/kg`, `EV: ₹12.00/kWh`).
- **Women-Only Safety Option**: Optional `🔒 WOMEN ONLY` safety flag when offering rides with strict server-side booking rejection (HTTP 403) for non-eligible users.
- **Boarding Verification OTP System**: 4-digit Boarding Verification OTP (`4829`) required before driver can initiate trip tracking.
- **Interactive Employee Commute Drilldown**: Click any employee in Admin Roster to view individual 7-day distance charts, wallet balance, recent trip history, and CO₂ prevented.
- **Global Light & Dark Mode System**: Complete global theme switching (`☀️/🌙`) across all screens, modals, Leaflet map tiles, and Recharts graphs.

---

## 🎬 Quick Presentation Workflow

1. Open **[Live Web App](https://odoo-hackathon-car-pooling-24-hr.vercel.app/)**.
2. Click **"1-Click Demo Login -> Marcus Vance (Driver)"**.
3. Open **Live Commute** -> Observe active commute from **Nagpur Railway Station to Dharampeth Tech Campus**.
4. Click **"Start Trip Now"** / **"Simulate GPS Motion"** -> Watch car marker move smoothly along Nagpur route polyline with live ETA countdowns.
5. Click **"Safety & SOS"** -> Show live trip status link copying and emergency alert simulation.
6. Click **Theme Switcher (`☀️/🌙`)** -> Test seamless global Light and Dark mode transitions across all screens, Leaflet map tiles, and analytics.
7. Switch persona to **Priya Sharma (Women-Only Driver)** -> Demonstrate **"Women-Only Ride"** toggle and Tata Nexon EV Max (`7.5 km/kWh`).
8. Switch persona to **Company Admin** -> Review Recharts analytics, department breakdown, and tap any employee row for individual commute & cost drilldown.
