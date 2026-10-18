import axiosClient from './axiosClient'

export const getRisksForProject = (projectId) => axiosClient.get(`/projects/${projectId}/risks`)
export const createRisk = (projectId, data) => axiosClient.post(`/projects/${projectId}/risks`, data)
export const updateRisk = (riskId, data) => axiosClient.put(`/risks/${riskId}`, data)
export const deleteRisk = (riskId) => axiosClient.delete(`/risks/${riskId}`)
