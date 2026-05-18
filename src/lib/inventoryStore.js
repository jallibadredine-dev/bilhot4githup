/* ════════════════════════════════════════════════════════════════
   HOVA — Shared Inventory Store
   Centralise la liste des chambres entre SmartInventory
   et le ChannelManager.  Clés localStorage :
     hova_inventory_rooms     → tableau plat (lecture rapide)
     hova_inventory_buildings → structure complète (rechargement SI)
════════════════════════════════════════════════════════════════ */

import { secureStorage } from './secureStorage';

const ROOMS_KEY = 'hova_inventory_rooms';
const BLDS_KEY  = 'hova_inventory_buildings';

/* ─── Mappings ──────────────────────────────────────────────── */
export const INVENTORY_TYPE_LABELS = {
  standard:   'Standard',
  superior:   'Supérieure',
  deluxe:     'Deluxe',
  suite:      'Suite',
  family:     'Familiale',
  accessible: 'PMR Accessible',
};

export const INVENTORY_CAPACITY = {
  standard: 2, superior: 2, deluxe: 3,
  suite: 4, family: 6, accessible: 2,
};

export const INVENTORY_STATUS_CFG = {
  available:   { label: 'Disponible',   color: '#15803D', bg: '#DCFCE7' },
  occupied:    { label: 'Occupée',      color: '#1D4ED8', bg: '#DBEAFE' },
  maintenance: { label: 'Maintenance',  color: '#B45309', bg: '#FEF3C7' },
  blocked:     { label: 'Hors service', color: '#B91C1C', bg: '#FEE2E2' },
};

/* ─── Flatten buildings → flat room list ───────────────────── */
export const flattenBuildings = (buildings = []) => {
  const rooms = [];
  buildings.forEach(b => {
    b.floors.forEach(f => {
      f.rooms.forEach(r => {
        rooms.push({
          id:           r.id,
          number:       r.number,
          type:         r.type,
          typeLabel:    INVENTORY_TYPE_LABELS[r.type] || r.type,
          status:       r.status,
          buildingId:   b.id,
          buildingName: b.name,
          floorId:      f.id,
          floorLabel:   f.label,
          capacity:     INVENTORY_CAPACITY[r.type] || 2,
          hasLock:      !!r.lock,
          lockOnline:   r.lock?.online ?? false,
        });
      });
    });
  });
  return rooms;
};

/* ─── Persist (called by SmartInventory on every buildings change) ── */
export const persistInventory = (buildings) => {
  try {
    const rooms = flattenBuildings(buildings);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    localStorage.setItem(BLDS_KEY,  JSON.stringify(buildings));
    window.dispatchEvent(new StorageEvent('storage', { key: ROOMS_KEY }));
  } catch {}
};

/* ─── Read (auth-gated — only admin PMS reads inventory state) ─ */
export const getInventoryRooms = () => secureStorage.parseJSON(ROOMS_KEY, []);

export const getInventoryBuildings = () => secureStorage.parseJSON(BLDS_KEY, null);

/* ─── Map inventory rooms → OTA products ────────────────────── */
export const roomsToOTAProducts = (rooms, ota) =>
  rooms.map(room => ({
    id:              `${ota.id}-inv-${room.id}`,
    otaId:           ota.id,
    otaName:         ota.name,
    otaLogo:         ota.logo,
    otaColor:        ota.color,
    inventoryRoomId: room.id,
    name:            `Chambre ${room.number} — ${room.typeLabel}`,
    type:            room.typeLabel,
    rooms:           1,
    capacity:        room.capacity,
    price:           null,
    currency:        'EUR',
    status:          room.status,
    buildingName:    room.buildingName,
    floorLabel:      room.floorLabel,
  }));
