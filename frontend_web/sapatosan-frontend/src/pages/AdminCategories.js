import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        id: '',
        name: '',
        description: '',
        featured: '',
        image: null
    });

    const token = localStorage.getItem('token');

    // Fetch categories from the backend
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories', {
           // const response = await axios.get('http://localhost:8080/api/categories', {    
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRowClick = (category) => {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };

    const handleEdit = () => {
        setShowCategoryModal(false);
        setCurrentCategory({ ...selectedCategory });
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (selectedCategory.productsCount > 0) {
            alert('Cannot delete category with products');
            return;
        }

        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories/${selectedCategory.id}`, {
               // await axios.delete(`http://localhost:8080/api/categories/${selectedCategory.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await fetchCategories(); // Refresh categories dynamically
                setShowCategoryModal(false);
                setSelectedCategory(null);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const openAddForm = () => {
        setCurrentCategory({
            id: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (currentCategory.id) {
                await axios.put(
                  `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories/${currentCategory.id}`,
                  // `http://localhost:8080/api/categories/${currentCategory.id}`,
                    { name: currentCategory.name, description: currentCategory.description, isFeatured: currentCategory.featured },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    'https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories',
                    //'http://localhost:8080/api/categories',
                    { name: currentCategory.name, description: currentCategory.description, isFeatured: currentCategory.featured },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            await fetchCategories(); // Refresh categories dynamically
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const toggleFeatured = async (category) => {
        try {
            const updatedCategory = { ...category, featured: !category.featured };
            await axios.put(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories/${category.id}`,
                //`http://localhost:8080/api/categories/${category.id}`,
                {
                    name: updatedCategory.name,
                    description: updatedCategory.description,
                    isFeatured: updatedCategory.featured
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(categories.map(cat =>
                cat.id === category.id ? updatedCategory : cat
            ));
        } catch (error) {
            console.error('Error toggling featured state:', error);
        }
    };

    const handleLogout = async () => {
        try {
           await axios.post('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout', {}, {
           // await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token'); // Clear the token from localStorage
            window.location.href = '/'; // Redirect to the landing page
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const filteredCategories = categories.filter(category =>
        (category.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

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
                        <Link to="/admin/users" className="sidebar-link">
                            <i className="fas fa-users"></i>
                            <span>Users</span>
                        </Link>
                        <Link to="/admin/categories" className="sidebar-link active">
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(category => (
                                        <tr
                                            key={category.id}
                                            onClick={() => handleRowClick(category)}
                                            className="clickable-row"
                                            style={{ backgroundColor: category.featured ? '#d4edda' : 'transparent' }}
                                        >
                                            <td>{category.id}</td>
                                            <td>{category.name}</td>
                                            <td>{category.description}</td>
                                            <td>{category.products || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-results">No categories found</td>
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