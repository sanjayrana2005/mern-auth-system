import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react'
import Input from '../components/input'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../Store/authStore'
import toast from 'react-hot-toast'

const LoginPage = () => {

  const [user, setUser] = useState({
    email: "",
    password: ""
  })

  const navigate = useNavigate()

  const { login, isLoading, error } = useAuthStore()
  const [errorMsg, setErrorMsg] = useState(error)

  const handleInputOnchange = (event) => {
    const { name, value } = event.target
    setUser({
      ...user,
      [name]: value
    })
  }

  {/* <EyeOff /> */ }

  const handleLogin = async (event) => {
    event.preventDefault()
    const response = await login(user.email, user.password)
    toast.success(response.message || "Login successfully")
    navigate("/")
  }

   useEffect(() => {
    if (error) {
      setErrorMsg(error)
      // clear error after 3s
       setTimeout(() => {
        setErrorMsg("")
       },2000)
      return 
    }
  }, [error])

  // setTimeout(() => {
  //   setErrorMsg("");
  // }, 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
    >

      <div className='p-8'>
        <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>Wellcome Back</h2>

        <form onSubmit={handleLogin}>
          <Input
            leftIcon={Mail}
            type="email"
            name="email"
            placeholder='Email Address'
            value={user.email}
            onChange={handleInputOnchange}
          />

          <Input
            leftIcon={Lock}
            rightIcon={[Eye, EyeOff]}
            type="password"
            name="password"
            placeholder='Password'
            value={user.password}
            onChange={handleInputOnchange}
          />

          <div className='flex items-center mb-2 justify-between'>
            <Link to="/forgot-password" className='text-sm text-green-400 hover:underline'>Forgot password?</Link>
          {errorMsg && <p className='text-red-500 text-sm'>{errorMsg}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTop={{ scale: 0.98 }}
            className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 hover:cursor-pointer'
            type='submit'
          >
            {isLoading ? <Loader className='w-6 h-6 animate-spin text-center mx-auto' /> : "Login"}
          </motion.button>
        </form>
      </div>

      <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center gap-2'>
        <p className='text-sm text-gray-400'>Don't have an account?</p>
        <Link to={"/signup"} className='text-sm text-green-400 hover:underline'>
          Sign up
        </Link>
      </div>
    </motion.div>
  )
}

export default LoginPage
