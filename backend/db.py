import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os.path as p

load_dotenv()

# Example: postgresql+psycopg2://postgres:postgres@localhost:5432/cafe_fausse
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/cafe_fausse")

# Pre-ping so dropped connections are auto-retried
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def init_db():
    """Create tables if they don't exist by executing schema.sql."""
    schema_path = p.join(p.dirname(__file__), "schema.sql")
    if not p.exists(schema_path):
        return

    with engine.begin() as conn:
        with open(schema_path, "r", encoding="utf-8") as f:
            conn.execute(text(f.read()))
