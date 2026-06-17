import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};

    if (!oldPassword) {
      tempErrors.oldPassword = "Current password is required";
    }

    // New password validation
    const specialCharRegex = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]/;
    const uppercaseRegex = /[A-Z]/;

    if (!newPassword) {
      tempErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      tempErrors.newPassword = "Password must be between 8 and 16 characters";
    } else if (!uppercaseRegex.test(newPassword)) {
      tempErrors.newPassword = "Password must include at least one uppercase letter";
    } else if (!specialCharRegex.test(newPassword)) {
      tempErrors.newPassword = "Password must include at least one special character";
    }

    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBack = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "ADMIN") {
      navigate("/admin");
    } else if (user.role === "STORE_OWNER") {
      navigate("/store");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      await api.post("/auth/change-password", { oldPassword, newPassword });
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        handleBack();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      const serverMsg = error.response?.data?.message || "Failed to update password. Please check your credentials.";
      setErrors({ general: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)" }}>
        <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "480px" }}>
          
          <button 
            onClick={handleBack} 
            className="btn btn-secondary" 
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", marginBottom: "1.5rem" }}
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Update Password</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Change your password below</p>

          {errors.general && (
            <div 
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--status-danger)",
                color: "#ff8a8a",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem"
              }}
            >
              <AlertCircle size={18} />
              <span>{errors.general}</span>
            </div>
          )}

          {success && (
            <div 
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid var(--status-success)",
                color: "#86efac",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem"
              }}
            >
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <Lock 
                  size={18} 
                  color="var(--text-secondary)" 
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.oldPassword && <span className="form-error">{errors.oldPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">New Password (8-16 chars, 1 uppercase, 1 special)</label>
              <div style={{ position: "relative" }}>
                <Lock 
                  size={18} 
                  color="var(--text-secondary)" 
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="e.g. NewSecurePass1!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <Lock 
                  size={18} 
                  color="var(--text-secondary)" 
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="e.g. NewSecurePass1!"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? <span>Updating Password...</span> : <span>Update Password</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
