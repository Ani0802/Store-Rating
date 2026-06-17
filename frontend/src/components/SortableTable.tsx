import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface SortableTableProps {
  columns: TableColumn[];
  data: any[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (key: string) => void;
  emptyMessage?: string;
}

export const SortableTable: React.FC<SortableTableProps> = ({
  columns,
  data,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = "No records found.",
}) => {
  return (
    <div className="table-container fade-in">
      <table className="premium-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span style={{ display: "inline-flex", color: isSorted ? "var(--accent-primary)" : "var(--text-muted)" }}>
                        {isSorted ? (
                          sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
