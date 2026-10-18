import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TaskManagementPage from './pages/TaskManagementPage'
import RiskManagementPage from './pages/RiskManagementPage'
import MyTasksPage from './pages/MyTasksPage'
import EmployeesPage from './pages/EmployeesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-shell">
              <Navbar />
              <Routes>
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/projects/:id/tasks" element={<TaskManagementPage />} />
                <Route path="/projects/:id/risks" element={<RiskManagementPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
              </Routes>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
