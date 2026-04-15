import React from 'react';
import './KanbanView.css';
import { motion } from 'framer-motion';
import { Battery, BatteryMedium, BatteryWarning } from 'lucide-react';

const KanbanCard = ({ task, index }) => {
  return (
    <motion.div 
      className="glass-card kanban-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="card-room-badge">{task.room}</div>
      <div className="card-title">{task.title}</div>
      <div className="card-meta">
        <div className="battery-status">
          {task.battery > 60 ? (
            <Battery size={14} className="battery-icon good" />
          ) : task.battery > 20 ? (
            <BatteryMedium size={14} className="battery-icon warning" />
          ) : (
            <BatteryWarning size={14} className="battery-icon critical" />
          )}
          {task.battery}% lock
        </div>
        <div className="assignee-avatar" title={task.assignee}>
          {task.assignee.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
    </motion.div>
  );
};

const KanbanView = () => {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: 't1', title: 'Deep Cleaning (Post-stay)', room: 'Room 302', battery: 85, assignee: 'Maria G.' },
        { id: 't2', title: 'Replace HVAC Filter', room: 'Room 105', battery: 45, assignee: 'John D.' }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: 't3', title: 'Light Turnover', room: 'Room 401', battery: 92, assignee: 'Sarah T.' }
      ]
    },
    {
      id: 'inspected',
      title: 'Inspected',
      tasks: [
        { id: 't4', title: 'VIP Setup Verification', room: 'Suite A', battery: 15, assignee: 'Alex M.' }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: 't5', title: 'Smart Lock Battery Swap', room: 'Room 202', battery: 100, assignee: 'John D.' }
      ]
    }
  ];

  return (
    <motion.div 
      className="glass-panel kanban-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px' }}
    >
      <div className="kanban-header">
        <h2 className="kanban-title">Operations Board</h2>
      </div>

      <div className="kanban-board">
        {columns.map((column, colIndex) => (
          <div key={column.id} className="kanban-column">
            <div className="column-header">
              <span>{column.title}</span>
              <span className="column-count">{column.tasks.length}</span>
            </div>
            <div className="column-content">
              {column.tasks.map((task, i) => (
                <KanbanCard key={task.id} task={task} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default KanbanView;
