import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'
const api = axios.create({ baseURL: API_BASE })

// attach token if present
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('ai_judge_token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

const auth = {
	login(token) { localStorage.setItem('ai_judge_token', token) },
	logout() { localStorage.removeItem('ai_judge_token') },
	getToken() { return localStorage.getItem('ai_judge_token') }
}

export { api as default, auth }
