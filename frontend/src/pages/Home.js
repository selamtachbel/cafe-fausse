import { Link } from "react-router-dom";
import NewsletterForm from "../components/NewsletterForm";


export default function Home(){
  return (
    <>
    
      <section className="hero card">
        <div>
          <h1>Warm cups. Calm moments.</h1>
          <p>Addis’s coziest corner for espresso, croissants, and good talks.</p>
          <div className="buttons">
            <Link className="btn btn-primary" to="/menu">View Menu</Link>
            <Link className="btn btn-secondary" to="/reservations">Book a Table</Link>
          </div>
        </div>
      </section>

      <section style={{marginTop:24}} className="card">
        <h2 style={{marginTop:0}}>Join our newsletter</h2>
        <p>Get weekly specials and latte art events.</p>
        <NewsletterForm/>
      </section>
    </>
  );
}