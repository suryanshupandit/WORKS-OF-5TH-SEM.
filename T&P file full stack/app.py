from flask import Flask, jsonify, request, send_from_directory
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'database.sqlite3'

app = Flask(__name__, static_folder=None)


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            '''
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                fullname TEXT NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                gender TEXT,
                dob TEXT,
                course TEXT,
                address TEXT
            )
            '''
        )
        connection.commit()


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


@app.route('/', methods=['GET'])
def home_redirect():
    return send_from_directory(BASE_DIR, 'l.html')


@app.route('/<path:filename>', methods=['GET'])
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return ('', 204)

    data = request.get_json(silent=True) or {}
    fullname = (data.get('fullname') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not fullname or not email or not password:
        return jsonify(ok=False, message='Full name, email, and password are required.'), 400

    with get_connection() as connection:
        connection.execute(
            '''
            INSERT INTO users (fullname, email, password, phone, gender, dob, course, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                fullname = excluded.fullname,
                password = excluded.password,
                phone = excluded.phone,
                gender = excluded.gender,
                dob = excluded.dob,
                course = excluded.course,
                address = excluded.address
            ''',
            (
                fullname,
                email,
                password,
                (data.get('phone') or '').strip(),
                (data.get('gender') or '').strip(),
                (data.get('dob') or '').strip(),
                (data.get('course') or '').strip(),
                (data.get('address') or '').strip(),
            ),
        )
        connection.commit()

    return jsonify(ok=True, message='Registration saved to database successfully.')


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return ('', 204)

    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify(ok=False, message='Email and password are required.'), 400

    with get_connection() as connection:
        user = connection.execute(
            'SELECT fullname, email, phone, gender, dob, course, address, password FROM users WHERE email = ?',
            (email,),
        ).fetchone()

    if user is None:
        return jsonify(ok=False, message='No account found for that email.'), 401

    if user['password'] != password:
        return jsonify(ok=False, message='Incorrect password.'), 401

    safe_user = {key: user[key] for key in user.keys() if key != 'password'}
    return jsonify(ok=True, message='Login successful.', user=safe_user)


if __name__ == '__main__':
    initialize_database()
    app.run(host='127.0.0.1', port=5000, debug=False)