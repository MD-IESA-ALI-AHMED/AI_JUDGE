import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { auth } from './api/api'

export default function App(){
  const navigate = useNavigate()
  const token = auth.getToken()

  function logout(){
    auth.logout();
    navigate('/')
  }

  return (
    <div style={{ padding: 20 }}>
      <header>
        <h1 style={{ display: 'inline-block', marginRight: 20 }}><Link to="/">AI JUDGE</Link></h1>
        {token ? (
          <>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link style={{ marginRight: 8 }} to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
