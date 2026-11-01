import sqlite3

conn = sqlite3.connect('database/trendtide.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', c.fetchall())

print("\n--- Users Schema ---")
for row in c.execute("PRAGMA table_info(users)").fetchall():
    print(row)

print("\n--- Existing Users ---")
try:
    for u in c.execute("SELECT * FROM users").fetchall():
        print(u)
except Exception as e:
    print("Error querying users:", e)

