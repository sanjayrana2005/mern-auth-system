const express = require("express")
const { signupController, loginController, logoutController, verifyEmail, resendCode, requestResetPassword, chechAuth, changePassword, resetPassword, verifyOTPLoggedOut, resendOTP} = require("../controller/auth-controller")
const verifyToken = require("../middleware/verifyToken")
const authRouter = express.Router()

authRouter.get("/check-auth",verifyToken,chechAuth)
authRouter.post("/signup",signupController)
authRouter.post("/login",loginController)
authRouter.post("/logout",logoutController)
authRouter.post("/verify-email",verifyEmail)
authRouter.post("/resend-code",resendCode)
authRouter.post("/resend-otp",resendOTP)
authRouter.post("/forgot-password",requestResetPassword)
authRouter.post("/verify-otp",verifyOTPLoggedOut)
authRouter.post("/reset-password",resetPassword)
authRouter.post("/change-password",verifyToken,changePassword)

// authRouter.post("/reset-password",resetYourPasswordLoggedIn)
// authRouter.post("/reset-password",resetPassword)
// authRouter.post("/change-password",changePassword)


module.exports = authRouter