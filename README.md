# ODOO COMMUTE — Enterprise Mobility Platform (India Edition)

> **"Turn empty seats into smarter commutes across India."**

ODOO COMMUTE is a production-ready **Enterprise Carpooling & Shared Mobility Platform** designed specifically for employees of registered corporate organizations in India. It optimizes daily workplace commutes, reduces corporate fuel expenses, promotes sustainability, and provides real-time vehicle tracking.

---

## 🇮🇳 Features & Architecture Overview

- **100% Indian Geographic Context**: All map views, seeded data, routes, and live GPS tracking are centered on **India** (Nagpur, Pune, Bengaluru, Mumbai). Zero foreign city placeholders.
- **Primary Demo Route**: `Nagpur Railway Station -> Sitabuldi -> Dharampeth Tech Campus` (`4.8 km`, `₹40 / seat`).
- **₹ INR Currency & Fuel Cost Transparency**: All monetary values throughout the app use **₹ INR**.
- **Vehicle Mileage & Fuel Rates**: Stored mileage (`km/L` or `km/kWh`) and configurable Indian fuel prices (`Petrol: ₹101.50/L`, `Diesel: ₹92.00/L`, `CNG: ₹78.00/kg`, `EV: ₹12.00/kWh`).
- **Women-Only Safety Option & Server-Side Enforcement**: Optional `🔒 WOMEN ONLY` safety flag when offering rides with strict server-side booking rejection (HTTP 403) for non-eligible users.
- **OTP Verification System**: 6-digit OTP verification dialog during Sign Up and sensitive actions with 30s resend cooldown, 3-attempt limits, and deterministic Hackathon Demo Mode (`123456`).
- **Global Light & Dark Mode System**: Complete global theme switching (`☀️/🌙`) across all screens, modals, dynamic GIS map tiles (CartoDB Voyager / CartoDB Dark Matter), and Recharts graphs.
- **Responsive Mobile Navigation**: Clean top navigation bar for desktop and fixed bottom bar (`MobileNav`) for mobile screens.

---

## 🔑 1-Click Judging Sandbox Credentials

| Persona Role | Email / Login | Password | Location & Vehicle Context |
|---|---|---|---|
| **Company Administrator** | `admin@odoo.demo` | `password123` | Analytics & Indian Fuel Price Configs |
| **Marcus Vance (Driver)** | `driver@odoo.demo` | `password123` | Honda City (`MH-31-FA-9021`, 17.5 km/L Petrol) |
| **Priya Sharma (Women-Only Driver)** | `female.driver@odoo.demo` | `password123` | Tata Nexon EV (`MH-31-EV-8842`, 7.5 km/kWh) • **Women-Only** |
| **Elena Rostova (Passenger)** | `employee@odoo.demo` | `password123` | Female Senior Designer |

---

## 🎬 Quick Presentation Workflow

1. Open **`http://localhost:5173`**.
2. Click **"1-Click Demo Login -> Marcus Vance (Driver)"**.
3. Open **Live Commute** -> Observe active commute from **Nagpur Railway Station to Dharampeth Tech Campus**.
4. Click **"Start Trip Now"** / **"Simulate GPS Motion"** -> Watch car marker move smoothly along Nagpur route polyline with live ETA countdowns.
5. Click **"Safety & SOS"** -> Show live trip status link copying and emergency alert simulation.
6. Click **Theme Switcher (`☀️/🌙`)** -> Test seamless global Light and Dark mode transitions across all screens, Leaflet map tiles, and analytics.
7. Switch persona to **Priya Sharma (Women-Only Driver)** -> Demonstrate **"Women-Only Ride"** toggle and Tata Nexon EV Max (`7.5 km/kWh`).
8. Switch persona to **Company Admin** -> Review Recharts analytics and Indian fuel price configuration inputs (`Petrol ₹/L`, `Diesel ₹/L`, `CNG ₹/kg`, `EV ₹/kWh`).
