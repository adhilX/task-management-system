# TaskFlow — Enterprise Agile Task & Project Management System

TaskFlow is a production-ready, full-stack, enterprise-grade Agile Project and Task Management System. Built using clean architectural patterns and modern frameworks, it empowers teams to plan workspaces, delegate tasks using a visual Kanban interface, manage rosters, track real-time activity metrics, and customize their interface theme under a highly optimized environment.

---

## ✨ Key Features

### 1. User Authentication & RBAC (Role-Based Access Control)
*   **Secure Authentication:** Secure JWT-based signup, login, and password management using `bcrypt` password hashing.
*   **Token Rotation:** Automatic silent token refresh mechanism to maintain user sessions securely without interruptions.
*   **Role-Based Validation:** Fine-grained authorization differentiating **System Administrators** and **Employees**:
    *   **System Admins:** Full control over workspace setups, employee onboarding directories, project updates, master dashboard metrics, and task delegations.
    *   **Employees:** Access to their dedicated Kanban boards to view assigned tasks, update completion states, and update profile passwords.
*   **Lock Status System:** Master setup is locked automatically once the initial administrator logs in, preventing unauthorized configuration bypasses.

### 2. Project Workspace Management
*   **Workspace Creator:** Interactive screens to plan projects, set deadlines (start & due dates), delegate Project Managers, and assign team lists.
*   **State Tracker:** Visual states to track projects across phases: `Planning`, `Active`, `Completed`, and `On Hold`.
*   **Interactive Search & Filters:** Fast, real-time live search queries and status filters to explore project directories.

### 3. Visual Kanban Task Boards
*   **Interactive Task Board:** Visual task boards grouping tasks by statuses: `Todo`, `In Progress`, `Review`, and `Completed`.
*   **Task Metadata:** Rich task details including Title, Descriptions, Priorities (`Low`, `Medium`, `High`), Due Dates, Assignees, and Parent Project mappings.
*   **Agile Mutations:** Modals to create new tasks, update details, transfer assignees, or change statuses dynamically.

### 4. Team Roster & Onboarding
*   **Employee Directory:** Centralized table displaying registered team members, their department (e.g., Engineering, Design, Product, Marketing), active status, and join date.
*   **Invite-Link Onboarding:** Admins send unique invitation link tokens via email, enabling new employees to securely configure their profile password and activate their account.

### 5. Stats & Real-time Analytics
*   **Executive Summaries:** Interactive metric dashboards for active projects, total tasks, and completion rate calculations.
*   **Recent Action Logs:** Chronological real-time update histories displaying task progress updates, assignees, and timestamps.

### 6. Premium Theme System & Micro-Animations
*   **Themed Dark & Light Modes:** Smooth, state-of-the-art styling supporting Violet-OLED Dark Mode and Minimalist Light Mode toggles.
*   **Visual Transitions:** Premium circular ripple (hole reveal) views powered by the CSS View Transitions API.
*   **Micro-Animations:** Fluid CSS waving-hand greetings, real-time blinking clock colons, hover-responsive scale-ups, and inline skeletal loaders.

---

## 🛠️ Tech Stack

### Frontend Client
*   **Core Framework:** Next.js 16 (App Router)
*   **View Library:** React 19
*   **Styling Engine:** Tailwind CSS v4 & PostCSS (Custom theme variables and HSL tokens)
*   **Data Synchronization:** TanStack React Query v5 & Axios interceptors
*   **Form Management:** React Hook Form + Zod Schema Validation
*   **Icon Pack:** Lucide React
*   **State Store:** Zustand (Auth states for Admins and Users)
*   **Language:** TypeScript

### Backend API Server
*   **Core Engine:** Node.js + Express.js
*   **Architecture:** Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
*   **Database:** MongoDB via Mongoose ODM
*   **API Specs:** Swagger / OpenAPI 3.0 via `swagger-jsdoc` & `swagger-ui-express`
*   **Authentication:** JWT Token validation (cookies / headers) & `bcrypt` cryptography
*   **Request Validation:** Joi validation middleware schemas
*   **Mailing Engine:** Nodemailer SMTP integration for invite delivery
*   **Security:** Helmet, CORS, and Express Rate Limiter
*   **Language:** TypeScript

