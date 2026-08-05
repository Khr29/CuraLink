<div align="center">

# 🩺 CuraLink
### Revolutionizing Healthcare Choices with Data

<p align="center">
An AI-powered healthcare platform that helps patients identify the right medical specialty, discover the best hospitals, securely manage health records, and make informed healthcare decisions.
</p>

![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![Express](https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![Google Maps](https://img.shields.io/badge/Google_Maps-Location-4285F4?style=for-the-badge&logo=googlemaps)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

</div>

---

# 📖 Overview

Healthcare decisions should be simple, reliable, and data-driven.

**CuraLink** is an intelligent healthcare platform designed to help patients navigate the healthcare ecosystem through AI-powered recommendations, hospital specialty rankings, digital health records, and smart appointment management.

Instead of searching randomly for hospitals or specialists, CuraLink analyzes patient symptoms, recommends the appropriate medical specialty, ranks hospitals based on expertise, and securely stores medical information in one centralized platform.

---

# 🎯 Problem Statement

Patients often struggle to:

- Find the correct specialist
- Choose the best hospital
- Store medical reports safely
- Access previous prescriptions
- Compare hospitals objectively
- Make informed healthcare decisions

CuraLink solves these challenges using AI and data-driven recommendations.

---

# 🚀 Features

## 👤 Patient Portal

- Secure Registration & Login
- AI Symptom Analysis
- Smart Specialty Recommendation
- Hospital Comparison
- Doctor Search
- Appointment Booking
- Appointment History
- Digital Medical Records
- QR-based Health Identity
- Profile Management

---

## 🩺 Doctor Portal

- Doctor Authentication
- Dashboard Analytics
- Appointment Management
- Patient Medical History
- Digital Prescriptions
- Availability Management
- Profile Editing

---

## 🏥 Hospital & Admin Portal

- Manage Doctors
- Manage Departments
- Hospital Analytics
- Appointment Monitoring
- User Management
- Reports & Insights
- Specialty Ranking Management

---

# 🤖 AI Features

CuraLink includes intelligent healthcare assistance:

- AI Symptom Analyzer
- Symptom-to-Specialty Mapping
- Hospital Recommendation Engine
- Healthcare Decision Support
- Future Disease Prediction (Planned)

---

# 🗺️ Google Maps Integration

Patients can:

- Locate nearby hospitals
- View hospital locations
- Get navigation directions
- Compare distance
- Search hospitals by specialty

---

# 🔐 Digital Health Identity

Every patient receives a secure digital identity allowing:

- Medical history storage
- Previous prescriptions
- Lab reports
- Scan reports
- Emergency information
- QR Code Health Card

---

# 🏗️ System Architecture

```
                     Patient
                        │
        ┌───────────────┴───────────────┐
        │                               │
 AI Symptom Analyzer            Hospital Search
        │                               │
        └───────────────┬───────────────┘
                        │
               Recommendation Engine
                        │
                Node.js REST API
                        │
     ┌────────────┬──────────────┬─────────────┐
     │            │              │
 MongoDB      Cloudinary     Google Maps
     │            │              │
     └────────────┴──────────────┘
```

---

# 💻 Technology Stack

## Frontend

- React.js
- Tailwind CSS
- React Router
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST API

## Database

- MongoDB
- Mongoose

## AI

- Machine Learning
- Symptom Recommendation Logic

## APIs

- Google Maps API
- Cloudinary API

---

# 📂 Project Structure

```
CuraLink

frontend/
admin/
backend/

frontend
 ├── components
 ├── pages
 ├── assets
 ├── hooks
 ├── context

backend
 ├── controllers
 ├── routes
 ├── models
 ├── middleware
 ├── config
 ├── utils

admin
 ├── pages
 ├── components
 ├── context
```

---

# 🔑 User Roles

### Patient

- Search doctors
- AI diagnosis assistance
- Book appointments
- View reports
- Manage records

### Doctor

- Manage appointments
- Issue prescriptions
- View patient history

### Admin

- Manage platform
- Add hospitals
- Add doctors
- View analytics

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/Khr29/CuraLink.git
cd CuraLink
```

Backend

```bash
cd backend
npm install
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Admin

```bash
cd admin
npm install
npm run dev
```

---

# 🔧 Environment Variables

Backend

```env
PORT=

MONGODB_URI=

JWT_SECRET=

CLOUDINARY_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_SECRET=

GOOGLE_MAPS_API_KEY=

OPENAI_API_KEY=
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected APIs
- Role-Based Authorization
- Secure Cloud Storage
- Input Validation

---

# 📊 Future Enhancements

- Video Consultation
- AI Disease Prediction
- Medical Chatbot
- ABHA Integration
- Electronic Health Records
- Voice Assistant
- Multi-language Support
- Pharmacy Integration
- Ambulance Tracking
- Health Insurance Integration

---

# 📷 Screenshots

## Home

<img width="1909" height="891" alt="image" src="https://github.com/user-attachments/assets/82a4f9fe-dfe2-4981-a31d-1d7b7f4f37fa" />


---

## Hospital Recommendation

<img width="1902" height="896" alt="image" src="https://github.com/user-attachments/assets/1bea4171-a74d-4388-a426-7d29fb4b61be" />


---

## Patient Dashboard

(Add Screenshot)

---

## Doctor Dashboard

(Add Screenshot)

---

## Admin Dashboard

<img width="1897" height="763" alt="image" src="https://github.com/user-attachments/assets/d9b08d33-9462-41f9-a082-bd237b6ccb36" />


---

# 👨‍💻 Developed By

**Khaled Taha Ahmed Al Daghan**

Computer Science Engineering Student

Visvesvaraya Technological University (VTU)

Bangalore, India

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps the project reach more developers.

---

<div align="center">

## CuraLink

### Revolutionizing Healthcare Choices with Data

Made with ❤️ by **Khaled Taha Ahmed Al Daghan**

</div>
