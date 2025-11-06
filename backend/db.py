from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os, os.path as p

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def init_db():
    schema_path = p.join(p.dirname(__file__), "schema.sql")
    if not p.exists(schema_path):
        return
    with engine.begin() as conn:
        with open(schema_path, "r", encoding="utf-8") as f:
            conn.execute(text(f.read()))