import React from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../Store/authStore'
import { FormatDate } from '../utils/date'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const HomePage = () => {
    const { user, logout } = useAuthStore()

    const handleLogOut = async () => {
        const response = await logout()
        toast.success(response.message || "Logokkut successfully")
    }
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
        >
            <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text'>
                Dashboard
            </h2>
            <div className='space-y-6'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700'
                >
                    <h3 className='text-xl font-semibold text-green-400'>Portfolio Information</h3>
                    <p className='text-gray-300'>Name: {user.name}</p>
                    <p className='text-gray-300'>Email: {user.email}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className='text-xl font-semibold text-green-400 mb-2'>Account Activity</h3>
                    <p className='text-gray-300 font-semibold'>Joined:
                        <span className='font-normal'>  {
                            new Date(user.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            })
                        }   </span>

                    </p>
                    <p className='text-gray-300 font-semibold'>Last Login:
                        <span className='font-normal'> {FormatDate(user.lastLogin)}</span></p>
                    <Link to={"/change-password"} className='text-green-500 cursor-pointer hover:underline'>Change Password</Link>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className='mt-4'
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogOut}
                    className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer'
                >
                    Logout
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

export default HomePage
