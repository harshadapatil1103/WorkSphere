import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProject } from '../api/projectService'
import { getRisksForProject, createRisk, updateRisk, deleteRisk } from '../api/riskService'

const severityOptions = ['LOW', 'MEDIUM', 'HIGH']
const statusOptions = ['OPEN', 'MITIGATED', 'CLOSED']

const emptyForm = { description: '', severity: 'MEDIUM' }

export default function RiskManagementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { email, isAdmin, isProjectManager } = useAuth()

  const [project, setProject] = useState(null)
  const [risks, setRisks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [projectRes, risksRes] = await Promise.all([getProject(id), getRisksForProject(id)])
      setProject(projectRes.data)
      setRisks(risksRes.data)
    } catch (err) {
      setError(err.response?.status === 403 ? "You don't have access to this project." : 'Could not load risks.')
    }
  }

  if (!project) return <div className="page">{error || 'Loading...'}</div>

  const isManager = isAdmin || (isProjectManager && project.projectManager?.email === email)

  const canManage = (risk) => isManager || risk.raisedBy?.email === email

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return
    try {
      await createRisk(id, form)
      setForm(emptyForm)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add risk.')
    }
  }

  const handleUpdate = async (risk, changes) => {
    try {
      await updateRisk(risk.id, { description: risk.description, severity: risk.severity, status: risk.status, ...changes })
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update risk.')
    }
  }

  const handleDelete = async (riskId) => {
    if (!window.confirm('Delete this risk?')) return
    try {
      await deleteRisk(riskId)
      loadData()
    } catch (err) {
      setError('Could not delete risk.')
    }
  }

  return (
    <div className="page">
      <button className="btn-link" onClick={() => navigate(`/projects/${id}`)}>← Back to {project.name}</button>

      <div className="page-header">
        <div>
          <h1>Risks — {project.name}</h1>
          <p>Anyone on this project can raise a risk. You can manage the ones you raised yourself.</p>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          placeholder="Describe the risk..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="grow"
        />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
          {severityOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn-primary">+ Add Risk</button>
      </form>

      {risks.length === 0 ? (
        <p className="empty-state">No risks logged yet.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Risk</th>
              <th>Raised by</th>
              <th>Severity</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td>{risk.description}</td>
                <td>{risk.raisedBy?.name || '—'}</td>
                <td>
                  {canManage(risk) ? (
                    <select value={risk.severity} onChange={(e) => handleUpdate(risk, { severity: e.target.value })}>
                      {severityOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`severity-pill severity-${risk.severity.toLowerCase()}`}>{risk.severity}</span>
                  )}
                </td>
                <td>
                  {canManage(risk) ? (
                    <select value={risk.status} onChange={(e) => handleUpdate(risk, { status: e.target.value })}>
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`status-pill status-${risk.status.toLowerCase()}`}>{risk.status}</span>
                  )}
                </td>
                <td className="row-actions">
                  {canManage(risk) && (
                    <button className="btn-link danger" onClick={() => handleDelete(risk.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
