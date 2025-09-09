import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader, Lock } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import Input from '../components/input'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../Store/authStore'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import toast from 'react-hot-toast'

const ResetPassword = () => {
    const [error, setError] = useState()
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
    const navigate = useNavigate()

    const { isLoading, resetPassword } = useAuthStore()

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (newPassword !== newPasswordConfirm) {
            setError("Passwords must be same")
            setTimeout(() => {
                setError("");
            }, 2000);
            return
        }

        try {
            const response = await resetPassword(newPassword)
            navigate("/login")
            toast.success(response?.message)
        }
        catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }

    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >

            <div className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Reset Password</h2>

                <form onSubmit={handleSubmit}>
                    <Input
                        leftIcon={Lock}
                        type="password"
                        name="newPassword"
                        placeholder='New Password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <Input
                        leftIcon={Lock}
                        rightIcon={[Eye, EyeOff]}
                        type="password"
                        name="newPasswordConfirn"
                        placeholder='Confirm new password'
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    />

                    {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}

                    <PasswordStrengthMeter password={newPassword} />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTop={{ scale: 0.98 }}
                        className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 hover:cursor-pointer mt-3'
                        type='submit'
                    >
                        {isLoading ? <Loader className='w-6 h-6 animate-spin text-center mx-auto' /> : "Set New Password"}
                    </motion.button>
                </form>
            </div>

            <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center gap-2'>
                <p className='text-sm text-gray-400'>Alreadyt have an account?</p>
                <Link to={"/login"} className='text-sm text-green-400 hover:underline'>
                    Login
                </Link>
            </div>
        </motion.div>

    )
}

export default ResetPassword
