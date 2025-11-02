import { useState } from "react";

// Convert date to ISO (YYYY-MM-DD)
function toIsoDate(input) {
  // Already ISO format from input type="date"
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  // Convert MM/DD/YYYY → YYYY-MM-DD
  const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m = input.match(mdy);
  if (m) {
    const mm = String(m[1]).padStart(2, "0");
    const dd = String(m[2]).padStart(2, "0");
    const yy = m[3];
    return `${yy}-${mm}-${dd}` ;
  }

  throw new Error("Invalid date");
}

// Convert time to 24h HH:MM
function to24h(timeStr) {
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr; // already 24h

  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error("Invalid time");

  let hh = parseInt(match[1], 10);
  const mm = match[2];
  const ap = match[3].toUpperCase();

  if (ap === "AM") hh = hh === 12 ? 0 : hh;
  else hh = hh === 12 ? 12 : hh + 12;

  return `${String(hh).padStart(2, "0")}:${mm}` ;
}

export default function Reservations() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 1,
  });

  const [msg, setMsg] = useState(null);

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);

    try {
      const dateIso = toIsoDate(form.date);
      const time24 = to24h(form.time);
      const time_slot = `${dateIso} ${time24}:00`;

      console.log("Time Slot:", time_slot);

      const res = await fetch("http://127.0.0.1:5000/api/reserve", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          time_slot,
          guests: Number(form.guests),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reservation failed");

      setMsg({ type: "ok", text: "Reservation confirmed!" });
      setForm({ name: "", email: "", phone: "", date: "", time: "", guests: 1 });

    } catch (err) {
      setMsg({ type: "err", text: err.message });
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "auto" }}>
      <h2>Reserve a table</h2>

      <form onSubmit={submit}>
        <input placeholder="Your Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />

        <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />

        <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />

        <select value={form.guests} onChange={(e) => set("guests", e.target.value)}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
        </select>

        <button type="submit">Book now</button>
      </form>

      {msg && (
        <p style={{ color: msg.type === "ok" ? "green" : "red" }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}