import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const { data, error } = await supabase.from('tasks').insert({ title: newTaskTitle, status: 'pending' }).select();
      if (error) throw error;
      
      setTasks(prev => [data[0], ...prev]);
      setNewTaskTitle('');
      toast.success('Task added!');
      
      // Log activity for AI
      api.post('/api/activity', { action_type: 'task_created', description: `Created a new task: ${newTaskTitle}` }).catch(() => {});
    } catch (e) {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { data, error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id).select();
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === task.id ? data[0] : t));
      
      // Log activity
      api.post('/api/activity', { action_type: 'task_updated', description: `Marked task '${task.title}' as ${newStatus}` }).catch(() => {});
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string, title: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task deleted');
      
      api.post('/api/activity', { action_type: 'task_deleted', description: `Deleted task: ${title}` }).catch(() => {});
    } catch (e) {
      toast.error('Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Checklist</h1>
        <p className="page-subtitle">Stay on top of your wedding plans.</p>
      </header>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="card-static p-4 flex items-center gap-4">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
            {completedCount}/{tasks.length} done
          </span>
        </div>
      )}

      <form onSubmit={handleAddTask} className="flex gap-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="btn-primary"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      <div className="card-static p-4 md:p-8">
        {isLoading ? (
          <p className="text-center text-text-tertiary py-10 animate-pulse">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-text-secondary font-medium">No tasks yet</p>
            <p className="text-sm text-text-tertiary">Add one above to get started!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-white/5 group ${task.status === 'completed' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task)}>
                  <button className={`${task.status === 'completed' ? 'text-success' : 'text-text-tertiary hover:text-text-secondary'} transition-colors`}>
                    {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <span className={`text-[15px] ${task.status === 'completed' ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id, task.title)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-error transition-all p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
