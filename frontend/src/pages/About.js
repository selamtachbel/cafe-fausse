export default function About(){
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>About Café Fausse</h2>
      <p>
        We’re a cozy neighborhood spot in Addis—serving specialty coffee, warm pastries,
        and calm moments. Our beans are roasted locally and our bakers arrive before dawn.
      </p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:12}}>
        <div className="card">
          <strong>Hours</strong>
          <div>Mon–Fri: 7:30–21:00</div>
          <div>Sat–Sun: 8:00–22:00</div>
        </div>
        <div className="card">
          <strong>Contact</strong>
          <div>Phone: 09-11-000-000</div>
          <div>Email: hello@cafefausse.et</div>
        </div>
      </div>
    </div>
  );
}