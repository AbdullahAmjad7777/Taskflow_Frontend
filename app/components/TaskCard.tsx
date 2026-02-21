'use client';

export default function TaskCard({ task, onEdit, onDelete }: { task: any, onEdit: (t: any) => void, onDelete: (id: number) => void }) {
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';

  const priorityStyles = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className={`p-4 bg-white border rounded-xl mb-3 shadow-sm ${isOverdue ? 'ring-2 ring-red-500 bg-red-50' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyles[task.priority as keyof typeof priorityStyles]}`}>
          {task.priority}
        </span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-blue-600 text-xs">Edit</button>
          <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-600 text-xs">Delete</button>
        </div>
      </div>
      
      <h4 className="font-bold text-gray-800">{task.title}</h4>
      <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
      
      <div className="mt-3 flex items-center justify-between">
        <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
          📅 {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
          {isOverdue && " (OVERDUE)"}
        </p>
      </div>
    </div>
  );
}