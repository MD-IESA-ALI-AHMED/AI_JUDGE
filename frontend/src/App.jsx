import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { auth } from './api/api'
import { motion } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'

export default function App() {
  const navigate = useNavigate()
  const token = auth.getToken()

  function logout() {
    auth.logout();
    toast.success('Logged out successfully');
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-800">AI Debate Judge</span>
              </Link>
            </div>
            <div className="flex items-center">
              {token ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
                  <Link to="/new-debate" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">New Debate</Link>
                  <button onClick={logout} className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</Link>
                  <Link to="/register" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
      >
        <Outlet />
      </motion.main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
