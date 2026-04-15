import React, { useState, useMemo } from 'react';
import {
  Building2, Layers, DoorOpen, Plus, Trash2, ChevronDown, ChevronRight,
  Search, Filter, Lock, BatteryMedium, Wifi, WifiOff, AlertTriangle,
  Settings, MoreVertical, Check, X, Zap, Edit3, Copy, Key,
  CheckCircle, XCircle, Wrench, Eye, BatteryFull, BatteryLow,
  Signal, SignalZero, Package, Grid3x3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartInventory.css';

/* ─── Data Seed ─── */
const LOCK_PROVIDERS = [
  { id: 'ttlock', name: 'TTLock', color: '#3B82F6', logo: '🔐' },
  { id: 'tthotel', name: 'TTHotel', color: '#8B5CF6', logo: '🏨' },
  { id: 'tuya', name: 'Tuya Smart', color: '#10B981', logo: '🌿' },
];

const ROOM_TYPES = [
  { id: 'standard', label: 'Standard', icon: '🛏️' },
  { id: 'superior', label: 'Supérieure', icon: '⭐' },
  { id: 'deluxe', label: 'Deluxe', icon: '💎' },
  { id: 'suite', label: 'Suite', icon: '👑' },
  { id: 'family', label: 'Familiale', icon: '👨‍👩‍👧' },
  { id: 'accessible', label: 'Accessible PMR', icon: '♿' },
];

const STATUS_MAP = {
  available: { label: 'Disponible', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle size={14} /> },
  occupied: { label: 'Occupée', color: '#3B82F6', bg: '#EFF6FF', icon: <DoorOpen size={14} /> },
  maintenance: { label: 'Maintenance', color: '#F59E0B', bg: '#FFFBEB', icon: <Wrench size={14} /> },
  blocked: { label: 'Hors service', color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={14} /> },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

/* ─── Initial Demo Data ─── */
const createInitialData = () => [{
  id: generateId(),
  name: 'Bâtiment Principal',
  floors: [
    {
      id: generateId(),
      number: 1,
      label: 'Rez-de-chaussée',
      rooms: [
        { id: generateId(), number: '101', type: 'standard', status: 'available', lock: { provider: 'ttlock', battery: 92, connected: true, lastSync: '2 min' } },
        { id: generateId(), number: '102', type: 'superior', status: 'occupied', lock: { provider: 'tthotel', battery: 78, connected: true, lastSync: '5 min' } },
        { id: generateId(), number: '103', type: 'deluxe', status: 'available', lock: null },
        { id: generateId(), number: '104', type: 'standard', status: 'maintenance', lock: { provider: 'tuya', battery: 15, connected: false, lastSync: '3h' } },
      ]
    },
    {
      id: generateId(),
      number: 2,
      label: 'Premier étage',
      rooms: [
        { id: generateId(), number: '201', type: 'suite', status: 'available', lock: { provider: 'ttlock', battery: 100, connected: true, lastSync: '1 min' } },
        { id: generateId(), number: '202', type: 'deluxe', status: 'occupied', lock: { provider: 'tthotel', battery: 65, connected: true, lastSync: '10 min' } },
        { id: generateId(), number: '203', type: 'family', status: 'available', lock: { provider: 'ttlock', battery: 88, connected: true, lastSync: '4 min' } },
      ]
    }
  ]
}];

const SmartInventory = ({ roomFolios = {}, clearFolioCharge }) => {
  const [buildings, setBuildings] = useState(createInitialData);
  const [expandedFloors, setExpandedFloors] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(null); // floorId
  const [showLockModal, setShowLockModal] = useState(null); // room
  const [showCheckoutModal, setShowCheckoutModal] = useState(null); // room details for checkout
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    let totalRooms = 0, available = 0, occupied = 0, maintenance = 0, connected = 0;
    buildings.forEach(b => b.floors.forEach(f => f.rooms.forEach(r => {
      totalRooms++;
      if (r.status === 'available') available++;
      if (r.status === 'occupied') occupied++;
      if (r.status === 'maintenance') maintenance++;
      if (r.lock?.connected) connected++;
    })));
    return { totalRooms, available, occupied, maintenance, connected };
  }, [buildings]);

  /* ─── Toggle Floor ─── */
  const toggleFloor = (floorId) => {
    setExpandedFloors(prev => ({ ...prev, [floorId]: !prev[floorId] }));
  };

  /* ─── Add Building ─── */
  const [newBuildingName, setNewBuildingName] = useState('');
  const [newBuildingFloors, setNewBuildingFloors] = useState(3);

  const handleAddBuilding = () => {
    if (!newBuildingName.trim()) return;
    const floors = [];
    for (let i = 1; i <= newBuildingFloors; i++) {
      floors.push({
        id: generateId(),
        number: i,
        label: i === 1 ? 'Rez-de-chaussée' : `Étage ${i - 1}`,
        rooms: [],
      });
    }
    setBuildings(prev => [...prev, { id: generateId(), name: newBuildingName, floors }]);
    setNewBuildingName('');
    setNewBuildingFloors(3);
    setShowAddBuilding(false);
  };

  /* ─── Bulk Create Rooms ─── */
  const [bulkFrom, setBulkFrom] = useState(1);
  const [bulkTo, setBulkTo] = useState(5);
  const [bulkType, setBulkType] = useState('standard');

  const handleBulkCreate = (buildingId, floorId) => {
    const building = buildings.find(b => b.id === buildingId);
    const floor = building?.floors.find(f => f.id === floorId);
    if (!floor) return;

    const prefix = floor.number * 100;
    const newRooms = [];
    for (let i = bulkFrom; i <= bulkTo; i++) {
      const roomNumber = String(prefix + i);
      // Skip if room number already exists
      if (floor.rooms.some(r => r.number === roomNumber)) continue;
      newRooms.push({
        id: generateId(),
        number: roomNumber,
        type: bulkType,
        status: 'available',
        lock: null,
      });
    }

    setBuildings(prev => prev.map(b =>
      b.id === buildingId
        ? {
            ...b,
            floors: b.floors.map(f =>
              f.id === floorId ? { ...f, rooms: [...f.rooms, ...newRooms] } : f
            ),
          }
        : b
    ));
    setShowBulkCreate(null);
    setBulkFrom(1);
    setBulkTo(5);
    setBulkType('standard');
  };

  /* ─── Assign Lock ─── */
  const handleAssignLock = (buildingId, floorId, roomId, providerId) => {
    setBuildings(prev => prev.map(b =>
      b.id === buildingId
        ? {
            ...b,
            floors: b.floors.map(f =>
              f.id === floorId
                ? {
                    ...f,
                    rooms: f.rooms.map(r =>
                      r.id === roomId
                        ? {
                            ...r,
                            lock: {
                              provider: providerId,
                              battery: 100,
                              connected: true,
                              lastSync: 'à l\'instant',
                            },
                          }
                        : r
                    ),
                  }
                : f
            ),
          }
        : b
    ));
    setShowLockModal(null);
  };

  /* ─── Change Room Status ─── */
  const handleStatusChange = (buildingId, floorId, roomId, newStatus) => {
    setBuildings(prev => prev.map(b =>
      b.id === buildingId
        ? {
            ...b,
            floors: b.floors.map(f =>
              f.id === floorId
                ? {
                    ...f,
                    rooms: f.rooms.map(r =>
                      r.id === roomId ? { ...r, status: newStatus } : r
                    ),
                  }
                : f
            ),
          }
        : b
    ));
  };

  /* ─── Checkout Room ─── */
  const handleCheckout = (buildingId, floorId, roomId, roomNumber) => {
    // 1. CLEAR FOLIO
    if (clearFolioCharge) {
      clearFolioCharge(roomNumber);
    }
    // 2. SET TO MAINTENANCE
    handleStatusChange(buildingId, floorId, roomId, 'maintenance');
    setShowCheckoutModal(null);
  };

  /* ─── Delete Room ─── */
  const handleDeleteRoom = (buildingId, floorId, roomId) => {
    setBuildings(prev => prev.map(b =>
      b.id === buildingId
        ? {
            ...b,
            floors: b.floors.map(f =>
              f.id === floorId
                ? { ...f, rooms: f.rooms.filter(r => r.id !== roomId) }
                : f
            ),
          }
        : b
    ));
  };

  /* ─── Battery Icon ─── */
  const BatteryIcon = ({ level }) => {
    if (level > 60) return <BatteryFull size={14} className="si-battery-good" />;
    if (level > 25) return <BatteryMedium size={14} className="si-battery-medium" />;
    return <BatteryLow size={14} className="si-battery-low" />;
  };

  /* ─── Filter rooms ─── */
  const filterRooms = (rooms) => {
    return rooms.filter(r => {
      const matchSearch = !searchQuery || r.number.includes(searchQuery);
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  };

  return (
    <div className="si-container">
      {/* ─── Top Bar ─── */}
      <div className="si-topbar">
        <div className="si-topbar-left">
          <div className="si-title-block">
            <div className="si-icon-title">
              <Package size={24} />
            </div>
            <div>
              <h1 className="si-title">Smart Inventory</h1>
              <p className="si-subtitle">Configuration hiérarchique des propriétés</p>
            </div>
          </div>
        </div>
        <div className="si-topbar-right">
          <div className="si-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher une chambre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="si-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="occupied">Occupée</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Hors service</option>
          </select>
          <button className="si-btn-primary" onClick={() => setShowAddBuilding(true)}>
            <Plus size={16} />
            <span>Ajouter Bâtiment</span>
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="si-stats-row">
        <div className="si-stat-card">
          <div className="si-stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><Layers size={20} /></div>
          <div className="si-stat-info">
            <span className="si-stat-value">{stats.totalRooms}</span>
            <span className="si-stat-label">Total Chambres</span>
          </div>
        </div>
        <div className="si-stat-card">
          <div className="si-stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}><CheckCircle size={20} /></div>
          <div className="si-stat-info">
            <span className="si-stat-value">{stats.available}</span>
            <span className="si-stat-label">Disponibles</span>
          </div>
        </div>
        <div className="si-stat-card">
          <div className="si-stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><DoorOpen size={20} /></div>
          <div className="si-stat-info">
            <span className="si-stat-value">{stats.occupied}</span>
            <span className="si-stat-label">Occupées</span>
          </div>
        </div>
        <div className="si-stat-card">
          <div className="si-stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}><Wrench size={20} /></div>
          <div className="si-stat-info">
            <span className="si-stat-value">{stats.maintenance}</span>
            <span className="si-stat-label">Maintenance</span>
          </div>
        </div>
        <div className="si-stat-card">
          <div className="si-stat-icon" style={{ background: '#F0FDF4', color: '#22C55E' }}><Wifi size={20} /></div>
          <div className="si-stat-info">
            <span className="si-stat-value">{stats.connected}</span>
            <span className="si-stat-label">Serrures IoT</span>
          </div>
        </div>
      </div>

      {/* ─── Buildings ─── */}
      <div className="si-buildings-list">
        {buildings.map((building) => (
          <div key={building.id} className="si-building-card">
            <div className="si-building-header">
              <div className="si-building-title">
                <Building2 size={22} className="si-building-icon" />
                <h2>{building.name}</h2>
                <span className="si-badge-count">{building.floors.reduce((acc, f) => acc + f.rooms.length, 0)} chambres</span>
              </div>
              <div className="si-building-actions">
                <button className="si-btn-ghost" title="Paramètres"><Settings size={16} /></button>
              </div>
            </div>

            {/* ─── Floors Accordion ─── */}
            <div className="si-floors-list">
              {building.floors.map((floor) => {
                const isExpanded = expandedFloors[floor.id] !== false; // default open
                const filteredRooms = filterRooms(floor.rooms);

                return (
                  <div key={floor.id} className="si-floor-section">
                    <div className="si-floor-header" onClick={() => toggleFloor(floor.id)}>
                      <div className="si-floor-left">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <span className="si-floor-label">
                          {floor.label || `Étage ${floor.number}`}
                        </span>
                        <span className="si-floor-count">{floor.rooms.length} ch.</span>
                      </div>
                      <div className="si-floor-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="si-btn-bulk"
                          onClick={() => setShowBulkCreate({ buildingId: building.id, floorId: floor.id })}
                        >
                          <Grid3x3 size={14} />
                          <span>Bulk Create</span>
                        </button>
                        <button
                          className="si-btn-add-room"
                          onClick={() => {
                            const prefix = floor.number * 100;
                            const nextNum = floor.rooms.length + 1;
                            const roomNumber = String(prefix + nextNum);
                            setBuildings(prev => prev.map(b =>
                              b.id === building.id
                                ? {
                                    ...b,
                                    floors: b.floors.map(f =>
                                      f.id === floor.id
                                        ? {
                                            ...f,
                                            rooms: [...f.rooms, {
                                              id: generateId(),
                                              number: roomNumber,
                                              type: 'standard',
                                              status: 'available',
                                              lock: null,
                                            }],
                                          }
                                        : f
                                    ),
                                  }
                                : b
                            ));
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="si-rooms-grid"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {filteredRooms.length === 0 ? (
                            <div className="si-empty-floor">
                              <DoorOpen size={32} strokeWidth={1} />
                              <p>Aucune chambre — Utilisez <strong>Bulk Create</strong> pour en ajouter</p>
                            </div>
                          ) : (
                            filteredRooms.map((room) => {
                              const statusInfo = STATUS_MAP[room.status];
                              const roomType = ROOM_TYPES.find(t => t.id === room.type);
                              const lockProvider = LOCK_PROVIDERS.find(l => l.id === room.lock?.provider);
                              const isSelected = selectedRoom?.id === room.id;

                              return (
                                <motion.div
                                  key={room.id}
                                  className={`si-room-card ${isSelected ? 'selected' : ''}`}
                                  layout
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  onClick={() => setSelectedRoom(isSelected ? null : { ...room, buildingId: building.id, floorId: floor.id })}
                                >
                                  {/* Room Header */}
                                  <div className="si-room-top">
                                    <div className="si-room-number-wrap">
                                      <span className="si-room-number">{room.number}</span>
                                      <span className="si-room-type">{roomType?.icon} {roomType?.label}</span>
                                      {roomFolios[room.number] && roomFolios[room.number].total > 0 && (
                                        <span className="si-folio-badge">
                                          Folio: €{roomFolios[room.number].total.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className="si-room-status"
                                      style={{ background: statusInfo.bg, color: statusInfo.color }}
                                    >
                                      {statusInfo.icon}
                                      <span>{statusInfo.label}</span>
                                    </div>
                                  </div>

                                  {/* Lock Info */}
                                  <div className="si-room-lock-row">
                                    {room.lock ? (
                                      <>
                                        <div className="si-lock-badge" style={{ borderColor: lockProvider?.color + '40', background: lockProvider?.color + '10' }}>
                                          <span className="si-lock-logo">{lockProvider?.logo}</span>
                                          <span className="si-lock-name" style={{ color: lockProvider?.color }}>{lockProvider?.name}</span>
                                        </div>
                                        <div className="si-lock-indicators">
                                          <div className="si-indicator" title={`Batterie: ${room.lock.battery}%`}>
                                            <BatteryIcon level={room.lock.battery} />
                                            <span>{room.lock.battery}%</span>
                                          </div>
                                          <div className={`si-indicator ${room.lock.connected ? 'connected' : 'disconnected'}`} title={room.lock.connected ? 'Connecté' : 'Déconnecté'}>
                                            {room.lock.connected ? <Wifi size={14} /> : <WifiOff size={14} />}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <button
                                        className="si-btn-connect-lock"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowLockModal({ room, buildingId: building.id, floorId: floor.id });
                                        }}
                                      >
                                        <Lock size={14} />
                                        <span>Connecter serrure</span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="si-room-actions" onClick={(e) => e.stopPropagation()}>
                                    <select
                                      className="si-status-select"
                                      value={room.status}
                                      onChange={(e) => handleStatusChange(building.id, floor.id, room.id, e.target.value)}
                                    >
                                      {Object.entries(STATUS_MAP).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                      ))}
                                    </select>
                                    
                                    {roomFolios[room.number] && roomFolios[room.number].total > 0 && (
                                      <button
                                        className="si-btn-folio-checkout"
                                        title="Payer Folio & Checkout"
                                        onClick={(e) => {
                                           e.stopPropagation();
                                           setShowCheckoutModal({ room, buildingId: building.id, floorId: floor.id, folio: roomFolios[room.number] });
                                        }}
                                      >
                                        Payer €{roomFolios[room.number].total.toFixed(2)}
                                      </button>
                                    )}

                                    {room.lock ? (
                                      <button
                                        className="si-btn-icon si-btn-lock-settings"
                                        title="Paramètres serrure"
                                        onClick={() => setShowLockModal({ room, buildingId: building.id, floorId: floor.id })}
                                      >
                                        <Key size={14} />
                                      </button>
                                    ) : null}
                                    <button
                                      className="si-btn-icon si-btn-delete"
                                      title="Supprimer"
                                      onClick={() => handleDeleteRoom(building.id, floor.id, room.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ MODALS ═══════ */}

      {/* ─── Add Building Modal ─── */}
      <AnimatePresence>
        {showAddBuilding && (
          <motion.div className="si-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBuilding(false)}>
            <motion.div className="si-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="si-modal-header">
                <Building2 size={22} />
                <h3>Nouveau Bâtiment</h3>
                <button className="si-modal-close" onClick={() => setShowAddBuilding(false)}><X size={18} /></button>
              </div>
              <div className="si-modal-body">
                <div className="si-form-group">
                  <label>Nom du bâtiment</label>
                  <input
                    type="text"
                    placeholder="Ex: Résidence Les Oliviers"
                    value={newBuildingName}
                    onChange={(e) => setNewBuildingName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="si-form-group">
                  <label>Nombre d'étages</label>
                  <div className="si-number-input">
                    <button onClick={() => setNewBuildingFloors(Math.max(1, newBuildingFloors - 1))}>−</button>
                    <span>{newBuildingFloors}</span>
                    <button onClick={() => setNewBuildingFloors(newBuildingFloors + 1)}>+</button>
                  </div>
                </div>
              </div>
              <div className="si-modal-footer">
                <button className="si-btn-secondary" onClick={() => setShowAddBuilding(false)}>Annuler</button>
                <button className="si-btn-primary" onClick={handleAddBuilding} disabled={!newBuildingName.trim()}>
                  <Plus size={16} />
                  <span>Créer le bâtiment</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bulk Create Modal ─── */}
      <AnimatePresence>
        {showBulkCreate && (
          <motion.div className="si-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulkCreate(null)}>
            <motion.div className="si-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="si-modal-header">
                <Grid3x3 size={22} />
                <h3>Création en Masse</h3>
                <button className="si-modal-close" onClick={() => setShowBulkCreate(null)}><X size={18} /></button>
              </div>
              <div className="si-modal-body">
                <p className="si-modal-hint">Génération automatique avec préfixe d'étage intelligent.</p>
                <div className="si-form-row">
                  <div className="si-form-group">
                    <label>De la chambre n°</label>
                    <input type="number" value={bulkFrom} onChange={(e) => setBulkFrom(Number(e.target.value))} min={1} />
                  </div>
                  <div className="si-form-group">
                    <label>À la chambre n°</label>
                    <input type="number" value={bulkTo} onChange={(e) => setBulkTo(Number(e.target.value))} min={bulkFrom} />
                  </div>
                </div>
                <div className="si-form-group">
                  <label>Type de chambre</label>
                  <select value={bulkType} onChange={(e) => setBulkType(e.target.value)}>
                    {ROOM_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="si-preview-badge">
                  <Zap size={14} />
                  <span>{bulkTo - bulkFrom + 1} chambres seront créées</span>
                </div>
              </div>
              <div className="si-modal-footer">
                <button className="si-btn-secondary" onClick={() => setShowBulkCreate(null)}>Annuler</button>
                <button className="si-btn-primary" onClick={() => handleBulkCreate(showBulkCreate.buildingId, showBulkCreate.floorId)}>
                  <Zap size={16} />
                  <span>Générer {bulkTo - bulkFrom + 1} chambres</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Lock Assignment Modal ─── */}
      <AnimatePresence>
        {showLockModal && (
          <motion.div className="si-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLockModal(null)}>
            <motion.div className="si-modal si-modal-lock" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="si-modal-header">
                <Lock size={22} />
                <h3>Connectivité Serrure — Ch. {showLockModal.room.number}</h3>
                <button className="si-modal-close" onClick={() => setShowLockModal(null)}><X size={18} /></button>
              </div>
              <div className="si-modal-body">
                <p className="si-modal-hint">Sélectionnez le fournisseur de serrure intelligente à associer.</p>
                <div className="si-lock-providers-grid">
                  {LOCK_PROVIDERS.map((provider) => {
                    const isActive = showLockModal.room.lock?.provider === provider.id;
                    return (
                      <button
                        key={provider.id}
                        className={`si-lock-provider-card ${isActive ? 'active' : ''}`}
                        style={{ '--provider-color': provider.color }}
                        onClick={() => handleAssignLock(
                          showLockModal.buildingId,
                          showLockModal.floorId,
                          showLockModal.room.id,
                          provider.id
                        )}
                      >
                        <span className="si-provider-logo">{provider.logo}</span>
                        <span className="si-provider-name">{provider.name}</span>
                        {isActive && <CheckCircle size={18} className="si-check-active" />}
                      </button>
                    );
                  })}
                </div>
                {showLockModal.room.lock && (
                  <div className="si-lock-status-detail">
                    <h4>État actuel</h4>
                    <div className="si-lock-detail-grid">
                      <div className="si-lock-detail-item">
                        <BatteryIcon level={showLockModal.room.lock.battery} />
                        <span>Batterie : {showLockModal.room.lock.battery}%</span>
                      </div>
                      <div className="si-lock-detail-item">
                        {showLockModal.room.lock.connected ? <Wifi size={16} className="si-connected" /> : <WifiOff size={16} className="si-disconnected" />}
                        <span>{showLockModal.room.lock.connected ? 'Connecté' : 'Déconnecté'}</span>
                      </div>
                      <div className="si-lock-detail-item">
                        <Signal size={16} />
                        <span>Dernière sync: {showLockModal.room.lock.lastSync}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="si-modal-footer">
                <button className="si-btn-secondary" onClick={() => setShowLockModal(null)}>Fermer</button>
              </div>
            </motion.div>
          </motion.div>
        )}

      {/* ─── Checkout FOLIO Modal ─── */}
      {showCheckoutModal && (
          <motion.div className="si-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckoutModal(null)}>
            <motion.div className="si-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={(e) => e.stopPropagation()}>
              <div className="si-modal-header" style={{ background: '#FFF1F2' }}>
                <Zap size={22} color="#E11D48" />
                <h3 style={{ color: '#E11D48' }}>Paiement Folio & Checkout - Ch. {showCheckoutModal.room.number}</h3>
                <button className="si-modal-close" onClick={() => setShowCheckoutModal(null)}><X size={18} /></button>
              </div>
              <div className="si-modal-body">
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Vous êtes sur le point d'encaisser le folio de la chambre et de réaliser le checkout. La chambre passera automatiquement en mode <strong>Maintenance</strong> pour être nettoyée par la gouvernante.
                </p>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '1rem', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#475569' }}>Consommations</span>
                      <span style={{ fontWeight: 800 }}>€{showCheckoutModal.folio.total.toFixed(2)}</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{showCheckoutModal.folio.items}</div>
                </div>
              </div>
              <div className="si-modal-footer">
                <button className="si-btn-secondary" onClick={() => setShowCheckoutModal(null)}>Annuler</button>
                <button 
                  className="si-btn-primary" 
                  style={{ background: '#E11D48', borderColor: '#E11D48' }}
                  onClick={() => handleCheckout(showCheckoutModal.buildingId, showCheckoutModal.floorId, showCheckoutModal.room.id, showCheckoutModal.room.number)}
                >
                  <CheckCircle size={16} />
                  <span>Encaisser et libérer la chambre</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
};

export default SmartInventory;
