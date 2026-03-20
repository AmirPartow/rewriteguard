import sqlite3
import os

db_path = "rewriteguard_local.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    # Check if table exists
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cur.fetchone():
        print("Table 'users' does not exist yet.")
    else:
        cur.execute("SELECT email FROM users LIMIT 100;")
        rows = cur.fetchall()
        if not rows:
            print("No users found in database.")
        else:
            for row in rows:
                print(row[0])
    conn.close()
else:
    print(f"Database {db_path} not found.")
