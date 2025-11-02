import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");

      setMsg({ type: "ok", text: "Thank you for subscribing!" });
      setEmail("");
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    }
  }

  return (
    
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: "8px", marginRight: "10px", width: "250px" }}
      />
      <button type="submit" style={{ padding: "8px 16px" }}>
        Subscribe
      </button>
      {msg && (
        <p style={{ color: msg.type === "ok" ? "green" : "red", marginTop: "8px" }}>
          {msg.text}
        </p>
      )}
    </form>
  );
}