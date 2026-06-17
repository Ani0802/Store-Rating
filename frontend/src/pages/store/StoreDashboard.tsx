import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import SortableTable from "../../components/SortableTable";
import type { TableColumn } from "../../components/SortableTable";
import RatingStars from "../../components/RatingStars";
import { Award, Users, MapPin, RefreshCw } from "lucide-react";

export const StoreDashboard: React.FC = () => {
  const [store, setStore] = useState<any | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "createdAt", order: "desc" });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/store/dashboard", {
        params: {
          sortBy: sort.key,
          sortOrder: sort.order,
        },
      });
      setStore(response.data.store);
      setRatings(response.data.ratings);
    } catch (error) {
      console.error("Error fetching store dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [sort]);

  const handleSort = (key: string) => {
    setSort((prev) => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Table columns
  const columns: TableColumn[] = [
    { key: "name", label: "User Name", sortable: true },
    { key: "email", label: "Email Address", sortable: true },
    { key: "address", label: "User Address", sortable: true },
    {
      key: "score",
      label: "Rating Given",
      sortable: true,
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RatingStars rating={r.score} size={16} />
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--status-warning)" }}>
            {r.score} / 5
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date Rated",
      sortable: true,
      render: (r) => {
        const date = new Date(r.createdAt);
        return <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{date.toLocaleDateString()}</span>;
      },
    },
  ];

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content fade-in">
        
        {loading && !store ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <span style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>Loading Store Metrics...</span>
          </div>
        ) : store ? (
          <>
            {/* Header Showcase Banner */}
            <div className="glass-panel" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ background: "var(--accent-gradient)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                  <Award size={32} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>{store.name}</h2>
                  <p style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    <MapPin size={14} />
                    <span>{store.address}</span>
                  </p>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={fetchDashboardData}>
                <RefreshCw size={14} />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* Dashboard Statistics Widgets */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              <div className="glass-panel stats-card">
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Overall Rating Score</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", width: "100%", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span className="stats-value">{store.averageRating} <span style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--text-secondary)" }}>/ 5</span></span>
                  <RatingStars rating={store.averageRating} size={24} />
                </div>
              </div>

              <div className="glass-panel stats-card">
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Total User Reviews</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", width: "100%", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span className="stats-value">{store.ratingCount}</span>
                  <Users size={24} color="var(--accent-secondary)" />
                </div>
              </div>
            </div>

            {/* Submitter Ratings Table */}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Review Submitter Details</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>A history of all registered users who rated your store</p>
              </div>

              <SortableTable
                columns={columns}
                data={ratings}
                sortBy={sort.key}
                sortOrder={sort.order}
                onSort={handleSort}
                emptyMessage="No reviews have been submitted for your store yet."
              />
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
            <span style={{ color: "var(--status-danger)", fontSize: "1.2rem" }}>Store profile not found. Please contact the administrator.</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default StoreDashboard;
