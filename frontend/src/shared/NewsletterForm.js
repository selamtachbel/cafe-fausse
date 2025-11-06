// frontend/src/shared/NewsletterForm.js
import React, { useState } from "react";
import api from "../shared/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg]     = useState("");

  async function subscribe(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api("/api/newsletter", {
        method: "POST",
        data: { email, name, phone },
      });
      setMsg("Subscribed! ✅");
    } catch (err) {
      console.error(err);
      setMsg("Failed to subscribe.");
    }
  }

  return (
    <form onSubmit={subscribe}>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="btn" type="submit">Subscribe</button>
      {msg && <div className="notice">{msg}</div>}
    </form>
  );
}