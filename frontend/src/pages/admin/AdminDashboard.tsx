import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import SortableTable from "../../components/SortableTable";
import type { TableColumn } from "../../components/SortableTable";
import RatingStars from "../../components/RatingStars";
import { Users, Star, UserPlus, Store as StoreIcon, Search, Eye, X, AlertCircle } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"users" | "stores">("stores");
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Users listing state
  const [users, setUsers] = useState<any[]>([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [userSort, setUserSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "createdAt", order: "desc" });

  // Stores listing state
  const [stores, setStores] = useState<any[]>([]);
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [storeSort, setStoreSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "createdAt", order: "desc" });

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Forms state
  const [userForm, setUserForm] = useState({ name: "", email: "", address: "", password: "", role: "USER" });
  const [storeForm, setStoreForm] = useState({ storeName: "", storeEmail: "", storeAddress: "", ownerName: "", ownerEmail: "", ownerPassword: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const { name, email, address, role } = userFilters;
      const response = await api.get("/admin/users", {
        params: {
          name: name || undefined,
          email: email || undefined,
          address: address || undefined,
          role: role || undefined,
          sortBy: userSort.key,
          sortOrder: userSort.order,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const { name, email, address } = storeFilters;
      const response = await api.get("/admin/stores", {
        params: {
          name: name || undefined,
          email: email || undefined,
          address: address || undefined,
          sortBy: storeSort.key,
          sortOrder: storeSort.order,
        },
      });
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userFilters, userSort, storeFilters, storeSort]);

  // Handle User Sort
  const handleUserSort = (key: string) => {
    setUserSort((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Handle Store Sort
  const handleStoreSort = (key: string) => {
    setStoreSort((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // View user details
  const handleViewUserDetail = async (userId: string) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetail(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  // Form validations for adding a normal/admin user
  const validateUserForm = () => {
    const errs: Record<string, string> = {};
    if (!userForm.name || userForm.name.length < 20 || userForm.name.length > 60) {
      errs.name = `Name must be between 20 and 60 characters (currently: ${userForm.name.length})`;
    }
    if (!userForm.email || !/\S+@\S+\.\S+/.test(userForm.email)) {
      errs.email = "Valid email is required";
    }
    if (!userForm.address || userForm.address.length > 400) {
      errs.address = "Address is required and cannot exceed 400 characters";
    }
    const specialCharRegex = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]/;
    const uppercaseRegex = /[A-Z]/;
    if (!userForm.password || userForm.password.length < 8 || userForm.password.length > 16 || !uppercaseRegex.test(userForm.password) || !specialCharRegex.test(userForm.password)) {
      errs.password = "Password must be 8-16 chars, contain 1 uppercase letter and 1 special character";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form validations for adding a store
  const validateStoreForm = () => {
    const errs: Record<string, string> = {};
    if (!storeForm.storeName || storeForm.storeName.length < 20 || storeForm.storeName.length > 60) {
      errs.storeName = `Store Name must be between 20 and 60 characters (currently: ${storeForm.storeName.length})`;
    }
    if (!storeForm.storeEmail || !/\S+@\S+\.\S+/.test(storeForm.storeEmail)) {
      errs.storeEmail = "Valid store email is required";
    }
    if (!storeForm.storeAddress || storeForm.storeAddress.length > 400) {
      errs.storeAddress = "Store Address is required and cannot exceed 400 characters";
    }
    if (!storeForm.ownerName || storeForm.ownerName.length < 20 || storeForm.ownerName.length > 60) {
      errs.ownerName = `Owner Name must be between 20 and 60 characters (currently: ${storeForm.ownerName.length})`;
    }
    if (!storeForm.ownerEmail || !/\S+@\S+\.\S+/.test(storeForm.ownerEmail)) {
      errs.ownerEmail = "Valid owner email is required";
    }
    const specialCharRegex = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]/;
    const uppercaseRegex = /[A-Z]/;
    if (!storeForm.ownerPassword || storeForm.ownerPassword.length < 8 || storeForm.ownerPassword.length > 16 || !uppercaseRegex.test(storeForm.ownerPassword) || !specialCharRegex.test(storeForm.ownerPassword)) {
      errs.ownerPassword = "Password must be 8-16 chars, contain 1 uppercase letter and 1 special character";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle User Form Submit
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setFormLoading(true);
    setFormErrors({});

    try {
      await api.post("/admin/users", userForm);
      setIsUserModalOpen(false);
      setUserForm({ name: "", email: "", address: "", password: "", role: "USER" });
      fetchStats();
      if (activeTab === "users") fetchUsers();
    } catch (error: any) {
      console.error(error);
      setFormErrors({ general: error.response?.data?.message || "Failed to create user" });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Store Form Submit
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStoreForm()) return;

    setFormLoading(true);
    setFormErrors({});

    try {
      await api.post("/admin/stores", storeForm);
      setIsStoreModalOpen(false);
      setStoreForm({ storeName: "", storeEmail: "", storeAddress: "", ownerName: "", ownerEmail: "", ownerPassword: "" });
      fetchStats();
      if (activeTab === "stores") fetchStores();
    } catch (error: any) {
      console.error(error);
      setFormErrors({ general: error.response?.data?.message || "Failed to create store" });
    } finally {
      setFormLoading(false);
    }
  };

  // Table Columns
  const userColumns: TableColumn[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (u) => {
        if (u.role === "ADMIN") return <span className="badge badge-admin">Admin</span>;
        if (u.role === "STORE_OWNER") return <span className="badge badge-owner">Store Owner</span>;
        return <span className="badge badge-user">User</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => handleViewUserDetail(u.id)}>
          <Eye size={12} />
          <span>View Details</span>
        </button>
      ),
    },
  ];

  const storeColumns: TableColumn[] = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "averageRating",
      label: "Average Rating",
      sortable: true,
      render: (s) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RatingStars rating={s.averageRating} size={16} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>({s.averageRating})</span>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content fade-in">
        
        {/* Statistics section */}
        <div className="dashboard-grid">
          <div className="glass-panel stats-card">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Total Users</span>
              <Users size={20} color="var(--accent-primary)" />
            </div>
            <span className="stats-value">{stats.totalUsers}</span>
          </div>

          <div className="glass-panel stats-card">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Registered Stores</span>
              <StoreIcon size={20} color="var(--accent-secondary)" />
            </div>
            <span className="stats-value">{stats.totalStores}</span>
          </div>

          <div className="glass-panel stats-card">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Submitted Ratings</span>
              <Star size={20} color="var(--status-warning)" />
            </div>
            <span className="stats-value">{stats.totalRatings}</span>
          </div>
        </div>

        {/* Action Controls Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          {/* Tab selectors */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "0.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
            <button 
              className="btn" 
              style={{ 
                padding: "0.5rem 1.25rem", 
                borderRadius: "var(--radius-sm)", 
                background: activeTab === "stores" ? "var(--accent-gradient)" : "transparent",
                color: activeTab === "stores" ? "#ffffff" : "var(--text-secondary)"
              }}
              onClick={() => setActiveTab("stores")}
            >
              <StoreIcon size={16} />
              <span>Stores</span>
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: "0.5rem 1.25rem", 
                borderRadius: "var(--radius-sm)", 
                background: activeTab === "users" ? "var(--accent-gradient)" : "transparent",
                color: activeTab === "users" ? "#ffffff" : "var(--text-secondary)"
              }}
              onClick={() => setActiveTab("users")}
            >
              <Users size={16} />
              <span>Users</span>
            </button>
          </div>

          {/* Creation buttons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsStoreModalOpen(true)}>
              <StoreIcon size={16} />
              <span>Add Store</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsUserModalOpen(true)}>
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Filtering Options Panel */}
        <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Search size={16} color="var(--accent-primary)" />
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter Listings</h4>
          </div>

          {activeTab === "users" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <input
                type="text"
                placeholder="Filter by Name"
                className="form-input"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Email"
                className="form-input"
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter by Address"
                className="form-input"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
              />
              <select
                className="form-input"
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                style={{ background: "#1a1a2b" }}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <input
                type="text"
                placeholder="Filter Store Name"
                className="form-input"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter Store Email"
                className="form-input"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Filter Store Address"
                className="form-input"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Data Table */}
        {activeTab === "users" ? (
          <SortableTable
            columns={userColumns}
            data={users}
            sortBy={userSort.key}
            sortOrder={userSort.order}
            onSort={handleUserSort}
            emptyMessage="No users found matching your filters."
          />
        ) : (
          <SortableTable
            columns={storeColumns}
            data={stores}
            sortBy={storeSort.key}
            sortOrder={storeSort.order}
            onSort={handleStoreSort}
            emptyMessage="No stores found matching your filters."
          />
        )}
      </div>

      {/* MODAL: Add User (Admin / Normal User) */}
      {isUserModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "500px", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Add New User Account</h3>
              <button onClick={() => setIsUserModalOpen(false)} style={{ background: "transparent", color: "var(--text-secondary)", cursor: "pointer", border: "none" }}>
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--status-danger)", color: "#ff8a8a", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <AlertCircle size={16} />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name (Min 20 characters)</label>
                <input type="text" className="form-input" placeholder="e.g. Richard Anthony Peterson" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="name@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address (Max 400 characters)</label>
                <textarea className="form-input" placeholder="Address..." rows={2} value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} />
                {formErrors.address && <span className="form-error">{formErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special)</label>
                <input type="password" className="form-input" placeholder="Password123!" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                {formErrors.password && <span className="form-error">{formErrors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select className="form-input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={{ background: "#1a1a2b" }}>
                  <option value="USER">User (Normal)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Store & Owner */}
      {isStoreModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "600px", padding: "1.75rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Add Store & Owner Profile</h3>
              <button onClick={() => setIsStoreModalOpen(false)} style={{ background: "transparent", color: "var(--text-secondary)", cursor: "pointer", border: "none" }}>
                <X size={20} />
              </button>
            </div>

            {formErrors.general && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--status-danger)", color: "#ff8a8a", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <AlertCircle size={16} />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleStoreSubmit}>
              <h4 style={{ color: "var(--accent-primary)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.25rem", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Store Details</h4>
              
              <div className="form-group">
                <label className="form-label">Store Name (Min 20 characters)</label>
                <input type="text" className="form-input" placeholder="e.g. Mega Plaza Supermarket Center" value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} />
                {formErrors.storeName && <span className="form-error">{formErrors.storeName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Email Address</label>
                <input type="email" className="form-input" placeholder="contact@megaplaza.com" value={storeForm.storeEmail} onChange={(e) => setStoreForm({ ...storeForm, storeEmail: e.target.value })} />
                {formErrors.storeEmail && <span className="form-error">{formErrors.storeEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Location Address (Max 400 characters)</label>
                <textarea className="form-input" placeholder="Store Address..." rows={2} value={storeForm.storeAddress} onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })} />
                {formErrors.storeAddress && <span className="form-error">{formErrors.storeAddress}</span>}
              </div>

              <h4 style={{ color: "var(--accent-secondary)", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.25rem", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase", marginTop: "1.25rem" }}>Owner Account Details</h4>

              <div className="form-group">
                <label className="form-label">Owner Full Name (Min 20 characters)</label>
                <input type="text" className="form-input" placeholder="e.g. Marcus Aurelius Peterson" value={storeForm.ownerName} onChange={(e) => setStoreForm({ ...storeForm, ownerName: e.target.value })} />
                {formErrors.ownerName && <span className="form-error">{formErrors.ownerName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Owner Login Email</label>
                <input type="email" className="form-input" placeholder="owner@megaplaza.com" value={storeForm.ownerEmail} onChange={(e) => setStoreForm({ ...storeForm, ownerEmail: e.target.value })} />
                {formErrors.ownerEmail && <span className="form-error">{formErrors.ownerEmail}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Owner Password (8-16 chars, 1 uppercase, 1 special)</label>
                <input type="password" className="form-input" placeholder="SecureOwnerPass1!" value={storeForm.ownerPassword} onChange={(e) => setStoreForm({ ...storeForm, ownerPassword: e.target.value })} />
                {formErrors.ownerPassword && <span className="form-error">{formErrors.ownerPassword}</span>}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsStoreModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View User Detail */}
      {selectedUserDetail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "500px", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Profile Details</h3>
              <button onClick={() => setSelectedUserDetail(null)} style={{ background: "transparent", color: "var(--text-secondary)", cursor: "pointer", border: "none" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <span className="form-label">Name</span>
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{selectedUserDetail.name}</p>
              </div>

              <div>
                <span className="form-label">Email</span>
                <p>{selectedUserDetail.email}</p>
              </div>

              <div>
                <span className="form-label">Address</span>
                <p style={{ color: "var(--text-secondary)" }}>{selectedUserDetail.address}</p>
              </div>

              <div>
                <span className="form-label">Role</span>
                <div style={{ marginTop: "0.25rem" }}>
                  {selectedUserDetail.role === "ADMIN" && <span className="badge badge-admin">Admin</span>}
                  {selectedUserDetail.role === "STORE_OWNER" && <span className="badge badge-owner">Store Owner</span>}
                  {selectedUserDetail.role === "USER" && <span className="badge badge-user">Normal User</span>}
                </div>
              </div>

              {selectedUserDetail.role === "STORE_OWNER" && selectedUserDetail.store && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-glass)" }}>
                  <span className="form-label" style={{ color: "var(--accent-primary)" }}>Linked Store Information</span>
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontWeight: 600 }}>{selectedUserDetail.store.name}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{selectedUserDetail.store.email}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{selectedUserDetail.store.address}</p>
                    
                    <span className="form-label">Store Rating Summary</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <RatingStars rating={selectedUserDetail.store.averageRating || 0} size={18} />
                      <span style={{ fontWeight: 700 }}>
                        {selectedUserDetail.store.averageRating || 0} / 5
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        ({selectedUserDetail.store.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1.5rem" }} onClick={() => setSelectedUserDetail(null)}>
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
