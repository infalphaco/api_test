// Base API URL - adjust if your backend is running on a different port/URL
const API_URL = 'http://localhost:5000/users';

// DOM Elements
const addUserForm = document.getElementById('addUserForm');
const usersTableBody = document.getElementById('usersTableBody');
const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
const editUserForm = document.getElementById('editUserForm');
const saveEditUserBtn = document.getElementById('saveEditUser');

// Load users when page loads
document.addEventListener('DOMContentLoaded', loadUsers);

// Add new user
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add user');
        }
        
        // Clear form and reload users
        addUserForm.reset();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding user: ' + error.message);
    }
});

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading users: ' + error.message);
    }
}

// Render users in the table
function renderUsers(users) {
    usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">Delete</button>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// Open edit modal with user data
async function openEditModal(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const user = await response.json();
        
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
        
        editUserModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading user data: ' + error.message);
    }
}

// Save edited user
saveEditUserBtn.addEventListener('click', async () => {
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user');
        }
        
        editUserModal.hide();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating user: ' + error.message);
    }
});

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting user: ' + error.message);
    }
}