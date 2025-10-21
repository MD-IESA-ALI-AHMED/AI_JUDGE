import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import Problems from './pages/Problems'
import Problem from './pages/Problem'
import Login from './pages/Login'
import Signup from './pages/Signup'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App /> }>
          <Route index element={<Problems />} />
          <Route path="problems/:id" element={<Problem />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
