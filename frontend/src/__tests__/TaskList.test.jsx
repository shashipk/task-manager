import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskList from '../components/TaskList';

const mockTasks = [
  { id: 1, title: 'Task One', description: 'Desc 1', status: 'TODO', createdAt: '2024-01-01T10:00:00' },
  { id: 2, title: 'Task Two', description: 'Desc 2', status: 'IN_PROGRESS', createdAt: '2024-01-02T11:00:00' },
  { id: 3, title: 'Task Three', description: '', status: 'DONE', createdAt: '2024-01-03T12:00:00' },
];

describe('TaskList', () => {
  const onEdit   = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('renders empty state when no tasks', () => {
    render(<TaskList tasks={[]} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    render(<TaskList tasks={mockTasks} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
    expect(screen.getByText('Task Three')).toBeInTheDocument();
  });

  it('calls onEdit with task when Edit clicked', () => {
    render(<TaskList tasks={mockTasks} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(onEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDelete with task when Delete clicked', () => {
    render(<TaskList tasks={mockTasks} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText('Delete')[1]);
    expect(onDelete).toHaveBeenCalledWith(mockTasks[1]);
  });

  it('renders status badges', () => {
    render(<TaskList tasks={mockTasks} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
