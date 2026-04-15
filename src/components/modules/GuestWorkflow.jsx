import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, FileText, CreditCard, KeyRound } from 'lucide-react';
import './GuestWorkflow.css';

const GuestWorkflow = () => {
  // Sample data simulating a guest's progress
  const [guests, setGuests] = useState([
    { id: '1', name: 'Alice Smith', room: 'Villa Sunrise', currentStage: 3, status: 'success' },
    { id: '2', name: 'Bob Johnson', room: 'Ocean View 4A', currentStage: 1, status: 'error', errorMsg: 'ID Rejected: Blurry Image' },
    { id: '3', name: 'Charlie Davis', room: 'Mountain Cabin', currentStage: 2, status: 'pending' }
  ]);

  const stages = [
    { num: 1, label: 'Booking Confirmed', icon: <CheckCircle2 size={18} />, colorClass: 'blue' },
    { num: 2, label: 'ID Verification', icon: <FileText size={18} />, colorClass: 'yellow' },
    { num: 3, label: 'Payment Secured', icon: <CreditCard size={18} />, colorClass: 'green' },
    { num: 4, label: 'Digital Key Sent', icon: <KeyRound size={18} />, colorClass: 'cyan' },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Guest Journey Workflows</h2>
        <div className="header-actions">
           <button className="btn-primary-outline">Filter Active</button>
        </div>
      </div>

      <div className="workflows-list">
        {guests.map(guest => (
          <div key={guest.id} className="white-card guest-flow-card">
             
             <div className="guest-info">
               <div className="avatar-group small">
                 <div className="avatar bg-blue text-white">{guest.name.charAt(0)}</div>
               </div>
               <div>
                 <h3>{guest.name}</h3>
                 <span className="room-label">{guest.room}</span>
               </div>
               
               {guest.status === 'error' && (
                 <div className="error-badge">
                   <AlertCircle size={14} />
                   <span>{guest.errorMsg}</span>
                 </div>
               )}
             </div>

             <div className="flow-path-container">
               {stages.map((stage, index) => {
                 
                 const isCompleted = guest.currentStage >= stage.num;
                 const isCurrent = guest.currentStage === stage.num;
                 const isError = isCurrent && guest.status === 'error';
                 
                 let nodeClass = '';
                 if (isCompleted && !isError) nodeClass = `completed ${stage.colorClass}`;
                 if (isCurrent && guest.status === 'pending') nodeClass = `pulsing ${stage.colorClass}`;
                 if (isError) nodeClass = 'error-state';

                 // Determine line color to the NEXT stage
                 let lineClass = '';
                 if (index < stages.length - 1) {
                    if (guest.currentStage > stage.num) lineClass = 'active-line';
                    if (isError && guest.currentStage === stage.num) lineClass = 'error-line';
                 }

                 return (
                   <React.Fragment key={stage.num}>
                     
                     <div className={`flow-node ${nodeClass}`}>
                        <div className="node-icon">{stage.icon}</div>
                        <span className="node-label">{stage.label}</span>
                     </div>
                     
                     {index < stages.length - 1 && (
                       <div className={`flow-connector ${lineClass}`}>
                         <div className="energy-pulse"></div>
                       </div>
                     )}

                   </React.Fragment>
                 )
               })}
             </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestWorkflow;
