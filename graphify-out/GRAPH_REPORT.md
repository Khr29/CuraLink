# Graph Report - .  (2026-08-06)

## Corpus Check
- 196 files · ~252,494 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 736 nodes · 1167 edges · 91 communities (26 shown, 65 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 142 edges (avg confidence: 0.73)
- Token cost: 0 input · 1,769,138 output

## Community Hubs (Navigation)
- Admin Backend Controllers
- Frontend Assets & Doctor Cards
- Admin App Dependencies
- Frontend App Dependencies
- Backend Server Dependencies
- Admin Form Components
- Backend Config & Stats
- Frontend App Routes
- Admin App Routes
- Frontend Header & Stats UI
- Theme & Branding Docs
- Backend Review Controller
- Admin Skeleton Loaders & Context
- Admin Sidebar & Assets
- Admin Dashboard Widgets
- Admin Doctor Profile Page
- Admin Context Providers
- Admin Dialogs & Empty States
- Admin Add Hospital Page
- Admin Reviews Panel
- Admin Audit Logs
- Admin Error Boundary
- Admin Doctor Requests Page
- Admin Users List Page
- Hospital Doctor Requests Page
- Admin Sidebar Assets Bundle
- Frontend How-It-Works Section
- Admin Logo Branding
- React Logo Branding
- Vite Logo Branding (Frontend)
- Vite Logo Asset (Admin)
- Add Icon Asset
- Appointment Icon Asset
- Appointments Icon Asset
- Cancel Icon Asset
- CuraLink Logo (Admin)
- Doctor Icon Asset
- Earning Icon Asset
- Home Icon Asset
- Patient Icon Asset
- Patients Icon Asset
- People Icon Asset
- Tick Icon Asset
- Upload Area Icon (Admin)
- About Page Hero Image
- Appointment Hero Image
- Arrow Icon Asset
- Chats Icon Asset
- Contact Page Hero Image
- Cross Icon Asset
- CuraLink Logo (Frontend)
- Dermatologist Specialty Icon
- Doctor Photo doc10
- Doctor Photo doc11
- Doctor Photo doc12
- Doctor Photo doc13
- Doctor Photo doc14
- Doctor Photo doc15
- Doctor Photo doc1
- Doctor Photo doc2
- Doctor Photo doc3
- Doctor Photo doc4
- Doctor Photo doc5
- Doctor Photo doc6
- Doctor Photo doc7
- Doctor Photo doc8
- Doctor Photo doc9
- Dropdown Icon Asset
- Gastroenterologist Specialty Icon
- General Physician Specialty Icon
- Group Profiles Graphic
- Gynecologist Specialty Icon
- Homepage Header Image
- Info Icon Asset
- Frontend Logo Branding
- Menu Icon Asset
- Neurologist Specialty Icon
- MediLink Brand Graphic
- Pediatricians Specialty Icon
- Profile Picture Placeholder
- Razorpay Payment Logo
- Stripe Payment Logo
- Upload Area Placeholder (Frontend)
- Upload Icon Asset
- Verified Badge Icon

## God Nodes (most connected - your core abstractions)
1. `logAction()` - 36 edges
2. `AppContext` - 20 edges
3. `HospitalContext` - 17 edges
4. `AdminContext` - 16 edges
5. `CuraLink Project README` - 16 edges
6. `StarRating()` - 12 edges
7. `SkeletonRow()` - 10 edges
8. `CuraLink Design System (Theme Doc)` - 10 edges
9. `DoctorContext` - 9 edges
10. `assets` - 7 edges

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

## Communities (91 total, 65 thin omitted)

### Community 0 - "Admin Backend Controllers"
Cohesion: 0.06
Nodes (71): addDoctor(), adminDashboard(), allDoctors(), allUsers(), appointmentCancel(), appointmentsAdmin(), changeUserStatus(), deleteDoctor() (+63 more)

### Community 1 - "Frontend Assets & Doctor Cards"
Cohesion: 0.05
Nodes (36): assets, doctors, specialityData, FEATURES, HospitalCard, navLinks, RatingDistribution(), ReviewCard (+28 more)

### Community 2 - "Admin App Dependencies"
Cohesion: 0.04
Nodes (45): dependencies, axios, lucide-react, react, react-dom, react-router-dom, react-toastify, tailwindcss (+37 more)

### Community 3 - "Frontend App Dependencies"
Cohesion: 0.04
Nodes (45): autoprefixer, dependencies, axios, react, react-dom, react-router-dom, react-toastify, devDependencies (+37 more)

### Community 4 - "Backend Server Dependencies"
Cohesion: 0.04
Nodes (44): author, dependencies, bcrypt, cloudinary, compression, cors, dotenv, express (+36 more)

### Community 5 - "Admin Form Components"
Cohesion: 0.10
Nodes (10): FormCard(), FormInput(), formFocusHandlers, formInputStyle, formLabelStyle, HospitalContext, DEPARTMENT_LIST, selectStyle (+2 more)

### Community 6 - "Backend Config & Stats"
Cohesion: 0.08
Nodes (28): connectCloudinary(), connectDB(), getPlatformStats(), bookAppointment(), cancelAppointment(), getProfie(), listAppointment(), loginUser() (+20 more)

### Community 7 - "Frontend App Routes"
Cohesion: 0.07
Nodes (19): About, App(), Appointments, Contact, Doctors, Home, HospitalDetails, Hospitals (+11 more)

### Community 8 - "Admin App Routes"
Cohesion: 0.07
Nodes (26): AddDoctor, AddHospital, AdminDoctorRequests, AllAppointments, AuditLogs, Dashboard, DoctorAppointment, DoctorDashboard (+18 more)

### Community 9 - "Frontend Header & Stats UI"
Cohesion: 0.09
Nodes (16): HeroStatCard(), TRUST, StatCard(), Stats(), useCountUp(), useInView(), Banner, FAQS (+8 more)

### Community 10 - "Theme & Branding Docs"
Cohesion: 0.10
Nodes (26): Admin App HTML Entry Point (index.html), Admin App README (Vite+React template), CuraLink Design System (Theme Doc), CuraLink Badge Styles, CuraLink Button Styles, CuraLink Card Styling Spec, CuraLink Color Palette (Navy/Blue/Teal system), CuraLink Gradient Tokens (+18 more)

### Community 11 - "Backend Review Controller"
Cohesion: 0.18
Nodes (21): addReview(), deleteMyReview(), deleteReview(), editMyReview(), getAllReviewsAdmin(), getDoctorReviews(), getHospitalReviews(), getMyReviews() (+13 more)

### Community 12 - "Admin Skeleton Loaders & Context"
Cohesion: 0.16
Nodes (5): SkeletonRow(), SkeletonStatGrid(), AppContext, AppContextProvider(), selectStyle

### Community 13 - "Admin Sidebar & Assets"
Cohesion: 0.21
Nodes (6): assets, ROLE_BADGE, AdminContext, DoctorContext, LOGIN_ROUTES, ROLE_ACCENT

### Community 15 - "Admin Doctor Profile Page"
Cohesion: 0.15
Nodes (3): inputErrorStyle, inputStyle, STATUS_BADGE

### Community 16 - "Admin Context Providers"
Cohesion: 0.18
Nodes (6): App(), AdminContextProvider(), DoctorContextProvider(), HospitalContextProvider(), inputStyle, labelStyle

### Community 18 - "Admin Add Hospital Page"
Cohesion: 0.20
Nodes (5): DEPARTMENT_LIST, FACILITY_LIST, INITIAL_HOSPITAL_STATE, inputStyle, labelStyle

### Community 20 - "Admin Audit Logs"
Cohesion: 0.29
Nodes (4): ACTOR_ICONS, ACTOR_TYPES, selectStyle, STATUSES

### Community 22 - "Admin Doctor Requests Page"
Cohesion: 0.33
Nodes (3): selectStyle, STATUS_TABS, TYPE_ICON

### Community 25 - "Admin Sidebar Assets Bundle"
Cohesion: 0.50
Nodes (4): assets.js (admin asset registry), List Icon (SVG), AdminSidebar.jsx, Dashboard.jsx (Admin)

## Ambiguous Edges - Review These
- `List Icon (SVG)` → `Dashboard.jsx (Admin)`  [AMBIGUOUS]
  admin/src/assets/list_icon.svg · relation: references

## Knowledge Gaps
- **263 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `List Icon (SVG)` and `Dashboard.jsx (Admin)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Admin App HTML Entry Point (index.html)` connect `Theme & Branding Docs` to `Admin Context Providers`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `Frontend App HTML Entry Point (index.html)` connect `Theme & Branding Docs` to `Frontend App Routes`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Backend Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.05690834473324213 - nodes in this community are weakly interconnected._
- **Should `Frontend Assets & Doctor Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.05063291139240506 - nodes in this community are weakly interconnected._
- **Should `Admin App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._