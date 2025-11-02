import { useEffect, useState } from "react";
const API = "http://127.0.0.1:5000";

function Table({ columns, rows }) {
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{textAlign:"left", padding:"10px", borderBottom:"1px solid #eadfda"}}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{padding:"12px", opacity:.7}}>No data</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c.key} style={{padding:"10px", borderBottom:"1px solid #f2eae5"}}>
                  {c.render ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
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

  async function load() {
    if (!key) return;
    setLoading(true); setErr("");
    try {
      const url =
  view === "reservations"
    ? `${API}/api/admin/reservations`
    : `${API}/api/admin/customers;`

const res = await fetch(url, {
  headers: { "x-admin-key": key }
});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (e) {
      setErr(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [view]);

  const resCols = [
    { key: "time_slot", label: "Time" },
    { key: "guests", label: "Guests" },
    { key: "table_number", label: "Table" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const custCols = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "newsletter", label: "Newsletter", render: v => (v ? "✅" : "—") },
  ];

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Admin Dashboard</h2>

      <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:12, marginBottom:12}}>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <button className="btn" onClick={() => setView("reservations")}
                  style={{background:view==="reservations"?"#e8f4ec":"#fff"}}>
            Reservations
          </button>
          <button className="btn" onClick={() => setView("customers")}
                  style={{background:view==="customers"?"#e8f4ec":"#fff"}}>
            Customers
          </button>
        </div>

        <form onSubmit={(e)=>{e.preventDefault(); load();}}>
          <input className="input" placeholder="Admin key" value={key} onChange={e=>setKey(e.target.value)} style={{width:220}} />
          <button className="btn btn-primary" type="submit" style={{marginLeft:8}}>Connect</button>
        </form>
      </div>

      {err && <div className="error" style={{marginBottom:12}}>{err}</div>}
      {loading ? <div>Loading…</div> : (
        <Table columns={view==="reservations" ? resCols : custCols} rows={rows} />
      )}
    </div>
  );
}