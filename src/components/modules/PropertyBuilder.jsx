import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  DoorOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Smartphone, 
  ShieldCheck,
  ChevronRight,
  Download,
  Upload,
  Search,
  MoreVertical
} from 'lucide-react';
import './PropertyBuilder.css';

const PropertyBuilder = () => {
  const [step, setStep] = useState(1); // 1: Building, 2: Floors/Rooms, 3: Review
  const [buildings, setBuildings] = useState([
    { id: 'b1', name: 'Main Tower', address: '123 Hotel St', floors: [
      { id: 'f1', level: 1, rooms: [
        { id: 'r101', number: '101', type: 'Standard', status: 'Clean', lock: 'Digital' },
        { id: 'r102', number: '102', type: 'Suite', status: 'Dirty', lock: 'RFID' }
      ]}
    ]}
  ]);

  const [newBuilding, setNewBuilding] = useState({ name: '', address: '' });
  const [bulkConfig, setBulkConfig] = useState({ floors: 5, roomsPerFloor: 12, startNumber: 101 });

  const addBuilding = () => {
    if (!newBuilding.name) return;
    const id = 'b' + (buildings.length + 1);
    setBuildings([...buildings, { ...newBuilding, id, floors: [] }]);
    setNewBuilding({ name: '', address: '' });
    setStep(2);
  };

  const generateRooms = (buildingId) => {
    setBuildings(prev => prev.map(b => {
      if (b.id !== buildingId) return b;
      const newFloors = [];
      for (let f = 1; f <= bulkConfig.floors; f++) {
        const rooms = [];
        for (let r = 1; r <= bulkConfig.roomsPerFloor; r++) {
          const roomNum = (f * 100) + r;
          rooms.push({
            id: `r${roomNum}`,
            number: roomNum.toString(),
            type: r % 5 === 0 ? 'Suite' : 'Standard',
            status: 'Clean',
            lock: 'Mobile Key'
          });
        }
        newFloors.push({ id: `f${f}`, level: f, rooms });
      }
      return { ...b, floors: newFloors };
    }));
    setStep(3);
  };

  return (
    <div className="property-builder-container animate-fade-in">
      {/* Header */}
      <header className="builder-header">
        <div className="title-group">
          <h1>Property Builder</h1>
          <p>Configurez votre inventaire hôtelier à grande échelle</p>
        </div>
        <div className="header-actions">
           <button className="btn-secondary"><Upload size={16} /> Import CSV</button>
           <button className="btn-primary" onClick={() => setStep(1)}><Plus size={16} /> Nouveau Bâtiment</button>
        </div>
      </header>

      {/* Wizard Steps Indicator */}
      <div className="wizard-steps">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}><span>1</span> Structure</div>
        <div className="step-divider"></div>
        <div className={`step-item ${step >= 2 ? 'active' : ''}`}><span>2</span> Configuration</div>
        <div className="step-divider"></div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}><span>3</span> Revue & IoT</div>
      </div>

      <main className="builder-content">
        {step === 1 && (
          <div className="step-panel animate-slide-up">
            <h3>Détails du Bâtiment</h3>
            <div className="form-group">
              <label>Nom du Bâtiment</label>
              <input 
                type="text" 
                placeholder="Ex: Aile Nord, Main Tower..." 
                value={newBuilding.name}
                onChange={e => setNewBuilding({...newBuilding, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Adresse / Zone</label>
              <input 
                type="text" 
                placeholder="Adresse physique ou zone interne" 
                value={newBuilding.address}
                onChange={e => setNewBuilding({...newBuilding, address: e.target.value})}
              />
            </div>
            <button className="btn-full-primary" onClick={addBuilding}>Continuer vers l'étage</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-panel animate-slide-up">
            <h3>Assistant de création par lots</h3>
            <div className="bulk-grid">
               <div className="form-group">
                 <label>Nombre d'Étages</label>
                 <input 
                   type="number" 
                   value={bulkConfig.floors}
                   onChange={e => setBulkConfig({...bulkConfig, floors: parseInt(e.target.value)})}
                 />
               </div>
               <div className="form-group">
                 <label>Chambres / Étage</label>
                 <input 
                   type="number" 
                   value={bulkConfig.roomsPerFloor}
                   onChange={e => setBulkConfig({...bulkConfig, roomsPerFloor: parseInt(e.target.value)})}
                 />
               </div>
            </div>
            <div className="info-box">
              <AlertCircle size={18} />
              <span>Ceci générera {bulkConfig.floors * bulkConfig.roomsPerFloor} unités avec numérotation séquentielle.</span>
            </div>
            <button className="btn-full-primary" onClick={() => generateRooms(buildings[buildings.length-1].id)}>Générer l'inventaire</button>
          </div>
        )}

        {step === 3 && (
          <div className="inventory-preview animate-fade-in">
            {buildings.map(b => (
              <div key={b.id} className="building-card">
                <div className="building-info">
                   <Building2 size={24} color="#3B82F6" />
                   <div>
                     <h4>{b.name}</h4>
                     <p>{b.address}</p>
                   </div>
                   <div className="badge-count-large">{b.floors.reduce((acc, f) => acc + f.rooms.length, 0)} Unités</div>
                </div>

                <div className="floors-list">
                  {b.floors.map(f => (
                    <div key={f.id} className="floor-row">
                      <div className="floor-label">
                         <Layers size={16} />
                         <span>Étage {f.level}</span>
                      </div>
                      <div className="rooms-grid">
                        {f.rooms.map(r => (
                          <div key={r.id} className={`room-pill status-${r.status.toLowerCase()}`}>
                            <span className="room-num">{r.number}</span>
                            <div className="room-icons">
                               {r.lock === 'Digital' ? <Key size={10} /> : <Smartphone size={10} />}
                               {r.status === 'Clean' ? <CheckCircle2 size={10} color="#10B981" /> : <AlertCircle size={10} color="#F59E0B" />}
                            </div>
                          </div>
                        ))}
                        <button className="btn-add-room"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Menu */}
      <div className="builder-footer">
        <p>Total Chambres Actives: <span className="text-highlight">128</span></p>
        <div className="footer-btns">
           <button className="btn-outline">Annuler</button>
           <button className="btn-success" onClick={() => setStep(1)}><ShieldCheck size={16} /> Valider l'Inventaire</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyBuilder;
