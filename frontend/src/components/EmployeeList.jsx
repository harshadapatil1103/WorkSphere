const roleLabels = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  EMPLOYEE: 'Employee',
}

export default function EmployeeList({ employees, onEdit, onDelete, canManage }) {
  if (employees.length === 0) {
    return <p className="empty-state">No employees yet — add your first one using the form.</p>
  }

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email (login)</th>
          <th>Role in Project</th>
          {canManage && <th></th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id}>
            <td>{emp.name}</td>
            <td>{emp.email}</td>
            <td>
              <span className={`role-pill role-${emp.systemRole?.toLowerCase()}`}>
                {roleLabels[emp.systemRole] || emp.roleInProject}
              </span>
            </td>
            {canManage && (
              <td className="row-actions">
                <button className="btn-link" onClick={() => onEdit(emp)}>Edit</button>
                <button className="btn-link danger" onClick={() => onDelete(emp.id)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
