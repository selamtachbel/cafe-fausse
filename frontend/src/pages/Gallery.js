const imgs = [
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
  "https://images.unsplash.com/photo-1459755486867-b55449bb39ff",
  "https://images.unsplash.com/photo-1461988625982-7e46a099bf4f",
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
].map(u=>`${u}?auto=format&fit=crop&w=800&q=80`);

export default function Gallery(){
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Gallery</h2>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:14}}>
        {imgs.map((src,i)=>(
          <img key={i} src={src} alt="cafe" style={{width:"100%", height:220, objectFit:"cover", borderRadius:12}}/>
        ))}
      </div>
    </div>
  );
}
