# Graph Report - .  (2026-08-07)

## Corpus Check
- 133 files · ~284,782 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 997 nodes · 1937 edges · 111 communities (47 shown, 64 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Component Library
- Backend Dependencies
- Admin App Routing
- User Auth & Booking
- Frontend App Routing
- Form UI Components
- Admin Controller
- Admin Sidebar & Layout
- Hospital Controller
- Shared Auth Handlers
- Profile UI Primitives
- Design System Docs
- Frontend Dependencies
- Structured Prescriptions
- Frontend Assets & Header
- Doctor Controller & Routes
- Review Controller
- Marketing Components
- Hospital Dashboard Widgets
- Reviews & Star Rating
- Appointment Review Flow
- Patient Portal Layout
- Session & Token Management
- Patient Portal Dashboard
- Dev Dependencies
- Stats & Data Models
- Doctor Scheduling
- Home Page Sections
- Lint/Build Tooling
- Doctor Appointments UI
- Hospital Patient Detail View
- Hospital Add-Hospital Form
- Route Mounting & Cloudinary
- Role Auth Middleware
- Admin Package Manifest
- Frontend Package Manifest
- Tailwind CSS Config
- Hospital Reviews Page
- Frontend Stats Widget
- Patient Prescriptions Page
- Phone Input & Register
- Audit Log System
- Recent Reviews Widget
- Admin Assets & Sidebar
- Hospital Departments Page
- Vite React Plugin
- How It Works Section
- Admin Branding Assets
- React Logo Asset
- Vite Logo (Frontend)
- Vite Logo (Admin)
- Add Icon Asset
- Appointment Icon Asset
- Appointments Icon Asset
- Cancel Icon Asset
- CuraLink Admin Logo
- Doctor Icon Asset
- Earning Icon Asset
- Home Icon Asset
- Patient Icon Asset
- Patients Icon Asset
- People Icon Asset
- Tick Icon Asset
- Upload Area Icon
- About Page Image
- Appointment Hero Image
- Arrow Icon Asset
- Chats Icon Asset
- Contact Page Image
- Close Icon Asset
- CuraLink Frontend Logo
- Dermatologist Icon Asset
- Doctor Photo (doc10)
- Doctor Photo (doc11)
- Doctor Photo (doc12)
- Doctor Photo (doc13)
- Doctor Photo (doc14)
- Doctor Photo (doc15)
- Doctor Photo (doc1)
- Doctor Photo (doc2)
- Doctor Photo (doc3)
- Doctor Photo (doc4)
- Doctor Photo (doc5)
- Doctor Photo (doc6)
- Doctor Photo (doc7)
- Doctor Photo (doc8)
- Doctor Photo (doc9)
- Dropdown Icon Asset
- Gastroenterologist Icon Asset
- General Physician Icon
- Group Profiles Image
- Gynecologist Icon Asset
- Header Hero Image
- Info Icon Asset
- Frontend Logo Asset
- Hamburger Menu Icon
- Neurologist Icon Asset
- MediLink Logo Graphic
- Pediatricians Icon Asset
- Profile Placeholder Image
- Razorpay Logo Asset
- Stripe Logo Asset
- Upload Placeholder Image
- Upload Icon Asset
- Verified Badge Icon

## God Nodes (most connected - your core abstractions)
1. `logAction()` - 54 edges
2. `AppContext` - 28 edges
3. `sanitizeText()` - 23 edges
4. `HospitalContext` - 20 edges
5. `AdminContext` - 17 edges
6. `CuraLink Project README` - 16 edges
7. `issueSession()` - 15 edges
8. `validatePasswordStrength()` - 13 edges
9. `revokeSession()` - 12 edges
10. `signAccessToken()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `CuraLink Project README` --conceptually_related_to--> `Admin App README (Vite+React template)`  [INFERRED]
  README.md → admin/README.md
- `CuraLink Project README` --conceptually_related_to--> `Frontend App README (Vite+React template)`  [INFERRED]
  README.md → frontend/README.md
- `CuraLink Design System (Theme Doc)` --conceptually_related_to--> `Admin App HTML Entry Point (index.html)`  [INFERRED]
  CURALINK_THEME.md → admin/index.html
- `CuraLink Design System (Theme Doc)` --conceptually_related_to--> `Frontend App HTML Entry Point (index.html)`  [INFERRED]
  CURALINK_THEME.md → frontend/index.html
- `CuraLink Project README` --conceptually_related_to--> `Admin App HTML Entry Point (index.html)`  [INFERRED]
  README.md → admin/index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design System Alignment Across Frontend & Admin Apps** — curalink_theme, admin_index, frontend_index [INFERRED 0.75]
- **CuraLink Three-App Monorepo (frontend/admin/backend)** — readme, frontend_index, admin_index [INFERRED 0.75]
- **AI Symptom Analyzer + Hospital Search Feed the Recommendation Engine** — readme_ai_symptom_analyzer, readme_hospital_search, readme_recommendation_engine [EXTRACTED 1.00]

## Communities (111 total, 64 thin omitted)

### Community 0 - "UI Component Library"
Cohesion: 0.06
Nodes (15): SkeletonCard(), SkeletonRow(), SkeletonStatGrid(), AdminContext, ACTOR_ICONS, ACTOR_TYPES, selectStyle, STATUSES (+7 more)

### Community 1 - "Backend Dependencies"
Cohesion: 0.04
Nodes (46): author, dependencies, bcrypt, cloudinary, compression, cookie-parser, cors, dotenv (+38 more)

### Community 2 - "Admin App Routing"
Cohesion: 0.05
Nodes (34): AddDoctor, AddHospital, AdminDoctorRequests, AllAppointments, AuditLogs, Dashboard, DoctorAppointment, DoctorDashboard (+26 more)

### Community 3 - "User Auth & Booking"
Cohesion: 0.09
Nodes (34): makeListSessionsHandler(), makeRefreshTokenHandler(), makeRevokeSessionHandler(), bookAppointment(), cancelAppointment(), getProfie(), listAppointment(), loginUser() (+26 more)

### Community 4 - "Frontend App Routing"
Cohesion: 0.05
Nodes (28): About, App(), Appointments, Contact, Dashboard, Doctors, ForgotPassword, Home (+20 more)

### Community 5 - "Form UI Components"
Cohesion: 0.11
Nodes (14): FormCard(), FormInput(), formFocusHandlers, formInputStyle, formLabelStyle, ImageUploadSlot(), DAY_NAMES, defaultWeeklyPattern() (+6 more)

### Community 6 - "Admin Controller"
Cohesion: 0.13
Nodes (33): addDoctor(), adminDashboard(), allDoctors(), allUsers(), appointmentCancel(), appointmentsAdmin(), changeUserStatus(), deleteDoctor() (+25 more)

### Community 7 - "Admin Sidebar & Layout"
Cohesion: 0.14
Nodes (16): App(), assets, PROFILE_PATH, ROLE_BADGE, AdminContextProvider(), DoctorContext, DoctorContextProvider(), HospitalContextProvider() (+8 more)

### Community 8 - "Hospital Controller"
Cohesion: 0.12
Nodes (26): addHospital(), changeHospitalStatus(), deleteHospital(), deleteHospitalGalleryImage(), DOCTOR_SELF_EDITABLE_FIELDS, getAllHospitals(), getHospitalById(), getHospitalSelfAppointments() (+18 more)

### Community 9 - "Shared Auth Handlers"
Cohesion: 0.15
Nodes (23): issueEmailVerificationOtp(), makeChangePasswordHandler(), makeForgotPasswordHandler(), makeLogoutAllHandler(), makeResetPasswordHandler(), makeSendVerificationOtpHandler(), makeVerifyEmailHandler(), changeHospitalSelfPassword() (+15 more)

### Community 10 - "Profile UI Primitives"
Cohesion: 0.13
Nodes (19): blurDefault(), Field(), focusTeal(), inputErrorStyle, inputStyle, RequestBadge(), SectionCard(), StarRow() (+11 more)

### Community 11 - "Design System Docs"
Cohesion: 0.10
Nodes (26): Admin App HTML Entry Point (index.html), Admin App README (Vite+React template), CuraLink Design System (Theme Doc), CuraLink Badge Styles, CuraLink Button Styles, CuraLink Card Styling Spec, CuraLink Color Palette (Navy/Blue/Teal system), CuraLink Gradient Tokens (+18 more)

### Community 12 - "Frontend Dependencies"
Cohesion: 0.09
Nodes (27): dependencies, axios, lucide-react, react, react-dom, react-phone-number-input, react-router-dom, react-toastify (+19 more)

### Community 13 - "Structured Prescriptions"
Cohesion: 0.14
Nodes (22): DRUG_FORMS, FREQUENCIES, ROUTES, TIMING_OPTIONS, addAttachment(), amendRecord(), canView(), finalizeRecord() (+14 more)

### Community 14 - "Frontend Assets & Header"
Cohesion: 0.11
Nodes (12): assets, doctors, specialityData, TRUST, accountMenuItems, Navbar(), navLinks, COLORS (+4 more)

### Community 15 - "Doctor Controller & Routes"
Cohesion: 0.14
Nodes (17): appointmentCancel(), appointmentComplete(), appointmentsDoctor(), changeAvailability(), doctorDashboard(), doctorList(), doctorProfile(), loginDoctor() (+9 more)

### Community 16 - "Review Controller"
Cohesion: 0.23
Nodes (19): addReview(), deleteMyReview(), deleteReview(), editMyReview(), getAllReviewsAdmin(), getDoctorReviews(), getHospitalReviews(), getMyReviews() (+11 more)

### Community 17 - "Marketing Components"
Cohesion: 0.13
Nodes (5): FEATURES, HospitalCard, DoctorCard, AppContext, departments

### Community 18 - "Hospital Dashboard Widgets"
Cohesion: 0.12
Nodes (4): QuickAction(), selectStyle, StatCard(), DoctorDashboard()

### Community 19 - "Reviews & Star Rating"
Cohesion: 0.13
Nodes (10): ReviewForm(), SIZES, DoctorCard, specialities, formatDate(), months, MyAppointments(), formatSlotDate() (+2 more)

### Community 20 - "Appointment Review Flow"
Cohesion: 0.25
Nodes (9): EmptyState(), RatingDistribution(), ReviewList(), WriteReviewCTA(), Appointments(), daysOfWeek, HospitalDetails(), formatExperience() (+1 more)

### Community 21 - "Patient Portal Layout"
Cohesion: 0.16
Nodes (9): PortalLayout(), menuItems, calculateAge(), MyProfile(), formatDate(), MedicalRecordsPage(), RecordDetailModal(), deviceLabel() (+1 more)

### Community 22 - "Session & Token Management"
Cohesion: 0.26
Nodes (13): refreshTokenSchema, clearCookieOptions(), REFRESH_COOKIE_NAMES, refreshCookieOptions(), issueSession(), readCookieToken(), requestMeta(), revokeSession() (+5 more)

### Community 23 - "Patient Portal Dashboard"
Cohesion: 0.19
Nodes (10): PortalStatCard(), computeProfileCompletion(), Dashboard(), formatSlotDate(), months, iconFor(), NotificationsPage(), timeAgo() (+2 more)

### Community 24 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): eslint-plugin-react-hooks, globals, @types/react-dom, eslint-plugin-react-hooks, globals, @types/react-dom, autoprefixer, devDependencies (+8 more)

### Community 25 - "Stats & Data Models"
Cohesion: 0.17
Nodes (8): getPlatformStats(), appointmentSchema, hospitalSchema, reviewSchema, statsRouter, main(), recomputeDoctorRating(), slotDateFor()

### Community 26 - "Doctor Scheduling"
Cohesion: 0.18
Nodes (14): canManageSchedule(), canViewSchedule(), findScheduleForDoctor(), getAvailableSlots(), getSchedule(), setDoctorEditPermission(), SLOT_DURATIONS, slotDateKey() (+6 more)

### Community 27 - "Home Page Sections"
Cohesion: 0.12
Nodes (10): Banner, FAQS, FeaturedHospitals, HowItWorks, RecentReviews, SpecialityMenu, Stats, TESTIMONIALS (+2 more)

### Community 28 - "Lint/Build Tooling"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-refresh, @types/react, vite, eslint, @eslint/js (+7 more)

### Community 29 - "Doctor Appointments UI"
Cohesion: 0.19
Nodes (7): AppContext, AppContextProvider(), composePrescriptionSummary(), EMPTY_ROW, MedicalRecordModal(), normalizeRow(), selectStyle

### Community 30 - "Hospital Patient Detail View"
Cohesion: 0.20
Nodes (9): appointmentStatus(), attachmentIcon(), calculateAge(), formatDateTime(), formatSlotDate(), HospitalPatientDetail(), months, STATUS_STYLES (+1 more)

### Community 31 - "Hospital Add-Hospital Form"
Cohesion: 0.18
Nodes (6): CuraLinkPhoneInput(), DEPARTMENT_LIST, FACILITY_LIST, INITIAL_HOSPITAL_STATE, inputStyle, labelStyle

### Community 32 - "Route Mounting & Cloudinary"
Cohesion: 0.17
Nodes (9): generalApiLimiter, adminRouter, doctorRouter, hospitalRouter, medicalRecordRouter, reviewRouter, scheduleRouter, userRouter (+1 more)

### Community 33 - "Role Auth Middleware"
Cohesion: 0.40
Nodes (5): authAdmin(), authDoctor(), authHospital(), authUser(), anyStaffAuth()

### Community 34 - "Admin Package Manifest"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 35 - "Frontend Package Manifest"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 36 - "Tailwind CSS Config"
Cohesion: 0.22
Nodes (8): tailwindcss, @tailwindcss/vite, tailwindcss, dependencies, tailwindcss, @tailwindcss/vite, tailwindcss, @tailwindcss/vite

### Community 39 - "Patient Prescriptions Page"
Cohesion: 0.57
Nodes (7): downloadPrescriptionPdf(), formatDate(), medDose(), MedicationCard(), medName(), PrescriptionDetail(), PrescriptionsPage()

### Community 41 - "Audit Log System"
Cohesion: 0.47
Nodes (4): buildFilter(), exportAuditLogs(), getAuditLogs(), auditLogSchema

### Community 43 - "Admin Assets & Sidebar"
Cohesion: 0.50
Nodes (4): assets.js (admin asset registry), List Icon (SVG), AdminSidebar.jsx, Dashboard.jsx (Admin)

### Community 45 - "Vite React Plugin"
Cohesion: 0.67
Nodes (3): @vitejs/plugin-react, @vitejs/plugin-react, @vitejs/plugin-react

## Ambiguous Edges - Review These
- `List Icon (SVG)` → `Dashboard.jsx (Admin)`  [AMBIGUOUS]
  admin/src/assets/list_icon.svg · relation: references

## Knowledge Gaps
- **278 isolated node(s):** `selectStyle`, `DEPARTMENT_LIST`, `selectStyle`, `auditLogSchema`, `hospitalRequestSchema` (+273 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `List Icon (SVG)` and `Dashboard.jsx (Admin)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Frontend App HTML Entry Point (index.html)` connect `Design System Docs` to `Frontend App Routing`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `Admin App HTML Entry Point (index.html)` connect `Design System Docs` to `Admin Sidebar & Layout`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **What connects `selectStyle`, `DEPARTMENT_LIST`, `selectStyle` to the rest of the system?**
  _278 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.06103896103896104 - nodes in this community are weakly interconnected._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Admin App Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._