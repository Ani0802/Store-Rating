import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { User, Mail, MapPin, Lock, UserPlus, AlertCircle } from "lucide-react";

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};

    // Name validation: 20-60 chars
    if (!formData.name) {
      tempErrors.name = "Name is required";
    } else if (formData.name.length < 20 || formData.name.length > 60) {
      tempErrors.name = `Name must be between 20 and 60 characters (currently: ${formData.name.length})`;
    }

    // Email validation
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    // Address validation: Max 400 chars
    if (!formData.address) {
      tempErrors.address = "Address is required";
    } else if (formData.address.length > 400) {
      tempErrors.address = `Address cannot exceed 400 characters (currently: ${formData.address.length})`;
    }

    // Password validation: 8-16 chars, one uppercase, one special
    const specialCharRegex = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]/;
    const uppercaseRegex = /[A-Z]/;

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      tempErrors.password = "Password must be between 8 and 16 characters";
    } else if (!uppercaseRegex.test(formData.password)) {
      tempErrors.password = "Password must include at least one uppercase letter";
    } else if (!specialCharRegex.test(formData.password)) {
      tempErrors.password = "Password must include at least one special character";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post("/auth/register", formData);
      const { token, user } = response.data;
      login(token, user);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      const serverMsg = error.response?.data?.message || "Registration failed. Please try again.";
      const fieldErrors = error.response?.data?.errors;
      
      if (fieldErrors) {
        // Flatten backend validation errors
        const newErrors: Record<string, string> = {};
        Object.keys(fieldErrors).forEach((key) => {
          newErrors[key] = fieldErrors[key][0];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: serverMsg });
      }
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
        padding: "2rem 1rem"
      }}
    >
      <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "550px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Create Account</h2>
          <p style={{ color: "var(--text-secondary)" }}>Register to start rating stores</p>
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
            <label className="form-label">Full Name (Min 20 characters)</label>
            <div style={{ position: "relative" }}>
              <User 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
              />
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Alexander Nathaniel Richardson"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

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
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address (Max 400 characters)</label>
            <div style={{ position: "relative", display: "flex" }}>
              <MapPin 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: "absolute", left: "12px", top: "15px" }} 
              />
              <textarea
                name="address"
                className="form-input"
                placeholder="Enter your permanent address..."
                value={formData.address}
                onChange={handleChange}
                rows={3}
                style={{ paddingLeft: "2.5rem", resize: "vertical" }}
              />
            </div>
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password (8-16 chars, 1 Uppercase, 1 Special Char)</label>
            <div style={{ position: "relative" }}>
              <Lock 
                size={18} 
                color="var(--text-secondary)" 
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} 
              />
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="e.g. SecurePass123!"
                value={formData.password}
                onChange={handleChange}
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
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Already have an account? </span>
          <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
