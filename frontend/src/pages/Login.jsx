import React, { useState } from 'react'
import api, { auth } from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/auth/login', { usernameOrEmail, password })
      if(res.data.ok){
        auth.login(res.data.token)
        navigate('/')
      } else {
        setError(res.data.error || 'Login failed')
      }
    }catch(err){
      setError(err.response?.data?.error || 'Server error')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={submit}>
        <div>
          <label>Username or Email</label>
          <input value={usernameOrEmail} onChange={e=>setUsernameOrEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
