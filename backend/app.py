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
from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "x-admin-key"],
    methods=["GET", "POST", "OPTIONS"]
)

@app.after_request
def add_headers(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Admin-Key"
    r.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return r

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
    data = request.get_json()

    # support both "slot" (old) & "time_slot" (new)
    slot = data.get("time_slot") or data.get("slot")

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    guests = int(data.get("guests") or 1)
    table_no = int(data.get("table") or 1)

    if not slot or not name or not email:
        return jsonify({"error": "missing required fields"}), 400

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
            SELECT r.id, r.time_slot, r.guests, r.table_number,
                   c.name, c.email, c.phone
            FROM reservations r
            JOIN customers c ON c.id = r.customer_id
            ORDER BY r.id DESC
            LIMIT 200
        """)).mappings().all()

    return jsonify(list(rows)), 200
# ---------------- PUBLIC: join newsletter ----------------
@app.post("/api/newsletter")
def newsletter():
    data = request.json or {}
    name  = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()

    if not email:
        return jsonify({"error": "email is required"}), 400

    with engine.begin() as conn:
        # customers table: id (pk), name, email, phone, newsletter (bool)
        conn.execute(text("""
            INSERT INTO customers (name, email, phone, newsletter)
            VALUES (:name, :email, :phone, TRUE)
            ON CONFLICT (email) DO UPDATE
               SET name = EXCLUDED.name,
                   phone = EXCLUDED.phone,
                   newsletter = TRUE
        """), {"name": name, "email": email, "phone": phone})

    return jsonify({"ok": True}), 200


# ---------------- ADMIN: list customers ------------------
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

    return jsonify(list(rows)), 200

# HEALTH CHECKS ------------
@app.get("/")
def home():
    return jsonify({"status": "running"}), 200

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/ping")
def ping():
    return jsonify({"pong": True}), 200
if __name__ == "__main__":
    app.run(debug=True)