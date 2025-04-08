import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

// Import shoe images
import basketshoe1 from '../assets/images/basketball/Anthony Edwards 1.png';
import basketshoe2 from '../assets/images/basketball/Harden Volume 8 Unisex.png';
import running1 from '../assets/images/running/Nike InfinityRN 4 Mens Road.png';
import running2 from '../assets/images/running/Nike Interact Run SE Mens Road.png';

const AdminProduct = () => {
    // State for managing products data
    const [products, setProducts] = useState([
        { 
            id: 1, 
            name: "Nike Anthony Edwards 1", 
            brand: "Nike", 
            category: "Basketball",
            price: 120.00,
            stock: 45,
            image: basketshoe1,
            description: "The Nike Anthony Edwards 1 is the first signature shoe for the rising NBA star. Featuring responsive cushioning and excellent court feel."
        },
        { 
            id: 2, 
            name: "Harden Volume 8 Unisex", 
            brand: "Adidas", 
            category: "Basketball",
            price: 140.00,
            stock: 32,
            image: basketshoe2,
            description: "The Harden Volume 8 is designed for James Harden's deceptive, change-of-pace game. Enhanced traction pattern for explosive moves."
        },
        { 
            id: 3, 
            name: "Nike InfinityRN 4 Mens Road", 
            brand: "Nike", 
            category: "Running",
            price: 160.00,
            stock: 28,
            image: running1,
            description: "Designed for daily training runs with maximum cushioning and a smooth ride. Features React foam and a breathable upper."
        },
        { 
            id: 4, 
            name: "Nike Interact Run SE Mens Road", 
            brand: "Nike", 
            category: "Running",
            price: 120.00,
            stock: 53,
            image: running2,
            description: "Lightweight and responsive running shoes ideal for both training and casual wear. Offers excellent support and versatility."
        },
        { 
            id: 5, 
            name: "Nike Zoom Air Running Shoes", 
            brand: "Nike", 
            category: "Running",
            price: 170.00,
            stock: 18,
            image: null,
            description: "Premium running shoes with Nike's Zoom Air technology for responsive cushioning. Perfect for serious runners."
        },
        { 
            id: 6, 
            name: "Nike LeBron 21", 
            brand: "Nike", 
            category: "Basketball",
            price: 200.00,
            stock: 25,
            image: null,
            description: "LeBron James' signature shoe featuring dual-chambered Air units and a Zoom Air unit for maximum impact protection."
        },
        { 
            id: 7, 
            name: "Puma Future Rider", 
            brand: "Puma", 
            category: "Casual",
            price: 85.00,
            stock: 60,
            image: null,
            description: "Retro-inspired casual sneakers with modern comfort technologies. Versatile design for everyday wear."
        },
        { 
            id: 8, 
            name: "Adidas Superstar", 
            brand: "Adidas", 
            category: "Casual",
            price: 90.00,
            stock: 72,
            image: null,
            description: "Iconic shell-toe design that has been a staple in fashion and streetwear for decades. Timeless style with modern comfort."
        }
    ]);

    // State for searching and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const itemsPerPage = 5;

    // State for product modals
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        name: '',
        brand: '',
        category: 'Basketball',
        price: '',
        stock: '',
        image: null,
        description: '',
        imageUrl: ''
    });

    // Filter products based on search term and filters
    const filteredProducts = products.filter(product => 
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === '' || product.category === categoryFilter) &&
        (brandFilter === '' || product.brand === brandFilter)
    );

    // Pagination logic
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle filter changes
    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleBrandChange = (e) => {
        setBrandFilter(e.target.value);
        setCurrentPage(1);
    };

    // Get unique categories and brands for filters
    const categories = [...new Set(products.map(product => product.category))];
    const brands = [...new Set(products.map(product => product.brand))];

    // Handle row click to select a product
    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
    };
    
    // Handle edit product
    const handleEdit = () => {
        setShowProductModal(false);
        setCurrentProduct({...selectedProduct});
        setShowEditModal(true);
    };
    
    // Handle delete product
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const updatedProducts = products.filter(product => product.id !== selectedProduct.id);
            setProducts(updatedProducts);
            setShowProductModal(false);
            setSelectedProduct(null);
        }
    };

    // Handle add new product
    const handleAddProduct = () => {
        setCurrentProduct({
            id: null,
            name: '',
            brand: '',
            category: 'Basketball',
            price: '',
            stock: '',
            image: null,
            description: '',
            imageUrl: ''
        });
        setShowEditModal(true);
    };
    
    // Handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({
            ...currentProduct,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) || '' : value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (currentProduct.id) {
            // Update existing product
            setProducts(
                products.map(product => 
                    product.id === currentProduct.id ? currentProduct : product
                )
            );
        } else {
            // Add new product
            const newProduct = {
                ...currentProduct,
                id: Math.max(...products.map(p => p.id)) + 1
            };
            setProducts([...products, newProduct]);
        }
        
        setShowEditModal(false);
    };
    
    // Close the modals
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
                        <Link to="/admin/products" className="sidebar-link active">
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
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group" style={{ marginRight: '15px' }}>
                                <select 
                                    value={brandFilter}
                                    onChange={handleBrandChange}
                                    className="search-input"
                                    style={{ paddingLeft: '15px', minWidth: '150px' }}
                                >
                                    <option value="">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
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
                                                {product.image ? (
                                                    <img 
                                                        src={product.image} 
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
                                            <td>{product.category}</td>
                                            <td>${product.price.toFixed(2)}</td>
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
                                {selectedProduct.image ? (
                                    <img 
                                        src={selectedProduct.image} 
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
                                <span className="product-brand">{selectedProduct.brand} | {selectedProduct.category}</span>
                                <span className="product-price">${selectedProduct.price.toFixed(2)}</span>
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
                                    <label htmlFor="category">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={currentProduct.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Basketball">Basketball</option>
                                        <option value="Running">Running</option>
                                        <option value="Casual">Casual</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price ($)</label>
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
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={currentProduct.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                ></textarea>
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