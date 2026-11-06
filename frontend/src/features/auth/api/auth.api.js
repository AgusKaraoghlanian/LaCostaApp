import { apiFetch } from '../../../config/http.js'

export const login = ({ email, password }) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password } })
