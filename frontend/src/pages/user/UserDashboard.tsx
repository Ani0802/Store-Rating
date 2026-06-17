import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import SortableTable from "../../components/SortableTable";
import type { TableColumn } from "../../components/SortableTable";
import RatingStars from "../../components/RatingStars";
import { Search, Star, X, AlertCircle } from "lucide-react";

export const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "name", order: "asc" });
  
  // Rating Modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [userScore, setUserScore] = useState<number>(5);
  const [ratingError, setRatingError] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  // Fetch stores
  const fetchStores = async () => {
    try {
      const { name, address } = filters;
      const response = await api.get("/user/stores", {
        params: {
          name: name || undefined,
          address: address || undefined,
          sortBy: sort.key,
          sortOrder: sort.order,
        },
      });
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters, sort]);

  const handleSort = (key: string) => {
    setSort((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Open modal to rate store (New or Modify)
  const handleOpenRatingModal = (store: any) => {
    setSelectedStore(store);
    setUserScore(store.userRating || 5);
    setRatingError("");
    setIsRatingModalOpen(true);
  };

  // Submit or update rating
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    setRatingLoading(true);
    setRatingError("");

    try {
      if (selectedStore.userRatingId) {
        // Update existing rating
        await api.put(`/user/ratings/${selectedStore.userRatingId}`, { score: userScore });
      } else {
        // Submit new rating
        await api.post("/user/ratings", { score: userScore, storeId: selectedStore.id });
      }
      setIsRatingModalOpen(false);
      setSelectedStore(null);
      fetchStores();
    } catch (error: any) {
      console.error(error);
      setRatingError(error.response?.data?.message || "Failed to submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  // Table Columns for user store list
  const columns: TableColumn[] = [
    { key: "name", label: "Store Name", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "averageRating",
      label: "Overall Rating",
      sortable: true,
      render: (s) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RatingStars rating={s.averageRating} size={16} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {s.averageRating > 0 ? `${s.averageRating} / 5` : "No Ratings"}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            ({s.ratingCount} reviews)
          </span>
        </div>
      ),
    },
    {
      key: "userRating",
      label: "My Rating",
      render: (s) => (
        s.userRating ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RatingStars rating={s.userRating} size={16} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-primary)" }}>
              ({s.userRating})
            </span>
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Not Rated yet</span>
        )
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <button 
          className="btn btn-primary" 
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
          onClick={() => handleOpenRatingModal(s)}
        >
          <Star size={12} style={{ fill: s.userRating ? "#ffffff" : "transparent" }} />
          <span>{s.userRating ? "Edit Rating" : "Submit Rating"}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content fade-in">
        
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>Registered Stores</h2>
          <p style={{ color: "var(--text-secondary)" }}>Browse store listings and submit your ratings (1 to 5 stars)</p>
        </div>

        {/* Filter/Search Panel */}
        <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Search size={16} color="var(--accent-primary)" />
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search Stores</h4>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Search by Store Name..."
              className="form-input"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Search by Location/Address..."
              className="form-input"
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            />
          </div>
        </div>

        {/* Stores Table */}
        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sort.key}
          sortOrder={sort.order}
          onSort={handleSort}
          emptyMessage="No registered stores match your search query."
        />
      </div>

      {/* MODAL: Submit / Edit Rating */}
      {isRatingModalOpen && selectedStore && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-panel fade-in" style={{ width: "100%", maxWidth: "450px", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {selectedStore.userRating ? "Edit Store Review" : "Submit Store Review"}
              </h3>
              <button onClick={() => setIsRatingModalOpen(false)} style={{ background: "transparent", color: "var(--text-secondary)", cursor: "pointer", border: "none" }}>
                <X size={20} />
              </button>
            </div>

            {ratingError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--status-danger)", color: "#ff8a8a", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <AlertCircle size={16} />
                <span>{ratingError}</span>
              </div>
            )}

            <form onSubmit={handleRatingSubmit} style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>{selectedStore.name}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{selectedStore.address}</p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Tap a star to rate</p>
                <RatingStars 
                  rating={userScore} 
                  interactive={true} 
                  onChange={(score) => setUserScore(score)} 
                  size={36} 
                />
                <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 700, color: "var(--status-warning)" }}>
                  {userScore} / 5
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsRatingModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={ratingLoading}>
                  {ratingLoading ? "Saving..." : "Save Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
