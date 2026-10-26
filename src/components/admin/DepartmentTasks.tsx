import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, ClipboardList, Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { DepartmentTask, TaskDepartment, TaskPriority, TaskStatus, User } from '../../types';

interface DepartmentTasksProps {
  canAssign: boolean;
  supportUsers: User[];
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-800',
  blocked: 'bg-rose-100 text-rose-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-cyan-100 text-cyan-800',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-rose-100 text-rose-800',
};

export const DepartmentTasks: React.FC<DepartmentTasksProps> = ({ canAssign, supportUsers }) => {
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<{ id: string; title: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'All' | TaskDepartment>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<TaskDepartment>('Digital');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    let mounted = true;
    const unsubscribe = api.subscribeTasks((updatedTasks) => {
      if (mounted) {
        setTasks(updatedTasks);
        setLoading(false);
      }
    });
    void api.getDepartmentTasks()
      .then((loadedTasks) => {
        if (mounted) {
          setTasks(loadedTasks);
          setLoading(false);
        }
      })
      .catch((loadError) => {
        console.error('Failed to load department tasks:', loadError);
        if (mounted) {
          setError('Could not load project tasks. Please try refreshing.');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const visibleTasks = tasks.filter((task) =>
    (departmentFilter === 'All' || task.department === departmentFilter)
    && (statusFilter === 'All' || task.status === statusFilter)
  );

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!title.trim() || !description.trim()) {
      setError('Add a task title and description before assigning it.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const assignee = supportUsers.find((user) => user.id === assignedToId);
      const createdTask = await api.createDepartmentTask({
        title: title.trim(),
        description: description.trim(),
        department,
        priority,
        assignedToId: assignee?.id,
        assignedToName: assignee?.name,
        dueDate: dueDate || undefined,
      });

      // Reset filters so the newly created task is always visible immediately
      setStatusFilter('All');
      setDepartmentFilter('All');

      // Optimistically add to state
      setTasks((previous) => [createdTask, ...previous.filter((task) => task.id !== createdTask.id)]);
      setTitle('');
      setDescription('');
      setDepartment('Digital');
      setPriority('medium');
      setAssignedToId('');
      setDueDate('');
      setShowForm(false);
      setSuccessMsg(`✓ Task "${createdTask.title}" assigned successfully!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (createError) {
      console.error('Failed to assign department task:', createError);
      setError(createError instanceof Error ? createError.message : 'Task assignment failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task: DepartmentTask, status: TaskStatus) => {
    setError('');
    try {
      await api.updateDepartmentTaskStatus(task.id, status);
      const now = new Date().toISOString();
      setTasks((previous) => previous.map((item) => item.id === task.id
        ? { ...item, status, updatedAt: now, completedAt: status === 'completed' ? now : undefined }
        : item));
    } catch (updateError) {
      console.error('Failed to update department task status:', updateError);
      setError(updateError instanceof Error ? updateError.message : 'Could not update task status.');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    setDeletingId(taskId);
    setError('');
    try {
      setTasks((previous) => previous.filter((task) => task.id !== taskId));
      await api.deleteDepartmentTask(taskId);
      setSuccessMsg(`✓ Task "${taskTitle}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (delErr) {
      console.error('Failed to delete task:', delErr);
      setError('Could not delete task. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-bold text-slate-900">Department project board</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {visibleTasks.length}{visibleTasks.length !== tasks.length ? ` of ${tasks.length}` : ''}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Digital and Developer department work assigned by Admin.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter tasks by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value as 'All' | TaskDepartment)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          >
            <option value="All">All departments ({tasks.length})</option>
            <option value="Digital">Digital ({tasks.filter((t) => t.department === 'Digital').length})</option>
            <option value="Developer">Developer ({tasks.filter((t) => t.department === 'Developer').length})</option>
          </select>
          <select
            aria-label="Filter tasks by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | TaskStatus)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          >
            <option value="All">All statuses ({tasks.length})</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({tasks.filter((t) => t.status === value).length})
              </option>
            ))}
          </select>

          {(departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setDepartmentFilter('All');
                setStatusFilter('All');
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              title="Show all tasks"
            >
              <RotateCcw size={13} />
              Reset filters
            </button>
          )}

          {canAssign && (
            <button
              type="button"
              onClick={() => setShowForm((open) => !open)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-cyan-800"
            >
              <Plus size={15} />
              Assign task
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {showForm && canAssign && (
        <form onSubmit={handleCreateTask} className="grid gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Task name
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Launch new landing page" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal" />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Department
            <select value={department} onChange={(event) => setDepartment(event.target.value as TaskDepartment)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
              <option value="Digital">Digital</option>
              <option value="Developer">Developer</option>
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
            Task details
            <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the scope, expected result, and any important context." className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal" />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-700">
            Assign support owner
            <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
              <option value="">Department queue (unassigned)</option>
              {supportUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-semibold text-slate-700">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-700">
              Due date
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            </label>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{saving ? 'Assigning…' : 'Create task'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading department tasks…
        </div>
      ) : visibleTasks.length === 0 ? (
        tasks.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-6 py-12 text-center">
            <ClipboardList className="mx-auto h-9 w-9 text-amber-500" />
            <h3 className="mt-3 text-base font-bold text-slate-800">
              No tasks match active filter
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Filtered by: {statusFilter !== 'All' ? `Status "${statusLabels[statusFilter]}"` : ''}
              {statusFilter !== 'All' && departmentFilter !== 'All' ? ' and ' : ''}
              {departmentFilter !== 'All' ? `Department "${departmentFilter}"` : ''}.
              {' '}(Total {tasks.length} task{tasks.length > 1 ? 's' : ''} on the board)
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setDepartmentFilter('All');
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-cyan-800"
            >
              <RotateCcw size={14} />
              Show all {tasks.length} task{tasks.length > 1 ? 's' : ''} (Reset filters)
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No tasks on the department board</p>
            <p className="mt-1 text-xs text-slate-500">{canAssign ? 'Assign a task to get the department board started.' : 'New admin assignments will appear here automatically.'}</p>
          </div>
        )
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {visibleTasks.map((task) => (
            <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${task.department === 'Developer' ? 'bg-violet-100 text-violet-800' : 'bg-cyan-100 text-cyan-800'}`}>{task.department}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label={`Update status for ${task.title}`}
                    value={task.status}
                    onChange={(event) => void handleStatusChange(task, event.target.value as TaskStatus)}
                    className={`rounded-lg border-0 px-2.5 py-2 text-xs font-bold ${statusStyles[task.status]}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>

                  {canAssign && (
                    <button
                      id={`delete-btn-${task.id}`}
                      type="button"
                      disabled={deletingId === task.id}
                      onClick={() => setConfirmDeleteTask({ id: task.id, title: task.title })}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none cursor-pointer disabled:opacity-40"
                      title="Delete task"
                      aria-label={`Delete task ${task.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{task.description}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span>{task.assignedToName ? `Owner: ${task.assignedToName}` : 'Department queue'}</span>
                <span className="inline-flex items-center gap-1.5">
                  {task.dueDate && <><CalendarDays size={13} /> Due {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}</>}
                </span>
                <span>Assigned by {task.createdByName}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* In-app Task Deletion Confirmation Modal */}
      {confirmDeleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Department Task</h3>
                <p className="text-xs text-slate-500">This will remove the task from all boards.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 my-4">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{confirmDeleteTask.title}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteTask(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-task-btn"
                type="button"
                disabled={deletingId === confirmDeleteTask.id}
                onClick={async () => {
                  const target = confirmDeleteTask;
                  setConfirmDeleteTask(null);
                  await handleDeleteTask(target.id, target.title);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {deletingId === confirmDeleteTask.id ? 'Deleting…' : 'Yes, Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
