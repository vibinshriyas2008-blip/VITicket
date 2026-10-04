# 🎟️ VITicket • Campus Event Ticketing & QR Check-In System

> **A production-ready full-stack event registration, cryptographic QR ticketing, automated email dispatch, and real-time organizer admission verification platform for campus communities.**

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Prerequisites & Installation](#6-prerequisites--installation)
7. [MongoDB Setup (Atlas, Local, & Zero-Config In-Memory)](#7-mongodb-setup)
8. [Email Provider Setup (SMTP & Ethereal Live Preview)](#8-email-provider-setup)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [How to Run the Backend Server](#10-how-to-run-the-backend-server)
11. [How to Run the Frontend Client](#11-how-to-run-the-frontend-client)
12. [Pre-Seeded Demo Test Accounts](#12-pre-seeded-demo-test-accounts)
13. [How to Create an Organizer Account](#13-how-to-create-an-organizer-account)
14. [How to Create an Event](#14-how-to-create-an-event)
15. [How to Register as a Student](#15-how-to-register-as-a-student)
16. [How to Test Email Delivery](#16-how-to-test-email-delivery)
17. [How to Scan QR Codes (Webcam, File Upload, & Manual)](#17-how-to-scan-qr-codes)
18. [How to Test Duplicate Scanning (Anti-Duplicate Check-In)](#18-how-to-test-duplicate-scanning)
19. [How to Test Invalid & Wrong Event QR Tokens](#19-how-to-test-invalid--wrong-event-qr-tokens)
20. [REST API Documentation](#20-rest-api-documentation)
21. [Security & Anti-Fraud Architecture](#21-security--anti-fraud-architecture)
22. [Deployment & GitHub Submission Guide](#22-deployment--github-submission-guide)

---

## 1. Project Overview

**VITicket** is an enterprise-grade campus event ticketing platform engineered to eliminate paper waste, eliminate event overbooking through atomic concurrency guards, and protect against counterfeit passes using cryptographically signed HMAC-SHA256 QR tokens.

Designed for university campus environments (hackathons, symposiums, guest lectures, cultural fests), VITicket delivers seamless registration for students and real-time gate admission control with live audio/visual feedback for event organizers.

---

## 2. Key Features

- **Dynamic Event Discovery**: Live catalog with full-text search, category filters, and real-time seat availability indicators (`AVAILABLE`, `ALMOST FULL`, `REGISTRATION CLOSED`).
- **Atomic Concurrency Protection**: Race-condition-safe capacity enforcement using MongoDB conditional atomic operations (`$expr: { $lt: ['$registeredCount', '$capacity'] }`). Guarantees an event can never exceed its limit even under simultaneous registrations.
- **Cryptographically Signed Ticket Tokens**: QR passes embed tamper-proof HMAC-SHA256 signed payloads containing `{ ticketId, eventId, studentId, issuedAt }`.
- **Automated HTML Email Delivery**: Sends responsive email passes with embedded high-resolution QR codes, venue directions, and entry guidelines using Nodemailer (with instant Ethereal preview links for zero-configuration testing).
- **Multi-Modal Organizer Gate Scanner**:
  - Live webcam optical QR code scanner.
  - Image file upload scanner (scans QR screenshots directly).
  - Manual token verification input fallback.
- **4-State Real-Time Verification Engine**:
  - `✅ VALID TICKET`: Grants entry, records `checkedInAt` timestamp, updates MongoDB.
  - `⚠️ ALREADY USED`: Blocks duplicate entry, displays original check-in timestamp.
  - `❌ INVALID TICKET`: Rejects forged, malformed, or untrusted signatures.
  - `❌ WRONG EVENT`: Rejects authentic tickets belonging to other campus events.
- **Organizer Operations Dashboard**: Live KPIs (Capacity, Registered, Checked In, Remaining) with real-time recent check-in streams.
- **Student Hub & Digital Passbook**: Instant ticket downloads (PNG/print) and admission status tracking.
- **Built-in Automated Verification Test Suite**: Comprehensive 7-test automated runner validating all edge cases and concurrency safeguards.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, HTML5-QRCode, Canvas-Confetti, Axios |
| **Backend** | Node.js (v18+), Express.js, Morgan, CORS, Dotenv |
| **Database** | MongoDB with Mongoose (with automated fallback to `mongodb-memory-server` for zero-install evaluation) |
| **Security & Auth** | JSON Web Tokens (JWT), bcrypt.js password hashing, HMAC-SHA256 constant-time verification |
| **Email Service** | Nodemailer (supports SMTP / Gmail / SendGrid / Amazon SES / Ethereal Test Accounts) |
| **QR Code Engine** | `qrcode` (High-density ECC Level H matrix generator), `html5-qrcode` optical scanner |

---

## 4. System Architecture

```
                       ┌───────────────────────────────┐
                       │     React 18 / Vite Client    │
                       │  (Student Hub / Org Portal)   │
                       └──────────────┬────────────────┘
                                      │ Axios REST / JWT Bearer
                                      ▼
                       ┌───────────────────────────────┐
                       │       Express.js Server       │
                       │    (Auth, Events, Check-in)   │
                       └───────┬───────────────┬───────┘
                               │               │
        ┌──────────────────────┼────────┐      │
        ▼                      ▼        ▼      ▼
┌──────────────┐     ┌───────────────┐ ┌────────────────┐
│   MongoDB    │     │ HMAC-SHA256   │ │   Nodemailer   │
│ (Atomic Inc) │     │ Token Service │ │ (HTML Email+QR)│
└──────────────┘     └───────────────┘ └────────────────┘
```

---

## 5. Folder Structure

```
viticket/
├── client/                          # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Navbar, Footer, StatusBadge, VerificationModal
│   │   ├── context/                 # AuthContext (JWT, session, role guards)
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Event catalog with filters & live capacity
│   │   │   ├── EventDetails.jsx     # Event info & atomic registration CTA
│   │   │   ├── RegistrationSuccess.jsx # Confetti, QR pass card, print/download
│   │   │   ├── MyTickets.jsx        # Student digital passbook & QR modal
│   │   │   ├── StudentDashboard.jsx # Student statistics & activity stream
│   │   │   ├── OrganizerDashboard.jsx # Live check-in KPIs & admissions feed
│   │   │   ├── OrganizerScanner.jsx # Webcam QR scanner & manual token fallback
│   │   │   ├── OrganizerEvents.jsx  # Event publisher & attendee logs
│   │   │   ├── Login.jsx            # 1-Click demo accounts + authentication
│   │   │   └── Register.jsx         # Student/Organizer signup
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios API client
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── index.css                # Tailwind directives & laser animations
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                    # Resilient Mongoose + in-memory auto-fallback
│   ├── controllers/
│   │   ├── authController.js        # Signup, login, profile
│   │   ├── eventController.js       # Event CRUD, filtering, search
│   │   ├── registrationController.js# Atomic capacity check & ticket creation
│   │   └── checkinController.js     # 4-state cryptographic verification
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT Bearer validation
│   │   ├── roleMiddleware.js        # Role-based access control (RBAC)
│   │   └── errorHandler.js          # Centralized error handler
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt methods
│   │   ├── Event.js                 # Event schema with virtual availability
│   │   └── Registration.js          # Unique compound index & ticket tokens
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── checkinRoutes.js
│   ├── scripts/
│   │   └── seed.js                  # Database seeder with realistic test data
│   ├── services/
│   │   ├── tokenService.js          # HMAC-SHA256 cryptographic generator/verifier
│   │   ├── qrService.js             # High-res QR DataURL and buffer generator
│   │   └── emailService.js          # HTML template renderer & SMTP/Ethereal transport
│   ├── tests/
│   │   └── verify-all.js            # Automated verification test suite (7 tests)
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Express app bootstrap
│
├── .gitignore
├── .env.example
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## 6. Prerequisites & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Installation

Clone the repository and install all dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/viticket.git
cd viticket

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
```

---

## 7. MongoDB Setup

VITicket is engineered to be **100% runnable without installing MongoDB**:

### Option A: Zero-Configuration In-Memory Mode (Recommended for Reviewers)
- If `MONGO_URI` is omitted from `server/.env`, the server **automatically initializes an embedded in-memory MongoDB engine (`mongodb-memory-server`)**.
- Zero external installations required. Tests and live runtime work immediately!

### Option B: Local MongoDB
Ensure your local MongoDB daemon is running, then set:
```env
MONGO_URI=mongodb://localhost:27017/viticket
```

### Option C: MongoDB Atlas Cloud
Create a free MongoDB Atlas cluster and set:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/viticket?retryWrites=true&w=majority
```

---

## 8. Email Provider Setup

VITicket supports two email delivery modes:

### Mode A: Zero-Config Ethereal Mode (Default)
Leave `EMAIL_HOST` blank in `server/.env`. The server automatically generates an ephemeral test account with Ethereal and prints live preview links in the terminal and in `/api/dev/last-email`!

### Mode B: Production SMTP (Gmail / SendGrid / AWS SES)
In `server/.env`, configure standard SMTP parameters:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_google_app_password
EMAIL_FROM="VITicket Campus Pass" <noreply@viticket.vit.ac.in>
```
*(For Gmail, create an "App Password" via Google Account > Security > 2-Step Verification > App Passwords).*

---

## 9. Environment Variables Reference

Create a file named `.env` inside the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Leave blank for zero-config embedded MongoDB)
MONGO_URI=

# Authentication & Cryptographic Security Secrets
JWT_SECRET=viticket_jwt_super_secret_key_2026_vit_production
TICKET_SECRET=viticket_hmac_ticket_crypto_key_2026_super_secure

# Email Notification Service (Leave blank for automated Ethereal test account)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="VITicket Campus Pass" <noreply@viticket.vit.ac.in>

# Frontend Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 10. How to Run the Backend Server

```bash
cd server

# Seed sample events and test accounts
npm run seed

# Start server in development mode
npm run dev

# Or start in standard production mode
npm start
```
The backend starts at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

## 11. How to Run the Frontend Client

In a separate terminal:

```bash
cd client

# Start Vite development server
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 12. Pre-Seeded Demo Test Accounts

The `npm run seed` command automatically seeds the database with pre-configured accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Organizer (Faculty)** | `organizer@vit.ac.in` | `Admin@1234` | Full event creation, capacity editing, gate QR scanner, check-in analytics |
| **Student (Vibin Shriyas)** | `vibin@vitstudent.ac.in` | `Student@1234` | Event registration, viewing passes, downloading QR tickets |
| **Student (Rahul Kumar)** | `rahul@vitstudent.ac.in` | `Student@1234` | Has an **already checked-in ticket** for testing duplicate scans |

> 💡 **Quick Login Buttons**: The Login page includes **1-Click Demo Buttons** (`Student Demo` and `Organizer Demo`) that instantly populate credentials for reviewers!

---

## 13. How to Create an Organizer Account

1. Click **Sign Up** in the navigation bar.
2. Select the **Faculty / Organizer** role pill.
3. Fill in Name, Email, Employee/Roll ID, and Password (min 6 characters).
4. Click **Complete Registration**. You will be redirected to the **Organizer Operations Hub**.

---

## 14. How to Create an Event

1. Log in with an Organizer account (`organizer@vit.ac.in`).
2. Navigate to **Manage Events** (`/organizer/events`).
3. Click the **Publish New Event** button.
4. Provide Title, Description, Date, Time, Venue, Category, and **Maximum Capacity**.
5. Click **Publish Event**. The event immediately appears in the student catalog.

---

## 15. How to Register as a Student

1. Log in with a Student account (`vibin@vitstudent.ac.in`) or browse as guest.
2. On the **Events** home page, click **Register** on any available event (e.g., *AWS Student Hackathon 2026*).
3. The backend atomically evaluates remaining capacity:
   - If `registeredCount < capacity`: Seat is reserved, signed ticket generated, and email dispatched.
   - If full: The button displays `Registration Closed - Maximum Capacity Reached`.
4. You will be greeted by the **Registration Confirmed** celebration screen featuring your official QR code and Ticket ID!

---

## 16. How to Test Email Delivery

1. Register for an event as a student.
2. Check your backend terminal log. You will observe:
   ```
   [Email] Ticket email sent to vibin@vitstudent.ac.in. MessageId: <...>
   [Email] View preview at: https://ethereal.email/message/...
   ```
3. Open the printed Ethereal URL in your browser to view the rendered, responsive HTML ticket pass with embedded QR code!
4. Alternatively, query `http://localhost:5000/api/dev/last-email` in your browser.

---

## 17. How to Scan QR Codes

1. Log in as an Organizer (`organizer@vit.ac.in`).
2. Navigate to **QR Scanner** (`/organizer/scanner`).
3. Choose the active event from the dropdown (e.g., *AWS Student Hackathon 2026*).
4. Verify using any of the 3 supported methods:
   - **Method A (Webcam)**: Click **Start Camera** and hold up a student QR pass.
   - **Method B (File Upload)**: Click **Upload QR Image** and upload a saved ticket QR screenshot.
   - **Method C (Manual Token)**: Paste a signed token into the manual input box and click **VERIFY TICKET**.

---

## 18. How to Test Duplicate Scanning

1. Open the Scanner (`/organizer/scanner`) with *AWS Student Hackathon 2026* selected.
2. Scan a valid ticket once -> The modal will display **`✅ VALID TICKET`** and update status to `CHECKED_IN`.
3. Scan the exact same ticket a second time.
4. **Expected Result**:
   - The scanner modal immediately pops up with:
     ```
     ⚠️ ALREADY USED
     Student: Vibin Shriyas
     Original Check-in: 10:32 AM
     Do NOT allow another check-in.
     ```
   - An audible warning buzz sounds and re-entry is blocked.

---

## 19. How to Test Invalid & Wrong Event QR Tokens

### Testing Invalid QR Tokens:
1. On the Scanner page, click the shortcut button: **Inject Fake / Tampered QR** (or type arbitrary text into the manual token box).
2. Click **VERIFY TICKET**.
3. **Expected Result**:
   ```
   ❌ INVALID TICKET
   "This ticket could not be verified."
   ```

### Testing Wrong Event QR Tokens:
1. Select *AI & Robotics National Symposium* in the organizer scanner dropdown.
2. Scan a ticket that was issued for *AWS Student Hackathon*.
3. **Expected Result**:
   ```
   ❌ WRONG EVENT
   "This ticket belongs to a different event."
   ```

---

## 20. REST API Documentation

### Authentication Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Organizer |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve active profile details |

### Event Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List events with `search`, `category`, and `status` filters |
| `GET` | `/api/events/:id` | Public | Retrieve single event details |
| `POST` | `/api/events` | Organizer | Create a new event |
| `PUT` | `/api/events/:id` | Organizer | Update event details & capacity |
| `DELETE` | `/api/events/:id` | Organizer | Delete an event |
| `POST` | `/api/events/:id/register` | Private | Atomic registration with capacity check |
| `GET` | `/api/events/:id/checkins` | Organizer | List all checked-in attendees |
| `GET` | `/api/events/:id/statistics` | Organizer | Get live event capacity & headcount stats |

### Registration & Ticket Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/my-registrations` | Private | Retrieve all tickets belonging to logged-in student |
| `GET` | `/api/tickets/:id` | Private | Get detailed ticket pass by Ticket ID (`TKT-XXXXXX`) |

### Check-In Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkin/verify` | Organizer | Verify signed token and check in attendee |

---

## 21. Security & Anti-Fraud Architecture

1. **Atomic Concurrency Protection**:
   ```javascript
   const event = await Event.findOneAndUpdate(
     { _id: eventId, $expr: { $lt: ['$registeredCount', '$capacity'] } },
     { $inc: { registeredCount: 1 } },
     { new: true }
   );
   ```
   Ensures capacity enforcement is executed as a single atomic operation in the database engine, eliminating race conditions.

2. **HMAC-SHA256 Cryptographic Signing**:
   - Tickets are signed with a server-side secret key: `signature = HMAC_SHA256(base64(payload), SECRET)`.
   - Verified using **constant-time string comparison** (`crypto.timingSafeEqual`) to protect against timing attacks.

3. **Compound Database Constraints**:
   - Unique compound index `{ studentId: 1, eventId: 1 }` prevents double registrations for the same event.
   - Unique ticket ID index prevents duplicate ticket records.

4. **Role-Based Access Control (RBAC)**:
   - Sensitive organizer routes are protected by dual-layer middleware (`protect` + `authorize('ORGANIZER')`).

---

## 22. Automated Test Suite Execution

VITicket includes an automated end-to-end integration test runner:

```bash
cd server
npm run test:verify
```

### Verified Test Matrix:
- **TEST 1**: Student registers successfully -> Registration created + signed token + QR Data URL + email dispatched.
- **TEST 2**: Event reaches maximum capacity -> 3rd registration rejected with `"Registration Closed - Maximum Capacity Reached"`.
- **TEST 3**: Organizer scans valid QR -> Returns `CHECKED_IN` + records timestamp.
- **TEST 4**: Organizer scans same QR again -> Returns `ALREADY_USED` with original check-in time.
- **TEST 5**: Organizer scans fake QR -> Returns `INVALID` ("This ticket could not be verified").
- **TEST 6**: Organizer scans ticket for another event -> Returns `WRONG_EVENT` ("This ticket belongs to a different event").
- **TEST 7 (Concurrency)**: 5 parallel requests compete for 1 remaining seat -> Exactly 1 succeeds, 4 are rejected, capacity never exceeded.

---

## 23. Deployment & GitHub Submission Guide

### Local Verification by Reviewers
This repository is configured so any technical evaluator can clone and run it with 3 standard commands:

```bash
# Terminal 1: Backend
cd server && npm install && npm run seed && npm run dev

# Terminal 2: Frontend
cd client && npm install && npm run dev
```

### GitHub Submission Steps
1. Initialize Git in the project root:
   ```bash
   git init
   git add .
   git commit -m "feat: complete VITicket campus ticketing & QR check-in system"
   ```
2. Create a new public repository on GitHub (e.g., `viticket-campus-system`).
3. Push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/viticket-campus-system.git
   git push -u origin main
   ```
4. Verify that `.env` is ignored by `.gitignore` and only `.env.example` is pushed.

---

*Built for College Technical Recruitment Challenge • Production-Quality Full-Stack Engineering.*
