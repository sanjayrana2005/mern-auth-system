import { motion } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router-dom'


const PageNotFound = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >
            <div className='p-8 flex flex-col items-center'>
                <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Page Not Found</h2>
            
                <Link to={"/"} className='text-green-500 hover:underline'>Back</Link>
            </div>
        </motion.div>
    )
}

export default PageNotFound
