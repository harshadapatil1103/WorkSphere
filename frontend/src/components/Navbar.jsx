import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleLabels = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  EMPLOYEE: 'Employee',
}

export default function Navbar() {
  const { name, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">WorkSphere</div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Projects</NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink>
        <NavLink to="/my-tasks" className={({ isActive }) => isActive ? 'active' : ''}>My Tasks</NavLink>
      </div>
      <div className="navbar-user">
        <span className="role-badge">{roleLabels[role] || role}</span>
        <span>{name}</span>
        <button className="btn-link" onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  )
}
