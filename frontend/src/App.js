// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Reservations from "./pages/Reservations";
import Admin from "./pages/Admin";

function Nav() {
  return (
    <nav style={{ padding: 12, display: "flex", gap: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Home</Link>
      <Link to="/menu">Menu</Link>
      <Link to="/gallery">Gallery</Link>
      <Link to="/about">About</Link>
      <Link to="/reservations">Reservations</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}