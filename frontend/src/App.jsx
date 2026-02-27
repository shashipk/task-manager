import React, { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import DeleteModal from './components/DeleteModal';
import { getAllTasks, createTask, updateTask, deleteTask } from './api/taskApi';

export default function App() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [showForm, setShowForm]     = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (taskData) => {
    await createTask(taskData);
    setShowForm(false);
    await loadTasks();
  };

  const handleUpdate = async (taskData) => {
    await updateTask(editingTask.id, taskData);
    setEditingTask(null);
    await loadTasks();
  };

  const handleDelete = async () => {
    await deleteTask(deletingTask.id);
    setDeletingTask(null);
    await loadTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {(showForm || editingTask) ? (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
        />
      ) : (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button className="btn-primary" onClick={handleAddNew}>
            + Add Task
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={setDeletingTask}
        />
      )}

      {deletingTask && (
        <DeleteModal
          task={deletingTask}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}
