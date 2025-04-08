import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: '', // Initialize as an empty string
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    // Fetch users from the backend
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/users', {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleEdit = () => {
        setShowUserModal(false);
        setCurrentUser({ ...selectedUser }); // Ensure the selected user's id is set
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/users/${currentUser.id}`, currentUser, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            setShowEditModal(false);
            fetchUsers(); // Refetch users after editing
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/users/${selectedUser.id}`, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers(); // Refetch users after deleting
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token'); // Clear the token from localStorage
            window.location.href = '/'; // Redirect to the landing page
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const closeUserModal = () => setShowUserModal(false);
    const closeEditModal = () => setShowEditModal(false);
    const closeDeleteModal = () => setShowDeleteModal(false);

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <h1 className="admin-title">ADMIN DASHBOARD</h1>
                <div className="auth-buttons">
                    <button onClick={handleLogout} className="auth-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-container">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <Link to="/admin/users" className="sidebar-link active">
                            <i className="fas fa-users"></i>
                            <span>Users</span>
                        </Link>
                        <Link to="/admin/products" className="sidebar-link">
                            <i className="fas fa-shoe-prints"></i>
                            <span>Products</span>
                        </Link>
                        <Link to="/admin/categories" className="sidebar-link">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/orders" className="sidebar-link">
                            <i className="fas fa-shopping-cart"></i>
                            <span>Orders</span>
                        </Link>
                        <Link to="/admin/analytics" className="sidebar-link">
                            <i className="fas fa-chart-bar"></i>
                            <span>Analytics</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    <div className="page-header">
                        <h2>User Management</h2>
                        <div className="action-buttons">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr
                                            key={user.id}
                                            onClick={() => handleRowClick(user)}
                                            className="clickable-row"
                                        >
                                            <td>{user.id}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.email}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-results">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* User Modal */}
            {showUserModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>User Actions</h3>
                        <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                        <button onClick={handleEdit}>Edit</button>
                        <button onClick={() => setShowDeleteModal(true)}>Delete</button>
                        <button onClick={closeUserModal}>Close</button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit User</h3>
                        <form onSubmit={handleEditSubmit}>
                            <input
                                type="text"
                                name="firstName"
                                value={currentUser.firstName}
                                onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                                placeholder="First Name"
                                required
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={currentUser.lastName}
                                onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                                placeholder="Last Name"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={currentUser.email}
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                placeholder="Email"
                                required
                            />
                            <button type="submit">Save</button>
                            <button type="button" onClick={closeEditModal}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete {selectedUser.firstName} {selectedUser.lastName}?</p>
                        <button onClick={handleDeleteConfirm}>Yes</button>
                        <button onClick={closeDeleteModal}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;