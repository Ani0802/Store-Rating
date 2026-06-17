import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Lock, Star, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <span className="badge badge-admin">System Admin</span>;
      case "STORE_OWNER":
        return <span className="badge badge-owner">Store Owner</span>;
      default:
        return <span className="badge badge-user">Normal User</span>;
    }
  };

  return (
    <nav 
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-glass)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "var(--shadow-premium)",
        zIndex: 100,
        position: "sticky",
        top: 0
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Star size={24} color="var(--accent-primary)" style={{ fill: "var(--accent-primary)" }} />
        <Link 
          to="/" 
          style={{ 
            fontSize: "1.5rem", 
            fontWeight: 700, 
            background: "var(--accent-gradient)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent",
            textDecoration: "none"
          }}
        >
          StoreRate
        </Link>
      </div>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "0.5rem 1rem", borderRadius: "50px", border: "1px solid var(--border-glass)" }}>
            <UserIcon size={16} color="var(--text-secondary)" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{user.email}</span>
            </div>
            {getRoleBadge(user.role)}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link 
              to="/change-password" 
              className="btn btn-secondary" 
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <Lock size={14} />
              <span>Change Password</span>
            </Link>
            
            <button 
              onClick={handleLogout} 
              className="btn btn-danger" 
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
