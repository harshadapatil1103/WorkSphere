import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const statusLabels = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const { email, isAdmin, isProjectManager } = useAuth()

  const canEdit = isAdmin || (isProjectManager && project.projectManager?.email === email)

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className={`status-badge status-${project.status?.toLowerCase()}`}>
        {statusLabels[project.status] || project.status}
      </div>
      <h3>{project.name}</h3>
      <p className="project-desc">{project.description || 'No description'}</p>
      <div className="project-meta">
        <span>{project.startDate} → {project.endDate}</span>
      </div>
      <div className="project-meta">
        <span>Manager: <strong>{project.projectManager?.name}</strong></span>
      </div>
      <div className="project-meta">
        <span>{project.employees?.length || 0} team member{project.employees?.length === 1 ? '' : 's'}</span>
      </div>

      {(canEdit || isAdmin) && (
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {canEdit && <button className="btn-link" onClick={() => onEdit(project)}>Edit</button>}
          {isAdmin && <button className="btn-link danger" onClick={() => onDelete(project.id)}>Delete</button>}
        </div>
      )}
    </div>
  )
}
