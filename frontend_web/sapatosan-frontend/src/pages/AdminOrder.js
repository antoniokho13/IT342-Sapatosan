import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

const AdminOrder = () => {
    // State for managing orders data
    const [orders, setOrders] = useState([]);

    // State for searching, filtering and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateSort, setDateSort] = useState('newest'); // 'newest' or 'oldest'
    const [currentPage, setCurrentPage] = useState(1);
    const [viewOrderDetails, setViewOrderDetails] = useState(null);
    // State for editing status in modal
    const [editingStatus, setEditingStatus] = useState('');
    const itemsPerPage = 5;

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Fetch orders when component mounts
    useEffect(() => {
        fetchOrders();
    }, []);

    // Fetch orders from the backend
    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                'https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders',
               // 'http://localhost:8080/api/orders',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('API Response:', response.data);
            
            // Transform the data to match our frontend structure
            const formattedOrders = response.data.map(order => {
                // Get the correct order ID directly
                const orderId = order.id || order.orderId;
                
                if (!orderId) {
                    console.error('Missing order ID in order:', order);
                }
                
                return {
                    id: orderId,
                    customer: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`,
                    email: order.email || 'No email provided',
                    date: new Date(order.orderDate || Date.now()).toISOString().split('T')[0],
                    total: order.totalAmount || 0,
                    items: order.items?.length || 0,
                    status: mapOrderStatus(order.paymentStatus),
                    payment: order.paymentMethod || 'Unknown',
                    details: {
                        items: order.items?.map(item => ({
                            id: item.productId,
                            name: item.productName,
                            size: item.size || 'N/A',
                            price: item.price || 0,
                            quantity: item.quantity || 1
                        })) || [],
                        shippingAddress: formatShippingAddress(order.shippingAddress),
                        shippingMethod: order.shippingMethod || 'Standard Shipping',
                        trackingNumber: order.trackingNumber || 'Not assigned yet'
                    }
                };
            });
            
            console.log('Fetched orders with IDs:', formattedOrders.map(o => o.id));
            setOrders(formattedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]); // Set empty array instead of demo data
            alert('Failed to fetch orders. Please try again later.');
        }
    };

    // Helper function to format shipping address
    const formatShippingAddress = (address) => {
        if (!address) return 'No address provided';
        return `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}, ${address.country || ''}`;
    };

    // Helper function to map backend order status to frontend display status
    const mapOrderStatus = (paymentStatus) => {
        switch (paymentStatus) {
            case 'PAID':
                return 'Delivered';
            case 'PENDING':
                return 'Processing';
            case 'CANCELLED':
                return 'Cancelled';
            case 'REFUNDED':
                return 'Refunded';
            case 'SHIPPED':
                return 'Shipped';
            default:
                return 'Pending';
        }
    };

    // Helper function to map frontend display status to backend payment status
    const mapToBackendStatus = (displayStatus) => {
        switch (displayStatus.toLowerCase()) {
            case 'delivered':
                return 'PAID';
            case 'processing':
                return 'PENDING';
            case 'pending':
                return 'PENDING';
            default:
                return 'PENDING';
        }
    };

    // Handle logout
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

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        // Validate that orderId exists
        if (!orderId) {
            console.error('Error: Order ID is undefined');
            alert('Cannot update order: Invalid order ID');
            return;
        }
        
        try {
            const backendStatus = mapToBackendStatus(newStatus);
            console.log(`Updating order ${orderId} to status: ${backendStatus}`);
            
            // Log the full URL for debugging
            const url = `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders/${orderId}?paymentStatus=${backendStatus}`;
           // const url = `http://localhost:8080/api/orders/${orderId}?paymentStatus=${backendStatus}`;
            console.log('Making PATCH request to:', url);
            
            await axios.patch(
                url,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            
            // If we're viewing the order details, update that too
            if (viewOrderDetails && viewOrderDetails.id === orderId) {
                setViewOrderDetails({ ...viewOrderDetails, status: newStatus });
            }
            
            // Provide user feedback
            alert(`Order #${orderId} status updated successfully to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            alert('Failed to update order status. Please try again.');
        }
    };

    // Handle update status in modal
    const handleUpdateStatus = () => {
        if (!viewOrderDetails || !editingStatus) return;
        
        if (editingStatus !== viewOrderDetails.status) {
            updateOrderStatus(viewOrderDetails.id, editingStatus);
        }
    };

    // Set initial editing status when modal opens
    useEffect(() => {
        if (viewOrderDetails) {
            setEditingStatus(viewOrderDetails.status);
        }
    }, [viewOrderDetails]);

    // Cancel order
    const handleCancelOrder = async (orderId) => {
        // Validate that orderId exists
        if (!orderId) {
            console.error('Error: Order ID is undefined');
            alert('Cannot cancel order: Invalid order ID');
            return;
        }

        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                console.log(`Cancelling order ${orderId}`);
                
                // Log the full URL for debugging
                const url = `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders/${orderId}`;
               // const url = `http://localhost:8080/api/orders/${orderId}`;
                console.log('Making DELETE request to:', url);
                
                await axios.delete(
                    url,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Update local state
                setOrders(orders.map(order => 
                    order.id === orderId ? { ...order, status: 'Cancelled' } : order
                ));
                
                // If we're viewing the order details, update that too
                if (viewOrderDetails && viewOrderDetails.id === orderId) {
                    setViewOrderDetails({ ...viewOrderDetails, status: 'Cancelled' });
                    // Close the modal after cancellation
                    closeOrderDetails();
                }
                
                // Provide user feedback
                alert(`Order #${orderId} has been cancelled successfully`);
            } catch (error) {
                console.error('Error cancelling order:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                }
                alert('Failed to cancel order. Please try again.');
            }
        }
    };

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

    // View order details
    const handleViewOrderDetails = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        setViewOrderDetails(order);
        if (order) {
            setEditingStatus(order.status);
        }
    };

    // Close order details modal
    const closeOrderDetails = () => {
        setViewOrderDetails(null);
        setEditingStatus('');
    };

    // CSS styles for the status dropdown
    const statusDropdownStyles = {
        select: {
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            minWidth: '120px'
        },
        container: {
            position: 'relative',
            display: 'inline-block',
            marginRight: '10px'
        }
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
                        <Link to="/admin/products" className="sidebar-link">
                            <i className="fas fa-shoe-prints"></i>
                            <span>Products</span>
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
                                    <option value="Delivered">Delivered</option>
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
                                        <tr key={order.id} onClick={() => handleViewOrderDetails(order.id)} style={{cursor: 'pointer'}}>
                                            <td>#{order.id || 'No ID'}</td>
                                            <td>
                                                <div>{order.customer}</div>
                                                <div className="email-subdued">{order.email}</div>
                                            </td>
                                            <td>{order.date}</td>
                                            <td>₱{order.total.toFixed(2)}</td>
                                            <td>{order.items}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>{order.payment}</td>
                                            <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    className="action-button view"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewOrderDetails(order.id);
                                                    }}
                                                    title="View Order Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                
                                                <div className="status-dropdown-container">
                                                    <select
                                                        className="status-dropdown"
                                                        value={order.status}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            const newStatus = e.target.value;
                                                            if (window.confirm(`Update order #${order.id} status to ${newStatus}?`)) {
                                                                updateOrderStatus(order.id, newStatus);
                                                            }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </div>
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
                                                <div className="status-update-container">
                                                    <select
                                                        className="status-dropdown"
                                                        value={editingStatus}
                                                        onChange={(e) => setEditingStatus(e.target.value)}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                    <button 
                                                        className="primary-button"
                                                        onClick={handleUpdateStatus}
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Payment Method:</span>
                                                <span className="value">{viewOrderDetails.payment}</span>
                                            </div>
                                            <div className="order-info-item">
                                                <span className="label">Total:</span>
                                                <span className="value bold">₱{viewOrderDetails.total.toFixed(2)}</span>
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
                                                        <td>₱{item.price.toFixed(2)}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="4" className="text-right">Subtotal:</td>
                                                    <td>₱{viewOrderDetails.details.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4" className="text-right">Shipping:</td>
                                                    <td>₱10.00</td>
                                                </tr>
                                                <tr className="total-row">
                                                    <td colSpan="4" className="text-right">Total:</td>
                                                    <td>₱{viewOrderDetails.total.toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="order-actions">
                                        <button className="secondary-button" onClick={closeOrderDetails}>
                                            Close
                                        </button>
                                        {viewOrderDetails.status.toLowerCase() !== 'cancelled' && (
                                            <button 
                                                className="danger-button"
                                                onClick={() => handleCancelOrder(viewOrderDetails.id)}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
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