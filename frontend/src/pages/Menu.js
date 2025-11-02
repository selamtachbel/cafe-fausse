const items = [
  { name: "Espresso", desc: "Rich & bold single shot", price: "80 ETB" },
  { name: "Cappuccino", desc: "Velvety milk foam", price: "120 ETB" },
  { name: "Latte", desc: "Smooth & creamy", price: "120 ETB" },
  { name: "Mocha", desc: "Chocolate + espresso", price: "140 ETB" },
  { name: "Croissant", desc: "Buttery layers", price: "90 ETB" },
  { name: "Tiramisu", desc: "Classic Italian", price: "160 ETB" },
];

export default function Menu() {
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Menu</h2>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
        gap:16
      }}>
        {items.map((i)=>(
          <div key={i.name} style={{padding:12, border:"1px solid #eadfda", borderRadius:12, background:"#fff"}}>
            <div style={{display:"flex", justifyContent:"space-between", fontWeight:600}}>
              <span>{i.name}</span><span>{i.price}</span>
            </div>
            <div style={{opacity:.75, marginTop:6}}>{i.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}