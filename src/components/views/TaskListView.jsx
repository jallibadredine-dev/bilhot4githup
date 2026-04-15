import React from 'react';
import { Plus, MoreHorizontal, ChevronDown, CheckCircle2, EyeOff, Trash2 } from 'lucide-react';
import './TaskListView.css';

const TaskListView = () => {
  return (
    <div className="tasklist-container hide-scrollbar">
      
      {/* Group: New */}
      <div className="task-group">
        <div className="group-header">
          <h3>New</h3>
          <span className="badge-count badge-red">4</span>
          <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
        </div>

        <div className="task-cards-list">
          <div className="white-card task-item expanded">
             <div className="item-header">
                <h4>Wireframing <span className="dot-yellow"></span></h4>
                <div className="progress-text yellow">45%</div>
             </div>
             <p className="task-subtitle">Real Estate Project</p>
             <div className="task-footer">
                <span className="task-role">Designer</span>
                <div className="avatar-group small">
                  <div className="avatar"></div>
                  <div className="avatar bg-blue text-white">NS</div>
                </div>
             </div>
          </div>

          <div className="white-card task-item collapsed">
            <div className="item-header">
              <h4>Design system <span className="dot-yellow"></span></h4>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>

          <div className="white-card task-item collapsed">
            <div className="item-header">
              <h4>Designing <span className="tag-new">New</span></h4>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>
          
          <div className="white-card task-item collapsed">
            <div className="item-header">
              <h4>Auto layout <span className="dot-cyan"></span></h4>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>
      </div>

      {/* Group: Completed */}
      <div className="task-group mt-4">
        <div className="group-header">
          <h3>Completed</h3>
          <span className="badge-count badge-blue">6</span>
          <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
        </div>

        <div className="task-cards-list">
          <div className="white-card task-item expanded">
             <div className="item-header">
                <h4>User interview <span className="dot-green"></span></h4>
                <div className="progress-text green">100%</div>
             </div>
             <div className="task-footer">
                <span className="task-role">Researcher</span>
                <div className="avatar-group small">
                  <div className="avatar"></div>
                  <div className="avatar bg-yellow">SA</div>
                </div>
             </div>
          </div>

          {/* Primary Action Button */}
          <button className="btn-add-primary">
            Add New <span className="btn-plus"><Plus size={14}/></span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TaskListView;
