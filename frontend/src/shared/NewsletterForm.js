import { useState } from "react";

export default function NewsletterForm(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState(null);

  async function submit(e){
    e.preventDefault();
    setMsg(null);
    try{
      const res = await fetch("/api/newsletter", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name, email, phone })
      });
      if(!res.ok) throw new Error("Failed");
      setMsg({type:"ok", text:"Subscribed. See you soon! ☕️"});
      setName(""); setEmail(""); setPhone("");
    }catch(err){
      setMsg({type:"err", text:"Could not subscribe. Try again."});
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="input" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
      <div style={{display:"flex", gap:10}}>
        <button className="btn btn-primary" type="submit">Subscribe</button>
      </div>
      {msg && <div className={msg.type==="ok"?"success":"error"}>{msg.text}</div>}
    </form>
  );
}