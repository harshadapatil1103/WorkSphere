import axiosClient from './axiosClient'

export const getEmployees = () => axiosClient.get('/employees')
export const getEmployee = (id) => axiosClient.get(`/employees/${id}`)
export const createEmployee = (data) => axiosClient.post('/employees', data)
export const updateEmployee = (id, data) => axiosClient.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => axiosClient.delete(`/employees/${id}`)
