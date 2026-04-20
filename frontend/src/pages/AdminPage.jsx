import { useEffect, useState, useCallback } from "react";
import { getAdminUsers, deleteAdminUser, getAdminItems } from "../services/api";

const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.admin-row:hover { background: rgba(255,255,255,0.04) !important; }
.admin-row:hover .row-actions { opacity: 1 !important; }
`;

/* ─── Confirm Delete Modal ──────────────────────────────── */
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div onClick={onCancel} style={{
    position: "fixed", inset: 0, zIndex: 3000,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", padding: "20px",
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      width: "100%", maxWidth: "380px",
      background: "var(--block-bg)", backdropFilter: "blur(24px)",
      borderRadius: "18px", border: "1px solid rgba(239,68,68,0.3)",
      padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      animation: "slideIn 0.18s ease",
    }}>
      <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "12px" }}>🗑</div>
      <h3 style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "16px",
        textAlign: "center", margin: "0 0 8px" }}>Confirm Delete</h3>
      <p style={{ color: "var(--text-color)", opacity: 0.55, fontSize: "13px",
        textAlign: "center", margin: "0 0 24px", lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onConfirm} style={{
          flex: 1, padding: "11px", borderRadius: "10px", border: "none",
          background: "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer",
        }}>Delete</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: "11px", borderRadius: "10px",
          border: "1px solid var(--block-border)", background: "transparent",
          color: "var(--text-color)", fontWeight: "600", fontSize: "14px",
          cursor: "pointer", opacity: 0.65,
        }}>Cancel</button>
      </div>
    </div>
  </div>
);

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ emoji, value, label, color, delay }) => (
  <div style={{
    background: "var(--block-bg)", backdropFilter: "blur(6px)",
    borderRadius: "16px", border: "1px solid var(--block-border)",
    padding: "18px 22px", display: "flex", alignItems: "center", gap: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    animation: `fadeUp 0.4s ease both`, animationDelay: delay,
  }}>
    <div style={{
      width: "44px", height: "44px", borderRadius: "12px",
      background: color + "22", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "20px", flexShrink: 0,
    }}>{emoji}</div>
    <div>
      <div style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "26px", lineHeight: 1 }}>{value}</div>
      <div style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "12px", marginTop: "3px" }}>{label}</div>
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
const AdminPage = () => {
  const [users, setUsers]   = useState([]);
  const [items, setItems]   = useState([]);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [u, i] = await Promise.all([getAdminUsers(), getAdminItems()]);
    setUsers(u); setItems(i);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });

  const handleDeleteUser = (u) => {
    askConfirm(
      `Delete user "${u.username}"? This cannot be undone.`,
      async () => { setConfirm(null); await deleteAdminUser(u.id); fetchAll(); }
    );
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 style={{ color: "var(--text-color)", fontWeight: "900",
              fontSize: "clamp(24px,4vw,34px)", letterSpacing: "-0.5px", margin: 0 }}>
              🛡 Admin Panel
            </h1>
            <span style={{
              padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444", letterSpacing: "0.5px",
            }}>RESTRICTED</span>
          </div>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: 0 }}>
            Manage all users and their content
          </p>
        </div>

        {/* Stat pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: "12px", marginBottom: "28px" }}>
          <StatCard emoji="👥" value={users.length} label="Total users" color="#7c3aed" delay="0.05s" />
          <StatCard emoji="👑" value={users.filter(u => u.is_admin).length} label="Admins" color="#ef4444" delay="0.10s" />
          <StatCard emoji="📦" value={items.length} label="Total items" color="#10b981" delay="0.15s" />
        </div>

        {/* Main block */}
        <div style={{
          background: "var(--block-bg)", backdropFilter: "blur(6px)",
          borderRadius: "20px", border: "1px solid var(--block-border)",
          padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          animation: "fadeUp 0.4s ease 0.15s both",
        }}>
          {/* Search */}
          <div style={{ marginBottom: "20px" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              style={{
                padding: "9px 14px", borderRadius: "10px", width: "100%",
                border: "1px solid var(--block-border)", background: "rgba(255,255,255,0.04)",
                color: "var(--text-color)", fontSize: "13px", outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#7c3aed")}
              onBlur={e => (e.target.style.borderColor = "var(--block-border)")}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 20px",
              color: "var(--text-color)", opacity: 0.35 }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
              <p style={{ fontSize: "13px", margin: 0 }}>Loading data...</p>
            </div>
          )}

          {/* ── Users list ── */}
          {!loading && (
            <div>
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px",
                  color: "var(--text-color)", opacity: 0.3 }}>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>👥</div>
                  <p style={{ fontSize: "13px", margin: 0 }}>No users found</p>
                </div>
              ) : filteredUsers.map((u, idx) => (
                <div key={u.id} className="admin-row" style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "10px",
                  background: "transparent", transition: "background 0.15s",
                  animation: `fadeUp 0.3s ease ${idx * 0.04}s both`,
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                    background: u.is_admin
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: "800", fontSize: "14px",
                  }}>
                    {u.username[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "14px" }}>
                        {u.username}
                      </span>
                      {u.is_admin && (
                        <span style={{
                          padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "800",
                          background: "rgba(239,68,68,0.12)", color: "#ef4444",
                          border: "1px solid rgba(239,68,68,0.25)", letterSpacing: "0.5px",
                        }}>ADMIN</span>
                      )}
                    </div>
                    <div style={{ color: "var(--text-color)", opacity: 0.4, fontSize: "11px" }}>
                      ID #{u.id} · {items.filter(i => i.user_id === u.id).length} items
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="row-actions" style={{ opacity: 0, transition: "opacity 0.15s" }}>
                    <button onClick={() => handleDeleteUser(u)} disabled={u.is_admin} style={{
                      padding: "7px 14px", borderRadius: "8px", cursor: u.is_admin ? "not-allowed" : "pointer",
                      border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                      color: "#ef4444", fontWeight: "700", fontSize: "12px",
                      opacity: u.is_admin ? 0.35 : 1,
                    }} title={u.is_admin ? "Cannot delete admin" : "Delete user"}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};

export default AdminPage;