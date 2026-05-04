# Implementation Steps for OTP Signup & Forgot Password

## 1. Backend Setup ✅
- [x] Create server/utils/email.js
- [x] Update server/models/User.js (add isVerified, otp, otpExpiry)
- [x] Update server/controllers/authController.js (OTP logic in register/login + new verify/forgot/reset)
- [x] Update server/routes/auth.js (new routes)
- [x] cd server && npm install nodemailer
- [x] Created server/.env.example → Created & configured server/.env with your Gmail/app-password

## 2. Frontend Setup ✅
- [x] Update client/src/services/api.js
- [x] Update client/src/context/AuthContext.jsx 
- [x] Update client/src/App.js (add routes)
- [x] Update RegisterPage.jsx (→ OTP page), LoginPage.jsx (forgot link)
- [x] Create VerifyOTPPage.jsx, ForgotPasswordPage.jsx, ResetPasswordPage.jsx

## 3. Test [ ]

## 3. Test [ ]
- [ ] Run server (may need DB migration for new columns)
- [ ] Test full flow

