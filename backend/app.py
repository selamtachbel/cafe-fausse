# backend/app.py
import os
from flask_cors import CORS
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy import create_engine
from dotenv import load_dotenv

# ---- load environment (.env must contain DATABASE_URL and ADMIN_KEY) ----
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")
ADMIN_KEY = os.getenv("ADMIN_KEY", "12345")  # fallback for local dev

# ---- DB engine ----
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ---- app ----
app = Flask(__name__)
CORS(app)

# ---- initialize schema once on boot from schema.sql ----
def init_db(): 
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as f:
        ddl = f.read()
    with engine.begin() as conn:
        conn.execute(text(ddl))

init_db() #init_db()

# --------------------------- helpers ---------------------------

def to_timeslot_or_400(time_slot_str: str):
    """
    Expect 'YYYY-MM-DD HH:MM:SS'. Ensures seconds present.
    Returns datetime instance. Raises ValueError if bad.
    """
    # Add ':00' seconds if user forgot
    if len(time_slot_str) == 16:  # 'YYYY-MM-DD HH:MM'
        time_slot_str = f"{time_slot_str}:00"
    return datetime.strptime(time_slot_str, "%Y-%m-%d %H:%M:%S")

def require_admin(req) -> bool:
    sent = req.headers.get("x-admin-key", "")
    return bool(ADMIN_KEY) and (sent == ADMIN_KEY)

# ---------------------------- routes ----------------------------

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.post("/api/reserve")
def reserve():
    """
    Body JSON:
    {
      "name": "...", "email": "...", "phone": "...",
      "time_slot": "YYYY-MM-DD HH:MM[:SS]", "guests": 1
    }
    """
    data = request.get_json(force=True, silent=True) or {}

    # 1) Validate
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    time_slot_str = (data.get("time_slot") or "").strip()
    guests = int(data.get("guests") or 1)

    if not (name and email and time_slot_str):
        return jsonify({"error": "name, email and time_slot are required"}), 400

    try:
        ts = to_timeslot_or_400(time_slot_str)
    except Exception:
        return jsonify({"error": "time_slot must be 'YYYY-MM-DD HH:MM[:SS]'" }), 400

    # 2) Upsert/ensure customer, get id
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO customers(name, email, phone)
                VALUES (:n, :e, :p)
                ON CONFLICT(email) DO UPDATE
                  SET name = EXCLUDED.name,
                      phone = EXCLUDED.phone
                RETURNING id
            """),
            {"n": name, "e": email, "p": phone}
        ).fetchone()
        cid = row.id

        # 3) check capacity for the exact time_slot
        existing = conn.execute(
            text("SELECT COUNT(*) FROM reservations WHERE time_slot = :ts"),
            {"ts": ts}
        ).scalar()

        CAP = 30  # seats/tables per slot
        if existing >= CAP:
            return jsonify({"error": "no tables available at that time"}), 400

        # 4) assign table 1..30 round-robin
        table_no = (existing % CAP) + 1

        # 5) insert reservation
        res_row = conn.execute(
            text("""
                INSERT INTO reservations(customer_id, time_slot, guests, table_number)
                VALUES (:cid, :ts, :g, :tn)
                RETURNING id
            """),
            {"cid": cid, "ts": ts, "g": guests, "tn": table_no}
        ).fetchone()

    return jsonify({
        "message": "reservation confirmed",
        "reservation_id": res_row.id,
        "table": table_no
    }), 200

# ---------------------------- Admin API ----------------------------

@app.get("/api/admin/reservations")
def admin_reservations():
    if not require_admin(request):
        return jsonify({"error": "unauthorized"}), 401

    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT
              r.id,
              r.time_slot,
              r.guests,
              r.table_number,
              c.name,
              c.email,
              c.phone
            FROM reservations r
            JOIN customers c ON c.id = r.customer_id
            ORDER BY r.time_slot DESC
            LIMIT 200
        """)).mappings().all()

    # Convert RowMapping -> dict for JSON
    rows = [dict(row) for row in rows]
    return jsonify(rows), 200


@app.get("/api/admin/customers")
def admin_customers():
    if not require_admin(request):
        return jsonify({"error": "unauthorized"}), 401

    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT id, name, email, phone, newsletter
            FROM customers
            ORDER BY id DESC
            LIMIT 200
        """)).mappings().all()

    rows = [dict(row) for row in rows]
    return jsonify(rows), 200

# ------------------------- Newsletter API -------------------------

@app.post("/api/newsletter")
def newsletter():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "email is required"}), 400

    with engine.begin() as conn:
        conn.execute(
            text("""
                INSERT INTO customers(name, email, phone, newsletter)
                VALUES (:n, :e, '', TRUE)
                ON CONFLICT(email) DO UPDATE
                  SET newsletter = TRUE
            """),
            {"n": email.split("@")[0], "e": email}
        )

    return jsonify({"message": "subscribed"}), 200

CORS(app, resources={r"/api/*": {"origins": "*"}})
if __name__ == "__main__":
    from flask_cors import CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.run()