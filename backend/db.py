import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./rewriteguard_local.db"

IS_SQLITE = DATABASE_URL.startswith("sqlite")

# For SQLite, we might need connect_args to allow multiple threads
engine_kwargs = {"pool_pre_ping": True}
if IS_SQLITE:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)


def now_func() -> str:
    """Return the correct SQL function for current timestamp based on database type."""
    return "CURRENT_TIMESTAMP" if IS_SQLITE else "NOW()"


def run_migrations():
    """Ensure necessary columns exist across different DB types (Postgres/SQLite)."""
    # Add columns if not exist
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN provider VARCHAR(20)"))
            conn.commit()
    except Exception:
        pass
    
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN provider_id VARCHAR(100)"))
            conn.commit()
    except Exception:
        pass


def setup_sqlite_tables():
    """Create initial tables if using local SQLite database."""
    if not IS_SQLITE:
        return

    with engine.connect() as conn:
        conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT,
                password_hash TEXT NOT NULL DEFAULT '',
                is_active BOOLEAN NOT NULL DEFAULT 1,
                email_verified BOOLEAN NOT NULL DEFAULT 0,
                last_login TIMESTAMP,
                plan_type TEXT NOT NULL DEFAULT 'free',
                daily_word_limit INTEGER NOT NULL DEFAULT 1000,
                provider TEXT,
                provider_id TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        )
        conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT
            )
        """)
        )
        conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS daily_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
                words_detect INTEGER NOT NULL DEFAULT 0,
                words_paraphrase INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, usage_date)
            )
        """)
        )
        conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                input_text TEXT NOT NULL,
                output_text TEXT,
                status TEXT NOT NULL DEFAULT 'queued',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
        )
        conn.commit()


# Run migrations and setup
run_migrations()
setup_sqlite_tables()

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
