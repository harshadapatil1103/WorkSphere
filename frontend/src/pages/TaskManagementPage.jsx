import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProject } from '../api/projectService'
import { getTasksForProject, createTask, updateTaskStatus, deleteTask } from '../api/taskService'

const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE']
const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

const emptyForm = { title: '', description: '', dueDate: '', assignedToId: '' }

export default function TaskManagementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { email, isAdmin, isProjectManager } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([getProject(id), getTasksForProject(id)])
      setProject(projectRes.data)
      setTasks(tasksRes.data)
    } catch (err) {
      setError(err.response?.status === 403 ? "You don't have access to this project." : 'Could not load tasks.')
    }
  }

  if (!project) return <div className="page">{error || 'Loading...'}</div>

  const canManage = isAdmin || (isProjectManager && project.projectManager?.email === email)
  const teamOptions = [project.projectManager, ...project.employees].filter(Boolean)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      await createTask(id, { ...form, assignedToId: form.assignedToId ? Number(form.assignedToId) : null })
      setForm(emptyForm)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create task.')
    }
  }

  const handleStatusChange = async (task, status) => {
    try {
      await updateTaskStatus(task.id, status)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status.')
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      loadData()
    } catch (err) {
      setError('Could not delete task.')
    }
  }

  const canEditStatus = (task) => canManage || task.assignedTo?.email === email

  return (
    <div className="page">
      <button className="btn-link" onClick={() => navigate(`/projects/${id}`)}>← Back to {project.name}</button>

      <div className="page-header">
        <div>
          <h1>Tasks — {project.name}</h1>
          <p>{canManage ? 'Assign work and track progress.' : 'View tasks and update the status of your own.'}</p>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
            <option value="">Assign to...</option>
            {teamOptions.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">+ Add Task</button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned to</th>
              <th>Due</th>
              <th>Status</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  {task.description && <div className="task-desc">{task.description}</div>}
                </td>
                <td>{task.assignedTo?.name || '—'}</td>
                <td>{task.dueDate || '—'}</td>
                <td>
                  {canEditStatus(task) ? (
                    <select value={task.status} onChange={(e) => handleStatusChange(task, e.target.value)}>
                      {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  ) : (
                    <span className={`status-pill status-${task.status.toLowerCase()}`}>{statusLabels[task.status]}</span>
                  )}
                </td>
                {canManage && (
                  <td className="row-actions">
                    <button className="btn-link danger" onClick={() => handleDelete(task.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
