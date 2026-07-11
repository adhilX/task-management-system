# TaskFlow — Agile Task & Project Management System

TaskFlow is a production-ready, full-stack agile project and task management application. It is designed to help teams collaborate, track project progress, assign tasks, and manage team members within a high-performance workspace.

---

## 🚀 Key Features

### 1. User Authentication & RBAC (Role-Based Access Control)
*   **Secure Authentication:** Secure JWT-based signup, login, and password management (using bcrypt hashing).
*   **Role Validation:** Fine-grained authorization differentiating **Admin** and **Employee** roles. Admins have privileges for creating/modifying/deleting projects, managing employees, and assignment changes, while Employees focus on their assigned boards.

### 2. Project Spaces
*   **Workspace Creation:** Interactive board to plan new workspaces, define timelines (start & end dates), designate Project Managers, and assign team members.
*   **Project Overview:** Quick cards showing project status (Planning, Active, Completed, On Hold), manager, and team size.
*   **Live Filtering:** Quick search bar and status filters for agile exploration.

### 3. Task Management (Kanban Board)
*   **Interactive Task Boards:** Visual boards grouping tasks by state (`Todo`, `In Progress`, `Review`, `Done`).
*   **Task Details:** Tracks title, detailed description, priority levels (`Low`, `Medium`, `High`), due dates, assignees, and parent projects.
*   **Agile Workflows:** Streamlined forms to create, edit, reassign, or update task progress.

### 4. Employee Directory
*   **Team Roster:** Full directory of registered team members displaying their email, role, department (e.g., Engineering, Design, Product), status (Active/Inactive), and join date.
*   **User Provisioning:** Admin controls to onboard new team members or update employee details/roles.

### 5. Stats & Analytics Dashboard
*   **Visual Metrics:** Sleek `StatsCard` metrics showing at-a-glance active projects, total tasks, completed items, and active users.
*   **Recent Activity:** Chronological overview of latest tasks and updates assigned to the logged-in user.

### 6. Custom Design System
*   Built entirely on a custom CSS design system using curated, modern aesthetics (deep dark modes, vibrant HSL gradients, subtle hover micro-animations).
*   Utilizes reusable core UI components:
    *   `Card` & `StatsCard` (Consistent glassmorphic layouts)
    *   `Badge` (Glow-effect state and status labels)
    *   `Modal` (Fully responsive modal backdrops)
    *   `ConfirmationDialog` (Safety alerts for delete cascades)
    *   `EmptyState` (No-data feedback states with actions)
    *   `Breadcrumbs` & `UserMenu` (Fluid navigation aids)
    *   `Loading Skeleton` (Visual loading states for cards and tables)

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** Next.js 16 (App Router)
*   **Library:** React 19
*   **Styling:** Tailwind CSS v4 & PostCSS (Custom theme definitions & HSL variables)
*   **Data Fetching & Cache Sync:** TanStack React Query (React Query v5) & Axios
*   **Form Management:** React Hook Form + Zod (Schema validation)
*   **Icons:** Lucide React
*   **Language:** TypeScript

### Backend
*   **Framework:** NestJS 11 (Progressive TypeScript Node.js framework)
*   **Database:** MongoDB via Mongoose ODM
*   **API Documentation:** Swagger / OpenAPI 3.0
*   **Authentication:** Passport.js with JWT Strategy
*   **Validation:** class-validator & class-transformer
*   **Environment Management:** ConfigModule + Joi validation schema
*   **Language:** TypeScript

---

## 📁 Project Structure

```text
task-management-system/
├── frontend/                 # Next.js App Client
│   ├── src/
│   │   ├── app/             # Routing pages (dashboard, login, register, etc.)
│   │   ├── components/      # Global providers & reusable shared UI components
│   │   ├── context/         # React Authentication context
│   │   ├── hooks/           # Custom client hooks
│   │   ├── lib/             # API client instances (Axios config)
│   │   └── types/           # TS Interfaces & schemas
│   └── package.json
│
├── backend/                  # NestJS API Server
│   ├── src/
│   │   ├── auth/            # Auth controller, JWT strategy, services
│   │   ├── users/           # User database schema & employee services
│   │   ├── projects/        # Project schema, management, and validations
│   │   ├── tasks/           # Task schemas, assignments, and mutations
│   │   └── main.ts          # Server bootstrap entry point
│   └── package.json
└── README.md                 # Project Documentation (This file)
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   npm / yarn / pnpm
*   MongoDB instance (local installation or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone <repository-url>
cd task-management-system
```

### 2. Configure Environment Variables

#### Backend Server (`backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h
```

#### Frontend Client (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Run

#### Backend Setup
```bash
cd backend
npm install
npm run start:dev  # Runs in watch mode on port 5000
```

#### Frontend Setup
```bash
cd ../frontend
npm install
npm run dev        # Runs dev server on http://localhost:3000
```

---

## 📖 API Documentation (Swagger)

When the backend server is running, you can access the interactive Swagger OpenAPI documentation to explore and test the endpoints directly from the browser:

🔗 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm run test       # Run Unit tests
npm run test:e2e   # Run End-to-End tests
npm run test:cov   # Check Test Coverage
```
