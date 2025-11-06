import os, logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy import create_engine

logging.basicConfig(level=logging.INFO)

# env
DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()
ADMIN_KEY = (os.getenv("ADMIN_KEY") or "12345").strip()

# db
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# app
app = Flask(__name__)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def add_headers(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, x-admin-key"
    r.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return r
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "x-admin-key"],
    methods=["GET", "POST", "OPTIONS"],
)

@app.after_request
def add_cors(r):
    r.headers["Access-Control-Allow-Origin"] = "*"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Admin-Key"
    r.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return r

# --- helpers -------------------------------------------------
def require_admin(req):
    key = (req.args.get("key") or "").strip()
    hdr = (req.headers.get("x-admin-key") or "").strip()
    expected = ADMIN_KEY
    if expected and (key == expected or hdr == expected):
        return True
    app.logger.info("Admin check failed")
    return False

# --- public: reserve ----------------------------------------
@app.post("/api/reserve")
def reserve():
    data = request.get_json() or {}
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
        """), {"slot": slot, "name": name, "email": email, "phone": phone, "guests": guests, "table": table_no})
        row = result.fetchone()

    return jsonify({"message": "Reservation confirmed", "reservation_id": row.id}), 200

# --- public: newsletter -------------------------------------
@app.post("/api/newsletter")
def newsletter():
    try:
        # accept JSON body safely
        data = request.get_json(force=True, silent=True) or {}

        name  = (data.get("name")  or "").strip()
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()

        if not email:
            return jsonify({"error": "email is required"}), 400

        # upsert into customers
        with engine.begin() as conn:
            conn.execute(text("""
                INSERT INTO customers (name, email, phone, newsletter)
                VALUES (:name, :email, :phone, TRUE)
                ON CONFLICT (email) DO UPDATE
                    SET name = EXCLUDED.name,
                        phone = EXCLUDED.phone,
                        newsletter = TRUE
            """), {"name": name, "email": email, "phone": phone})

        return jsonify({"ok": True}), 200

    except Exception as e:
        # log full traceback to Render logs and also return the message
        app.logger.exception("newsletter failed")
        return jsonify({"error": str(e)}), 500

# --- admin ---------------------------------------------------
@app.get("/api/admin/reservations")
def admin_reservations():
    if not require_admin(request):
        return jsonify({"error": "unauthorized"}), 401
    with engine.begin() as conn:
        rows = conn.execute(text("""
            SELECT r.id, r.time_slot, r.guests, r.table_number, c.name, c.email, c.phone
            FROM reservations r
            JOIN customers c ON c.id = r.customer_id
            ORDER BY r.id DESC
            LIMIT 200
        """)).mappings().all()
    return jsonify(list(rows)), 200

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

# --- health/version -----------------------------------------
@app.get("/")
def home():
    return jsonify({"status": "running"}), 200

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/api/ping")
def ping():
    return jsonify({"pong": True}), 200

@app.get("/api/version")
def version():
    return jsonify({"v": "cafefausse-2025-11-06-2"}), 200

# --- startup log --------------------------------------------
def log_routes():
    rules = sorted([str(r.rule) for r in app.url_map.iter_rules()])
    app.logger.info("ROUTES: %s", rules)

log_routes()
# --- ONE TIME DB FIX ---
with engine.begin() as conn:
    conn.execute(text("""
        ALTER TABLE customers
        ADD CONSTRAINT unique_email UNIQUE (email);
    """))

if __name__ == "__main__":
    app.run(debug=True)