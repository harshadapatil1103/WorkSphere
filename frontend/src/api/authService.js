import axiosClient from './axiosClient'

// No token exists yet at login time, so this is just a plain POST
export const login = (email, password) =>
  axiosClient.post('/auth/login', { email, password })
