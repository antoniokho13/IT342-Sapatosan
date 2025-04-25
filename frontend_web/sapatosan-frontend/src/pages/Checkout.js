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
        paymentMethod: 'credit_card',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCVC: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Load cart data from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('sapatosanCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            // Redirect to home if cart is empty
            navigate('/');
        }
        
        // Pre-fill email if user is logged in
        const savedEmail = localStorage.getItem('email');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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
    };

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
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
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
        
        // Payment validation
        if (formData.paymentMethod === 'credit_card') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
            else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
                newErrors.cardNumber = "Card number should be 16 digits";
                
            if (!formData.cardName.trim()) newErrors.cardName = "Name on card is required";
            if (!formData.cardExpiry.trim()) newErrors.cardExpiry = "Expiry date is required";
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) 
                newErrors.cardExpiry = "Format should be MM/YY";
                
            if (!formData.cardCVC.trim()) newErrors.cardCVC = "CVC is required";
            else if (!/^\d{3,4}$/.test(formData.cardCVC)) 
                newErrors.cardCVC = "CVC should be 3-4 digits";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        // Simulate API call with timeout
        setTimeout(() => {
            // Generate random order ID
            const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
            setOrderId(generatedOrderId);
            setOrderComplete(true);
            
            // Clear cart from localStorage
            localStorage.removeItem('sapatosanCart');
            
            setIsSubmitting(false);
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="checkout-page">
                <header className="checkout-header">
                    <div className="logo-container">
                        <Link to="/">
                            <img src={logo} alt="Sapatosan Logo" className="logo" />
                        </Link>
                    </div>
                </header>
                
                <div className="order-confirmation">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>Order Complete!</h2>
                    <p>Your order has been placed successfully.</p>
                    <p>Order ID: <span className="order-id">{orderId}</span></p>
                    <p>A confirmation email has been sent to {formData.email}</p>
                    <div className="confirmation-details">
                        <h3>Order Summary</h3>
                        <div className="confirmation-items">
                            {cart.map((item, index) => (
                                <div key={index} className="confirmation-item">
                                    <div className="item-name">
                                        {item.name} <span>(US {item.selectedSize})</span>
                                    </div>
                                    <div className="item-price">${item.price.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="confirmation-totals">
                            <div className="total-line">
                                <span>Subtotal:</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="total-line">
                                <span>Tax (12%):</span>
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
                    <Link to="/" className="return-home">
                        Return to Home
                    </Link>
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
                                    onChange={handleInputChange}
                                    className={errors.firstName ? 'error' : ''}
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
                                    onChange={handleInputChange}
                                    className={errors.lastName ? 'error' : ''}
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
                                onChange={handleInputChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
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
                                <label htmlFor="city">City</label>
                                <input 
                                    type="text" 
                                    id="city" 
                                    name="city" 
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className={errors.city ? 'error' : ''}
                                />
                                {errors.city && <span className="error-message">{errors.city}</span>}
                            </div>
                            
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
                        
                        <h2>Payment</h2>
                        <p className="payment-secure-text">All transactions are secure and encrypted.</p>

                        <div className="payment-container">
                            <div className="payment-header">
                                <span className="payment-provider">Secure Payments via PayMongo</span>
                                <div className="payment-icons">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1024px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" />
                                    <img src="https://1000logos.net/wp-content/uploads/2021/05/Grab-logo.png" alt="GrabPay" />
                                    <span className="more-payment-methods">+8</span>
                                </div>
                            </div>
                            
                            <div className="payment-redirect-info">
                                <div className="redirect-icon">
                                    <img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" alt="Redirect" />
                                </div>
                                <p className="redirect-text">
                                    After clicking "Pay now", you will be redirected to Secure Payments via PayMongo to complete your purchase securely.
                                </p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="place-order-btn" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Pay now'}
                        </button>
                    </form>
                </div>
                
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    
                    <div className="summary-items">
                        {cart.map((item, index) => (
                            <div key={index} className="summary-item">
                                <div className="summary-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="summary-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="summary-item-size">Size: US {item.selectedSize}</p>
                                    <p className="summary-item-price">${item.price.toFixed(2)}</p>
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