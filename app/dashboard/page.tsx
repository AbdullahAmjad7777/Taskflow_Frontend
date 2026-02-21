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

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-bold animate-pulse">Loading TaskFlow...</p>
      </div>
    );
  }

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 transition-all duration-700 ease-in-out">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-blue-600 tracking-tighter transition-all hover:skew-x-2 cursor-default">TaskFlow</h1>
          <p className="text-gray-400 text-sm font-medium">Welcome back, {user?.name || 'User'} 👋</p>
        </div>
        <button 
          onClick={logout} 
          className="w-full sm:w-auto bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90 border border-red-100"
        >
          Logout
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Projects', val: totalProjects, color: 'border-blue-500', text: 'text-blue-600' },
          { label: 'Total Tasks', val: totalTasks, color: 'border-purple-500', text: 'text-purple-600' },
          { label: 'Completed', val: completedTasks, color: 'border-green-500', text: 'text-green-600' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-b-8 ${stat.color} transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.text}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Create Project Section */}
      <div className="group flex flex-col sm:flex-row gap-3 mb-12 bg-white p-3 rounded-2xl shadow-md border border-gray-100 transition-all focus-within:ring-2 focus-within:ring-blue-100">
        <input 
          className="flex-1 bg-transparent p-3 outline-none font-medium text-gray-700" 
          placeholder="What's your next big project?" 
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <button 
          onClick={handleCreateProject} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
        >
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      <h2 className="text-xl font-black text-gray-800 mb-6 px-1">Your Workspaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => {
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          const done = projectTasks.filter(t => t.status === 'Done').length;
          const total = projectTasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div 
              key={project.id} 
              onClick={() => router.push(`/project/${project.id}`)} 
              className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 cursor-pointer transition-all duration-500 flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                  {project.name}
                </h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md">PROJ-{project.id.toString().slice(-3)}</span>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-3 font-bold">
                  <span className="text-gray-400">{done} / {total} Tasks Finished</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-50">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-1000 rounded-full" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
