import React, { useState } from 'react';
import { Plus, MoreHorizontal, ChevronDown, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './TaskListView.css';

const INITIAL_TASKS = [
  { id: 1, title: 'Check-in VIP', time: '14:00', desc: 'Villa Ocean Dream', role: 'Concierge', avatar: 'MK', status: 'priority', color: 'yellow' },
  { id: 2, title: 'Nettoyage Ch. 104', color: 'cyan', status: 'priority' },
  { id: 3, title: 'Panier Accueil', color: 'yellow', status: 'priority', tag: 'Urgent' },
  { id: 4, title: 'Générer code PIN', color: 'yellow', status: 'priority' },
  { id: 5, title: 'Inspection Villa', role: 'Gouvernante', avatar: 'SA', status: 'completed', color: 'green' },
];

const TaskListView = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'priority' ? 'completed' : 'priority' };
      }
      return t;
    }));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return setIsAdding(false);
    
    setTasks([
      { id: Date.now(), title: newTaskTitle, status: 'priority', color: 'cyan' },
      ...tasks
    ]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const priorityTasks = tasks.filter(t => t.status === 'priority');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="tasklist-container hide-scrollbar">
      
      {/* Group: Priorités */}
      <div className="task-group">
        <div className="group-header">
          <h3>Priorités</h3>
          <span className="badge-count badge-red">{priorityTasks.length}</span>
          <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
        </div>

        <div className="task-cards-list">
          <AnimatePresence>
            {priorityTasks.map(task => (
              <motion.div 
                key={task.id} 
                className="white-card task-item collapsed"
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => toggleTask(task.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="item-header">
                  <h4>{task.title} {task.tag ? <span className="tag-new">{task.tag}</span> : <span className={`dot-${task.color}`}></span>}</h4>
                  <div className={`check-circle ${task.color}`} style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #cbd5e1' }}></div>
                </div>
                {task.desc && <p className="task-subtitle mt-2">{task.desc}</p>}
                {task.role && (
                  <div className="task-footer mt-2">
                    <span className="task-role">{task.role}</span>
                    <div className="avatar-group small">
                      <div className="avatar bg-blue text-white">{task.avatar}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Group: Completed */}
      <div className="task-group mt-4">
        <div className="group-header">
          <h3>Terminé</h3>
          <span className="badge-count badge-blue">{completedTasks.length}</span>
          <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
        </div>

        <div className="task-cards-list">
          <AnimatePresence>
            {completedTasks.map(task => (
              <motion.div 
                key={task.id} 
                className="white-card task-item collapsed"
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => toggleTask(task.id)}
                style={{ cursor: 'pointer', opacity: 0.6 }}
              >
                <div className="item-header">
                  <h4 style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{task.title}</h4>
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Primary Action Button */}
          {isAdding ? (
            <form onSubmit={addTask} style={{ marginTop: '10px' }}>
               <input 
                 autoFocus
                 type="text" 
                 value={newTaskTitle}
                 onChange={e => setNewTaskTitle(e.target.value)}
                 onBlur={addTask}
                 placeholder="Titre de la tâche..."
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
               />
            </form>
          ) : (
            <button className="btn-add-primary" onClick={() => setIsAdding(true)}>
              Nouvelle Tâche <span className="btn-plus"><Plus size={14}/></span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default TaskListView;
