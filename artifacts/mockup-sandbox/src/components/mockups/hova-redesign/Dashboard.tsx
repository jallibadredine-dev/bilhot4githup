import {
  LayoutDashboard, Building2, CalendarDays, BarChart3, Users, Settings,
  Bell, Search, ChevronDown, TrendingUp, Home, Lock, Zap, Globe,
  ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, AlertCircle,
  Star, LogOut, HelpCircle, CreditCard
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: true },
  { icon: CalendarDays, label: "Réservations" },
  { icon: Building2, label: "Propriétés" },
  { icon: Globe, label: "Canaux" },
  { icon: Lock, label: "Serrures" },
  { icon: Zap, label: "Automatisations" },
  { icon: BarChart3, label: "Rapports" },
  { icon: Users, label: "Clients" },
  { icon: CreditCard, label: "Facturation" },
];

const footerItems = [
  { icon: HelpCircle, label: "Aide" },
  { icon: Settings, label: "Paramètres" },
];

const kpis = [
  {
    label: "Taux d'occupation",
    value: "78%",
    delta: "+4.2%",
    up: true,
    sub: "vs mois dernier",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    label: "Revenu mensuel",
    value: "12 480 €",
    delta: "+11.8%",
    up: true,
    sub: "vs mois dernier",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    label: "RevPAR",
    value: "97 €",
    delta: "-2.1%",
    up: false,
    sub: "vs mois dernier",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    label: "Avis clients",
    value: "4.8 / 5",
    delta: "+0.2",
    up: true,
    sub: "sur 142 avis",
    color: "#D97706",
    bg: "#FFFBEB",
  },
];

const reservations = [
  { guest: "Marie Dupont", property: "Appart. Riviera", checkin: "19 mai", checkout: "23 mai", status: "confirmed", amount: "480 €" },
  { guest: "James Wilson", property: "Studio Opéra", checkin: "20 mai", checkout: "24 mai", status: "pending", amount: "320 €" },
  { guest: "Anna Müller", property: "Villa Côte d'Azur", checkin: "21 mai", checkout: "28 mai", status: "confirmed", amount: "1 260 €" },
  { guest: "Carlos Ruiz", property: "Appart. Riviera", checkin: "24 mai", checkout: "26 mai", status: "confirmed", amount: "240 €" },
  { guest: "Yuki Tanaka", property: "Studio Opéra", checkin: "25 mai", checkout: "30 mai", status: "pending", amount: "400 €" },
];

const channelData = [
  { name: "Airbnb", pct: 48, color: "#FF385C" },
  { name: "Booking.com", pct: 31, color: "#2563EB" },
  { name: "Direct", pct: 14, color: "#059669" },
  { name: "Autres", pct: 7, color: "#9CA3AF" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: { label: "Confirmé", bg: "#ECFDF5", color: "#059669" },
    pending:   { label: "En attente", bg: "#FFFBEB", color: "#D97706" },
    cancelled: { label: "Annulé", bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
};

export function Dashboard() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", color: "#111827" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 220, minWidth: 220, background: "#FFFFFF", borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", padding: "0 0 16px" }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ width: 32, height: 32, background: "#2563EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 15, fontStyle: "italic", fontFamily: "Georgia, serif" }}>H</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5, color: "#111827" }}>hova</span>
        </div>

        {/* Property pill */}
        <div style={{ padding: "12px 12px 4px" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <Home size={14} color="#6B7280" />
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Villa Côte d'Azur</span>
            <ChevronDown size={14} color="#9CA3AF" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {navItems.map(({ icon: Icon, label, active }) => (
            <button key={label} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 16px", border: "none", cursor: "pointer",
              background: active ? "#EFF6FF" : "transparent",
              color: active ? "#2563EB" : "#6B7280",
              fontWeight: active ? 600 : 500, fontSize: 13.5,
              position: "relative",
              borderLeft: active ? "3px solid #2563EB" : "3px solid transparent",
              transition: "all 0.12s",
            }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
          {footerItems.map(({ icon: Icon, label }) => (
            <button key={label} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "8px 16px", border: "none", background: "transparent",
              color: "#6B7280", fontWeight: 500, fontSize: 13.5, cursor: "pointer",
            }}>
              <Icon size={16} />
              {label}
            </button>
          ))}
          <button style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 16px", border: "none", background: "transparent", color: "#DC2626", fontWeight: 500, fontSize: 13.5, cursor: "pointer" }}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOP HEADER */}
        <header style={{ height: 60, background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Tableau de bord</h1>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Lundi 19 mai 2026</p>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: 50, width: 220 }}>
            <Search size={14} color="#9CA3AF" />
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>Rechercher…</span>
          </div>

          {/* Actions */}
          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", position: "relative" }}>
            <Bell size={16} color="#6B7280" />
            <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#2563EB", borderRadius: "50%", border: "1.5px solid white" }} />
          </button>

          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", border: "1.5px solid #E5E7EB", borderRadius: 50, background: "white", cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>MA</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Marc A.</span>
            <ChevronDown size={13} color="#9CA3AF" />
          </button>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, marginBottom: 8 }}>{k.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: -0.5 }}>{k.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: k.up ? "#059669" : "#DC2626", background: k.up ? "#ECFDF5" : "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>
                    {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {k.delta}
                  </span>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>{k.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

            {/* Reservations table */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Réservations récentes</h2>
                <button style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", background: "#EFF6FF", padding: "5px 12px", border: "none", borderRadius: 8, cursor: "pointer" }}>Voir tout</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    {["Client", "Propriété", "Arrivée", "Départ", "Statut", "Montant"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 500, color: "#111827" }}>{r.guest}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{r.property}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{r.checkin}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{r.checkout}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: "12px 16px", fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Channel distribution */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Canaux de réservation</h2>
                {channelData.map((c) => (
                  <div key={c.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{c.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{c.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Actions rapides</h2>
                {[
                  { label: "Synchroniser les canaux", icon: Globe, color: "#2563EB", bg: "#EFF6FF" },
                  { label: "Créer une réservation", icon: CalendarDays, color: "#059669", bg: "#ECFDF5" },
                  { label: "Envoyer un message", icon: Users, color: "#7C3AED", bg: "#F5F3FF" },
                  { label: "Voir les serrures", icon: Lock, color: "#D97706", bg: "#FFFBEB" },
                ].map((a) => (
                  <button key={a.label} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", border: "none", background: "transparent", cursor: "pointer", borderRadius: 8, textAlign: "left", marginBottom: 2 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <a.icon size={14} color={a.color} />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "#374151" }}>{a.label}</span>
                    <ArrowUpRight size={14} color="#9CA3AF" style={{ marginLeft: "auto" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
