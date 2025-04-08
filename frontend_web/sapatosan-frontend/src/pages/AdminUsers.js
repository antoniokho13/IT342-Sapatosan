import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminUsers = () => {
    // State for managing users data
    const [users, setUsers] = useState([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: '********' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', password: '********' },
        { id: 3, firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@example.com', password: '********' },
        { id: 4, firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', password: '********' },
        { id: 5, firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@example.com', password: '********' },
        { id: 6, firstName: 'Emily', lastName: 'Jones', email: 'emily.jones@example.com', password: '********' },
        { id: 7, firstName: 'David', lastName: 'Miller', email: 'david.miller@example.com', password: '********' },
        { id: 8, firstName: 'Jennifer', lastName: 'Davis', email: 'jennifer.davis@example.com', password: '********' }
    ]);

    // State for searching and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    // State for selected user and modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    // Filter users based on search term
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };
    
    // Handle row click to select a user
    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };
    
    // Handle edit user
    const handleEdit = () => {
        setShowUserModal(false);
        setCurrentUser({...selectedUser});
        setShowEditModal(true);
    };
    
    // Handle delete user
    const handleDelete = () => {
        // Filter out the selected user
        const updatedUsers = users.filter(user => user.id !== selectedUser.id);
        setUsers(updatedUsers);
        setShowUserModal(false);
        setSelectedUser(null);
    };

    // Handle add new user
    const handleAddUser = () => {
        setCurrentUser({
            id: null,
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        });
        setShowEditModal(true);
    };
    
    // Handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({
            ...currentUser,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (currentUser.id) {
            // Update existing user
            setUsers(
                users.map(user => 
                    user.id === currentUser.id ? currentUser : user
                )
            );
        } else {
            // Add new user
            const newUser = {
                ...currentUser,
                id: Math.max(...users.map(u => u.id)) + 1
            };
            setUsers([...users, newUser]);
        }
        
        setShowEditModal(false);
    };
    
    // Close the modals
    const closeUserModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

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
                    <Link to="/" className="auth-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Logout
                    </Link>
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
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                            <button className="add-button" onClick={handleAddUser}>
                                <i className="fas fa-plus"></i> Add User
                            </button>
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
                                    <th>Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map(user => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => handleRowClick(user)}
                                            className="clickable-row"
                                        >
                                            <td>{user.id}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.password}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-results">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && (
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="page-button"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            
                            <span className="page-info">{currentPage} of {totalPages}</span>
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="page-button"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </main>
            </div>
            
            {/* User Action Modal */}
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
                                onClick={handleDelete}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Edit/Add Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{currentUser.id ? 'Edit User' : 'Add New User'}</h3>
                            <button className="close-modal" onClick={closeEditModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={currentUser.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={currentUser.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={currentUser.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={currentUser.password}
                                    onChange={handleInputChange}
                                    required={!currentUser.id} // Required only for new users
                                    placeholder={currentUser.id ? "Leave blank to keep current password" : ""}
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="button" onClick={closeEditModal} className="cancel-button">
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    {currentUser.id ? 'Update' : 'Add'} User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminUsers;