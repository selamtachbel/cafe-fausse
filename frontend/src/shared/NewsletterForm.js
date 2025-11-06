// frontend/src/shared/NewsletterForm.js
import React, { useState } from "react";
import { api } from "../shared/api";

export default function NewsletterForm() {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg]     = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await api("/newsletter", {
        method: "POST",
        body: JSON.stringify({ name, email, phone }),
      });
      setMsg({ type: "ok", text: "Subscribed. See you soon! 😊" });
      setName(""); setEmail(""); setPhone("");
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Could not subscribe. Try again." });
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <input className="input" placeholder="Your name"  value={name}  onChange={(e)=>setName(e.target.value)} />
      <input className="input" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input className="input" placeholder="Phone (optional)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
      <button className="btn btn-primary" type="submit">Subscribe</button>
      {msg && <div style={{ color: msg.type === "ok" ? "green" : "red" }}>{msg.text}</div>}
    </form>
  );
}