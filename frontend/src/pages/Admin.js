// frontend/src/pages/Admin.js
import React, { useEffect, useState } from "react";
import { api } from "../shared/api";

// simple table
function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e8f4ec" }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 12, opacity: 0.7 }}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{ padding: 12, borderBottom: "1px solid #f2eae5" }}
                  >
                    {c.render ? c.render(r[c.key]) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  const [key, setKey] = useState(localStorage.getItem("ADMIN_KEY") || "");
  const [view, setView] = useState("reservations");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  // columns
  const resCols = [
    { key: "time_slot", label: "Time" },
    { key: "guests", label: "Guests" },
    { key: "table_number", label: "Table" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" }
  ];

  const custCols = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "newsletter", label: "Newsletter", render: (v) => (v ? "✅" : "❌") }
  ];

  async function load() {
    if (!key) return;
    setLoading(true);
    setErr("");

    try {
      // inside load()
      const path = view === "reservations" ? "/admin/reservations" : "/admin/customers";
      const data = await api(path, { headers: { "x-admin-key": key } });

      setRows(Array.isArray(data) ? data : []);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (e) {
      setErr(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // reload when tab changes (and we already have a key)
  useEffect(() => {
    if (key) load();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>

      {/* tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={() => setView("reservations")}
            style={{ background: view === "reservations" ? "#e8f4ec" : "#fff" }}
          >
            Reservations
          </button>
          <button
            className="btn"
            onClick={() => setView("customers")}
            style={{ background: view === "customers" ? "#e8f4ec" : "#fff" }}
          >
            Customers
          </button>
        </div>
      </div>

      {/* admin key */}
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          placeholder="Admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" type="submit" style={{ marginLeft: 8 }}>
          Connect
        </button>
      </form>
      {err && <div className="error" style={{ marginBottom: 12, color: "red" }}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table columns={view === "reservations" ? resCols : custCols} rows={rows} />
      )}
    </div>
  );
}