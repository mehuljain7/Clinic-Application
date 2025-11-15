# Clinic Detector - Allergy Diagnosis Application

# Description

**Clinic Detector** is a full-stack application that allows users to check for potential allergies and maintain their medical reports. The platform features user authentication, email verification, password recovery, and secure storage of diagnosis reports. This project demonstrates a complete workflow from registration to diagnosis report generation.

---

# Features

## User Authentication

- Registration with email verification
- Login only for verified users
- Forgot Password & Reset Password functionality

## Diagnosis Workflow

- Users submit symptom inputs
- Dempster Shafer based algorithm for diagnosis generation
- Save diagnosis results to the database
- Generate downloadable PDF reports

## Notifications

- Email verification for new users
- Password reset emails
- Resend verification emails

---

# Screenshots

## Mobile App Screenshots

- **Login & Registration**
  ![`Login Screen`](source/image.png)
  `Login Screen`
  ![`Registration Screen`](source/image%201.png)
  `Registration Screen`
- **Home & Diagnosis Form**
  ![`Home Screen`](source/image%202.png)
  `Home Screen`
  ![`Diagnosis Form`](source/image%203.png)
  `Diagnosis Form`
- **Diagnosis Result**
  
  ![`Diagnosis Result in action`](source/diagnosis.gif)
  
  `Diagnosis Result in action`

## Email Screenshots

- **Verification Email**
  ![`Email Verification`](source/image%204.png)
  `Email Verification`
  ![`Email Verification in action`](source/verify_email.gif)
  `Email Verification in action`
- **Forgot Password Email**
  ![`Forgot Password`](source/password_reset.png)
  `Forgot Password`
  ![image.png](source/image%205.png)
  ![`Password Change in action`](source/password_change.gif)
  `Password Change in action`
- **Resend Verification Email**
  ![image.png](source/image%206.png)
  ![`Resend Verification`](source/image%207.png)
  `Resend Verification`

---

# Technology Stack

## Frontend

- React Native / Expo – Cross-platform mobile app
- AsyncStorage – Persistent local storage for user session
- React Navigation – Navigation and screen management
- Toast Notifications – `react-native-toast-message`

## Backend

- Node.js & Express – REST API server
- MongoDB / Mongoose – Database for users and diagnosis
- Nodemailer / Mailgun / Resend – Sending verification and reset emails
- Docker – Containerized backend deployment

## Deployment & CI/CD

- Railway – Backend deployment
- EAS Build (Expo Application Services) – Mobile app build
- GitHub Releases – Distributing APK

---

# Setup Instructions

## Backend Setup

1. `git clone <repo-url>`
2. `cd backend`
3. `npm install`
4. `cp .env.example .env`
5. Fill in your environment variables
6. `npm start`

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. Configure API endpoints in `api.js`
4. `expo start`

## Build APK for Android

- `eas build -p android --profile preview`
- Download the APK and install it on your device

---

# Folder Structure

**/backend**

- `models/` – MongoDB schemas
- `routes/` – Express routes
- `config/` – DB & environment config
- `server.js` – Express server

**/frontend**

- `screens/` – App screens: Login, Home, Diagnosis
- `components/` – Reusable components
- `api.js` – API endpoints config
- `App.js`

---

# Usage Workflow

1. Register with a valid email
2. Verify your email via the verification email
3. Login after verification
4. Submit symptom inputs in the diagnosis form
5. View results and optionally download a PDF report
6. Use “Forgot Password” to reset if needed
7. Resend verification if the first email was not received

---

# Email Workflow Example

## Verification Email

- Message:
  _"Hello John Doe, Thanks for registering! Please verify your email by clicking below: [Verify Email Link]"_

## Forgot Password Email

- Message:
  _"Click below to reset your password: [Reset Password Link]. Link expires in 15 minutes."_

## Resend Verification Email

- Message:
  _"Didn’t receive a verification email? Click below: [Resend Verification Link]"_

---

# Notes

- Ensure backend is deployed on a **public domain** for the APK to work on mobile.
- The app currently supports **Android APK distribution**; iOS requires Xcode & Apple Developer account.
- Docker simplifies backend deployment and local setup.

---

# License

This project is licensed under the **MIT License**.
