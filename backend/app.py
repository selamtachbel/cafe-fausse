import os, logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO)

DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()
ADMIN_KEY = (os.getenv("ADMIN_KEY") or "12345").strip()

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def add_headers(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, x-admin-key"
    r.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return r

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

# ---- Newsletter route ----
@app.post("/api/newsletter")
def subscribe_newsletter():
    data = request.get_json()
    email = data.get("email", "")
    name = data.get("name", "")
    phone = data.get("phone", "")

    with engine.begin() as conn:
        conn.execute(text("INSERT INTO subscribers (email, name, phone) VALUES (:email, :name, :phone)"),
                      {"email": email, "name": name, "phone": phone})

    return jsonify({"message": "Subscribed!"})

# ---- Reservation route ----
@app.post("/api/reserve")
def reserve_table():
    data = request.get_json()

    with engine.begin() as conn:
        conn.execute(
            text("INSERT INTO reservations (name, email, phone, date, time, guests, table_number) "
                 "VALUES (:name, :email, :phone, :date, :time, :guests, :table)"),
            {
                "name": data["name"],
                "email": data["email"],
                "phone": data["phone"],
                "date": data["date"],
                "time": data["time"],
                "guests": data["guests"],
                "table": data.get("table", None)
            },
        )
    return jsonify({"message": "Reservation saved!"})

# --- Admin routes ---
@app.get("/api/admin/reservations")
def get_reservations():
    if request.headers.get("x-admin-key") != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 403
    
    rows = []
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM reservations ORDER BY id DESC"))
        rows = [dict(row) for row in res]
        
    return jsonify(rows)

@app.get("/api/admin/subscribers")
def get_subscribers():
    if request.headers.get("x-admin-key") != ADMIN_KEY:
        return jsonify({"error": "Unauthorized"}), 403
    
    rows = []
    with engine.connect() as conn:
        res = conn.execute(text("SELECT * FROM subscribers ORDER BY id DESC"))
        rows = [dict(row) for row in res]
        
    return jsonify(rows)


if __name__ == "__main__":
    app.run(debug=True)