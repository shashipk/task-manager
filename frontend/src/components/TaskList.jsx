import React from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No tasks yet. Click &ldquo;+ Add Task&rdquo; to get started!
      </div>
    );
  }

  return (
    <div className="task-list" role="list">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
