import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import EmployeeForm from '../components/EmployeeForm'
import EmployeeList from '../components/EmployeeList'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employeeService'

export default function EmployeesPage() {
  const { isAdmin } = useAuth()
  const [employees, setEmployees] = useState([])
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [error, setError] = useState('')
  const [createdAccount, setCreatedAccount] = useState(null) // { employee, temporaryPassword }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees()
      setEmployees(res.data)
    } catch (err) {
      setError('Could not reach the backend. Is Spring Boot running on port 8080?')
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data)
        setEditingEmployee(null)
      } else {
        const res = await createEmployee(data)
        // Their login account was just created - show the one-time password
        setCreatedAccount(res.data)
      }
      fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong saving the employee.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee? Their login account will be removed too.')) return
    try {
      await deleteEmployee(id)
      fetchEmployees()
    } catch (err) {
      setError('Could not delete employee.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>
            {isAdmin
              ? 'Add people here — this creates their login account automatically.'
              : 'The shared pool of people who can be assigned to projects.'}
          </p>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {createdAccount && (
        <div className="banner-success">
          <strong>{createdAccount.employee.name}</strong> was added. Share these login details with them:
          <div className="credential-box">
            <div>Email: <strong>{createdAccount.employee.email}</strong></div>
            <div>Temporary password: <strong>{createdAccount.temporaryPassword}</strong></div>
          </div>
          <span className="hint">This password is shown only once — it can't be retrieved again.</span>
          <button className="btn-link" onClick={() => setCreatedAccount(null)}>Dismiss</button>
        </div>
      )}

      <main className={isAdmin ? 'app-main' : ''}>
        {isAdmin && (
          <EmployeeForm
            onSubmit={handleSubmit}
            editingEmployee={editingEmployee}
            onCancelEdit={() => setEditingEmployee(null)}
          />
        )}
        <EmployeeList
          employees={employees}
          onEdit={setEditingEmployee}
          onDelete={handleDelete}
          canManage={isAdmin}
        />
      </main>
    </div>
  )
}
