import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2, Layers, Plus, ChevronDown, ChevronRight, Search,
  Lock, Unlock, Wifi, WifiOff, Key, CheckCircle, XCircle,
  Wrench, BatteryFull, BatteryMedium, BatteryLow, Package,
  X, Smartphone, MessageSquare, Mail, UserCheck, LogOut,
  RefreshCw, Shield, Zap, CreditCard, MoreHorizontal, Grid3x3,
  DoorOpen, AlertTriangle, Settings, Activity, Star, ChevronLeft,
  GripVertical, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartInventory.css';
import { persistInventory, getInventoryBuildings } from '../../lib/inventoryStore';
import { secureStorage } from '../../lib/secureStorage';
import CardAccessModal from './CardAccessModal';

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const LOCK_PROVIDERS = {
  ttlock:  { id: 'ttlock',  name: 'TTLock',     color: '#3B82F6', bg: '#EFF6FF', logo: '🔐', brand: 'TT Technology' },
  tthotel: { id: 'tthotel', name: 'TTHotel',    color: '#8B5CF6', bg: '#F5F3FF', logo: '🏨', brand: 'TT Hotel Group' },
  tuya:    { id: 'tuya',    name: 'Tuya Smart', color: '#10B981', bg: '#F0FDF4', logo: '🌿', brand: 'Tuya Inc.' },
};

const LOCK_POOL = {
  ttlock: [
    { devId: 'TT-001', name: 'TTLock G2 Pro #001', serial: 'G2P-0001', battery: 85, online: true,  fw: '2.4.1' },
    { devId: 'TT-002', name: 'TTLock G2 Pro #002', serial: 'G2P-0002', battery: 72, online: true,  fw: '2.4.1' },
    { devId: 'TT-003', name: 'TTLock G3 #003',     serial: 'G3-0003',  battery: 91, online: false, fw: '3.1.0' },
    { devId: 'TT-004', name: 'TTLock G2 Pro #004', serial: 'G2P-0004', battery: 67, online: true,  fw: '2.4.1' },
    { devId: 'TT-005', name: 'TTLock Slim #005',   serial: 'SL-0005',  battery: 44, online: true,  fw: '2.3.8' },
  ],
  tthotel: [
    { devId: 'TTH-001', name: 'TTHotel Pro #001',  serial: 'THP-0001', battery: 78, online: true,  fw: '1.8.3' },
    { devId: 'TTH-002', name: 'TTHotel Pro #002',  serial: 'THP-0002', battery: 55, online: true,  fw: '1.8.3' },
    { devId: 'TTH-003', name: 'TTHotel Lite #003', serial: 'THL-0003', battery: 88, online: false, fw: '1.5.2' },
    { devId: 'TTH-004', name: 'TTHotel Pro #004',  serial: 'THP-0004', battery: 31, online: true,  fw: '1.8.3' },
  ],
  tuya: [
    { devId: 'TY-001', name: 'Tuya Smart Lock #001', serial: 'TY-0001', battery: 15, online: false, fw: '2.0.1' },
    { devId: 'TY-002', name: 'Tuya Smart Lock #002', serial: 'TY-0002', battery: 92, online: true,  fw: '2.1.0' },
    { devId: 'TY-003', name: 'Tuya NFC Lock #003',   serial: 'TY-0003', battery: 63, online: true,  fw: '2.1.0' },
  ],
};

const ROOM_TYPES = {
  standard:   { label: 'Standard',       icon: '🛏️',  short: 'STD' },
  superior:   { label: 'Supérieure',     icon: '⭐',   short: 'SUP' },
  deluxe:     { label: 'Deluxe',         icon: '💎',   short: 'DLX' },
  suite:      { label: 'Suite',          icon: '👑',   short: 'STE' },
  family:     { label: 'Familiale',      icon: '👨‍👩‍👧',  short: 'FAM' },
  accessible: { label: 'PMR Accessible', icon: '♿',   short: 'PMR' },
};

