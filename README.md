<div align="center">

# 🩺 Medilink
### Doctor Appointment Booking Platform

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **Book · Manage · Heal**
>
> A production-ready full-stack doctor appointment booking platform — where patients book instantly, doctors manage seamlessly, and admins oversee everything from one place.

<br/>

**[🚀 Live Demo – Patient Portal](https://your-vercel-url.vercel.app)** · **[⚙️ Admin Panel](https://your-admin-url.vercel.app)** · **[📦 Backend API](https://your-render-url.onrender.com)**

<br/>

[✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [🛠️ Tech Stack](#️-tech-stack) · [⚡ Quick Start](#-quick-start) · [📡 API Reference](#-api-reference) · [🔮 Roadmap](#-roadmap)

</div>

---

## 🎯 What Is Medilink?

Booking a doctor appointment shouldn't require a phone call. **Medilink** brings the entire experience online — patients find doctors, book slots, and pay securely in minutes. Doctors get a personal dashboard to manage their schedule and earnings. Admins control the entire platform from a single panel.

Built on the **MERN Stack** with **Razorpay payments** and **Cloudinary media storage**, Medilink is a complete, deployment-ready healthcare booking solution.

---

## ✨ Features

### 👤 Patient Portal
- Secure registration & login with JWT
- Browse & search doctors by specialty
- Book appointments with available time slots
- Online payment via Razorpay
- View complete appointment history
- Cancel appointments
- Edit profile & upload profile photo

### 🩺 Doctor Dashboard
- Dedicated doctor login & profile
- Earnings overview & analytics
- View & manage all appointments
- Access patient details per appointment
- Update availability & profile info

### 🛡️ Admin Panel
- Platform-wide dashboard & analytics
- Add, edit & manage doctor listings
- Monitor all appointments across the platform
- Track total system earnings
- Real-time platform activity overview

---

## 🏗️ Architecture

```
┌──────────────────────┐    ┌──────────────────────┐
│   Patient Frontend   │    │    Admin Panel        │
│   React + Tailwind   │    │   React + Tailwind    │
└──────────┬───────────┘    └──────────┬────────────┘
           │                           │
           └──────────┬────────────────┘
                      │ REST API (JWT Auth)
           ┌──────────▼────────────────┐
           │      Backend API          │
           │   Node.js + Express.js    │
           └──────────┬────────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
┌───────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
│   MongoDB    │ │Razorpay │ │ Cloudinary  │
│    Atlas     │ │Payments │ │   Media     │
└──────────────┘ └─────────┘ └─────────────┘
```

### Design Principles
- **3-App Architecture** — Patient frontend, Admin panel, and Backend are independently deployable
- **Role-Based Access** — Separate auth flows for Patient, Doctor, and Admin
- **Service Isolation** — Payments, media, and database are independent services
- **Cloud-Native** — Built for Vercel + Render + MongoDB Atlas from day one

---

## 📁 Project Structure

```
Medilink/
│
├── frontend/                        # Patient Website (React)
│   └── src/
│       ├── pages/                   # Home, Doctors, Appointments
│       ├── components/              # Navbar, DoctorCard, etc.
│       ├── context/                 # Global state management
│       └── assets/
│
├── admin/                           # Admin + Doctor Panel (React)
│   └── src/
│       ├── pages/
│       │   ├── admin/               # Dashboard, Doctors, Appointments
│       │   └── doctor/              # Doctor dashboard, earnings
│       ├── components/
│       └── context/
│
└── backend/                         # Node.js API Server
    └── src/
        ├── controllers/             # Auth, Doctors, Appointments, Payments
        ├── models/                  # User, Doctor, Appointment schemas
        ├── routes/                  # API route definitions
        ├── middlewares/             # JWT auth, role guards
        └── config/                  # DB, Cloudinary, Razorpay config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Patient Frontend** | React.js, Tailwind CSS, React Router, Axios |
| **Admin Panel** | React.js, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Payments** | Razorpay Payment Gateway |
| **Media Storage** | Cloudinary (CDN-backed) |
| **Deployment** | Vercel (Frontend) + Render (Backend) + MongoDB Atlas |

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Razorpay account (test keys)
- Cloudinary account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/medilink.git
cd medilink
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Patient portal runs on `http://localhost:5173`

### 4. Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

Admin panel runs on `http://localhost:5174`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Frontend
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/user/register` | Patient | Register new patient |
| `POST` | `/user/login` | Patient | Patient login |
| `POST` | `/doctor/login` | Doctor | Doctor login |
| `POST` | `/admin/login` | Admin | Admin login |

### Appointment Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/user/appointments` | Patient | Get my appointments |
| `POST` | `/user/book-appointment` | Patient | Book an appointment |
| `POST` | `/user/cancel-appointment` | Patient | Cancel appointment |
| `GET` | `/doctor/appointments` | Doctor | Get doctor's appointments |
| `GET` | `/admin/appointments` | Admin | Get all appointments |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/user/payment-razorpay` | Initiate Razorpay payment |
| `POST` | `/user/verify-razorpay` | Verify payment & confirm booking |

---

## 💳 Payment Flow

```
Patient selects slot
        ↓
Razorpay checkout opens
        ↓
Payment processed securely
        ↓
Webhook verifies payment
        ↓
Appointment confirmed ✅
```

---

## ☁️ Media Handling

All profile images (patients & doctors) are stored on **Cloudinary**:
- Automatic optimization & compression
- CDN-backed fast delivery globally
- Secure upload with signed URLs
- No server storage required

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT tokens with expiry |
| Role Guards | Middleware-based RBAC for Patient / Doctor / Admin |
| Payment Security | Razorpay signature verification on every transaction |
| Media Security | Cloudinary signed uploads |
| Password Storage | Bcrypt hashing |

---

## 🔮 Roadmap

- [x] JWT role-based authentication (Patient / Doctor / Admin)
- [x] Doctor listing & appointment booking
- [x] Razorpay payment integration
- [x] Cloudinary profile image upload
- [x] Admin & Doctor dashboards
- [x] Appointment cancellation
- [ ] 🎥 Video consultation (WebRTC)
- [ ] 📧 Email notifications (booking confirmation, reminders)
- [ ] ⭐ Doctor ratings & reviews
- [ ] ⏰ Appointment reminders (SMS / Push)
- [ ] 💬 Real-time chat (Socket.io)
- [ ] 📱 Mobile app (React Native)
- [ ] 🔍 Advanced doctor search & filters

---

## 💡 Key Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| 3-App structure | Patient, Admin, Backend independently deployable & scalable |
| JWT over sessions | Stateless auth — works seamlessly across Vercel + Render |
| Cloudinary for media | Eliminates server storage; CDN ensures fast global delivery |
| Razorpay over Stripe | Better support for Indian payment ecosystem |
| MongoDB Atlas | Managed cloud DB — zero ops overhead for MVP |

---

                                                   Home Page

<img width="1918" height="905" alt="Image" src="https://github.com/user-attachments/assets/2cbaceda-db06-4139-9003-4be8f332a149" />
                                                                
                                                  Book Appointment

<img width="1917" height="917" alt="Image" src="https://github.com/user-attachments/assets/5ead53ce-c14c-41c7-87e1-e2e84e146938" />

                                        Admin & Doctor Dashboard login & SingUp

<img width="1918" height="911" alt="Image" src="https://github.com/user-attachments/assets/92f32964-79ee-4ced-8157-35d655cee20e" />

                                                   Admin Dashboard

<img width="1917" height="832" alt="Image" src="https://github.com/user-attachments/assets/9b49730a-3e67-4f64-bb96-0a52b8c03585" />

                                                    Doctor Dashboard

<img width="1911" height="846" alt="Image" src="https://github.com/user-attachments/assets/6cc3233e-568b-48e5-819c-0d50b4ed5d61" />

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by Aneesh Yadav**

*Full Stack Developer · MERN Stack · Node.js · React · MongoDB · Razorpay · Cloudinary*

⭐ **If this project helped you, give it a star!** ⭐

</div>
