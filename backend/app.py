from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
import logging

# enable logging
logging.basicConfig(level=logging.INFO)

# Load .env (local dev only)
load_dotenv()

# Load from environment
DATABASE_URL = os.getenv("DATABASE_URL", "") .strip()
ADMIN_KEY = os.getenv("ADMIN_KEY", "12345").strip()

# DB engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Flask app
app = Flask(__name__)
CORS(app)

# Create DB tables from schema.sql
def init_db():
    try:
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        with open(schema_path, "r", encoding="utf-8") as f:
            ddl = f.read()

        with engine.begin() as conn:
            conn.execute(text(ddl))
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ DB init error: {e}")

init_db()

# --- admin helper ---
def require_admin(req):
    # accept key in query or in header
    key_query  = (req.args.get("key") or "").strip()
    key_header = (req.headers.get("x-admin-key") or "").strip()
    expected   = (ADMIN_KEY or "").strip()

    if key_query == expected or key_header == expected:
        return True

    # log helpful info without printing the real key
    app.logger.info(
        "Admin check failed: query=%r header=%r expected_len=%d",
        key_query, key_header, len(expected)
    )
    return False

# ----------------- PUBLIC ROUTES -----------------

@app.post("/api/reserve")
def reserve():
    data = request.json
    slot = data.get("slot")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    guests = data.get("guests")
    table_no = data.get("table")

    with engine.begin() as conn:
        result = conn.execute(text("""
            INSERT INTO reservations (time_slot, name, email, phone, guests, table_number)
            VALUES (:slot, :name, :email, :phone, :guests, :table)
            RETURNING id
        """), {
            "slot": slot,
            "name": name,
            "email": email,
            "phone": phone,
            "guests": guests,
            "table": table_no
        })

        res = result.fetchone()
        return jsonify({"message": "Reservation confirmed", "reservation_id": res.id}), 200

# ----------------- ADMIN ROUTE -----------------

@app.get("/api/admin/reservations")
def admin_reservations():
    if not require_admin(request):
        return jsonify({"error": "unauthorized"}), 401

    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT r.id, r.time_slot, r.guests, r.table_number, r.name, r.email, r.phone
            FROM reservations r
            ORDER BY r.id DESC
        """))

        data = [dict(row) for row in rows]
        return jsonify(data), 200

# ----------------- HEALTH CHECK -----------------

@app.get("/")
def home():
    return jsonify({"status": "running"}), 200

# Run local
if __name__ == "__main__":
    app.run(debug=True)