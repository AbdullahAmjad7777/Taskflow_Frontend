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

  // API Call to fetch details
  const fetchProjectDetails = useCallback(async () => {
    if (!user?.token || !id) return;
    try {
      // 1. Get Tasks for this project
      const res = await api.get(`/tasks/${id}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      setTasks(res.data);
      
      // 2. Get All Projects to find current project name
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

  // Add New Task
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

  // Update Existing Task (from Modal)
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

  // Delete Task
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

  // Delete Entire Project
  const handleDeleteProject = async () => {
    if (!confirm("Are you sure? This will delete the project and all its tasks.") || !user?.token) return;
    try {
      await api.delete(`/projects/${id}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      router.push('/dashboard');
    } catch (err) {
      alert("Delete failed. Check backend route.");
    }
  };

  // Move Task (Important for "Done" status)
  const moveTask = async (task: any, newStatus: string) => {
  if (!user?.token) return;

  // Date ko clean karein: "2026-02-22T19:00:00.000Z" -> "2026-02-22"
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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:underline mb-2 block">← Back to Dashboard</button>
            <h1 className="text-3xl font-bold text-gray-800">{project?.name || 'Project Tasks'}</h1>
          </div>
          <button onClick={handleDeleteProject} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition">
            Delete Project
          </button>
        </div>

        {/* Add Task Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="border p-2 rounded-lg" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <input type="date" className="border p-2 rounded-lg" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
            <select className="border p-2 rounded-lg" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <button onClick={handleAddTask} className="bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Add Task</button>
            <textarea className="border p-2 rounded-lg md:col-span-4" placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
          </div>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map(status => (
            <div key={status} className="bg-gray-100 p-4 rounded-xl min-h-[400px]">
              <h3 className="font-black text-gray-500 uppercase text-sm mb-4 tracking-widest">{status}</h3>
              <div className="space-y-3">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="relative group">
                    <TaskCard task={task} onEdit={setEditTask} onDelete={handleDeleteTask} />
                    {/* Move Quick Actions */}
                    <div className="flex gap-1 mt-1">
                      {statuses.filter(s => s !== status).map(s => (
                        <button 
                          key={s} 
                          onClick={() => moveTask(task, s)} 
                          className="text-[10px] bg-white border px-2 py-0.5 rounded hover:bg-blue-50 transition"
                        >
                          Move to {s}
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

      {/* Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <input className="border w-full p-2 mb-2 rounded" value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})} />
            <textarea className="border w-full p-2 mb-2 rounded" value={editTask.description} onChange={e => setEditTask({...editTask, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select className="border p-2 rounded" value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <input type="date" className="border p-2 rounded" value={editTask.due_date?.split('T')[0] || ''} onChange={e => setEditTask({...editTask, due_date: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTask(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleUpdateTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}