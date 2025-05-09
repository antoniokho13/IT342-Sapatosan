import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Checkout.css';
import logo from '../assets/images/logo.png';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Philippines',
        contactNumber: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [fetchingPayment, setFetchingPayment] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');

    // Load cart data from backend and fetch user data
    useEffect(() => {
        const fetchUserAndCartData = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const email = localStorage.getItem('email');
            
            if (!token || !userId) {
                // If user is not logged in, redirect to login page
                navigate('/login?redirect=/checkout');
                return;
            }
            
            try {
                // Fetch user data
                const userResponse = await axios.get('http://localhost:8080/api/users', {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
                
                const currentUser = userResponse.data.find(user => user.email === email);
                
                if (currentUser) {
                    setFormData(prev => ({ 
                        ...prev, 
                        firstName: currentUser.firstName || '',
                        lastName: currentUser.lastName || '',
                        email: currentUser.email || ''
                    }));
                } else {
                    // If user not found but has email in localStorage
                    setFormData(prev => ({ ...prev, email: email || '' }));
                }

                // Fetch cart data
                await fetchCartItems(token, userId);
                
            } catch (error) {
                console.error('Error fetching user or cart data:', error);
                // If we can't fetch user data, at least try to use the email from localStorage
                if (email) {
                    setFormData(prev => ({ ...prev, email }));
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserAndCartData();
    }, [navigate]);

    // Function to fetch cart items from backend
    const fetchCartItems = async (token, userId) => {
        try {
            // First, get the cart data
            const cartResponse = await axios.get(
                `http://localhost:8080/api/carts/user/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (cartResponse.status !== 200 || !cartResponse.data) {
                console.log('No cart found or empty cart');
                navigate('/'); // Redirect to home if cart is empty
                return;
            }

            const cartData = cartResponse.data;
            const cartProductIds = Object.keys(cartData.cartProductIds || {});
            
            if (cartProductIds.length === 0) {
                console.log('Cart is empty');
                navigate('/'); // Redirect to home if cart is empty
                return;
            }
            
            // Next, fetch ALL products to find the ones in the cart
            const productsResponse = await axios.get(
                `http://localhost:8080/api/products`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (!productsResponse.data || !Array.isArray(productsResponse.data)) {
                console.error("Failed to fetch products for cart");
                return;
            }
            
            // Create a map of all products by ID for easy lookup
            const productsMap = {};
            productsResponse.data.forEach(product => {
                productsMap[product.id] = {
                    ...product,
                    price: product.price / 100,
                    sizes: [7, 8, 9, 10, 11, 12],
                    description: product.description || `Premium ${product.brand} shoes.`,
                    imageUrl: product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'
                };
            });
            
            // Get the saved sizes from localStorage
            const savedCart = JSON.parse(localStorage.getItem('sapatosanCart') || '[]');
            const sizeMap = {};
            savedCart.forEach(item => {
                const key = item.id;
                sizeMap[key] = item.selectedSize;
            });
            
            // Build the cart items with complete product details
            const cartItems = cartProductIds.map(productId => {
                const product = productsMap[productId] || {};
                const quantity = cartData.cartProductIds[productId] || 1;
                const savedSize = sizeMap[productId] || 7;
                
                return {
                    ...product,
                    id: productId,
                    quantity: quantity,
                    price: product.price || 0,
                    selectedSize: savedSize
                };
            });
            
            setCart(cartItems);
            localStorage.setItem('sapatosanCart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error fetching cart items:', error);
            const savedCart = localStorage.getItem('sapatosanCart');
            if (savedCart) {
                // Fallback to local storage if API fails
                setCart(JSON.parse(savedCart));
            } else {
                navigate('/'); // Redirect to home if no cart data available
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Don't allow changes to firstName, lastName, or email
        if (name !== 'firstName' && name !== 'lastName' && name !== 'email') {
            setFormData({
                ...formData,
                [name]: value,
            });
            
            // Clear error when user starts typing
            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: null
                });
            }
        }
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.12; // 12% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + 10; // $10 shipping fee
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Basic validation
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
        if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Prepare the order data that matches the backend OrderEntity structure
        const orderData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            postalCode: formData.postalCode,
            country: formData.country,
            contactNumber: formData.contactNumber
        };
        
        try {
            console.log("Creating order with data:", orderData);
            // Make the API call to create an order
            const response = await axios.post(
                `http://localhost:8080/api/orders/from-cart/${userId}`,
                orderData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                // Extract the order ID from the response (which is an OrderResponse object)
                const responseData = response.data;
                const orderId = responseData.order?.id;
                
                if (!orderId) {
                    console.error("Order ID not found in response:", responseData);
                    setErrors({ submit: 'Failed to retrieve order ID from response' });
                    return;
                }
                
                setOrderId(orderId);
                console.log("Order created successfully with ID:", orderId);
                
                // Clear cart from localStorage
                localStorage.removeItem('sapatosanCart');
                
                // Set payment info from the response if available
                if (responseData.payment) {
                    setPaymentInfo(responseData.payment);
                } else {
                    // If not in response, fetch it separately
                    try {
                        console.log("Fetching payment information for order:", orderId);
                        const paymentResponse = await axios.get(
                            `http://localhost:8080/api/payments/order/${orderId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        
                        if (paymentResponse.status === 200 && paymentResponse.data) {
                            console.log("Payment information received:", paymentResponse.data);
                            setPaymentInfo(paymentResponse.data);
                        }
                    } catch (error) {
                        console.error('Error fetching payment link:', error);
                    }
                }
                
                // Show order confirmation screen
                setOrderComplete(true);
                
            } else {
                console.error("Unexpected response status:", response.status);
                setErrors({ submit: 'Failed to place order. Please try again.' });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            let errorMessage = 'Failed to place order';
            
            // Provide more specific error messages when available
            if (error.response?.data) {
                errorMessage += ': ' + error.response.data;
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            setErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchPaymentInfo = async (orderId) => {
        if (!orderId) return;
        
        setFetchingPayment(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await axios.get(
                `http://localhost:8080/api/payments/order/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200 && response.data) {
                setPaymentInfo(response.data);
                return response.data;
            } else {
                console.error('No payment information found');
                return null;
            }
        } catch (error) {
            console.error('Error fetching payment information:', error);
            return null;
        } finally {
            setFetchingPayment(false);
        }
    };

    const handlePayNowClick = async () => {
        // Set processing state
        setIsProcessingPayment(true);
        
        try {
            // If we don't have payment info yet, fetch it
            let paymentData = paymentInfo;
            if (!paymentData) {
                paymentData = await fetchPaymentInfo(orderId);
            }
            
            // If we have a payment link, update the order status and redirect
            if (paymentData && paymentData.link) {
                // Update the order status to indicate the user is proceeding to payment
                const token = localStorage.getItem('token');
                try {
                    console.log(`Updating order ${orderId} status to PENDING before redirecting to payment`);
                    await axios.patch(
                        `http://localhost:8080/api/orders/${orderId}`,
                        null,
                        { 
                            params: { paymentStatus: 'PENDING' },
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    console.log("Order status updated to PENDING");
                    
                    // Set local status immediately for better UX
                    setPaymentStatus('PENDING');
                    
                    // Redirect to payment gateway
                    console.log("Redirecting to payment URL:", paymentData.link);
                    window.location.href = paymentData.link;
                } catch (updateError) {
                    console.error("Error updating order status:", updateError);
                    // Continue anyway to not block payment
                    window.location.href = paymentData.link;
                }
            } else {
                // If for some reason we don't have a link, show an error
                alert('Payment link not available. Please refresh and try again.');
                // Try fetching the payment data again
                fetchPaymentInfo(orderId);
                setIsProcessingPayment(false);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            alert('There was an error processing your payment. Please try again.');
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        let intervalId;
        
        // If we have an order, check payment status periodically
        if (orderComplete && orderId) {
            const checkPaymentStatus = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `http://localhost:8080/api/orders/${orderId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (response.data && response.data.paymentStatus) {
                        setPaymentStatus(response.data.paymentStatus);
                        
                        // If paid, stop checking
                        if (response.data.paymentStatus === 'PAID') {
                            clearInterval(intervalId);
                        }
                    }
                } catch (error) {
                    console.error("Error checking payment status:", error);
                }
            };
            
            // Check immediately and then every 10 seconds
            checkPaymentStatus();
            intervalId = setInterval(checkPaymentStatus, 10000);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [orderComplete, orderId]);

    if (isLoading) {
        return <div className="loading">Loading checkout information...</div>;
    }

    // Update the order confirmation render section
    if (orderComplete) {
        return (
            <div className="checkout-page">
                <header className="checkout-header">
                    <div className="logo-container">
                        <Link to="/">
                            <img src={logo} alt="Sapatosan Logo" className="logo" />
                        </Link>
                    </div>
                    <div className="checkout-title">
                        <h1>Order Confirmation</h1>
                    </div>
                </header>
                
                <div className="order-confirmation">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>Your Order Has Been Placed!</h2>
                    <p>Order ID: <span className="order-id">{orderId}</span></p>
                    <p>A confirmation email has been sent to {formData.email}</p>
                    
                    <div className={`order-status-badge ${paymentStatus.toLowerCase()}`}>
                        Payment Status: <span>{paymentStatus}</span>
                    </div>
                    
                    <div className="confirmation-details">
                        <div className="confirmation-section">
                            <h3>Shipping Information</h3>
                            <div className="confirmation-info">
                                <p><strong>{formData.firstName} {formData.lastName}</strong></p>
                                <p>{formData.address}</p>
                                <p>{formData.postalCode}, {formData.country}</p>
                                <p>Phone: {formData.contactNumber}</p>
                            </div>
                        </div>
                        
                        <div className="confirmation-section">
                            <h3>Order Summary</h3>
                            <div className="confirmation-items">
                                {cart.map((item, index) => (
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
                            </div>
                            <div className="confirmation-totals">
                                <div className="total-line">
                                    <span>Subtotal:</span>
                                    <span>₱{calculateSubtotal().toFixed(2)}</span>
                                </div>
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
                    
                    <div className="payment-section">
                        <h3>Complete Your Payment</h3>
                        <p>Please proceed to pay for your order.</p>
                        
                        <div className="payment-methods">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="payment-logo" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="payment-logo" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" className="payment-logo" />
                        </div>
                        
                        <div className="payment-actions">
                            <button 
                                onClick={handlePayNowClick} 
                                className="pay-now-btn"
                                disabled={fetchingPayment || isProcessingPayment}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                {isProcessingPayment ? 'Processing...' : 
                                 fetchingPayment ? 'Loading...' : 'Pay Now'}
                            </button>
                            
                            <Link to="/" className="continue-shopping-link">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
                
                <footer className="footer">
                    <div className="footer-bottom">
                        <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <div className="checkout-title">
                    {/* Removed the h1 element containing "Checkout" text */}
                </div>
                <div className="back-to-cart">
                    <Link to="/casual">
                        <i className="fas fa-arrow-left"></i> Back to Shopping
                    </Link>
                </div>
            </header>
            
            <div className="checkout-content">
                <div className="checkout-form-container">
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        <h2>Shipping Information</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    value={formData.firstName}
                                    disabled={true}
                                    className={errors.firstName ? 'error disabled' : 'disabled'}
                                />
                                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    value={formData.lastName}
                                    disabled={true}
                                    className={errors.lastName ? 'error disabled' : 'disabled'}
                                />
                                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email}
                                disabled={true}
                                className={errors.email ? 'error disabled' : 'disabled'}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        
                       <div className="form-group">
    <label htmlFor="contactNumber">Contact Number</label>
    <input 
        type="text" 
        id="contactNumber" 
        name="contactNumber" 
        value={formData.contactNumber}
        onChange={handleInputChange}
        className={errors.contactNumber ? 'error' : ''}
    />
    {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
</div>
                        
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                value={formData.address}
                                onChange={handleInputChange}
                                className={errors.address ? 'error' : ''}
                            />
                            {errors.address && <span className="error-message">{errors.address}</span>}
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="postalCode">Postal Code</label>
                                <input 
                                    type="text" 
                                    id="postalCode" 
                                    name="postalCode" 
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className={errors.postalCode ? 'error' : ''}
                                />
                                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <select 
                                    id="country" 
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                >
                                    <option value="Philippines">Philippines</option>
                                    <option value="United States">United States</option>
                                    <option value="Japan">Japan</option>
                                    <option value="South Korea">South Korea</option>
                                </select>
                            </div>
                        </div>
                        
                        <h2>Payment</h2>
                        <p className="payment-secure-text">All transactions are secure and encrypted.</p>

                        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

                        <button 
                            type="submit" 
                            className="pay-now-btn place-order-btn" 
                            disabled={isSubmitting}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            {isSubmitting ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>
                
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    
                    <div className="summary-items">
                        {cart.map((item, index) => (
                            <div key={index} className="summary-item">
                                <div className="summary-item-image">
                                    <img src={item.imageUrl} alt={item.name} />
                                </div>
                                <div className="summary-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="summary-item-size">Size: US {item.selectedSize}</p>
                                    <p className="summary-item-quantity">Quantity: {item.quantity}</p>
                                    <p className="summary-item-price">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="summary-totals">
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>₱{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax (12%)</span>
                            <span>₱{calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping</span>
                            <span>₱10.00</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total</span>
                            <span>₱{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Checkout;