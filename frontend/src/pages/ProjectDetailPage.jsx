import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProject, addEmployeeToProject, removeEmployeeFromProject } from '../api/projectService'
import { getEmployees } from '../api/employeeService'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { email, isAdmin, isProjectManager } = useAuth()
  const [project, setProject] = useState(null)
  const [allEmployees, setAllEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [projectRes, employeesRes] = await Promise.all([getProject(id), getEmployees()])
      setProject(projectRes.data)
      setAllEmployees(employeesRes.data)
    } catch (err) {
      setError(err.response?.status === 403
        ? "You don't have access to this project."
        : 'Could not load this project.')
    }
  }

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) return
    try {
      await addEmployeeToProject(id, selectedEmployeeId)
      setSelectedEmployeeId('')
      loadData()
    } catch (err) {
      setError('Could not add employee to project.')
    }
  }

  const handleRemoveEmployee = async (employeeId) => {
    try {
      await removeEmployeeFromProject(id, employeeId)
      loadData()
    } catch (err) {
      setError('Could not remove employee from project.')
    }
  }

  if (!project) {
    return <div className="page">{error || 'Loading...'}</div>
  }

  // Admin can manage every project. A Project Manager can only manage
  // the one(s) where they are the actual assigned manager.
  const canManage = isAdmin || (isProjectManager && project.projectManager?.email === email)

  const assignedIds = new Set(project.employees.map((e) => e.id))
  const availableEmployees = allEmployees.filter((e) => !assignedIds.has(e.id))

  return (
    <div className="page">
      <button className="btn-link" onClick={() => navigate('/')}>← Back to projects</button>

      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description || 'No description'}</p>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      <div className="detail-meta">
        <div><span className="meta-label">Timeline</span>{project.startDate} → {project.endDate}</div>
        <div><span className="meta-label">Manager</span>{project.projectManager?.name}</div>
        <div><span className="meta-label">Status</span>{project.status}</div>
      </div>

      <div className="detail-tabs">
        <Link to={`/projects/${id}/tasks`} className="tab-link">📋 Task Management</Link>
        <Link to={`/projects/${id}/risks`} className="tab-link">⚠️ Risk Management</Link>
      </div>

      <section className="team-section">
        <h2>Team ({project.employees.length})</h2>

        {canManage && (
          <div className="add-employee-row">
            <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
              <option value="">Add an employee...</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.roleInProject}</option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleAddEmployee} disabled={!selectedEmployeeId}>
              Add to project
            </button>
          </div>
        )}

        {project.employees.length === 0 ? (
          <p className="empty-state">No team members yet.</p>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {project.employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.roleInProject}</td>
                  {canManage && (
                    <td className="row-actions">
                      <button className="btn-link danger" onClick={() => handleRemoveEmployee(emp.id)}>Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
