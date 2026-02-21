'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../lib/axios';
import { AuthContext } from '../../context/AuthContext';
import TaskCard from '../../components/TaskCard';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Low',
    status: 'To Do',
    due_date: '',
  });

  const fetchProjectDetails = useCallback(async () => {
    if (!user?.token || !id) return;
    try {
      const res = await api.get(`/tasks/${id}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setTasks(res.data);
      
      const projRes = await api.get(`/projects`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      const currentProj = projRes.data.find((p: any) => p.id === Number(id));
      setProject(currentProj);
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  }, [id, user?.token]);

  useEffect(() => {
    if (user?.token) fetchProjectDetails();
  }, [user, fetchProjectDetails]);

  const handleAddTask = async () => {
    if (!newTask.title) return alert("Title is required");
    if (!user?.token) return;

    try {
      await api.post(`/tasks/${id}`, newTask, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setNewTask({ title: '', description: '', priority: 'Low', status: 'To Do', due_date: '' });
      fetchProjectDetails();
    } catch (error) {
      alert("Task add nahi ho saka");
    }
  };

  const handleUpdateTask = async () => {
    if (!editTask || !user?.token) return;
    try {
      await api.put(`/tasks/${editTask.id}`, editTask, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setEditTask(null);
      fetchProjectDetails();
    } catch (error) {
      alert("Update fail ho gaya");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?") || !user?.token) return;
    try {
      await api.delete(`/tasks/${taskId}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      fetchProjectDetails();
    } catch (error) {
      alert("Delete fail ho gaya");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure? This will delete the project and all its tasks.") || !user?.token) return;
    try {
      await api.delete(`/projects/${id}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      router.push('/dashboard');
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const moveTask = async (task: any, newStatus: string) => {
    if (!user?.token) return;
    const cleanDate = task.due_date ? task.due_date.split('T')[0] : null;
    try {
      await api.put(`/tasks/${task.id}`, 
        { ...task, status: newStatus, due_date: cleanDate }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchProjectDetails();
    } catch (error) {
      console.error("Move Task Error:", error);
    }
  };

  const statuses = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="group">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex items-center text-blue-600 font-semibold mb-2 transition-transform hover:-translate-x-1"
            >
              <span className="mr-2">←</span> Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {project?.name || 'Project Tasks'}
            </h1>
          </div>
          <button 
            onClick={handleDeleteProject} 
            className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm border border-red-100 active:scale-95"
          >
            Delete Project
          </button>
        </header>

        {/* Add Task Form - Modern Glassmorphism approach */}
        <section className="bg-white p-6 rounded-2xl shadow-sm mb-10 border border-slate-200/60 transition-all hover:shadow-md">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Add Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              placeholder="Task Title" 
              value={newTask.title} 
              onChange={e => setNewTask({...newTask, title: e.target.value})} 
            />
            <input 
              type="date" 
              className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              value={newTask.due_date} 
              onChange={e => setNewTask({...newTask, due_date: e.target.value})} 
            />
            <select 
              className="border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white" 
              value={newTask.priority} 
              onChange={e => setNewTask({...newTask, priority: e.target.value})}
            >
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <button 
              onClick={handleAddTask} 
              className="bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Create Task
            </button>
            <textarea 
              className="border border-slate-200 p-3 rounded-xl md:col-span-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]" 
              placeholder="Describe the task details..." 
              value={newTask.description} 
              onChange={e => setNewTask({...newTask, description: e.target.value})} 
            />
          </div>
        </section>

        {/* Task Board - Kanban Style */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {statuses.map(status => (
            <div key={status} className="bg-slate-200/40 p-5 rounded-2xl border border-slate-200/50 min-h-[500px] transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-500 uppercase text-xs tracking-[0.2em]">{status}</h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              
              <div className="space-y-4">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <TaskCard task={task} onEdit={setEditTask} onDelete={handleDeleteTask} />
                    
                    {/* Simplified Quick Move Actions */}
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-x-auto pb-1">
                      {statuses.filter(s => s !== status).map(s => (
                        <button 
                          key={s} 
                          onClick={() => moveTask(task, s)} 
                          className="whitespace-nowrap text-[9px] font-black uppercase tracking-tighter bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Edit Task</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Title</label>
                <input className="border border-slate-200 w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                <textarea className="border border-slate-200 w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" value={editTask.description} onChange={e => setEditTask({...editTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Priority</label>
                  <select className="border border-slate-200 w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Due Date</label>
                  <input type="date" className="border border-slate-200 w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={editTask.due_date?.split('T')[0] || ''} onChange={e => setEditTask({...editTask, due_date: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditTask(null)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleUpdateTask} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
