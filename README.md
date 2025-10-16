


# 🏆 FTS Champ CRM

A modern, full-featured **Customer Relationship Management (CRM)** system built with **React + Vite**, designed for seamless donor, receipt, membership, and school management with advanced reporting and admin tools.

---

## 📁 Project Structure

```

sajid-tech-fts-champ-crm/
├── README.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── index.html
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── api/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   └── utils/
└── backup/

````

---

## 🚀 Features

- 🔐 **Authentication**
  - Login, Logout, Forgot Password, Change Password
  - Protected Routes with Role-Based Access

- 📊 **Dashboard**
  - Clean analytics dashboard with visual reports using Chart.js

- 🧾 **Donor & Receipt Management**
  - Create, Edit, and View individual and company donors
  - Receipt creation, drafts, and timeline management

- 🏫 **School Management**
  - School list, allotments, and donor allocations
  - Dynamic shimmer loaders for seamless data loading

- 🧠 **Reports Module**
  - 10DB Statement, Donor, Promoter, School, Receipt reports
  - Data filtering, export, and detailed views

- ⚙️ **Master Settings**
  - Manage chapters, designations, OTS, FAQ, and viewers
  - Super Admin & Admin separation

- 🧩 **Membership Management**
  - Active/Inactive member lists and dashboards

- 📦 **Reusable Components**
  - Modular UI components built using Radix UI + ShadCN + TailwindCSS
  - Includes buttons, dialogs, loaders, tables, accordions, forms, etc.

- 🧠 **Utilities & Hooks**
  - Custom hooks for API, mutations, media queries, smooth scrolling, and more

---

## 🛠️ Tech Stack

| Category | Tools / Libraries |
|-----------|------------------|
| **Frontend** | React 18, Vite |
| **UI Framework** | Tailwind CSS, ShadCN, Radix UI |
| **State & Data** | React Query, React Hook Form |
| **Routing** | React Router DOM |
| **Charts & Visualization** | Chart.js, react-chartjs-2 |
| **Utilities** | Axios, Moment.js, jsPDF, html2canvas, XLSX |
| **Icons** | Lucide React, React Icons |
| **Auth & Cookies** | js-cookie, crypto-js |
| **Animation** | Framer Motion |

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sajid-tech/fts-champ-crm.git
````

2. **Navigate into the project**

   ```bash
   cd sajid-tech-fts-champ-crm
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

6. **Preview production build**

   ```bash
   npm run preview
   ```

---

## 🧩 Folder Highlights

### `/src/app/`

Contains all feature modules (auth, donor, receipt, report, membership, etc.).

### `/src/components/`

Reusable UI components and domain-specific components such as:

* `loader/` → Loaders and shimmer effects
* `master-settings/` → Admin configuration pages
* `common/` → Shared UI helpers

### `/src/hooks/`

Custom React hooks for API, mutations, and UI behaviors.

### `/src/routes/`

Application routing setup with protected routes and path constants.

### `/src/utils/`

Helper functions for date handling, donor type logic, encryption, etc.

---

## 🧱 Development Standards

* Code follows **ESLint** and **Prettier** formatting rules.
* UI adheres to a **consistent design system** using Tailwind and ShadCN components.
* Each module is self-contained for scalability and maintainability.

---

## 📦 Available NPM Scripts

| Script            | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start development server     |
| `npm run build`   | Build project for production |
| `npm run preview` | Preview built app locally    |
| `npm run lint`    | Run ESLint for code linting  |

---

## 🔒 Environment Configuration

Create an `.env` file in the root directory for API and configuration variables:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_ENV=development
```

---

## 🧑‍💻 Developer Info

**Project Name:** FTS Champ CRM
**Version:** 3.0.8
**Developed by:** Sajid Tech
**Frontend Framework:** React (Vite + Tailwind + ShadCN)

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use and modify for your own CRM systems.

---

## 🌟 Acknowledgements

* [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [React Query](https://tanstack.com/query)
* [ShadCN/UI](https://ui.shadcn.com/)
* [Radix UI](https://www.radix-ui.com/)
* [Lucide Icons](https://lucide.dev/)


---


https://documenter.getpostman.com/view/7456368/2sB3QJMA9H#ccfc09d2-3e7e-44d6-b644-fd6b6329863f