import React, { useState } from 'react'
import api, { auth } from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Signup(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/auth/register', { username, email, password })
      if(res.data.ok){
        auth.login(res.data.token)
        navigate('/')
      } else {
        setError(res.data.error || 'Registration failed')
      }
    }catch(err){
      setError(err.response?.data?.error || 'Server error')
    }
  }

  return (
    <div>
      <h2>Sign up</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <div>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
