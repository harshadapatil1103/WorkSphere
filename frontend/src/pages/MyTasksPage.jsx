import { useState, useEffect } from 'react'
import { getMyTasks, updateTaskStatus } from '../api/taskService'

const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE']
const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const res = await getMyTasks()
      setTasks(res.data)
    } catch (err) {
      setError('Could not load your tasks.')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status)
      loadTasks()
    } catch (err) {
      setError('Could not update status.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p>Everything assigned to you, across every project.</p>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {tasks.length === 0 ? (
        <p className="empty-state">Nothing assigned to you yet.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Task</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.project?.name}</td>
                <td>
                  <strong>{task.title}</strong>
                  {task.description && <div className="task-desc">{task.description}</div>}
                </td>
                <td>{task.dueDate || '—'}</td>
                <td>
                  <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}>
                    {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
