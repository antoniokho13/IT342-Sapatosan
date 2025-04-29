import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
            const response = await axios.get('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users', {
                headers: { authorization: `Bearer ${token}` }
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
            await axios.put(`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users/${currentUser.id}`, currentUser, {
                headers: { authorization: `Bearer ${token}` }
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
            await axios.delete(`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users/${selectedUser.id}`, {
                headers: { authorization: `Bearer ${token}` }
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
            await axios.post('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout', {}, {
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
                        <Link to="/admin/categories" className="sidebar-link">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/products" className="sidebar-link">
                            <i className="fas fa-shoe-prints"></i>
                            <span>Products</span>
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
                    <div className="modal-content user-action-modal">
                        <div className="modal-header">
                            <h3>User Actions</h3>
                            <button className="close-modal" onClick={closeUserModal}>×</button>
                        </div>
                        
                        <div className="user-details">
                            <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                            <p>{selectedUser.email}</p>
                        </div>
                        
                        <div className="user-actions">
                            <button 
                                className="action-button-large edit"
                                onClick={handleEdit}
                            >
                                <i className="fas fa-edit"></i>
                                Edit User
                            </button>
                            <button 
                                className="action-button-large delete"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content user-edit-modal">
                        <div className="modal-header">
                            <h3>Edit User</h3>
                            <button className="close-modal" onClick={closeEditModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="category-form">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={currentUser.firstName}
                                    onChange={(e) => setCurrentUser({ ...currentUser, firstName: e.target.value })}
                                    placeholder="First Name"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={currentUser.lastName}
                                    onChange={(e) => setCurrentUser({ ...currentUser, lastName: e.target.value })}
                                    placeholder="Last Name"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={currentUser.email}
                                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            
                            <div className="form-buttons">
                                <button type="button" className="cancel-button" onClick={closeEditModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content user-action-modal">
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                            <button className="close-modal" onClick={closeDeleteModal}>×</button>
                        </div>
                        
                        <div className="user-details">
                            <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                            <p>{selectedUser.email}</p>
                            <p className="warning-text">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                        </div>
                        
                        <div className="user-actions">
                            <button 
                                className="action-button-large edit"
                                onClick={closeDeleteModal}
                            >
                                <i className="fas fa-times"></i>
                                Cancel
                            </button>
                            <button 
                                className="action-button-large delete"
                                onClick={handleDeleteConfirm}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;