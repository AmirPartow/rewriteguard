from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db

app = FastAPI()

@app.get("/db/ping")
def db_ping(db: Session = Depends(get_db)):
    val = db.execute(text("SELECT 1")).scalar()
    return {"ok": True, "value": val}

@app.post("/db/write-test")
def write_test(db: Session = Depends(get_db)):
    # simple write to prove DB works (inserts a user)
    db.execute(text("INSERT INTO users (email, full_name) VALUES (:e, :n) ON CONFLICT (email) DO NOTHING"),
               {"e": "test1@demo.com", "n": "Test User"})
    db.commit()
    return {"ok": True}

@app.get("/db/read-test")
def read_test(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT id, email, full_name FROM users ORDER BY id DESC LIMIT 5")).mappings().all()
    return {"users": list(rows)}
