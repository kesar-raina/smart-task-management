from flask import Flask, render_template, request, jsonify, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Secret key is used for login sessions
app.secret_key = "taskbloom-secret-key"

DATABASE = "taskbloom.db"


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

def init_db():

    conn = get_db()

    # Users table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # Tasks table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


# ==================================================
# HOME PAGE
# ==================================================

@app.route("/")
def home():

    return render_template("index.html")


# ==================================================
# SIGNUP
# ==================================================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Please fill all required fields."
        }), 400

    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Passwords do not match."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    conn = get_db()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:

        conn.close()

        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 400

    # Never store the actual password
    hashed_password = generate_password_hash(password)

    conn.execute(
        """
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
        """,
        (name, email, hashed_password)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully."
    })


# ==================================================
# LOGIN
# ==================================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db()

    user = conn.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    conn.close()

    if not user:

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user["id"]
    session["user_name"] = user["name"]

    return jsonify({
        "success": True,
        "name": user["name"]
    })


# ==================================================
# LOGOUT
# ==================================================

@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True
    })


# ==================================================
# GET CURRENT USER
# ==================================================

@app.route("/current-user")
def current_user():

    if "user_id" not in session:

        return jsonify({
            "logged_in": False
        })

    return jsonify({
        "logged_in": True,
        "name": session["user_name"]
    })


# ==================================================
# GET TASKS
# ==================================================

@app.route("/tasks", methods=["GET"])
def get_tasks():

    if "user_id" not in session:

        return jsonify({
            "message": "Please login first."
        }), 401

    conn = get_db()

    tasks = conn.execute(
        """
        SELECT *
        FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (session["user_id"],)
    ).fetchall()

    conn.close()

    result = []

    for task in tasks:

        result.append({
            "id": task["id"],
            "title": task["title"],
            "description": task["description"],
            "priority": task["priority"],
            "dueDate": task["due_date"],
            "completed": bool(task["completed"])
        })

    return jsonify(result)


# ==================================================
# ADD TASK
# ==================================================

@app.route("/tasks", methods=["POST"])
def add_task():

    if "user_id" not in session:

        return jsonify({
            "message": "Please login first."
        }), 401

    data = request.get_json()

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    priority = data.get("priority", "medium")
    due_date = data.get("dueDate", "")

    if not title:

        return jsonify({
            "message": "Task title is required."
        }), 400

    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO tasks
        (user_id, title, description, priority, due_date)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            session["user_id"],
            title,
            description,
            priority,
            due_date
        )
    )

    conn.commit()

    task_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "id": task_id
    })


# ==================================================
# UPDATE TASK
# ==================================================

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):

    if "user_id" not in session:

        return jsonify({
            "message": "Please login first."
        }), 401

    data = request.get_json()

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    priority = data.get("priority", "medium")
    due_date = data.get("dueDate", "")
    completed = 1 if data.get("completed", False) else 0

    conn = get_db()

    cursor = conn.execute(
        """
        UPDATE tasks

        SET
            title = ?,
            description = ?,
            priority = ?,
            due_date = ?,
            completed = ?

        WHERE
            id = ?
            AND user_id = ?
        """,
        (
            title,
            description,
            priority,
            due_date,
            completed,
            task_id,
            session["user_id"]
        )
    )

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    if updated == 0:

        return jsonify({
            "message": "Task not found."
        }), 404

    return jsonify({
        "success": True
    })


# ==================================================
# DELETE TASK
# ==================================================

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):

    if "user_id" not in session:

        return jsonify({
            "message": "Please login first!"
        }), 401

    conn = get_db()

    cursor = conn.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        AND user_id = ?
        """,
        (
            task_id,
            session["user_id"]
        )
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    if deleted == 0:

        return jsonify({
            "message": "Task not found."
        }), 404

    return jsonify({
        "success": True
    })


# ==================================================
# RUN APPLICATION
# ==================================================

if __name__ == "__main__":

    init_db()

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )