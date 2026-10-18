import axiosClient from './axiosClient'

export const getTasksForProject = (projectId) => axiosClient.get(`/projects/${projectId}/tasks`)
export const getMyTasks = () => axiosClient.get('/tasks/mine')
export const createTask = (projectId, data) => axiosClient.post(`/projects/${projectId}/tasks`, data)
export const updateTask = (taskId, data) => axiosClient.put(`/tasks/${taskId}`, data)
export const updateTaskStatus = (taskId, status) => axiosClient.patch(`/tasks/${taskId}/status`, { status })
export const deleteTask = (taskId) => axiosClient.delete(`/tasks/${taskId}`)
