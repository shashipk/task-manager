import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteModal from '../components/DeleteModal';

const task = { id: 1, title: 'My Task' };

describe('DeleteModal', () => {
  const onConfirm = vi.fn();
  const onCancel  = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('renders task name in confirmation message', () => {
    render(<DeleteModal task={task} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByText(/My Task/)).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(<DeleteModal task={task} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete is clicked', async () => {
    onConfirm.mockResolvedValue();
    render(<DeleteModal task={task} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('has correct aria attributes', () => {
    render(<DeleteModal task={task} onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Task')).toBeInTheDocument();
  });
});