const STATUS_CFG = {
  available:   { label: 'Disponible',  color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  occupied:    { label: 'Occupée',     color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  maintenance: { label: 'Maintenance', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
  blocked:     { label: 'Hors service',color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
};

const GUEST_MAP = {
  '102': { name: 'Robert Chen',    checkIn: '2026-05-17', checkOut: '2026-05-20', nights: 3, source: 'Booking.com', phone: '+33 6 11 22 33', email: 'r.chen@mail.com' },
  '202': { name: 'Marie Laurent',  checkIn: '2026-05-13', checkOut: '2026-05-20', nights: 7, source: 'Direct',      phone: '+33 6 22 33 44', email: 'm.laurent@mail.com' },
  '304': { name: 'Jean Dupont',    checkIn: '2026-05-15', checkOut: '2026-05-19', nights: 4, source: 'Airbnb',      phone: '+33 6 33 44 55', email: 'j.dupont@mail.com' },
};

const genId = () => Math.random().toString(36).substr(2, 9);
const genPin = () => `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;

const createInitialData = () => [{
  id: genId(), name: 'Bâtiment Principal',
  floors: [
    { id: genId(), number: 1, label: 'Rez-de-chaussée', rooms: [
      { id: genId(), number: '101', type: 'suite',     status: 'available',   lock: { provider: 'ttlock',  devId: 'TT-001', battery: 92, online: true,  locked: true,  pin: null,       lastSync: '2 min' } },
      { id: genId(), number: '102', type: 'superior',  status: 'occupied',    lock: { provider: 'tthotel', devId: 'TTH-001', battery: 78, online: true,  locked: false, pin: '4829-11',  lastSync: '5 min' } },
      { id: genId(), number: '103', type: 'deluxe',    status: 'available',   lock: null },
      { id: genId(), number: '104', type: 'standard',  status: 'maintenance', lock: { provider: 'tuya',    devId: 'TY-001', battery: 15, online: false, locked: true,  pin: null,       lastSync: '3 h' } },
    ]},
    { id: genId(), number: 2, label: 'Premier étage', rooms: [
      { id: genId(), number: '201', type: 'suite',     status: 'available',   lock: { provider: 'ttlock',  devId: 'TT-002', battery: 100, online: true, locked: true,  pin: null,       lastSync: '1 min' } },
      { id: genId(), number: '202', type: 'deluxe',    status: 'occupied',    lock: { provider: 'tthotel', devId: 'TTH-002', battery: 65, online: true, locked: false, pin: '7341-28',  lastSync: '10 min' } },
      { id: genId(), number: '203', type: 'family',    status: 'available',   lock: { provider: 'ttlock',  devId: 'TT-003', battery: 88, online: false, locked: true,  pin: null,       lastSync: '4 min' } },
    ]},
    { id: genId(), number: 3, label: 'Deuxième étage', rooms: [
      { id: genId(), number: '304', type: 'suite',     status: 'occupied',    lock: { provider: 'tthotel', devId: 'TTH-003', battery: 88, online: true,  locked: false, pin: '9182-77',  lastSync: '7 min' } },
      { id: genId(), number: '305', type: 'superior',  status: 'available',   lock: { provider: 'ttlock',  devId: 'TT-004', battery: 67, online: true,  locked: true,  pin: null,       lastSync: '3 min' } },
      { id: genId(), number: '306', type: 'accessible',status: 'available',   lock: null },
    ]},
  ]
}];

/* ─── BATTERY ICON ──────────────────────────────────────────── */
const BattIcon = ({ level, size = 14 }) => {
  if (level > 60) return <BatteryFull size={size} color="#16A34A"/>;
  if (level > 25) return <BatteryMedium size={size} color="#D97706"/>;
  return <BatteryLow size={size} color="#DC2626"/>;
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const SmartInventory = ({ roomFolios = {}, clearFolioCharge }) => {
  const [cleaningStatus, setCleaningStatus] = useState(() => secureStorage.parseJSON('sh_cleaning_status', {}));

  useEffect(() => {
    const sync = () => { setCleaningStatus(secureStorage.parseJSON('sh_cleaning_status', {})); };
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 4000);
    return () => { window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);

  const [buildings,      setBuildings]      = useState(() => getInventoryBuildings() || createInitialData());

  /* ── Persist to shared inventory store on every change ── */
  useEffect(() => {
    persistInventory(buildings);
  }, [buildings]);

  const [expandedFloors, setExpandedFloors] = useState({});
  const [selectedRoom,   setSelectedRoom]   = useState(null);
  const [panelTab,       setPanelTab]       = useState('room');
  const [lockModal,      setLockModal]      = useState(null);  // { room, buildingId, floorId }
  const [lockProvider,   setLockProvider]   = useState('ttlock');
  const [checkoutModal,  setCheckoutModal]  = useState(null);
  const [addBuildingOpen,setAddBuildingOpen]= useState(false);
  const [newBldName,     setNewBldName]     = useState('');
  const [newBldFloors,   setNewBldFloors]   = useState(3);
  const [searchQ,        setSearchQ]        = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [generating,     setGenerating]     = useState(false);
  const [showCardModal,  setShowCardModal]  = useState(false);

  /* ── TTHotel-style navigation state ── */
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => (getInventoryBuildings() || createInitialData())[0]?.id || null);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');

  const selectedBuilding = useMemo(
    () => buildings.find(b => b.id === selectedBuildingId) || buildings[0],
    [buildings, selectedBuildingId]
  );

  /* ── Floor rename ── */
  const [editFloorModal, setEditFloorModal] = useState(null); // { buildingId, floorId, currentLabel }
  const [editFloorLabel, setEditFloorLabel] = useState('');

  /* ── Drag-and-drop room reorder ── */
  const [dragRoomId,  setDragRoomId]  = useState(null);
  const [dragOverId,  setDragOverId]  = useState(null);
  const [dragFloorId, setDragFloorId] = useState(null);

  /* ── Add Building wizard ── */
  const [newBldFloorDefs, setNewBldFloorDefs] = useState([]);
  const [addBldStep,      setAddBldStep]      = useState(1); // 1=info, 2=floors, 3=preview

  /* ── Bulk Add Rooms modal ── */
  const [bulkRoomModal, setBulkRoomModal] = useState(null); // { buildingId, floorId, floorLabel, floorNum }
  const [bulkCount,     setBulkCount]     = useState(4);
  const [bulkStartNum,  setBulkStartNum]  = useState('');
  const [bulkRoomType,  setBulkRoomType]  = useState('standard');
  const [bulkStatus,    setBulkStatus]    = useState('available');

  /* ── Add Room (single) modal ── */
  const [addRoomModal,  setAddRoomModal]  = useState(null); // { buildingId, floorId, floorNum }
  const [newRoomNum,    setNewRoomNum]    = useState('');
  const [newRoomType,   setNewRoomType]   = useState('standard');
  const [newRoomStatus, setNewRoomStatus] = useState('available');

  /* ── Stats ── */
  const stats = useMemo(() => {
    let total = 0, available = 0, occupied = 0, maintenance = 0, connected = 0, noLock = 0;
    buildings.forEach(b => b.floors.forEach(f => f.rooms.forEach(r => {
      total++;
      if (r.status === 'available')   available++;
      if (r.status === 'occupied')    occupied++;
      if (r.status === 'maintenance') maintenance++;
      if (r.lock?.online) connected++;
      if (!r.lock)        noLock++;
    })));
    return { total, available, occupied, maintenance, connected, noLock };
  }, [buildings]);

  /* ── Flatten all rooms for quick lookup ── */
  const allRooms = useMemo(() => {
    const list = [];
    buildings.forEach(b => b.floors.forEach(f => f.rooms.forEach(r => {
      list.push({ ...r, buildingId: b.id, buildingName: b.name, floorId: f.id, floorLabel: f.label });
    })));
    return list;
  }, [buildings]);

  /* ── Used device IDs ── */
  const usedDevIds = useMemo(() => new Set(allRooms.map(r => r.lock?.devId).filter(Boolean)), [allRooms]);

  /* ── Mutate helpers ── */
  const updateRoom = (buildingId, floorId, roomId, patch) => {
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b, floors: b.floors.map(f => f.id !== floorId ? f : {
        ...f, rooms: f.rooms.map(r => r.id !== roomId ? r : { ...r, ...patch })
      })
    }));
  };

  /* ── Assign lock ── */
  const handleAssignLock = (device) => {
    if (!lockModal) return;
    const { room, buildingId, floorId } = lockModal;
    updateRoom(buildingId, floorId, room.id, {
      lock: { provider: lockProvider, devId: device.devId, battery: device.battery, online: device.online, locked: true, pin: null, lastSync: 'à l\'instant' },
      status: room.status === 'available' ? 'available' : room.status,
    });
    if (selectedRoom?.id === room.id) {
      setSelectedRoom(r => ({ ...r, lock: { provider: lockProvider, devId: device.devId, battery: device.battery, online: device.online, locked: true, pin: null, lastSync: 'à l\'instant' } }));
    }
    setLockModal(null);
  };

  /* ── Unlink lock ── */
  const handleUnlinkLock = (buildingId, floorId, roomId) => {
    updateRoom(buildingId, floorId, roomId, { lock: null });
    if (selectedRoom?.id === roomId) setSelectedRoom(r => ({ ...r, lock: null }));
  };

  /* ── Change status ── */
  const handleStatus = (buildingId, floorId, roomId, status) => {
    updateRoom(buildingId, floorId, roomId, { status });
    if (selectedRoom?.id === roomId) setSelectedRoom(r => ({ ...r, status }));
  };

  /* ── Toggle locked ── */
  const handleToggleLock = (buildingId, floorId, roomId, locked) => {
    updateRoom(buildingId, floorId, roomId, { lock: { ...allRooms.find(r => r.id === roomId)?.lock, locked } });
    if (selectedRoom?.id === roomId) setSelectedRoom(r => ({ ...r, lock: { ...r.lock, locked } }));
  };

  /* ── Generate PIN ── */
  const handleGeneratePin = (buildingId, floorId, roomId) => {
    setGenerating(true);
    setTimeout(() => {
      const newPin = genPin();
      const room = allRooms.find(r => r.id === roomId);
      updateRoom(buildingId, floorId, roomId, { lock: { ...room.lock, pin: newPin } });
      if (selectedRoom?.id === roomId) setSelectedRoom(r => ({ ...r, lock: { ...r.lock, pin: newPin } }));
      setGenerating(false);
    }, 900);
  };

  /* ── Build floor defs from count ── */
  const buildFloorDefs = (count) => {
    const labels = ['Rez-de-chaussée', '1er Étage', '2ème Étage', '3ème Étage', '4ème Étage', '5ème Étage', '6ème Étage', '7ème Étage', '8ème Étage', '9ème Étage'];
    return Array.from({ length: count }, (_, i) => ({
      label: labels[i] || `${i + 1}ème Étage`,
      prefix: String(i + 1),
      roomCount: 4,
      roomType: 'standard',
    }));
  };

  /* ── Open Add Building wizard ── */
  const openAddBuilding = () => {
    setNewBldName('');
    setNewBldFloors(3);
    setNewBldFloorDefs(buildFloorDefs(3));
    setAddBldStep(1);
    setAddBuildingOpen(true);
  };

  /* ── Sync floor defs when floor count changes ── */
  const handleFloorCountChange = (n) => {
    const count = Math.max(1, Math.min(10, Number(n)));
    setNewBldFloors(count);
    setNewBldFloorDefs(prev => {
      const defs = buildFloorDefs(count);
      return defs.map((d, i) => prev[i] ? { ...d, label: prev[i].label, prefix: prev[i].prefix, roomCount: prev[i].roomCount, roomType: prev[i].roomType } : d);
    });
  };

  /* ── Confirm add building ── */
  const handleAddBuilding = () => {
    if (!newBldName.trim()) return;
    const newBuilding = {
      id: genId(),
      name: newBldName.trim(),
      floors: newBldFloorDefs.map((fd, i) => ({
        id: genId(),
        number: i + 1,
        label: fd.label,
        rooms: Array.from({ length: fd.roomCount }, (_, j) => ({
          id: genId(),
          number: `${fd.prefix}${String(j + 1).padStart(2, '0')}`,
          type: fd.roomType,
          status: 'available',
          lock: null,
        })),
      })),
    };
    setBuildings(prev => [...prev, newBuilding]);
    setAddBuildingOpen(false);
  };

  /* ── Open bulk add rooms modal ── */
  const openBulkRoomModal = (buildingId, floor) => {
    const existing = floor.rooms;
    const lastNum  = existing.length > 0 ? parseInt(existing[existing.length - 1].number, 10) + 1 : floor.number * 100 + 1;
    setBulkRoomModal({ buildingId, floorId: floor.id, floorLabel: floor.label, floorNum: floor.number });
    setBulkCount(4);
    setBulkStartNum(String(isNaN(lastNum) ? floor.number * 100 + 1 : lastNum));
    setBulkRoomType('standard');
    setBulkStatus('available');
  };

  /* ── Confirm bulk add rooms ── */
  const handleBulkAddRooms = () => {
    if (!bulkRoomModal) return;
    const { buildingId, floorId } = bulkRoomModal;
    const start = parseInt(bulkStartNum, 10) || 100;
    const newRooms = Array.from({ length: bulkCount }, (_, i) => ({
      id: genId(),
      number: String(start + i),
      type: bulkRoomType,
      status: bulkStatus,
      lock: null,
    }));
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b,
      floors: b.floors.map(f => f.id !== floorId ? f : {
        ...f, rooms: [...f.rooms, ...newRooms],
      }),
    }));
    setBulkRoomModal(null);
  };

  /* ── Open single add room modal ── */
  const openAddRoomModal = (buildingId, floor) => {
    const existing = floor.rooms;
    const lastNum  = existing.length > 0 ? parseInt(existing[existing.length - 1].number, 10) + 1 : floor.number * 100 + 1;
    setAddRoomModal({ buildingId, floorId: floor.id, floorLabel: floor.label, floorNum: floor.number });
    setNewRoomNum(String(isNaN(lastNum) ? floor.number * 100 + 1 : lastNum));
    setNewRoomType('standard');
    setNewRoomStatus('available');
  };

  /* ── Confirm single add room ── */
  const handleAddSingleRoom = () => {
    if (!addRoomModal || !newRoomNum.trim()) return;
    const { buildingId, floorId } = addRoomModal;
    const room = { id: genId(), number: newRoomNum.trim(), type: newRoomType, status: newRoomStatus, lock: null };
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b,
      floors: b.floors.map(f => f.id !== floorId ? f : {
        ...f, rooms: [...f.rooms, room],
      }),
    }));
    setAddRoomModal(null);
  };

  /* ── Delete room ── */
  const handleDeleteRoom = (buildingId, floorId, roomId) => {
    if (selectedRoom?.id === roomId) setSelectedRoom(null);
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b,
      floors: b.floors.map(f => f.id !== floorId ? f : {
        ...f, rooms: f.rooms.filter(r => r.id !== roomId),
      }),
    }));
  };

  /* ── Delete building ── */
  const handleDeleteBuilding = (buildingId) => {
    setBuildings(prev => prev.filter(b => b.id !== buildingId));
    if (selectedRoom?.buildingId === buildingId) setSelectedRoom(null);
  };

  /* ── Rename floor label ── */
  const handleRenameFloor = () => {
    if (!editFloorModal || !editFloorLabel.trim()) return;
    const { buildingId, floorId } = editFloorModal;
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b,
      floors: b.floors.map(f => f.id !== floorId ? f : { ...f, label: editFloorLabel.trim() }),
    }));
    setEditFloorModal(null);
  };

  /* ── Reorder rooms via drag-and-drop ── */
  const handleRoomDrop = (buildingId, floorId, targetRoomId) => {
    if (!dragRoomId || dragRoomId === targetRoomId) {
      setDragRoomId(null); setDragOverId(null); setDragFloorId(null);
      return;
    }
    setBuildings(prev => prev.map(b => b.id !== buildingId ? b : {
      ...b,
      floors: b.floors.map(f => {
        if (f.id !== floorId) return f;
        const rooms   = [...f.rooms];
        const fromIdx = rooms.findIndex(r => r.id === dragRoomId);
        const toIdx   = rooms.findIndex(r => r.id === targetRoomId);
        if (fromIdx < 0 || toIdx < 0) return f;
        const [moved] = rooms.splice(fromIdx, 1);
        rooms.splice(toIdx, 0, moved);
        return { ...f, rooms };
      }),
    }));
    setDragRoomId(null); setDragOverId(null); setDragFloorId(null);
  };

  /* ── Checkout ── */
  const handleCheckout = () => {
    if (!checkoutModal) return;
    const { room, buildingId, floorId } = checkoutModal;
    if (clearFolioCharge) clearFolioCharge(room.number);
    updateRoom(buildingId, floorId, room.id, { status: 'maintenance', lock: room.lock ? { ...room.lock, locked: true, pin: null } : null });
    if (selectedRoom?.id === room.id) setSelectedRoom(r => ({ ...r, status: 'maintenance' }));
    setCheckoutModal(null);
  };

  /* ── Filter ── */
  const filterRooms = (rooms) => rooms.filter(r => {
    const matchSearch = !searchQ || r.number.toLowerCase().includes(searchQ.toLowerCase()) || GUEST_MAP[r.number]?.name.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── Open room panel ── */
  const openRoom = (room, buildingId, floorId, buildingName, floorLabel) => {
    setSelectedRoom({ ...room, buildingId, floorId, buildingName, floorLabel });
    setPanelTab('room');
  };

  /* ── Folio total for a room ── */
  const folioTotal = (roomNum) => roomFolios[roomNum]?.total || 0;
  const folioCharges = (roomNum) => roomFolios[roomNum]?.charges || [];

  return (
    <div className="tth-root">

      {/* ══ HEADER ════════════════════════════════════════════ */}
      <div className="tth-header">
        <div className="tth-header-left">
          <div className="tth-header-icon"><Package size={18}/></div>
          <div>
            <h1>Gestion des Chambres</h1>
            <p>IoT · Serrures connectées · Inventaire</p>
          </div>
        </div>
        <div className="tth-header-stats">
          {[
            { label: 'Total', value: stats.total, color: '#2563EB' },
            { label: 'Libres', value: stats.available, color: '#16A34A' },
            { label: 'Occupées', value: stats.occupied, color: '#2563EB' },
            { label: 'Maintenance', value: stats.maintenance, color: '#D97706' },
            { label: 'Connectées', value: stats.connected, color: '#16A34A' },
            { label: 'Sans serrure', value: stats.noLock, color: '#DC2626' },
          ].map(s => (
            <div key={s.label} className="tth-hstat">
              <span className="tth-hstat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="tth-hstat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
        <button className="tth-add-bld-btn" onClick={openAddBuilding}>
          <Plus size={14}/> Bâtiment
        </button>
      </div>

      {/* ══ BODY: 3 PANELS ════════════════════════════════════ */}
      <div className="tth-body">

        {/* ─── LEFT NAV: Building + Floor ─── */}
        <div className="tth-left-nav">
          <div className="tth-nav-section">
            <span className="tth-nav-title">Bâtiment</span>
            {buildings.map((b, i) => (
              <button
                key={b.id}
                className={`tth-nav-item ${selectedBuildingId === b.id ? 'active' : ''}`}
                onClick={() => { setSelectedBuildingId(b.id); setSelectedFloorFilter('all'); }}
                title={b.name}
              >
                {i + 1}
                {selectedBuildingId === b.id && <span className="tth-nav-dot"/>}
              </button>
            ))}
            <button className="tth-nav-add" onClick={openAddBuilding} title="Ajouter bâtiment">+</button>
          </div>

          <div className="tth-nav-divider"/>

          <div className="tth-nav-section">
            <span className="tth-nav-title">Etage</span>
            <button
              className={`tth-nav-item text ${selectedFloorFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFloorFilter('all')}
            >Tous</button>
            {selectedBuilding?.floors.map(f => (
              <div key={f.id} className="tth-floor-row">
                <button
                  className={`tth-nav-item ${selectedFloorFilter === f.number ? 'active' : ''}`}
                  onClick={() => setSelectedFloorFilter(f.number)}
                  title={f.label}
                >{f.number}</button>
                <button
                  className="tth-floor-rename-btn"
                  title={`Renommer: ${f.label}`}
                  onClick={e => {
                    e.stopPropagation();
                    setEditFloorModal({ buildingId: selectedBuilding.id, floorId: f.id, currentLabel: f.label });
                    setEditFloorLabel(f.label);
                  }}
                ><Pencil size={9}/></button>
              </div>
            ))}
            <button className="tth-nav-add"
              onClick={() => {
                if (!selectedBuilding) return;
                const floor = selectedFloorFilter !== 'all'
                  ? selectedBuilding.floors.find(f => f.number === selectedFloorFilter)
                  : selectedBuilding.floors[selectedBuilding.floors.length - 1];
                if (floor) openBulkRoomModal(selectedBuilding.id, floor);
              }}
              title="Ajouter chambres">+</button>
          </div>
        </div>

        {/* ─── CENTER: Room Grid ─── */}
        <div className="tth-center">
          <div className="tth-grid">
            {selectedBuilding?.floors
              .filter(f => selectedFloorFilter === 'all' || f.number === selectedFloorFilter)
              .flatMap(floor =>
                filterRooms(floor.rooms)
                  .filter(r => roomTypeFilter === 'all' || r.type === roomTypeFilter)
                  .map(room => {
                    const guest = GUEST_MAP[room.number];
                    const rType = ROOM_TYPES[room.type] || ROOM_TYPES.standard;
                    const isSelected = selectedRoom?.id === room.id;
                    const lockOnline = room.lock?.online === true;
                    const hasLock    = !!room.lock;
                    const cs = cleaningStatus[room.number];

                    const isDragging  = dragRoomId === room.id;
                    const isDragOver  = dragOverId === room.id && dragFloorId === floor.id && !isDragging;

                    return (
                      <motion.div
                        key={room.id}
                        className={`tth-card status-${room.status}${isSelected ? ' selected' : ''}${isDragging ? ' tth-dragging' : ''}${isDragOver ? ' tth-drag-over' : ''}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragRoomId(room.id); setDragFloorId(floor.id); }}
                        onDragEnd={() => { setDragRoomId(null); setDragOverId(null); setDragFloorId(null); }}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(room.id); setDragFloorId(floor.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={e => { e.preventDefault(); handleRoomDrop(selectedBuilding.id, floor.id, room.id); }}
                        onClick={() => openRoom(room, selectedBuilding.id, floor.id, selectedBuilding.name, floor.label)}
                      >
                        <div className="tth-card-head">
                          <span className="tth-grip"><GripVertical size={11}/></span>
                          <span className="tth-card-num">{room.number}</span>
                          {room.status === 'occupied' && <RefreshCw size={12} className="tth-spin-icon"/>}
                        </div>

                        <span className="tth-card-type">{rType.label}</span>
                        {guest && <span className="tth-card-guest">{guest.name.split(' ')[0]}</span>}

                        <div className="tth-card-footer">
                          {/* Lock icon: blue=connected, red=offline/no lock */}
                          <span
                            className={`tth-lock-icon ${hasLock ? (lockOnline ? 'lock-blue' : 'lock-orange') : 'lock-red'}`}
                            title={hasLock ? (lockOnline ? 'Serrure connectée' : 'Serrure hors ligne') : 'Aucune serrure'}
                            onClick={e => {
                              e.stopPropagation();
                              if (!hasLock) setLockModal({ room, buildingId: selectedBuilding.id, floorId: floor.id });
                            }}
                          >
                            <Lock size={13}/>
                          </span>

                          {hasLock && room.lock.battery < 25 && (
                            <span className="tth-badge-icon battery" title={`Batterie ${room.lock.battery}%`}>
                              <BatteryLow size={12}/>
                            </span>
                          )}
                          {cs?.status === 'dirty' && (
                            <span className="tth-badge-icon clean" title="À nettoyer">🧹</span>
                          )}
                          {cs?.status === 'in_progress' && (
                            <span className="tth-badge-icon" title="Ménage en cours">⏳</span>
                          )}
                          {room.status === 'maintenance' && !cs && (
                            <span className="tth-badge-icon repair" title="Maintenance">🔧</span>
                          )}
                        </div>

                        {room.lock?.pin && (
                          <div className="tth-pin-tag"><Key size={9}/> {room.lock.pin}</div>
                        )}
                      </motion.div>
                    );
                  })
              )}

            {/* + Add room card */}
            {selectedBuilding && (
              <button
                className="tth-add-card"
                onClick={() => {
                  const floor = selectedFloorFilter !== 'all'
                    ? selectedBuilding.floors.find(f => f.number === selectedFloorFilter)
                    : selectedBuilding.floors[selectedBuilding.floors.length - 1];
                  if (floor) openAddRoomModal(selectedBuilding.id, floor);
                }}
              >
                <Plus size={20}/>
                <span>Créer une chambre</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: Filters + Operations ─── */}
        {!selectedRoom && (
          <div className="tth-right-panel">
            <div className="tth-rp-block">
              <label className="tth-rp-label">Chercher par nom</label>
              <div className="tth-search-row">
                <input
                  className="tth-rp-input"
                  placeholder="Numéro de chambre"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
                <button className="tth-rp-search-btn"><Search size={15}/></button>
              </div>
            </div>

            <div className="tth-rp-block">
              <label className="tth-rp-label">Recherche de type de chambre</label>
              <select className="tth-rp-select" value={roomTypeFilter} onChange={e => setRoomTypeFilter(e.target.value)}>
                <option value="all">Tous</option>
                {Object.entries(ROOM_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="tth-rp-block">
              <label className="tth-rp-label">Filtre.</label>
              {[
                { key: 'available',   label: 'Libre',              dot: '#94A3B8' },
                { key: 'occupied',    label: 'Enregistré',         dot: '#2563EB' },
                { key: 'maintenance', label: 'Réparation',         dot: '#EF4444' },
                { key: 'blocked',     label: 'Hors service',       dot: '#7C3AED' },
              ].map(f => (
                <label key={f.key} className="tth-filter-row">
                  <input
                    type="checkbox"
                    checked={filterStatus === f.key}
                    onChange={e => setFilterStatus(e.target.checked ? f.key : 'all')}
                  />
                  <span className="tth-filter-dot" style={{ background: f.dot }}/>
                  <span>{f.label}</span>
                </label>
              ))}
              <label className="tth-filter-row">
                <input type="checkbox" checked={filterStatus === 'all' && searchQ === ''} onChange={() => { setFilterStatus('all'); setSearchQ(''); setRoomTypeFilter('all'); }} />
                <span className="tth-filter-dot" style={{ background: '#E2E8F0' }}/>
                <span>Réinitialiser</span>
              </label>
            </div>

            <div className="tth-rp-block">
              <label className="tth-rp-label">Opérations de carte</label>
              <button className="tth-op-btn" onClick={() => { if (selectedRoom?.lock) { setShowCardModal(true); } }}>
                Voir la carte
              </button>
              <button className="tth-op-btn" onClick={() => {
                if (selectedRoom) handleUnlinkLock(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id);
              }}>
                Supprimer la carte
              </button>
              <button className="tth-op-btn" onClick={() => {
                if (selectedRoom) handleGeneratePin(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id);
              }}>
                Renouveler la carte
              </button>
            </div>
          </div>
        )}

        {/* ══ ROOM DETAIL PANEL ═════════════════════════════ */}
        <AnimatePresence>
          {selectedRoom && (() => {
            const sCfg  = STATUS_CFG[selectedRoom.status] || STATUS_CFG.available;
            const rType = ROOM_TYPES[selectedRoom.type] || ROOM_TYPES.standard;
            const prov  = selectedRoom.lock ? LOCK_PROVIDERS[selectedRoom.lock.provider] : null;
            const dev   = selectedRoom.lock ? LOCK_POOL[selectedRoom.lock.provider]?.find(d => d.devId === selectedRoom.lock.devId) : null;
            const guest = GUEST_MAP[selectedRoom.number];
            const fTotal   = folioTotal(selectedRoom.number);
            const fCharges = folioCharges(selectedRoom.number);

            return (
              <motion.div
                className="si-panel"
                key="panel"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              >
                {/* Panel header */}
                <div className="si-panel-head" style={{ borderTop: `3px solid ${sCfg.border}` }}>
                  <div className="si-panel-head-left">
                    <span className="si-panel-roomnum">Chambre {selectedRoom.number}</span>
                    <div className="si-panel-meta">
                      <span className="si-panel-type">{rType.icon} {rType.label}</span>
                      <span className="si-panel-status" style={{ background: sCfg.bg, color: sCfg.color }}>{sCfg.label}</span>
                    </div>
                  </div>
                  <button className="si-close-btn" onClick={() => setSelectedRoom(null)}><X size={17}/></button>
                </div>

                {/* Tabs */}
                <div className="si-panel-tabs">
                  {[['room','Chambre'],['lock','Serrure IoT'],['folio','Folio']].map(([k,l]) => (
                    <button key={k} className={panelTab === k ? 'active' : ''} onClick={() => setPanelTab(k)}>
                      {k === 'folio' && fTotal > 0 && <span className="si-tab-badge">{fTotal.toFixed(0)}€</span>}
                      {l}
                    </button>
                  ))}
                </div>

                {/* Panel body */}
                <div className="si-panel-body">

                  {/* ─── TAB: CHAMBRE ─── */}
                  {panelTab === 'room' && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="si-tab-pane">
                      <div className="si-info-grid">
                        <InfoBlock label="Chambre" value={`${selectedRoom.number} — ${rType.label}`}/>
                        <InfoBlock label="Étage" value={`${selectedRoom.floorLabel} (${selectedRoom.buildingName})`}/>
                        <InfoBlock label="Statut" value={sCfg.label} valueColor={sCfg.color}/>
                        <InfoBlock label="Type de lit" value="Lit double King"/>
                        {guest ? (
                          <>
                            <InfoBlock label="Client" value={guest.name}/>
                            <InfoBlock label="Check-in" value={guest.checkIn + ' · 14h00'}/>
                            <InfoBlock label="Check-out" value={guest.checkOut + ' · 11h00'}/>
                            <InfoBlock label="Nuits" value={guest.nights + ' nuits'}/>
                            <InfoBlock label="Canal" value={guest.source}/>
                          </>
                        ) : (
                          <InfoBlock label="Client" value="— Chambre libre —"/>
                        )}
                      </div>
                      {guest && (
                        <div className="si-contact-row">
                          <a href={`tel:${guest.phone}`} className="si-contact-chip"><Smartphone size={12}/>{guest.phone}</a>
                          <a href={`mailto:${guest.email}`} className="si-contact-chip"><Mail size={12}/>{guest.email}</a>
                        </div>
                      )}
                      <div className="si-status-change">
                        <label>Changer le statut</label>
                        <div className="si-status-pills">
                          {Object.entries(STATUS_CFG).map(([k, v]) => (
                            <button key={k}
                              className={`si-status-pill ${selectedRoom.status === k ? 'active' : ''}`}
                              style={selectedRoom.status === k ? { background: v.bg, color: v.color, borderColor: v.border } : {}}
                              onClick={() => handleStatus(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id, k)}
                            >{v.label}</button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── TAB: SERRURE IoT ─── */}
                  {panelTab === 'lock' && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="si-tab-pane">
                      {selectedRoom.lock ? (
                        <>
                          {/* Device info */}
                          <div className="si-lock-card" style={{ borderColor: prov?.color + '40', background: prov?.bg }}>
                            <div className="si-lock-card-top">
                              <span className="si-lock-prov-logo">{prov?.logo}</span>
                              <div>
                                <span className="si-lock-dev-name">{dev?.name || prov?.name}</span>
                                <span className="si-lock-dev-serial">{dev?.serial} · FW {dev?.fw || '—'}</span>
                              </div>
                              <div className={`si-lock-online-badge ${selectedRoom.lock.online ? 'on' : 'off'}`}>
                                {selectedRoom.lock.online ? <Wifi size={11}/> : <WifiOff size={11}/>}
                                {selectedRoom.lock.online ? 'En ligne' : 'Hors ligne'}
                              </div>
                            </div>
                            <div className="si-batt-row">
                              <BattIcon level={selectedRoom.lock.battery} size={16}/>
                              <div className="si-batt-bar-track">
                                <div className="si-batt-bar-fill"
                                  style={{ width: `${selectedRoom.lock.battery}%`,
                                           background: selectedRoom.lock.battery < 20 ? '#EF4444' : selectedRoom.lock.battery < 40 ? '#F59E0B' : '#16A34A' }}/>
                              </div>
                              <span className="si-batt-pct">{selectedRoom.lock.battery}%</span>
                              <span className="si-batt-sync">Sync: {selectedRoom.lock.lastSync}</span>
                            </div>
                          </div>

                          {/* Lock/Unlock control */}
                          <div className="si-lock-controls">
                            <button
                              className={`si-lock-toggle ${selectedRoom.lock.locked ? 'locked' : 'unlocked'}`}
                              onClick={() => handleToggleLock(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id, !selectedRoom.lock.locked)}
                            >
                              {selectedRoom.lock.locked ? <><Lock size={16}/> Verrouillée</> : <><Unlock size={16}/> Déverrouillée</>}
                            </button>
                            <button
                              className={`si-gen-pin-btn ${generating ? 'loading' : ''}`}
                              onClick={() => handleGeneratePin(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id)}
                              disabled={generating}
                            >
                              {generating ? <><RefreshCw size={14} className="spin-icon"/> Génération…</> : <><Key size={14}/> Code PIN</>}
                            </button>
                            <button
                              className="si-gen-pin-btn"
                              style={{ background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE' }}
                              onClick={() => setShowCardModal(true)}
                            >
                              <CreditCard size={14}/> Carte d'accès
                            </button>
                          </div>

                          {/* PIN display */}
                          {selectedRoom.lock.pin && (
                            <div className="si-pin-display">
                              <span className="si-pin-label"><Key size={12}/> Code PIN actuel</span>
                              <span className="si-pin-value">{selectedRoom.lock.pin}</span>
                            </div>
                          )}

                          {/* Send PIN */}
                          {selectedRoom.lock.pin && guest && (
                            <div className="si-send-row">
                              <span className="si-send-label">Envoyer à {guest.name}</span>
                              <div className="si-send-btns">
                                <button className="si-send-btn"><MessageSquare size={12}/> WhatsApp</button>
                                <button className="si-send-btn">📱 SMS</button>
                                <button className="si-send-btn"><Mail size={12}/> Email</button>
                              </div>
                            </div>
                          )}

                          {/* Unlink */}
                          <button className="si-unlink-btn"
                            onClick={() => handleUnlinkLock(selectedRoom.buildingId, selectedRoom.floorId, selectedRoom.id)}>
                            <X size={13}/> Délier cette serrure
                          </button>
                        </>
                      ) : (
                        <div className="si-no-lock">
                          <Lock size={36} color="#CBD5E1" strokeWidth={1.5}/>
                          <span>Aucune serrure connectée</span>
                          <button className="si-btn-primary" onClick={() => setLockModal({ room: selectedRoom, buildingId: selectedRoom.buildingId, floorId: selectedRoom.floorId })}>
                            <Plus size={14}/> Connecter une serrure IoT
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ─── TAB: FOLIO ─── */}
                  {panelTab === 'folio' && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="si-tab-pane">
                      {fCharges.length > 0 ? (
                        <>
                          <div className="si-folio-list">
                            {fCharges.map((c, i) => (
                              <div className="si-folio-charge" key={i}>
                                <span className="si-folio-type-badge" style={{ background: c.type === 'F&B' ? '#FEF3C7' : c.type === 'Spa' ? '#F5F3FF' : '#F0F9FF', color: c.type === 'F&B' ? '#B45309' : c.type === 'Spa' ? '#6D28D9' : '#0369A1' }}>
                                  {c.type}
                                </span>
                                <div className="si-folio-charge-info">
                                  <span className="si-folio-items">{c.items}</span>
                                  <span className="si-folio-time">{c.time || '—'}</span>
                                </div>
                                <span className="si-folio-amount">{c.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                              </div>
                            ))}
                          </div>
                          <div className="si-folio-total-row">
                            <span>Total à facturer</span>
                            <strong>{fTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>
                          </div>
                          <button className="si-checkout-btn"
                            onClick={() => setCheckoutModal({ room: selectedRoom, buildingId: selectedRoom.buildingId, floorId: selectedRoom.floorId })}>
                            <LogOut size={15}/> Checkout & Facturer — {fTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </button>
                        </>
                      ) : (
                        <div className="si-no-folio">
                          <CreditCard size={36} color="#CBD5E1" strokeWidth={1.5}/>
                          <span>Aucune consommation enregistrée</span>
                          <p>Les services commandés via le Hub de Services apparaîtront ici automatiquement.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ══ FLOOR RENAME MODAL ════════════════════════════════ */}
      <AnimatePresence>
        {editFloorModal && (
          <div className="si-modal-overlay" onClick={() => setEditFloorModal(null)}>
            <motion.div className="si-modal si-modal-sm" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>
              <div className="si-modal-head">
                <div>
                  <h2><Pencil size={15} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>Renommer l'étage</h2>
                  <p>Étage {editFloorModal.currentLabel}</p>
                </div>
                <button className="si-close-btn" onClick={() => setEditFloorModal(null)}><X size={17}/></button>
              </div>
              <div className="si-wizard-body">
                <div className="si-form-group">
                  <label>Nouveau nom de l'étage <span className="si-req">*</span></label>
                  <input
                    className="si-input"
                    value={editFloorLabel}
                    onChange={e => setEditFloorLabel(e.target.value)}
                    placeholder="ex: Rez-de-chaussée, 1er Étage…"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && editFloorLabel.trim() && handleRenameFloor()}
                  />
                </div>
              </div>
              <div className="si-modal-foot">
                <button className="si-btn-ghost" onClick={() => setEditFloorModal(null)}>Annuler</button>
                <button className="si-btn-primary" onClick={handleRenameFloor} disabled={!editFloorLabel.trim()}>
                  <CheckCircle size={14}/> Renommer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ LOCK MODAL ════════════════════════════════════════ */}
      <AnimatePresence>
        {lockModal && (
          <div className="si-modal-overlay" onClick={() => setLockModal(null)}>
            <motion.div className="si-modal" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>
              <div className="si-modal-head">
                <div>
                  <h2>Connecter une serrure IoT</h2>
                  <p>Chambre {lockModal.room.number} — Sélectionnez le fournisseur et l'appareil</p>
                </div>
                <button className="si-close-btn" onClick={() => setLockModal(null)}><X size={17}/></button>
              </div>

              {/* Provider tabs */}
              <div className="si-modal-prov-tabs">
                {Object.values(LOCK_PROVIDERS).map(p => (
                  <button key={p.id} className={`si-prov-tab ${lockProvider === p.id ? 'active' : ''}`}
                    style={lockProvider === p.id ? { background: p.bg, borderColor: p.color, color: p.color } : {}}
                    onClick={() => setLockProvider(p.id)}>
                    <span className="si-prov-logo">{p.logo}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Device list */}
              <div className="si-device-list">
                {LOCK_POOL[lockProvider]?.map(device => {
                  const isUsed = usedDevIds.has(device.devId);
                  return (
                    <div key={device.devId} className={`si-device-row ${isUsed ? 'used' : ''}`}>
                      <div className="si-device-info">
                        <span className="si-device-name">{device.name}</span>
                        <span className="si-device-serial">{device.serial} · FW {device.fw}</span>
                      </div>
                      <div className="si-device-stats">
                        <BattIcon level={device.battery} size={13}/>
                        <span className={device.battery < 20 ? 'text-red' : ''}>{device.battery}%</span>
                        {device.online ? <span className="si-dot online"/> : <span className="si-dot offline"/>}
                        <span>{device.online ? 'En ligne' : 'Hors ligne'}</span>
                      </div>
                      <button
                        className={`si-link-btn ${isUsed ? 'disabled' : ''}`}
                        disabled={isUsed}
                        onClick={() => !isUsed && handleAssignLock(device)}
                      >
                        {isUsed ? '✓ Assignée' : 'Lier'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ CHECKOUT CONFIRM ══════════════════════════════════ */}
      <AnimatePresence>
        {checkoutModal && (
          <div className="si-modal-overlay" onClick={() => setCheckoutModal(null)}>
            <motion.div className="si-modal si-modal-sm" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>
              <div className="si-modal-head">
                <div>
                  <h2>Checkout Chambre {checkoutModal.room.number}</h2>
                  <p>Cette action règle le folio et met la chambre en maintenance</p>
                </div>
                <button className="si-close-btn" onClick={() => setCheckoutModal(null)}><X size={17}/></button>
              </div>
              <div className="si-checkout-summary">
                <div className="si-checkout-line"><span>Folio total</span><strong>{folioTotal(checkoutModal.room.number).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong></div>
                <div className="si-checkout-line"><span>Serrure</span><strong>PIN révoqué au départ</strong></div>
                <div className="si-checkout-line"><span>Nouveau statut</span><strong>Maintenance (nettoyage)</strong></div>
              </div>
              <div className="si-modal-foot">
                <button className="si-btn-ghost" onClick={() => setCheckoutModal(null)}>Annuler</button>
                <button className="si-btn-danger" onClick={handleCheckout}><LogOut size={14}/> Confirmer Checkout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ ADD BUILDING WIZARD ═══════════════════════════════ */}
      <AnimatePresence>
        {addBuildingOpen && (
          <div className="si-modal-overlay" onClick={() => setAddBuildingOpen(false)}>
            <motion.div className="si-modal si-modal-lg" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>

              <div className="si-modal-head">
                <div>
                  <h2><Building2 size={17} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>Nouveau Bâtiment</h2>
                  <p>Étape {addBldStep}/3 — {addBldStep===1?'Informations générales':addBldStep===2?'Configuration des étages':'Aperçu avant création'}</p>
                </div>
                <button className="si-close-btn" onClick={() => setAddBuildingOpen(false)}><X size={17}/></button>
              </div>

              {/* Step indicator */}
              <div className="si-wizard-steps">
                {['Informations','Étages','Aperçu'].map((s, i) => (
                  <div key={i} className={`si-wizard-step ${addBldStep > i ? 'done' : ''} ${addBldStep === i+1 ? 'active' : ''}`}>
                    <div className="si-wizard-dot">{addBldStep > i+1 ? <CheckCircle size={12}/> : i+1}</div>
                    <span>{s}</span>
                    {i < 2 && <div className="si-wizard-line"/>}
                  </div>
                ))}
              </div>

              {/* STEP 1 — Nom + Nb étages */}
              {addBldStep === 1 && (
                <div className="si-wizard-body">
                  <div className="si-form-group">
                    <label>Nom du bâtiment <span className="si-req">*</span></label>
                    <input
                      className="si-input"
                      placeholder="ex: Bâtiment A, Villa Sud, Résidence Les Pins…"
                      value={newBldName}
                      onChange={e => setNewBldName(e.target.value)}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && newBldName.trim() && setAddBldStep(2)}
                    />
                  </div>
                  <div className="si-form-group">
                    <label>Nombre d'étages</label>
                    <div className="si-number-picker">
                      <button onClick={() => handleFloorCountChange(newBldFloors - 1)} disabled={newBldFloors <= 1}>−</button>
                      <input
                        type="number" min="1" max="10"
                        value={newBldFloors}
                        onChange={e => handleFloorCountChange(e.target.value)}
                        className="si-input si-input-center"
                      />
                      <button onClick={() => handleFloorCountChange(newBldFloors + 1)} disabled={newBldFloors >= 10}>+</button>
                    </div>
                    <p className="si-hint">1 = RDC seulement · 3 = RDC + 2 étages · max 10 étages</p>
                  </div>
                </div>
              )}

              {/* STEP 2 — Configuration par étage */}
              {addBldStep === 2 && (
                <div className="si-wizard-body">
                  <p className="si-wizard-intro">Personnalisez chaque étage — libellé, préfixe des numéros et type de chambre par défaut.</p>
                  <div className="si-floor-defs-list">
                    {newBldFloorDefs.map((fd, i) => (
                      <div key={i} className="si-floor-def-row">
                        <div className="si-floor-def-num">{i === 0 ? 'RDC' : `É${i}`}</div>
                        <div className="si-floor-def-fields">
                          <div className="si-form-group si-form-group-sm">
                            <label>Libellé étage</label>
                            <input className="si-input si-input-sm" value={fd.label}
                              onChange={e => setNewBldFloorDefs(prev => prev.map((d, j) => j===i ? {...d, label: e.target.value} : d))}/>
                          </div>
                          <div className="si-form-group si-form-group-sm">
                            <label>Préfixe N°</label>
                            <input className="si-input si-input-sm si-input-short" value={fd.prefix}
                              placeholder="1, A, B…"
                              onChange={e => setNewBldFloorDefs(prev => prev.map((d, j) => j===i ? {...d, prefix: e.target.value} : d))}/>
                          </div>
                          <div className="si-form-group si-form-group-sm">
                            <label>Nb chambres</label>
                            <div className="si-number-picker si-number-picker-sm">
                              <button onClick={() => setNewBldFloorDefs(prev => prev.map((d,j) => j===i ? {...d, roomCount: Math.max(0, d.roomCount-1)} : d))}>−</button>
                              <input type="number" min="0" max="30" value={fd.roomCount} className="si-input si-input-center si-input-sm"
                                onChange={e => setNewBldFloorDefs(prev => prev.map((d,j) => j===i ? {...d, roomCount: Math.max(0,Math.min(30,parseInt(e.target.value)||0))} : d))}/>
                              <button onClick={() => setNewBldFloorDefs(prev => prev.map((d,j) => j===i ? {...d, roomCount: Math.min(30, d.roomCount+1)} : d))}>+</button>
                            </div>
                          </div>
                          <div className="si-form-group si-form-group-sm">
                            <label>Type par défaut</label>
                            <select className="si-select si-select-sm" value={fd.roomType}
                              onChange={e => setNewBldFloorDefs(prev => prev.map((d,j) => j===i ? {...d, roomType: e.target.value} : d))}>
                              {Object.entries(ROOM_TYPES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="si-floor-def-preview">
                          {Array.from({length: Math.min(fd.roomCount, 6)}, (_,j) => (
                            <span key={j} className="si-room-preview-chip">{fd.prefix}{String(j+1).padStart(2,'0')}</span>
                          ))}
                          {fd.roomCount > 6 && <span className="si-room-preview-more">+{fd.roomCount-6}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 — Aperçu */}
              {addBldStep === 3 && (
                <div className="si-wizard-body">
                  <div className="si-preview-building">
                    <div className="si-preview-bld-head">
                      <Building2 size={16}/>
                      <strong>{newBldName || 'Nouveau Bâtiment'}</strong>
                      <span className="si-floor-chip">{newBldFloorDefs.reduce((s,f)=>s+f.roomCount,0)} ch. · {newBldFloors} étage{newBldFloors>1?'s':''}</span>
                    </div>
                    {newBldFloorDefs.map((fd, i) => (
                      <div key={i} className="si-preview-floor">
                        <div className="si-preview-floor-label">
                          <span>{fd.label}</span>
                          <span className="si-floor-chip">{fd.roomCount}</span>
                        </div>
                        <div className="si-preview-rooms">
                          {Array.from({length: fd.roomCount}, (_,j) => (
                            <div key={j} className="si-preview-room-card">
                              <span className="si-preview-room-num">{fd.prefix}{String(j+1).padStart(2,'0')}</span>
                              <span className="si-preview-room-type">{ROOM_TYPES[fd.roomType]?.icon}</span>
                            </div>
                          ))}
                          {fd.roomCount === 0 && <span className="si-hint" style={{padding:'6px'}}>Aucune chambre — vous pourrez en ajouter plus tard</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="si-modal-foot">
                {addBldStep > 1
                  ? <button className="si-btn-ghost" onClick={() => setAddBldStep(s => s-1)}>← Retour</button>
                  : <button className="si-btn-ghost" onClick={() => setAddBuildingOpen(false)}>Annuler</button>
                }
                {addBldStep < 3
                  ? <button className="si-btn-primary" onClick={() => setAddBldStep(s => s+1)} disabled={addBldStep===1 && !newBldName.trim()}>
                      Suivant →
                    </button>
                  : <button className="si-btn-primary" onClick={handleAddBuilding}>
                      <CheckCircle size={14}/> Créer le bâtiment
                    </button>
                }
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ BULK ADD ROOMS MODAL ══════════════════════════════ */}
      <AnimatePresence>
        {bulkRoomModal && (
          <div className="si-modal-overlay" onClick={() => setBulkRoomModal(null)}>
            <motion.div className="si-modal si-modal-sm" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>
              <div className="si-modal-head">
                <div>
                  <h2><Layers size={16} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>Ajout en masse</h2>
                  <p>{bulkRoomModal.floorLabel}</p>
                </div>
                <button className="si-close-btn" onClick={() => setBulkRoomModal(null)}><X size={17}/></button>
              </div>

              <div className="si-wizard-body">
                <div className="si-form-row">
                  <div className="si-form-group">
                    <label>Nombre de chambres à créer</label>
                    <div className="si-number-picker">
                      <button onClick={() => setBulkCount(c => Math.max(1, c-1))}>−</button>
                      <input type="number" min="1" max="50" value={bulkCount} className="si-input si-input-center"
                        onChange={e => setBulkCount(Math.max(1, Math.min(50, parseInt(e.target.value)||1)))}/>
                      <button onClick={() => setBulkCount(c => Math.min(50, c+1))}>+</button>
                    </div>
                  </div>
                  <div className="si-form-group">
                    <label>N° de chambre de départ</label>
                    <input className="si-input" value={bulkStartNum}
                      onChange={e => setBulkStartNum(e.target.value)}
                      placeholder="ex: 201"/>
                  </div>
                </div>

                <div className="si-form-row">
                  <div className="si-form-group">
                    <label>Type de chambre</label>
                    <select className="si-select" value={bulkRoomType} onChange={e => setBulkRoomType(e.target.value)}>
                      {Object.entries(ROOM_TYPES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                  </div>
                  <div className="si-form-group">
                    <label>Statut initial</label>
                    <select className="si-select" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
                      {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="si-bulk-preview">
                  <span className="si-bulk-preview-label">Aperçu des numéros créés :</span>
                  <div className="si-bulk-preview-chips">
                    {Array.from({length: Math.min(bulkCount, 10)}, (_,i) => {
                      const n = parseInt(bulkStartNum, 10);
                      return <span key={i} className="si-room-preview-chip">{isNaN(n) ? '?' : n+i}</span>;
                    })}
                    {bulkCount > 10 && <span className="si-room-preview-more">+{bulkCount-10} chambres</span>}
                  </div>
                </div>
              </div>

              <div className="si-modal-foot">
                <button className="si-btn-ghost" onClick={() => setBulkRoomModal(null)}>Annuler</button>
                <button className="si-btn-primary" onClick={handleBulkAddRooms}>
                  <Plus size={14}/> Créer {bulkCount} chambre{bulkCount>1?'s':''}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ ADD SINGLE ROOM MODAL ════════════════════════════ */}
      <AnimatePresence>
        {addRoomModal && (
          <div className="si-modal-overlay" onClick={() => setAddRoomModal(null)}>
            <motion.div className="si-modal si-modal-sm" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} onClick={e => e.stopPropagation()}>
              <div className="si-modal-head">
                <div>
                  <h2><Plus size={16} style={{display:'inline',verticalAlign:'middle',marginRight:6}}/>Nouvelle chambre</h2>
                  <p>{addRoomModal.floorLabel}</p>
                </div>
                <button className="si-close-btn" onClick={() => setAddRoomModal(null)}><X size={17}/></button>
              </div>

              <div className="si-wizard-body">
                <div className="si-form-group">
                  <label>Numéro de chambre <span className="si-req">*</span></label>
                  <input className="si-input" value={newRoomNum}
                    onChange={e => setNewRoomNum(e.target.value)}
                    placeholder="ex: 201, A01, Studio-1…"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && newRoomNum.trim() && handleAddSingleRoom()}/>
                </div>
                <div className="si-form-row">
                  <div className="si-form-group">
                    <label>Type de chambre</label>
                    <select className="si-select" value={newRoomType} onChange={e => setNewRoomType(e.target.value)}>
                      {Object.entries(ROOM_TYPES).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                  </div>
                  <div className="si-form-group">
                    <label>Statut initial</label>
                    <select className="si-select" value={newRoomStatus} onChange={e => setNewRoomStatus(e.target.value)}>
                      {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="si-modal-foot">
                <button className="si-btn-ghost" onClick={() => setAddRoomModal(null)}>Annuler</button>
                <button className="si-btn-primary" onClick={handleAddSingleRoom} disabled={!newRoomNum.trim()}>
                  <Plus size={14}/> Ajouter la chambre
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ CARD ACCESS MODAL ═══════════════════════════════ */}
      {showCardModal && selectedRoom?.lock && (() => {
        const guest = GUEST_MAP[selectedRoom.number];
        const prov  = LOCK_PROVIDERS[selectedRoom.lock.provider];
        return (
          <CardAccessModal
            open={showCardModal}
            onClose={() => setShowCardModal(false)}
            roomId={selectedRoom.number}
            roomName={`Chambre ${selectedRoom.number}`}
            lockId={selectedRoom.lock.devId}
            floor={''}
            guestName={guest?.name || ''}
            checkIn={guest?.checkIn || ''}
            checkOut={guest?.checkOut || ''}
          />
        );
      })()}
    </div>
  );
};

/* ─── InfoBlock sub-component ─── */
const InfoBlock = ({ label, value, valueColor }) => (
  <div className="si-info-block">
    <span className="si-info-label">{label}</span>
    <span className="si-info-value" style={valueColor ? { color: valueColor, fontWeight: 700 } : {}}>{value}</span>
  </div>
);

export default SmartInventory;