---

## 📁 Project Structure

```text
task-management-system/
├── frontend/                     # Next.js Client Application
│   ├── app/                      # Next.js App Router (Layouts, Portals, Views)
│   │   ├── (auth)/               # Auth pages (login, register, invite activation)
│   │   ├── admin/                # Admin Portal views & settings
│   │   ├── dashboard/            # Employee Dashboard views & profiles
│   │   ├── globals.css           # Tailwind v4 import & Custom Theme overrides
│   │   └── layout.tsx            # App root, viewport, & theme hydration script
│   ├── components/               # Reusable UI (Sidebar, ThemeToggle, Modals)
│   ├── services/                 # API service modules (Axios client requests)
│   ├── stores/                   # Zustand authentication stores
│   ├── utils/                    # Client helper functions (cookie handlers)
│   ├── public/                   # Static assets & icons
│   └── package.json              # Frontend manifest & dependencies
│
├── backend/                      # Express.js API Server
│   ├── src/
│   │   ├── domain/               # Enterprise Core Business Logic
│   │   │   ├── entities/         # Domain model entities
│   │   │   ├── enums/            # System-wide Enums (Roles, Statuses)
│   │   │   ├── errors/           # Custom Domain errors
│   │   │   └── repositories/     # Interface contracts for repositories
│   │   │
│   │   ├── application/          # Use Cases & Application Services
│   │   │   ├── use-cases/        # Business workflows (auth, users, tasks, projects)
│   │   │   └── services/         # Interface contracts (email, tokens, hashing)
│   │   │
│   │   ├── infrastructure/       # External Systems & Implementations
│   │   │   ├── database/         # Mongoose ODM schemas & repositories
│   │   │   ├── email/            # Nodemailer SMTP transporter implementation
│   │   │   └── security/         # Cryptography & JWT token implementations
│   │   │
│   │   ├── presentation/         # Express Adapters & HTTP Layers
│   │   │   ├── controllers/      # Route handler controllers
│   │   │   ├── routes/           # Endpoint path mappings (/api/v1/...)
│   │   │   ├── middlewares/      # Rate limiters, JWT verification, error filters
│   │   │   ├── validation/       # Joi request validation schemas
│   │   │   ├── dtos/             # Data Transfer Objects mapping domain entities
│   │   │   └── swagger.ts        # OpenAPI config properties
│   │   │
│   │   ├── app.ts                # Express app config, middlewares & dependency setup
│   │   └── main.ts               # Server bootstrap entry point
│   │
│   ├── package.json              # Backend manifest & dependencies
│   └── tsconfig.json             # TypeScript compiler settings
│
└── README.md                     # Root Project Documentation
```

---

## ⚙️ Local Installation & Configuration

### Prerequisites
*   Node.js (v18+)
*   npm / yarn
*   A running MongoDB instance (Local community database or MongoDB Atlas URI)

### 1. Clone the Workspace
```bash
git clone <repository-url>
cd task-management-system
```

### 2. Configure Environment Variables

#### Backend API (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-management
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# SMTP Details for Onboarding Invitations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS="your_gmail_app_password"
SMTP_FROM="TaskFlow" <your_email@gmail.com>
```

#### Frontend Client (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Installation and Bootstrapping

Open two separate terminals to launch the backend and frontend servers:

#### Running the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will start in development mode, listening on **[http://localhost:5000](http://localhost:5000)**.

#### Running the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
The application will launch on **[http://localhost:3000](http://localhost:3000)**.

---

## 📖 OpenAPI / Swagger API Specifications

When the backend server is running locally, you can inspect and execute test requests on the endpoints using the interactive OpenAPI/Swagger web documentation:

🔗 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**  
🔗 **[http://localhost:5000/api/v1/docs](http://localhost:5000/api/v1/docs)**
