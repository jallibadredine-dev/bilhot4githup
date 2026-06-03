import React from 'react';
import { Search, MapPin, Home, Wifi, Shield, ChevronRight, Star } from 'lucide-react';
import './PropertyGallery.css';

const PropertyGallery = () => {
  const properties = [
    { id: 1, name: 'Appartement Marais', rooms: 12, bookings: 5, price: '120€', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80' },
    { id: 2, name: 'Studio Eiffel', rooms: 10, bookings: 3, price: '95€', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80' },
    { id: 3, name: 'Villa Sunrise', rooms: 1, bookings: 1, price: '450€', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80' },
  ];

  return (
    <div className="property-module">
      <div className="module-header-glass">
        <div>
          <h2>Nos Logements</h2>
          <p className="text-secondary">Gestion du parc immobilier et équipements</p>
        </div>
        <div className="header-actions">
           <div className="search-input-wrapper glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={16} />
              <input type="text" placeholder="Rechercher un bien..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
           </div>
           <button className="btn-action primary">Ajouter Logement</button>
        </div>
      </div>

      <div className="property-layout-grid">
        <div className="property-main-view">
           <div className="property-cards-grid">
              {properties.map(p => (
                <div key={p.id} className="property-card glass-card">
                   <div className="property-image" style={{ backgroundImage: `url(${p.img})` }}>
                      <div className="image-badge">Réserveé</div>
                   </div>
                   <div className="property-info">
                      <h4>{p.name}</h4>
                      <div className="property-meta">
                         <span>{p.rooms} Logements Métrics</span>
                         <span>{p.bookings} Réservés</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="property-detail-sidebar glass-panel">
           <div className="detail-section">
              <h5>Propriété Sélectionnée</h5>
              <div className="selected-card glass-card" style={{ padding: '1rem' }}>
                 <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} alt=""/>
                 <h4>Appartement Marais</h4>
                 <p className="text-secondary" style={{ fontSize: '0.8rem' }}>14 rue de Rivoli, Paris</p>
              </div>
           </div>

           <div className="detail-section">
              <h5>Équipements</h5>
              <div className="amenities-list">
                 <span className="amenity-tag">Wifi HD</span>
                 <span className="amenity-tag">AC</span>
                 <span className="amenity-tag">Cuisine</span>
                 <span className="amenity-tag">Piscine</span>
              </div>
           </div>

           <div className="detail-section">
              <h5>Connectivité IoT</h5>
              <div className="lock-connection-status">
                 <Shield size={20} color="var(--status-green)" />
                 <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Serrure Connectée</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--status-green)' }}>Batterie 88% ● Signal Fort</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyGallery;
