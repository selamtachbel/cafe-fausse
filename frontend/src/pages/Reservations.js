// frontend/src/pages/Reservations.js
import React, { useState } from "react";
import { api } from "../shared/api";
import { toISODate, to24h } from "../shared/date";

export default function Reservations() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 1,
    table: 1, // send a default to satisfy DB NOT NULL
  });
  const [msg, setMsg] = useState(null);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);

    try {
      const dateISO = toISODate ? toISODate(form.date) : form.date; // keep your helper
      const time24 = to24h ? to24h(form.time) : form.time;
      const time_slot = `${dateISO} ${time24}:00`;

      await api("/reserve", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          time_slot,
          guests: Number(form.guests),
          table: Number(form.table || 1),
        }),
      });

      setMsg({ type: "ok", text: "Reservation confirmed!" });
      setForm({ name: "", email: "", phone: "", date: "", time: "", guests: 1, table: 1 });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not reserve" });
    }
  }

  return (
    <div className="container" style={{ padding: "40px" }}>
      <h2>Reserve a Table</h2>

      <form onSubmit={submit} style={{ maxWidth: "400px" }}>
        <label>Name</label>
        <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} required />

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required />

        <label>Phone</label>
        <input type="text" value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />

        <label>Date</label>
        <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} required />

        <label>Time</label>
        <input type="time" value={form.time} onChange={(e) => setField("time", e.target.value)} required />

        <label>Guests</label>
        <input type="number" min="1" value={form.guests} onChange={(e) => setField("guests", e.target.value)} required />

        <label>Table (optional)</label>
        <input type="number" min="1" value={form.table} onChange={(e) => setField("table", e.target.value)} />

        <button type="submit">Reserve</button>
      </form>

      {msg && <p style={{ color: msg.type === "ok" ? "green" : "red" }}>{msg.text}</p>}
    </div>
  );
}