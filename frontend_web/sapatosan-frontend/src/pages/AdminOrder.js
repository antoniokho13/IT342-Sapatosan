import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminOrder = () => {
    // State for managing orders data
    const [orders, setOrders] = useState([
        { 
            id: 1001, 
            customer: "John Doe", 
            email: "john.doe@example.com",
            date: "2025-04-05",
            total: 240.00,
            items: 2,
            status: "Delivered",
            payment: "Credit Card"
        },
        { 
            id: 1002, 
            customer: "Jane Smith", 
            email: "jane.smith@example.com",
            date: "2025-04-06",
            total: 120.00,
            items: 1,
            status: "Processing",
            payment: "PayPal"
        },
        { 
            id: 1003, 
            customer: "Michael Johnson", 
            email: "michael.johnson@example.com",
            date: "2025-04-06",
            total: 360.00,
            items: 3,
            status: "Shipped",
            payment: "Credit Card"
        },
        { 
            id: 1004, 
            customer: "Sarah Williams", 
            email: "sarah.williams@example.com",
            date: "2025-04-07",
            total: 170.00,
            items: 1,
            status: "Pending",
            payment: "Bank Transfer"
        },
        { 
            id: 1005, 
            customer: "Robert Brown", 
            email: "robert.brown@example.com",
            date: "2025-04-07",
            total: 210.00,
            items: 2,
            status: "Delivered",
            payment: "Credit Card"
        },
        { 
            id: 1006, 
            customer: "Emily Jones", 
            email: "emily.jones@example.com",
            date: "2025-04-08",
            total: 90.00,
            items: 1,
            status: "Processing",
            payment: "PayPal"
        },
        { 
            id: 1007, 
            customer: "David Miller", 
            email: "david.miller@example.com",
            date: "2025-04-08",
            total: 320.00,
            items: 2,
            status: "Cancelled",
            payment: "Credit Card"
        }
    ]);

    // State for searching, filtering and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateSort, setDateSort] = useState('newest'); // 'newest' or 'oldest'
    const [currentPage, setCurrentPage] = useState(1);
    const [viewOrderDetails, setViewOrderDetails] = useState(null);
    const itemsPerPage = 5;

    // Filter orders based on search term and status filter
    const filteredOrders = orders.filter(order => 
        (order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)) &&
        (statusFilter === '' || order.status === statusFilter)
    );

    // Sort orders by date
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Pagination logic
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

    // Handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle date sort change
    const handleDateSortChange = (e) => {
        setDateSort(e.target.value);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'status-delivered';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    // Mock order details for the selected order
    const getOrderDetails = (orderId) => {
        // In a real app, you would fetch this data from the backend
        const orderDetailsMap = {
            1001: {
                items: [
                    { id: 1, name: "Nike Anthony Edwards 1", size: "US 10", price: 120.00, quantity: 1 },
                    { id: 2, name: "Nike InfinityRN 4 Mens Road", size: "US 9", price: 120.00, quantity: 1 }
                ],
                shippingAddress: "123 Main St, Anytown, CA 12345",
                shippingMethod: "Standard Shipping",
                trackingNumber: "SPS1001284753"
            },
            1002: {
                items: [
                    { id: 3, name: "Harden Volume 8 Unisex", size: "US 11", price: 120.00, quantity: 1 }
                ],
                shippingAddress: "456 Oak Ave, Somewhere, NY 67890",
                shippingMethod: "Express Shipping",
                trackingNumber: "SPS1002394856"
            },
            1003: {
                items: [
                    { id: 4, name: "Nike KD16 Ember Glow", size: "US 10.5", price: 150.00, quantity: 1 },
                    { id: 5, name: "Nike LeBron 21 World Is Your Oyster", size: "US 11", price: 200.00, quantity: 1 },
                    { id: 6, name: "Adidas Superstar", size: "US 9", price: 10.00, quantity: 1 }
                ],
                shippingAddress: "789 Pine Rd, Elsewhere, TX 13579",
                shippingMethod: "Next Day Delivery",
                trackingNumber: "SPS1003485967"
            },
            1004: {
                items: [
                    { id: 7, name: "Nike Interact Run SE Mens Road", size: "US 10", price: 170.00, quantity: 1 }
                ],
                shippingAddress: "321 Cedar St, Nowhere, FL 24680",
                shippingMethod: "Standard Shipping",
                trackingNumber: "Pending"
            },
            1005: {
                items: [
                    { id: 8, name: "Kobe A.D. 'Igloo'", size: "US 9", price: 160.00, quantity: 1 },
                    { id: 9, name: "Nike Women's Sabrina 2 EP", size: "US 7", price: 50.00, quantity: 1 }
                ],
                shippingAddress: "654 Maple Dr, Anywhere, WA 97531",
                shippingMethod: "Express Shipping",
                trackingNumber: "SPS1005384965"
            },
            1006: {
                items: [
                    { id: 10, name: "Nike Men's G.T. Cut Academy", size: "US 12", price: 90.00, quantity: 1 }
                ],
                shippingAddress: "987 Birch Ln, Someplace, IL 86420",
                shippingMethod: "Standard Shipping",
                trackingNumber: "SPS1006293847"
            },
            1007: {
                items: [
                    { id: 11, name: "Nike KD17 Flight To Paris", size: "US 10", price: 180.00, quantity: 1 },
                    { id: 12, name: "Nike Zoom Freak 1 All Star", size: "US 11", price: 140.00, quantity: 1 }
                ],
                shippingAddress: "246 Elm Blvd, Otherplace, GA 75309",
                shippingMethod: "Express Shipping",
                trackingNumber: "Cancelled"
            }
        };
        
        return orderDetailsMap[orderId] || { 
            items: [], 
            shippingAddress: "Not available", 
            shippingMethod: "Not available",
            trackingNumber: "Not available"
        };
    };

    // View order details
    const handleViewOrderDetails = (orderId) => {
        const orderDetails = getOrderDetails(orderId);
        const order = orders.find(o => o.id === orderId);
        setViewOrderDetails({ ...order, details: orderDetails });
    };

    // Close order details modal
    const closeOrderDetails = () => {
        setViewOrderDetails(null);
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
                        <Link to="/admin/categories" className="sidebar-link">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/orders" className="sidebar-link active">
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
                        <h2>Order Management</h2>
                        <div className="action-buttons">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    placeholder="Search orders..." 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                            <div className="filter-group" style={{ marginRight: '15px' }}>
                                <select 
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    className="search-input"
                                    style={{ paddingLeft: '15px', minWidth: '150px' }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <select 
                                    value={dateSort}
                                    onChange={handleDateSortChange}
                                    className="search-input"
                                    style={{ paddingLeft: '15px', minWidth: '150px' }}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.length > 0 ? (
                                    currentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>
                                                <div>{order.customer}</div>
                                                <div className="email-subdued">{order.email}</div>
                                            </td>
                                            <td>{order.date}</td>
                                            <td>${order.total.toFixed(2)}</td>
                                            <td>{order.items}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{order.payment}</td>
                                            <td className="action-cell">
                                                <button 
                                                    className="action-button view"
                                                    onClick={() => handleViewOrderDetails(order.id)}
                                                    title="View Order Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button 
                                                    className="action-button edit"
                                                    title="Edit Order"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-results">No orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sortedOrders.length > 0 && (
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

                    {/* Order Details Modal */}
                    {viewOrderDetails && (
                        <div className="modal-overlay">
                            <div className="modal-content order-details-modal">
                                <div className="modal-header">
                                    <h3>Order #{viewOrderDetails.id} Details</h3>
                                    <button className="close-modal" onClick={closeOrderDetails}>×</button>
                                </div>
                                <div className="order-details-content">
                                    <div className="order-details-section">
                                        <h4>Order Information</h4>
                                        <div className="order-info-grid">
                                            <div className="order-info-item">
                                                <span className="label">Customer:</span>
                                                <span className="value">{viewOrderDetails.customer}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Email:</span>
                                                <span className="value">{viewOrderDetails.email}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Date:</span>
                                                <span className="value">{viewOrderDetails.date}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Status:</span>
                                                <span className={`status-badge ${getStatusBadgeClass(viewOrderDetails.status)}`}>
                                                    {viewOrderDetails.status}
                                                </span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Payment Method:</span>
                                                <span className="value">{viewOrderDetails.payment}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Total:</span>
                                                <span className="value bold">${viewOrderDetails.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="order-details-section">
                                        <h4>Shipping Information</h4>
                                        <div className="order-info-grid">
                                            <div className="order-info-item wide">
                                                <span className="label">Address:</span>
                                                <span className="value">{viewOrderDetails.details.shippingAddress}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Method:</span>
                                                <span className="value">{viewOrderDetails.details.shippingMethod}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Tracking:</span>
                                                <span className="value">{viewOrderDetails.details.trackingNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-details-section">
                                        <h4>Order Items</h4>
                                        <table className="order-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Size</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewOrderDetails.details.items.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td>{item.size}</td>
                                                        <td>${item.price.toFixed(2)}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-right">Subtotal:</td>
                                                    <td>${viewOrderDetails.details.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4" className="text-right">Shipping:</td>
                                                    <td>$10.00</td>
                                                </tr>
                                                <tr className="total-row">
                                                    <td colSpan="4" className="text-right">Total:</td>
                                                    <td>${viewOrderDetails.total.toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="order-actions">
                                        <button className="secondary-button" onClick={closeOrderDetails}>
                                            Close
                                        </button>
                                        <button className="primary-button">
                                            Update Status
                                        </button>
                                    </div>
                                </div>
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

export default AdminOrder;