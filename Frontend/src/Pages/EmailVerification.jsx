import { motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../Store/authStore'
import { Link } from "react-router-dom"
import toast from 'react-hot-toast'

const EmailVerification = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef([])
    const navigate = useNavigate()
    const [isVerifying, setIsVerifying] = useState(false);  // ✅ separate
    const [isResending, setIsResending] = useState(false);
    const [hasResent, setHasResent] = useState(false);

    const [cooldown, setCooldown] = useState(60); // 1 min
    const [message, setMessage] = useState("");
    const location = useLocation();
    const [userEmail, setUserEmail] = useState("");
    const { error,verifyEmail,resendOtpEmail } = useAuthStore()

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

    const handlSubmit = async (event) => {
        event.preventDefault()
        const verifiCationCode = code.join("")
        setIsVerifying(true)
        try {
            await verifyEmail(verifiCationCode)
            localStorage.removeItem("pendingEmail");
            navigate("/")
            toast.success("Email verified successfully")
        } finally {
            setIsVerifying(false)
        }
    }

    useEffect(() => {
        if (code.every(digit => digit !== '')) {
            setTimeout(() => {
                handlSubmit(new Event("submit"))
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

    useEffect(() => {
        // Try to get from navigate state OR fallback to localStorage
        const emailFromState = location.state?.email;
        const emailFromStorage = localStorage.getItem("pendingEmail");

        setUserEmail(emailFromState || emailFromStorage || "");
    }, [location.state]);

    const handleResend = async () => {
        if (hasResent) return; // prevent clicking while waiting

        setIsResending(true);
        setMessage("");
        try {
            const msg = await resendOtpEmail(userEmail); // 👈 replace with real email
            setMessage(msg);
            setHasResent(true);
            toast.success(msg?.message)
            setCode(["", "", "", "", "", ""]);
        } catch (error) {
            setMessage(error);
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return (
        <div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md'
            >
                <h2 className='text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Verify Your Email</h2>
                <p className='text-center text-gray-300 mb-6'>Enter the 6-digit code sent to your email address.</p>
                <form onSubmit={handlSubmit} className='space-y-2'>
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
                    {message && <p className="text-green-400 mt-2">{message}</p>}
                    {error && <p className='text-red-500 mt-2'>{error}</p>}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isVerifying || code.some((digit) => !digit)}
                        className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 text-center hover:cursor-pointer'
                    >
                        {isVerifying ? "verifying..." : "Verify Email"}
                    </motion.div>
                    <div className='flex justify-center'>
                        <Link to={"/signup"} className='text-green-500 hover:text-green-300'>Back</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default EmailVerification
