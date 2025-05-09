import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../assets/css/OrderConfirmation.css';
import logo from '../assets/images/logo.png';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [showOrderItems, setShowOrderItems] = useState(false);

    useEffect(() => {
        document.body.classList.add('body-no-scroll');
        return () => {
            document.body.classList.remove('body-no-scroll');
        };
    }, []);

    const fetchOrderFromServer = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const orderResponse = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!orderResponse.data) {
                throw new Error('Order not found');
            }

            const paymentResponse = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/payments/order/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const orderData = {
                orderId,
                order: orderResponse.data,
                paymentInfo: paymentResponse.data || null,
                formData: {
                    firstName: orderResponse.data.firstName,
                    lastName: orderResponse.data.lastName,
                    email: orderResponse.data.email,
                    address: orderResponse.data.address,
                    postalCode: orderResponse.data.postalCode,
                    country: orderResponse.data.country,
                    contactNumber: orderResponse.data.contactNumber,
                },
                cart: JSON.parse(localStorage.getItem('currentOrder'))?.cart || []
            };

            setOrderDetails(orderData);

            if (orderResponse.data.paymentStatus === 'PAID') {
                setPaymentStatus('PAID');
                setPaymentCompleted(true);
            }

            localStorage.setItem('currentOrder', JSON.stringify(orderData));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setLoading(false);
        }
    };

    // Add function to check payment status manually
    const checkPaymentStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !orderId) return;

            // Call the backend endpoint to check payment status
            await axios.post(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/payments/check/${orderId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Fetch updated order details after checking payment
            await fetchOrderFromServer();
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    useEffect(() => {
        const loadOrderDetails = async () => {
            const storedOrder = localStorage.getItem('currentOrder');
            if (storedOrder) {
                const parsedOrder = JSON.parse(storedOrder);
                if (parsedOrder.orderId === orderId) {
                    setOrderDetails(parsedOrder);

                    if (parsedOrder.order && parsedOrder.order.paymentStatus === 'PAID') {
                        setPaymentStatus('PAID');
                        setPaymentCompleted(true);
                    }

                    setLoading(false);
                    fetchOrderFromServer();
                    return;
                }
            }

            await fetchOrderFromServer();
        };

        if (orderId) {
            loadOrderDetails();
        } else {
            navigate('/');
        }
    }, [orderId, navigate]);

    // Add polling to check payment status every 3 seconds
    useEffect(() => {
        // Only poll if payment is still pending
        if (orderId && !paymentCompleted) {
            const intervalId = setInterval(() => {
                checkPaymentStatus();
            }, 3000); // Check every 3 seconds
            
            // Clean up interval on component unmount or when payment is completed
            return () => clearInterval(intervalId);
        }
    }, [orderId, paymentCompleted]);

    const calculateSubtotal = () => {
        if (!orderDetails || !orderDetails.cart || orderDetails.cart.length === 0) return 0;
        return orderDetails.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.12;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + 10;
    };

    const handlePayNow = () => {
        if (orderDetails && orderDetails.paymentInfo && orderDetails.paymentInfo.link) {
            window.open(orderDetails.paymentInfo.link, '_blank');
        } else {
            console.error('Payment link not available');
        }
    };

    const toggleOrderItems = () => {
        setShowOrderItems(!showOrderItems);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">
                    <div className="spinner"></div>
                    Loading order confirmation...
                </div>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className="error-container">
                <h2>Order not found</h2>
                <p>We couldn't find the order you're looking for.</p>
                <button onClick={() => navigate('/')} className="pay-now-btn">
                    Return to Home
                </button>
            </div>
        );
    }

    const isPaid = paymentStatus === 'PAID';
    const statusClass = isPaid ? 'paid' : 'pending';
    const statusText = isPaid ? 'Payment completed' : 'PENDING';
    const title = isPaid ? 'Order Succeeded!' : 'Order Has Been Placed!';

    return (
        <div className="confirmation-page">
            <header className="confirmation-header">
                <div className="header-logo">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" />
                    </Link>
                </div>
                <h1>Order Confirmation</h1>
                <p className="order-id-header">Order ID: <strong>{orderId}</strong></p>
            </header>

            <div className="order-confirmation">
                <div className="success-icon">
                    <i className={`fas ${isPaid ? 'fa-check-circle' : 'fa-clipboard-check'}`}></i>
                </div>
                
                <h2>{title}</h2>
                <p>Order ID: <span className="order-id">{orderId}</span></p>
                <p>A confirmation email has been sent to {orderDetails.formData?.email || 'your email'}</p>

                <div className={`order-status-badge ${statusClass}`}>
                    Payment Status: <span>{statusText}</span>
                </div>

                <div className="confirmation-details">
                    <div className="left-column">
                        <div className="shipping-info">
                            <h3 className="shipping-info-title">Shipping Information</h3>
                            <div className="shipping-info-content">
                                <div className="shipping-detail">
                                    <span className="detail-label">Name</span>
                                    <span className="detail-value">{orderDetails.formData?.firstName} {orderDetails.formData?.lastName}</span>
                                </div>
                                <div className="shipping-detail">
                                    <span className="detail-label">Address</span>
                                    <span className="detail-value">{orderDetails.formData?.address}</span>
                                </div>
                                <div className="shipping-detail">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value">{orderDetails.formData?.postalCode}, {orderDetails.formData?.country}</span>
                                </div>
                                <div className="shipping-detail">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{orderDetails.formData?.contactNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="order-items-container">
                            <button 
                                className={`order-summary-toggle ${showOrderItems ? 'expanded' : ''}`}
                                onClick={toggleOrderItems}
                            >
                                Order Summary ({orderDetails.cart?.length || 0} items)
                                <span className="toggle-icon">
                                    <i className={`fas fa-chevron-${showOrderItems ? 'up' : 'down'}`}></i>
                                </span>
                            </button>
                            <div className={`order-summary-content ${showOrderItems ? 'visible' : ''}`}>
                                {orderDetails.cart && orderDetails.cart.map((item, index) => (
                                    <div key={index} className="confirmation-item">
                                        <div className="item-image">
                                            <img src={item.imageUrl} alt={item.name} />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.name}</h4>
                                            <p className="item-meta">Size: US {item.selectedSize} · Qty: {item.quantity}</p>
                                            <p className="item-price">₱{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="total-line">
                                    <span>Tax:</span>
                                    <span>₱{calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="total-line">
                                    <span>Shipping:</span>
                                    <span>₱10.00</span>
                                </div>
                                <div className="total-line grand-total">
                                    <span>Total:</span>
                                    <span>₱{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="payment-section">
                    <div className="payment-actions">
                        {isPaid ? (
                            <>
                                <button onClick={() => navigate('/')} className="pay-now-btn">
                                    Return to Dashboard
                                </button>
                                <button onClick={() => navigate('/')} className="continue-shopping-btn">
                                    Continue Shopping
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handlePayNow} className="pay-now-btn">
                                    Pay Now
                                </button>
                                <button onClick={() => navigate('/')} className="continue-shopping-btn">
                                    Continue Shopping
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <footer className="footer">
                <p>&copy; 2025 Sapatosan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default OrderConfirmation;