from flask import Flask, request, jsonify
from flaskext.mysql import MySQL
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure MySQL
app.config['MYSQL_DATABASE_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_DATABASE_USER'] = os.getenv('DB_USER')
app.config['MYSQL_DATABASE_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DATABASE_DB'] = 'rest_api_example'

mysql = MySQL(app)

@app.route('/')
def home():
    return "Welcome to the User Management API"

# Create a new user
@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        
        conn = mysql.get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            (name, email)
        )
        conn.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'id': cursor.lastrowid
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Get all users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        conn = mysql.get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name, email, created_at FROM users")
        users = cursor.fetchall()
        
        users_list = []
        for user in users:
            users_list.append({
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'created_at': user[3]
            })
            
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get a single user
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        conn = mysql.get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        
        if user:
            return jsonify({
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'created_at': user[3]
            }), 200
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update a user
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        
        conn = mysql.get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE users SET name = %s, email = %s WHERE id = %s",
            (name, email, user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Delete a user
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = mysql.get_db()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)