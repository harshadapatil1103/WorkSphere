import axiosClient from './axiosClient'

export const getProjects = () => axiosClient.get('/projects')
export const getProject = (id) => axiosClient.get(`/projects/${id}`)
export const createProject = (data) => axiosClient.post('/projects', data)
export const updateProject = (id, data) => axiosClient.put(`/projects/${id}`, data)
export const deleteProject = (id) => axiosClient.delete(`/projects/${id}`)

export const addEmployeeToProject = (projectId, employeeId) =>
  axiosClient.post(`/projects/${projectId}/employees/${employeeId}`)

export const removeEmployeeFromProject = (projectId, employeeId) =>
  axiosClient.delete(`/projects/${projectId}/employees/${employeeId}`)
