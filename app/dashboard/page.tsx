'use client';
import { useEffect, useState, useContext, useCallback } from 'react';
import { api } from '../lib/axios';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, authLoading, logout } = useContext(AuthContext);
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const projectRes = await api.get('/projects', { headers: { Authorization: `Bearer ${user.token}` } });
      const projectsArray = Array.isArray(projectRes.data) ? projectRes.data : (projectRes.data.projects || []);
      setProjects(projectsArray);

      if (projectsArray.length > 0) {
        const taskRequests = projectsArray.map((p: any) =>
          api.get(`/tasks/${p.id}`, { headers: { Authorization: `Bearer ${user.token}` } }).catch(() => ({ data: [] }))
        );
        const taskResponses = await Promise.all(taskRequests);
        const allTasks: any[] = [];
        taskResponses.forEach((res, index) => {
          const tasksArray = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
          tasksArray.forEach((task: any) => { allTasks.push({ ...task, project_id: projectsArray[index].id }); });
        });
        setTasks(allTasks);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [user?.token]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/');
      else fetchData();
    }
  }, [user, authLoading, fetchData, router]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await api.post('/projects', { name: newProjectName }, { headers: { Authorization: `Bearer ${user.token}` } });
    setNewProjectName('');
    fetchData();
  };

  if (authLoading || loading) return <div className="p-10 text-center">Loading TaskFlow...</div>;

  // Stats Logic
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">TaskFlow</h1>
        <button onClick={logout} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Logout</button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-blue-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Total Projects</p>
          <p className="text-3xl font-black">{totalProjects}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-purple-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Total Tasks</p>
          <p className="text-3xl font-black">{totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Completed</p>
          <p className="text-3xl font-black">{completedTasks}</p>
        </div>
      </div>

      {/* Create Project Section */}
      <div className="flex gap-2 mb-10 bg-white p-4 rounded-xl shadow-sm">
        <input 
          className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" 
          placeholder="Enter project name..." 
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button onClick={handleCreateProject} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Create Project</button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          const done = projectTasks.filter(t => t.status === 'Done').length;
          const total = projectTasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={project.id} onClick={() => router.push(`/project/${project.id}`)} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md cursor-pointer transition">
              <h3 className="text-xl font-bold mb-4">{project.name}</h3>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-500">{done} of {total} tasks</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}