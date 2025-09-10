import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../Store/authStore'

import { ArrowLeft, Loader, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from "react-hot-toast"
import { useRef } from 'react'
import Input from '../components/Input'


const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const { user, isLoading, forgotPassword, } = useAuthStore()


    // otp verification
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef([])
    const navigate = useNavigate()
    const [isVerifying, setIsVerifying] = useState(false);  // ✅ separate
    const [isResending, setIsResending] = useState(false);
    const [hasResent, setHasResent] = useState(false);

    const [cooldown, setCooldown] = useState(60); // 1 min
    // const [userEmail, setUserEmail] = useState("");
    const {  verifyOTP, resendOTP } = useAuthStore()

    const handleInputOnChange = (index, value) => {
        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        if (value && index < 5) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").slice(0, 6).split("")
        const newCode = [...code]

        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || ""
        }
        setCode(newCode)

        // focus last filled or first empty
        const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "")
        const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5
        inputRefs.current[focusIndex]?.focus()
    }

    const handlSubmitOTP = async (event) => {
        event.preventDefault()
        const verifiCationCode = code.join("")
        setIsVerifying(true)
        try {
            const response = await verifyOTP(verifiCationCode,email)
            navigate("/reset-password")
            toast.success(response?.message)
        } 
        catch(error){
            toast.error(error.response?.data?.message||error.message)
        }
        finally {
            setIsVerifying(false)
        }
    }

    useEffect(() => {
        if (code.every(digit => digit !== '')) {
            setTimeout(() => {
                handlSubmitOTP(new Event("submit"))
            }, 300)
        }
    }, [code])

    //timer
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer);
    }, [cooldown])

    const handleResend = async () => {
        if (hasResent) return; // prevent clicking while waiting

        setIsResending(true);
        try {
            const msg = await resendOTP(email); // 👈 replace with real email
            setHasResent(true);
            toast.success(msg?.message)
        } catch (error) {
            toast.error(error?.response?.message);
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // emai input
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email)
        }
    }, [user])

    const handleSubmitEmail = async (event) => {
        event.preventDefault()
        try {
            const response = await forgotPassword(email)  // call your auth store method
            setIsSubmitted(true)
            toast.success(response.message || "Reset OTP sent successfully")
            // setEmail("")
        } catch (error) {
            toast.error(error.message)
        }

    }

    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
            {/* //done */}
            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Forgot Password</h2>
                {
                    !isSubmitted ? (
                        <form onSubmit={handleSubmitEmail}>
                            <p className='text-gray-300 mb-6 text-center'>Enter email address and we'll send you a OTP to reset your password.</p>

                            <Input
                                leftIcon={Mail}
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                disabled={!!user?.email} // disable if logged in
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTop={{ scale: 0.98 }}
                                className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 hover:cursor-pointer'
                                type='submit'
                            >
                                {isLoading ? <Loader className='w-6 h-6 animate-spin text-center mx-auto' /> : "Send OTP"}
                            </motion.button>
                        </form>
                    ) : (
                        <div className='text-center'>
                            {/* <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md'
                            > */}
                                <h2 className='text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Verify Your OTP</h2>
                                <p className='text-center text-gray-300 mb-6'>Enter the 6-digit code sent to your email address.</p>
                                <form onSubmit={handlSubmitOTP} className='space-y-2'>
                                    <div className='flex justify-between'>
                                        {
                                            code.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    type='text'
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleInputOnChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    onPaste={handlePaste}
                                                    className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-400 rounded-lg focus:border-green-500 focus:outline-none'
                                                />
                                            ))
                                        }
                                    </div>
                                    <div className='flex justify-end text-right'>
                                        {!hasResent && cooldown === 0 && (
                                            <h2
                                                className="text-white inline-block cursor-pointer hover:underline hover:decoration-green-500"
                                                onClick={handleResend}
                                            >
                                                {isResending ? "Sending..." : "Resend"}
                                            </h2>
                                        )}

                                        {!hasResent && cooldown > 0 && (
                                            <span className="text-gray-400">
                                                Resend in 0:{cooldown}s
                                            </span>
                                        )}
                                    </div>
                                
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={isVerifying || code.some((digit) => !digit)}
                                        className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 text-center hover:cursor-pointer'
                                    >
                                        {isVerifying ? "verifying..." : "Verify OTP"}
                                    </motion.button>
                                    <div className='flex justify-center'>
                                        <Link to={"/signup"} className='text-green-500 hover:text-green-300'>Back</Link>
                                    </div>
                                </form>
                            {/* </motion.div> */}
                        </div>
                    )
                }
            </div>

            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center' >
                <Link to={"/login"} className='text-sm text-green-400 hover:underline flex items-center'>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                </Link>
            </div>

        </motion.div>
    )
}

export default ForgotPassword




