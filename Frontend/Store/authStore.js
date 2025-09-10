import { create } from "zustand"
import Axios from "../src/utils/Axios"

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    otpVerified: null,
    verifiedEmail: null,

    signup: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await Axios.post("auth/signup", {
                name,
                email,
                password
            })
            localStorage.setItem("pendingEmail", response.data.email);
            set({ isAuthenticated: false,})
            return response.data.email
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up", isLoading: false })
            throw error
        }
        finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    resendOtpEmail: async (email) => {
        try {
            const response = await Axios.post("/auth/resend-code", { email });
            return response.data.message; // e.g. "OTP sent again"
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Failed to resend OTP"
            set({ error: errMsg})
            throw new Error(errMsg)   // ✅ throw clean message
        }
        finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    resendOTP: async (email) => {
        try {
            const response = await Axios.post("/auth/resend-otp", { email });
            return response.data.message; // e.g. "OTP sent again"
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Failed to resend OTP"
            set({ error: errMsg })
            throw new Error(errMsg)   // ✅ throw clean message
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null })
        try {
            const response = await Axios.post("/auth/verify-email", { code })
            set({ user: response.data.user, isAuthenticated: true })
            return response.data
        } catch (error) {
            set({ error: error.response.data.message || "Error Verifying email", isLoading: false })
            throw error
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await Axios.post("auth/login", {
                email,
                password
            })
            set({ user: response.data.user, isAuthenticated: true, isLoading: false, error: response.message })
            return response.data
        } catch (error) {
            set({ error: error?.response?.data?.message || "Error loging up"})
            throw error
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    checkAuth: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        set({ isCheckingAuth: true, error: null })
        try {
            const response = await Axios.get("/auth/check-auth")
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
        } catch (error) {
            set({ error: null, isCheckingAuth: false })
            throw error
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await Axios.post("/auth/logout")
            set({ user: null, isAuthenticated: false, error: null, isLoading: false, message: response.data.message, verifiedEmail: null, })
            return response.data
        } catch (error) {
            set({ error: "Error logging out"})
            throw error
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, message: null })
        try {
            const response = await Axios.post("/auth/forgot-password", { email })
            set({ message: response?.data?.message, isLoading: false, })
            return response.data
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Error sending reset password email"
            set({error: errMsg })
            throw new Error(errMsg)
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }

    },

    verifyOTP: async (otp, email) => {
        set({ isLoading: true, error: null })
        try {
            const response = await Axios.post("/auth/verify-otp", { otp })
            set({ user: response.data.user, message: response.data.message, otpVerified: true, isLoading: false, verifiedEmail: email })
            return response.data
        } catch (error) {
            set({ error: error.response.data.message || "Error Verifying email" })
            throw error
        }
        finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    resetPassword: async (password) => {
        const { verifiedEmail } = get();
        if (!verifiedEmail) {
            throw new Error("No verified email found. Please verify OTP again.");
        }

        set({ isLoading: true, error: null, message: null })
        try {

            // if user logged in then token can be null
            const response = await Axios.post(`/auth/reset-password`, { email: verifiedEmail, password })
            set({ user: response.data.user, message: response.data.message, verifiedEmail: null })
            return response.data
        } catch (error) {
            set({ error: error.response.data.message || "Error resetting password" })
            throw error
        }finally {
        set({ isLoading: false }); // ✅ always stop loader
    }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null, message: null })
        try {
            const response = await Axios.post("/auth/change-password", { currentPassword, newPassword },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }
            )
            set({ message: response.data.message, isLoading: false })
            return response.data
        } catch (error) {
            set({ error: error.response.data.message || "Error changing password" })
            throw error
        }
        finally {
        set({ isLoading: false }); // ✅ ensures loader stops
    }
    }



}))