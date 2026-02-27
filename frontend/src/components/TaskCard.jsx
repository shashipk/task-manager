import React from 'react';

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_BADGE = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-progress',
  DONE: 'badge-done',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return (
    <div className="task-card" role="listitem" data-testid={`task-card-${task.id}`}>
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-description">{task.description}</div>
        )}
        <div className="task-meta">
          <span className={`badge ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          {formattedDate && (
            <span style={{ marginLeft: '0.75rem' }}>Created: {formattedDate}</span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button
          className="btn-primary"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
        >
          Edit
        </button>
        <button
          className="btn-danger"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
