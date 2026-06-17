import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Invalid email format";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      login(token, user);

      // Redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STORE_OWNER") {
        navigate("/store");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      const serverMessage = error.response?.data?.message || "Invalid credentials. Please try again.";
      setErrors({ general: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "1rem"
      }}
    >
      <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "450px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)" }}>Sign in to continue to StoreRate</p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
              />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Don't have an account? </span>
          <Link to="/register" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
