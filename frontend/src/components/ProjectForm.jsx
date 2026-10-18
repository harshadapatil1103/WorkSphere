import { useState, useEffect } from 'react'

const emptyForm = { name: '', description: '', startDate: '', endDate: '', status: 'PLANNED', projectManagerId: '' }

export default function ProjectForm({ employees, editingProject, onSubmit, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingProject) {
      setForm({
        name: editingProject.name,
        description: editingProject.description || '',
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
        status: editingProject.status,
        projectManagerId: editingProject.projectManager?.id || '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [editingProject])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Project name is required'
    if (!form.startDate) newErrors.startDate = 'Start date is required'
    if (!form.endDate) newErrors.endDate = 'End date is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    if (!form.projectManagerId) newErrors.projectManagerId = 'Pick a project manager'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, projectManagerId: Number(form.projectManagerId) })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>

        <div className="field">
          <label>Project name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Website Redesign" />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="field">
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} placeholder="Optional" />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Start date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            {errors.startDate && <span className="error">{errors.startDate}</span>}
          </div>
          <div className="field">
            <label>End date</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            {errors.endDate && <span className="error">{errors.endDate}</span>}
          </div>
        </div>

        <div className="field">
          <label>Project manager</label>
          <select name="projectManagerId" value={form.projectManagerId} onChange={handleChange}>
            <option value="">Select a project manager...</option>
            {employees.filter((e) => e.systemRole === 'PROJECT_MANAGER').map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          {errors.projectManagerId && <span className="error">{errors.projectManagerId}</span>}
          {employees.filter((e) => e.systemRole === 'PROJECT_MANAGER').length === 0 && (
            <span className="hint">No Project Managers yet — add an employee with that role first.</span>
          )}
        </div>

        <div className="field">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">{editingProject ? 'Save changes' : 'Create project'}</button>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
