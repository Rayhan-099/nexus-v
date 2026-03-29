# 🏎️ Nexus-V: Unified Automotive Service Ecosystem

Nexus-V is a premium, high-fidelity platform designed to consolidate automotive services into a single, cohesive digital experience. From automated car wash queues to AI-validated repair proofs and smart EV charging management, Nexus-V is the "Pro-Max" solution for modern vehicle owners and service partners.

![Nexus-V Client Dashboard](/C:/Users/khanr/.gemini/antigravity/brain/693b7457-dbc1-4328-ade4-c9d690d5a273/nexus_v_client_dashboard_1774793250081.png)

---

## 🌟 Key Features

### 👤 For Customers (Client App)
- **Split-Screen Authentication**: Modern, high-impact entry flow with brand-focused visuals.
- **Bento Grid Dashboard**: High-density information display for quick access to services.
- **QuickWash Queue**: Join digital lines at partner locations and track your position in real-time.
- **EV Station Array**: Monitor and book available charging slots with live status updates.
- **Trust Engine**: View AI-validated photographic evidence of repairs to ensure total transparency.

### 🏢 For Partners (Partner Portal)
- **Bento Command Center**: A professional-grade interface to manage live operations.
- **Queue Management**: Active controls to advance or add vehicles to the digital wash queue.
- **AI Proof Upload**: Capture and upload repair evidence directly to the Trust Engine for customer validation.
- **Hardware Monitoring**: Live telemetry for EV charging hubs and station health.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite**
- **Tailwind CSS v4** (Advanced glassmorphism & custom utility layers)
- **Framer Motion** (Fluid page transitions & micro-interactions)
- **Lucide React** (Premium iconography)
- **Zustand** (Lightweight state management)

### Backend
- **Node.js** & **Express**
- **Socket.IO** (Real-time bi-directional telemetry)
- **MongoDB** (Persistant storage for Users, Partners, and Service History)
- **JWT** (Secure, role-based authentication)

---

## 📂 Project Structure

```text
nexus-v/
├── client-app/           # React Frontend for Customers (Port 5173)
├── partner-dashboard/    # React Frontend for Service Partners (Port 5174)
├── backend-core/         # Node.js API & Socket Server (Port 5000)
├── trust-engine/         # Python/OpenCV logic (Placeholder)
└── docs/                 # Project documentation & walkthroughs
```

---

## 🚦 Getting Started (Whole Steps)

### Prerequisites
- **Node.js**: [Download and install](https://nodejs.org/) (v16.x or higher recommended).
- **MongoDB**: You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier) or a local MongoDB instance.
- **Git**: To clone the repository.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/nexus-v.git
   cd nexus-v
   ```

2. **Setup Backend Core:**
   Navigate to the backend directory, install dependencies, and configure environment variables.
   ```bash
   cd backend-core
   npm install
   ```
   Create a `.env` file in `backend-core/` and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Setup Client Application:**
   Open a new terminal, navigate to `client-app/`, and start the development server.
   ```bash
   cd client-app
   npm install
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

4. **Setup Partner Dashboard:**
   Open another terminal, navigate to `partner-dashboard/`, and start the development server.
   ```bash
   cd partner-dashboard
   npm install
   npm run dev
   ```
   The dashboard will be available at [http://localhost:5174](http://localhost:5174).

---

## 📸 visual Overview

### Advanced Layout Distribution
We've moved away from standard "centered" forms to high-impact **Split-Screen** and **Bento Grid** designs.

| Feature | Visual Preview |
| :--- | :--- |
| **Partner Auth** | ![Partner Register](/C:/Users/khanr/.gemini/antigravity/brain/693b7457-dbc1-4328-ade4-c9d690d5a273/partner_register_split_screen_1774793941186.png) |
| **Partner Bento Grid** | ![Partner Dashboard](/C:/Users/khanr/.gemini/antigravity/brain/693b7457-dbc1-4328-ade4-c9d690d5a273/partner_dashboard_bento_grid_1774794013245.png) |

---

## 🚀 Future Roadmap
- [x] **Phase 1**: Core MVP & Socket System
- [x] **Phase 2**: JWT Authentication & Role-based access
- [x] **Phase 3**: Premium UI/UX Overhaul (Pro-max Aesthetics)
- [ ] **Phase 4**: Stripe Payment Integration (Test Mode)
- [ ] **Phase 5**: Advanced Gemini AI Vision for the Trust Engine (Automated damage assessment)

---

Developed with ❤️ for the Automotive Future.
**Nexus-V Team**
