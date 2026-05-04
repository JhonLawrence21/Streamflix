# Google Sign-In Fix Progress

✅ **Step 1**: Create this TODO.md to track progress
✅ **Step 2**: Update server/controllers/authController.js - Add googleVerify function
✅ **Step 3**: Update server/routes/auth.js - Use controller's googleVerify
✅ **Step 4**: Delete server/config/googleAuth.js (unused Passport)

**Next steps**:
- [ ] **Step 5**: Update client/src/context/AuthContext.jsx - Add googleLogin method
- [ ] **Step 5**: Update client/src/context/AuthContext.jsx - Add googleLogin method
- [ ] **Step 6**: Update client/src/pages/LoginPage.jsx - Use context.googleLogin
- [ ] **Step 7**: Update client/src/pages/RegisterPage.jsx - Use context.googleLogin  
- [ ] **Step 8**: Delete client/src/pages/AuthCallbackPage.jsx (unused)
- [ ] **Step 9**: Test Google sign-in on Login/Register pages
- [ ] **Step 10**: Update this TODO.md as complete & attempt_completion

**Goal**: Fix Google sign-in so user state updates in AuthContext (Navbar shows logged in).
