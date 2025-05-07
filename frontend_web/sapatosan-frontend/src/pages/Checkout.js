import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
                const userResponse = await axios.get('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users', {
                 //   const userResponse = await axios.get('http://localhost:8080/api/users', {
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
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/user/${userId}`,
               // `http://localhost:8080/api/carts/user/${userId}`,
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
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
               // `http://localhost:8080/api/products`,
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
            // Make the API call to create an order
            const response = await axios.post(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders/from-cart/${userId}`,
               // `http://localhost:8080/api/orders/from-cart/${userId}`,
                orderData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.status === 200) {
                // Get the order ID from the response
                const orderId = response.data;
                
                // Clear cart from localStorage
                localStorage.removeItem('sapatosanCart');
                
                // Immediately fetch payment information and redirect
                try {
                    const paymentResponse = await axios.get(
                        `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/payments/order/${orderId}`,
                       // `http://localhost:8080/api/payments/order/${orderId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    
                    if (paymentResponse.status === 200 && paymentResponse.data && paymentResponse.data.link) {
                        // Redirect user directly to payment link
                        window.location.href = paymentResponse.data.link;
                    } else {
                        // If no payment link, show error
                        setErrors({ submit: 'Payment link not available. Please try again later.' });
                    }
                } catch (error) {
                    console.error('Error fetching payment link:', error);
                    setErrors({ submit: 'Could not retrieve payment information: ' + (error.response?.data || error.message) });
                }
            } else {
                setErrors({ submit: 'Failed to place order. Please try again.' });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            setErrors({ submit: 'Failed to place order: ' + (error.response?.data || error.message) });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add a function to fetch payment information
    const fetchPaymentInfo = async (orderId) => {
        if (!orderId) return;
        
        setFetchingPayment(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/payments/order/${orderId}`,
               // `http://localhost:8080/api/payments/order/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200 && response.data) {
                setPaymentInfo(response.data);
            } else {
                console.error('No payment information found');
            }
        } catch (error) {
            console.error('Error fetching payment information:', error);
        } finally {
            setFetchingPayment(false);
        }
    };

    // Handle payment button click
    const handlePayNowClick = async () => {
        if (!paymentInfo) {
            await fetchPaymentInfo(orderId);
        }
        
        // If we have payment link, navigate to it
        if (paymentInfo && paymentInfo.link) {
            window.open(paymentInfo.link, '_blank');
        } else {
            alert('Payment link not available. Please try again later.');
        }
    };

    if (isLoading) {
        return <div className="loading">Loading checkout information...</div>;
    }

    // Modify your orderComplete render section
    if (orderComplete) {
        return (
            <div className="checkout-page">
                <div className="order-confirmation">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>Order Complete!</h2>
                    <p>Order ID: <span className="order-id">{orderId}</span> • {formData.email}</p>
                    
                    <div className="confirmation-details">
                        <h3>Order Summary</h3>
                        <div className="confirmation-items">
                            {cart.map((item, index) => (
                                <div key={index} className="confirmation-item">
                                    <div className="item-name">
                                        {item.name} <span>({item.selectedSize})</span>
                                    </div>
                                    <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="confirmation-totals">
                            <div className="total-line">
                                <span>Subtotal:</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="total-line">
                                <span>Tax:</span>
                                <span>${calculateTax().toFixed(2)}</span>
                            </div>
                            <div className="total-line">
                                <span>Shipping:</span>
                                <span>$10.00</span>
                            </div>
                            <div className="total-line grand-total">
                                <span>Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-section">
                        <h3>Complete Your Purchase</h3>
                        <div className="payment-info">
                            <p>Click the button below for our secure payment gateway</p>
                            
                            <div className="payment-methods">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="payment-logo" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="payment-logo" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" className="payment-logo" />
                            </div>
                        </div>
                        
                        <div className="payment-actions">
                            <button 
                                onClick={handlePayNowClick} 
                                className="pay-now-btn"
                                disabled={fetchingPayment}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                {fetchingPayment ? 'Loading...' : 'Pay Now'}
                            </button>
                            
                            <Link to="/" className="continue-shopping-link">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
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
                            <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax (12%)</span>
                            <span>${calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping</span>
                            <span>$10.00</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
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