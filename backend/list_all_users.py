import sqlite3
import os

db_path = "rewriteguard_local.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT email, created_at FROM users ORDER BY created_at DESC;")
    rows = cur.fetchall()
    print(f"Total Users: {len(rows)}")
    for row in rows:
        print(f"{row[0]} (created: {row[1]})")
    conn.close()
else:
    print(f"Database {db_path} not found.")
