import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminCategories = () => {
    // State for managing categories data
    const [categories, setCategories] = useState([
        { 
            id: 1, 
            name: "Basketball", 
            description: "High-performance basketball shoes for indoor and outdoor courts",
            productsCount: 10,
            featured: true,
            image: "basketball-category.jpg"
        },
        { 
            id: 2, 
            name: "Running", 
            description: "Responsive running shoes designed for road and trail surfaces",
            productsCount: 10,
            featured: true,
            image: "running-category.jpg"
        },
        { 
            id: 3, 
            name: "Casual", 
            description: "Everyday casual shoes for comfort and style",
            productsCount: 8,
            featured: true,
            image: "casual-category.jpg"
        },
        { 
            id: 4, 
            name: "Soccer", 
            description: "Professional soccer cleats for field play",
            productsCount: 0,
            featured: false,
            image: null
        },
        { 
            id: 5, 
            name: "Training", 
            description: "Cross-training shoes for gym and fitness activities",
            productsCount: 0,
            featured: false,
            image: null
        },
    ]);

    // State for searching and form management
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        id: null,
        name: '',
        description: '',
        featured: false,
        image: null
    });

    // Filter categories based on search term
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle search change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle row click to select a category
    const handleRowClick = (category) => {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };
    
    // Handle edit category
    const handleEdit = () => {
        setShowCategoryModal(false);
        setCurrentCategory({...selectedCategory});
        setIsFormOpen(true);
    };
    
    // Handle delete category
    const handleDelete = () => {
        if (selectedCategory.productsCount > 0) {
            alert('Cannot delete category with products');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(category => category.id !== selectedCategory.id));
            setShowCategoryModal(false);
            setSelectedCategory(null);
        }
    };

    // Form handlers
    const openAddForm = () => {
        setCurrentCategory({
            id: null,
            name: '',
            description: '',
            featured: false,
            image: null
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
    };
    
    // Close the category action modal
    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setSelectedCategory(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCategory({
            ...currentCategory,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (currentCategory.id) {
            // Update existing category
            setCategories(
                categories.map(category => 
                    category.id === currentCategory.id ? currentCategory : category
                )
            );
        } else {
            // Add new category
            const newCategory = {
                ...currentCategory,
                id: Math.max(...categories.map(c => c.id)) + 1,
                productsCount: 0
            };
            setCategories([...categories, newCategory]);
        }
        
        setIsFormOpen(false);
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
                        <Link to="/admin/users" className="sidebar-link">
                            <i className="fas fa-users"></i>
                            <span>Users</span>
                        </Link>
                        <Link to="/admin/products" className="sidebar-link">
                            <i className="fas fa-shoe-prints"></i>
                            <span>Products</span>
                        </Link>
                        <Link to="/admin/categories" className="sidebar-link active">
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
                        <h2>Category Management</h2>
                        <div className="action-buttons">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    placeholder="Search categories..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                            <button className="add-button" onClick={openAddForm}>
                                <i className="fas fa-plus"></i> Add Category
                            </button>
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Products</th>
                                    <th>Featured</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(category => (
                                        <tr 
                                            key={category.id}
                                            onClick={() => handleRowClick(category)}
                                            className="clickable-row"
                                        >
                                            <td>{category.id}</td>
                                            <td>{category.name}</td>
                                            <td>{category.description}</td>
                                            <td>{category.productsCount}</td>
                                            <td>
                                                {category.featured ? (
                                                    <span className="badge-featured">
                                                        <i className="fas fa-check-circle"></i> Featured
                                                    </span>
                                                ) : (
                                                    <span className="badge-not-featured">
                                                        <i className="fas fa-times-circle"></i> Not Featured
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-results">No categories found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Category Action Modal */}
                    {showCategoryModal && selectedCategory && (
                        <div className="modal-overlay">
                            <div className="modal-content category-action-modal">
                                <div className="modal-header">
                                    <h3>Category Actions</h3>
                                    <button className="close-modal" onClick={closeCategoryModal}>×</button>
                                </div>
                                <div className="category-details">
                                    <h4>{selectedCategory.name}</h4>
                                    <p>{selectedCategory.description}</p>
                                    <div className="category-info">
                                        <span>Products: {selectedCategory.productsCount}</span>
                                        <span>
                                            {selectedCategory.featured ? (
                                                <span className="badge-featured">
                                                    <i className="fas fa-check-circle"></i> Featured
                                                </span>
                                            ) : (
                                                <span className="badge-not-featured">
                                                    <i className="fas fa-times-circle"></i> Not Featured
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="category-actions">
                                    <button 
                                        className="action-button-large edit"
                                        onClick={handleEdit}
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit Category
                                    </button>
                                    <button 
                                        className={`action-button-large delete ${selectedCategory.productsCount > 0 ? 'disabled' : ''}`}
                                        onClick={handleDelete}
                                        disabled={selectedCategory.productsCount > 0}
                                        title={selectedCategory.productsCount > 0 ? "Cannot delete category with products" : "Delete category"}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                        Delete Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category Add/Edit Form Modal */}
                    {isFormOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>{currentCategory.id ? 'Edit Category' : 'Add New Category'}</h3>
                                    <button className="close-modal" onClick={closeForm}>×</button>
                                </div>
                                <form onSubmit={handleSubmit} className="category-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Category Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={currentCategory.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={currentCategory.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            id="featured"
                                            name="featured"
                                            type="checkbox"
                                            checked={currentCategory.featured}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="featured">Featured Category</label>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="image">Category Image (URL)</label>
                                        <input
                                            id="image"
                                            name="image"
                                            type="text"
                                            value={currentCategory.image || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter image URL or leave blank"
                                        />
                                    </div>
                                    <div className="form-buttons">
                                        <button type="button" onClick={closeForm} className="cancel-button">
                                            Cancel
                                        </button>
                                        <button type="submit" className="save-button">
                                            {currentCategory.id ? 'Update' : 'Create'} Category
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminCategories;