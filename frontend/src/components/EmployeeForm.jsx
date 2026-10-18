import { useState, useEffect } from 'react'

const emptyForm = { name: '', email: '', systemRole: 'EMPLOYEE' }

const roleOptions = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
]

export default function EmployeeForm({ onSubmit, editingEmployee, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editingEmployee) {
      setForm({
        name: editingEmployee.name,
        email: editingEmployee.email,
        systemRole: editingEmployee.systemRole || 'EMPLOYEE',
      })
    } else {
      setForm(emptyForm)
    }
  }, [editingEmployee])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const roleLabel = roleOptions.find((r) => r.value === form.systemRole)?.label

    onSubmit({
      name: form.name,
      email: form.email,
      systemRole: form.systemRole,
      // "Role in Project" doubles as the descriptive label shown everywhere
      roleInProject: roleLabel,
    })

    if (!editingEmployee) setForm(emptyForm)
  }

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>

      <div className="field">
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Cooper" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="field">
        <label>Email address</label>
        <input name="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" />
        {errors.email && <span className="error">{errors.email}</span>}
        <span className="hint">This becomes their login email.</span>
      </div>

      <div className="field">
        <label>Role in Project</label>
        <select name="systemRole" value={form.systemRole} onChange={handleChange}>
          {roleOptions.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingEmployee ? 'Save changes' : 'Add employee'}
        </button>
        {editingEmployee && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
