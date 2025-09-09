import { Navigate, Route, Routes } from "react-router-dom"
import FloatingShape from "./components/FloatingShape"
import SignupPage from "./Pages/SignupPage"
import LoginPage from "./Pages/LoginPage"
import EmailVerification from "./Pages/EmailVerification"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "../Store/authStore"
import { useEffect } from "react"
import HomePage from "./Pages/HomePage"
import LoadingSpinner from "./components/LoadingSpinner"
import ForgotPassword from "./Pages/ForgotPassword"
import ResetPassword from "./Pages/ResetPassword"
import ChangePassword from "./Pages/ChangePassword"



// protects routes tht require authentication
const ProtectdRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user.isVerified) {

    return <Navigate to="/verify-email" replace />
  }

  return children
}

// redirect authenticated user to home page
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center relative overflow-hidden p-3">
      <FloatingShape
        color="bg-green-500" size="w-64 h-64" top="-5%" left="-10%" delay={0}
      />
      <FloatingShape
        color="bg-green-500" size="w-48 h-48" top="70%" left="80%" delay={5}
      />
      <FloatingShape
        color="bg-green-500" size="w-32 h-32" top="40%" left="-10%" delay={2}
      />

      <Routes>

        <Route path="/" element={
          <ProtectdRoute>
            <HomePage />
          </ProtectdRoute>} />

        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <SignupPage />
          </RedirectAuthenticatedUser>
        } />

        <Route path="/login" element={<RedirectAuthenticatedUser>
          <LoginPage />
        </RedirectAuthenticatedUser>} />

        <Route path="/verify-email" element={<EmailVerification />} />

        <Route path="/forgot-password" element={
          // <RedirectAuthenticatedUser>
            <ForgotPassword />
          //  </RedirectAuthenticatedUser> 
        } />

        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="//change-password" element={<ChangePassword/>}/>

      </Routes>

      <Toaster />
    </div>
  )
}

export default App
