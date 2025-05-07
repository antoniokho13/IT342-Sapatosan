import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminProduct = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const itemsPerPage = 5;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id: '',
        name: '',
        brand: '',
        categoryId: '',
        price: '',
        stock: '',
        imageUrl: '',
        description: ''
    });

    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const token = localStorage.getItem('token');

    // Fetch products and categories from the backend
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
               // `http://localhost:8080/api/products`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories`,
               // `http://localhost:8080/api/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleLogout = async () => {
        try {
           // await axios.post('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout', {}, {
            await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token'); // Clear the token from localStorage
            window.location.href = '/'; // Redirect to the landing page
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = products.filter(product =>
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === '' || product.categoryId === categoryFilter)
    );

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };

    const handleEdit = () => {
        setShowProductModal(false);
        // Convert price from cents to whole units for editing
        const productForEdit = { 
            ...selectedProduct,
            price: selectedProduct.price / 100 
        };
        setCurrentProduct(productForEdit);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(
                    `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products/${selectedProduct.id}`,
                   // `http://localhost:8080/api/products/${selectedProduct.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProducts(products.filter(product => product.id !== selectedProduct.id));
                setShowProductModal(false);
                setSelectedProduct(null);
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleAddProduct = () => {
        setCurrentProduct({
            id: '',
            name: '',
            brand: '',
            categoryId: '',
            price: '',
            stock: '',
            imageUrl: '',
            description: ''
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({
            ...currentProduct,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) || '' : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            let imageUrl = currentProduct.imageUrl; // Start with existing URL
    
            // Upload the image if a new file is selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
    
                console.log('Uploading image...'); // Debugging line
                const uploadResponse = await axios.post(
                    'https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/images/upload',
                   // 'http://localhost:8080/api/images/upload',
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
    
                imageUrl = uploadResponse.data; // Get the uploaded image URL
                console.log('Image uploaded successfully:', imageUrl); // Debugging line
            } else {
                 console.log('No new image file selected. Using existing URL:', imageUrl); // Debugging line
            }
    
            // Prepare the product data with the correct image URL and price in cents
            const productData = { 
                ...currentProduct, 
                imageUrl,
                // Convert price from display format (whole units) to storage format (cents)
                price: parseFloat(currentProduct.price) * 100
            };
    
            if (currentProduct.id) {
                // Update existing product
                console.log('Updating product:', currentProduct.id, productData); // Debugging line
                await axios.put(
                    `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products/${currentProduct.id}`,
                    //`http://localhost:8080/api/products/${currentProduct.id}`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('Product updated successfully'); // Debugging line
    
            } else {
                // Add new product
                console.log('Adding new product:', productData); // Debugging line
                await axios.post(
                    `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
                    //`http://localhost:8080/api/products`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('Product added successfully'); // Debugging line
            }
    
            // Clear the selected image file state after successful save
            setImageFile(null);
    
            await fetchProducts(); // Refresh the product list
            setShowEditModal(false);
        } catch (error) {
            console.error('Error saving product:', error);
            // You might want to show an error message to the user here
        }
    };
    // Add this handler to your file input
    const handleImageFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const closeProductModal = () => {
        setShowProductModal(false);
        setSelectedProduct(null);
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
                        <Link to="/admin/categories" className="sidebar-link">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/products" className="sidebar-link active">
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
                        <h2>Product Management</h2>
                        <div className="action-buttons">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                            <div className="filter-group" style={{ marginRight: '15px' }}>
                                <select 
                                    value={categoryFilter}
                                    onChange={handleCategoryChange}
                                    className="search-input"
                                    style={{ paddingLeft: '15px', minWidth: '150px' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="add-button" onClick={handleAddProduct}>
                                <i className="fas fa-plus"></i> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map(product => (
                                        <tr 
                                            key={product.id}
                                            onClick={() => handleRowClick(product)}
                                            className="clickable-row"
                                        >
                                            <td>{product.id}</td>
                                            <td>
                                                {product.imageUrl ? (
                                                    <img 
                                                        src={product.imageUrl} 
                                                        alt={product.name} 
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                                    />
                                                ) : (
                                                    <div 
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            background: '#f0f0f0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '20px',
                                                            color: '#aaa'
                                                        }}
                                                    >
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </td>
                                            <td>{product.name}</td>
                                            <td>{product.brand}</td>
                                            <td>
                                                {categories.find(category => category.id === product.categoryId)?.name || 'Unknown'}
                                            </td>
                                            <td>₱{(product.price / 100).toFixed(2)}</td>
                                            <td>{product.stock}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-results">No products found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > 0 && (
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
            
            {/* Product Action Modal */}
            {showProductModal && selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content product-action-modal">
                        <div className="modal-header">
                            <h3>Product Actions</h3>
                            <button className="close-modal" onClick={closeProductModal}>×</button>
                        </div>
                        <div className="product-details">
                            <div className="product-image-container">
                                {selectedProduct.imageUrl ? (
                                    <img 
                                        src={selectedProduct.imageUrl} 
                                        alt={selectedProduct.name}
                                        className="product-preview" 
                                    />
                                ) : (
                                    <div className="product-preview no-image">
                                        <i className="fas fa-image"></i>
                                    </div>
                                )}
                            </div>
                            <h4>{selectedProduct.name}</h4>
                            <div className="product-info">
                                <span className="product-brand">
                                    {selectedProduct.brand} | {categories.find(category => category.id === selectedProduct.categoryId)?.name || 'Unknown'}
                                </span>
                                <span className="product-price">₱{(selectedProduct.price / 100).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="product-actions">
                            <button 
                                className="action-button-large edit"
                                onClick={handleEdit}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Product
                            </button>
                            <button 
                                className="action-button-large delete"
                                onClick={handleDelete}
                            >
                                <i className="fas fa-trash-alt"></i>
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Edit/Add Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content product-modal">
                        <div className="modal-header">
                            <h3>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="close-modal" onClick={closeEditModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Product Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={currentProduct.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="brand">Brand</label>
                                    <input
                                        id="brand"
                                        name="brand"
                                        type="text"
                                        value={currentProduct.brand}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="categoryId">Category</label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={currentProduct.categoryId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price (₱)</label>
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={currentProduct.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="stock">Stock</label>
                                    <input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={currentProduct.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageUrl">Image URL</label>
                                <input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="text"
                                    value={currentProduct.imageUrl || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter image URL or leave blank"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="imageFile">Upload Image</label>
                                <input
                                    id="imageFile"
                                    name="imageFile"
                                    type="file"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </div>

                            <div className="form-buttons">
                                <button type="button" onClick={closeEditModal} className="cancel-button">
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    {currentProduct.id ? 'Update' : 'Add'} Product
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

export default AdminProduct;