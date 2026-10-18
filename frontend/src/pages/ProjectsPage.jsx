import { useState, useEffect } from 'react'
import ProjectCard from '../components/ProjectCard'
import ProjectForm from '../components/ProjectForm'
import { useAuth } from '../context/AuthContext'
import { getProjects, createProject, updateProject, deleteProject } from '../api/projectService'
import { getEmployees } from '../api/employeeService'

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([getProjects(), getEmployees()])
      setProjects(projectsRes.data)
      setEmployees(employeesRes.data)
    } catch (err) {
      setError('Could not load projects. Is the backend running?')
    }
  }

  const openNewProjectForm = () => {
    setEditingProject(null)
    setShowForm(true)
  }

  const openEditForm = (project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleSubmit = async (data) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data)
      } else {
        await createProject(data)
      }
      setShowForm(false)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save project.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await deleteProject(id)
      loadData()
    } catch (err) {
      setError('Could not delete project.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>{isAdmin ? 'Track every project, its timeline, and its team.' : 'Projects you can view or manage.'}</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openNewProjectForm}>+ New Project</button>}
      </div>

      {error && <div className="banner-error">{error}</div>}

      {projects.length === 0 ? (
        <p className="empty-state">
          {isAdmin ? 'No projects yet — click "New Project" to create your first one.' : 'No projects assigned to you yet.'}
        </p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onEdit={openEditForm} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          employees={employees}
          editingProject={editingProject}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
