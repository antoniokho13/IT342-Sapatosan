import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Running.css';
import logo from '../assets/images/logo.png';

const Running = () => {
    // State for cart with localStorage persistence
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('sapatosanCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    
    // UI state variables
    const [quickViewShoe, setQuickViewShoe] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [userInfo, setUserInfo] = useState({ email: localStorage.getItem('email') || '' });
    
    // Product data state
    const [runningShoes, setRunningShoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch products from backend
    useEffect(() => {
        const fetchRunningShoes = async () => {
            try {
                setLoading(true);
                
                const token = localStorage.getItem('token');
                console.log("Fetching products with token:", token ? "Token exists" : "No token");
                
                const runningCategoryId = "-ONPHD1YnHGCH_07BXTO";
                
                // Only add Authorization if token exists
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                
                const response = await axios.get(
                    `http://localhost:8080/api/products`,
                    { headers }
                );
                
                console.log("API response data:", response.data);
                
                if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                    setError("No products found or invalid data format received");
                    setLoading(false);
                    return;
                }
                
                const runningProducts = response.data.filter(product => 
                    product.categoryId === runningCategoryId
                );
                
                if (runningProducts.length === 0) {
                    setError("No running shoes found");
                    setLoading(false);
                    return;
                }
                
                const processedShoes = runningProducts.map(shoe => ({
                    ...shoe,
                    price: shoe.price / 100,
                    sizes: [7, 8, 9, 10, 11, 12],
                    description: shoe.description || `Premium ${shoe.brand} running shoes designed for performance and comfort.`,
                    imageUrl: shoe.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'
                }));
                
                console.log("Processed running shoes:", processedShoes);
                setRunningShoes(processedShoes);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch running products:', err);
                setError(`Failed to load running shoes: ${err.message}. Please try again later.`);
                setLoading(false);
            }
        };
        
        fetchRunningShoes();
    }, []);

    // Cart functions
    const addToCart = async (shoe, size, quantity) => {
        // Check if user is logged in
        if (!localStorage.getItem('token')) {
            // Redirect to login page with return URL
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        // Prepare the cart product data
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage
        const shoeWithDetails = { ...shoe, selectedSize: size, quantity };
        const cartProduct = {
            productId: shoeWithDetails.id,
            quantity: shoeWithDetails.quantity, // Quantity selected by the user
            cartId: userId, // Use userId as cartId
        };

        try {
            // Send the cart product to the backend
            const response = await axios.post(
                'http://localhost:8080/api/carts/products',
                cartProduct,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // Update the local cart state
                const existingProductIndex = cart.findIndex(
                    (item) => item.id === shoeWithDetails.id && item.selectedSize === size
                );

                if (existingProductIndex !== -1) {
                    // Update quantity if the product already exists in the cart
                    const updatedCart = [...cart];
                    updatedCart[existingProductIndex].quantity += quantity;
                    setCart(updatedCart);
                    localStorage.setItem('sapatosanCart', JSON.stringify(updatedCart));
                } else {
                    // Add new product to the cart
                    const newCart = [...cart, shoeWithDetails];
                    setCart(newCart);
                    localStorage.setItem('sapatosanCart', JSON.stringify(newCart));
                }

                // Close the modal
                setQuickViewShoe(null);
                setSelectedSize(null);
            } else {
                console.error('Failed to add to cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('sapatosanCart', JSON.stringify(newCart));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const toggleCart = () => {
        setShowCart(!showCart);
        // If we're opening the cart, close any other modals
        if (!showCart) {
            setQuickViewShoe(null);
        }
    };

    const openQuickView = (shoe) => {
        setQuickViewShoe(shoe);
        setSelectedSize(null); // Reset the selected size
        setShowCart(false); // Close the cart if it's open
    };

    const closeQuickView = () => {
        setQuickViewShoe(null);
        setSelectedSize(null);
    };

    // Add logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setUserInfo({ email: '' });
    };

    // Checkout handler
    const handleCheckout = () => {
        // Check if user is logged in
        if (!localStorage.getItem('token')) {
            // Redirect to login page with return URL
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        // Save cart to session for checkout page
        localStorage.setItem('checkoutItems', localStorage.getItem('sapatosanCart'));
        
        // Navigate to checkout page
        window.location.href = '/checkout';
    };

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickViewShoe && !event.target.closest('.quick-view-modal-content') && !event.target.closest('.quick-view')) {
                closeQuickView();
            }
            if (showCart && !event.target.closest('.cart-modal-content')) {
                setShowCart(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [quickViewShoe, showCart, showDropdown]);

    // Animation for sections
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });

        const sections = document.querySelectorAll('.hero-section, .products-grid');
        sections.forEach(section => {
            observer.observe(section);
        });

        return () => {
            sections.forEach(section => {
                observer.unobserve(section);
            });
        };
    }, []);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (quickViewShoe || showCart) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [quickViewShoe, showCart]);

    // Handle storage changes for cart sync
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'sapatosanCart') {
                const updatedCart = e.newValue ? JSON.parse(e.newValue) : [];
                setCart(updatedCart);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <div className="running-page">
            {/* Header */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/basketball" className="nav-link">Basketball</Link>
                    <Link to="/casual" className="nav-link">Casual</Link>
                    <Link to="/running" className="nav-link active">Running</Link>
                </nav>
                <div className="auth-buttons">
                    {localStorage.getItem('token') ? (
                        <>
                            <div className="header-cart-icon" onClick={toggleCart}>
                                <i className="fas fa-shopping-cart"></i>
                                <span className="header-cart-count">{cart.length}</span>
                            </div>
                            
                            <div className="user-dropdown" ref={dropdownRef}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="user-avatar-button"
                                >
                                    <div className="user-avatar">
                                        {(userInfo.email || localStorage.getItem('email') || 'U').charAt(0)}
                                    </div>
                                </button>
                                
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-header-title">Signed in as</div>
                                            <div className="dropdown-header-email">
                                                {userInfo.email || localStorage.getItem('email')}
                                            </div>
                                        </div>
                                        
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <i className="fas fa-user dropdown-item-icon"></i>
                                            My Account
                                        </Link>
                                        
                                        <button 
                                            onClick={() => {
                                                handleLogout();
                                                setShowDropdown(false);
                                            }} 
                                            className="dropdown-item-button"
                                        >
                                            <i className="fas fa-sign-out-alt dropdown-item-icon"></i>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/register" className="auth-button">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            Join Us
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>RUNNING SHOES</h1>
                    <p>Advanced technology and comfort for every runner.</p>
                </div>
            </section>


            {/* Products Grid */}
            <section className="products-section">
                <div className="products-grid">
                    {loading && <div className="loading-spinner">Loading products...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && runningShoes.length === 0 && (
                        <div className="no-products-message">No running shoes available.</div>
                    )}

                    {!loading && !error && runningShoes.length > 0 && (
                        <>
                            {runningShoes.map((shoe) => (
                                <div className="product-card" id={`shoe-${shoe.id}`} key={shoe.id}>
                                    <div className="product-image">
                                        <img src={shoe.imageUrl} alt={shoe.name} />
                                        <div className="quick-view" onClick={() => openQuickView(shoe)}>Quick View</div>
                                    </div>
                                    <div className="product-details">
                                        <div className="product-brand">{shoe.brand}</div>
                                        <h3 className="product-name">{shoe.name}</h3>
                                        <div className="product-price">${shoe.price.toFixed(2)}</div>
                                        <div className="product-sizes">
                                            {shoe.sizes.map(size => (
                                                <span className="size-option" key={size}>US {size}</span>
                                            ))}
                                        </div>
                                        <button 
                                            className="add-to-cart"
                                            onClick={() => openQuickView(shoe)} // Open the Quick View Modal
                                        >
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            Add to Cart
                                        </button>
                                        <div className="added-notification">Added to Cart</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </section>

            {/* Quick View Modal */}
            {quickViewShoe && (
                <div className="quick-view-modal">
                    <div className="quick-view-modal-content">
                        <button className="close-modal" onClick={closeQuickView}>×</button>
                        <div className="modal-product-details">
                            <div className="modal-product-image">
                                <img src={quickViewShoe.imageUrl} alt={quickViewShoe.name} />
                            </div>
                            <div className="modal-product-info">
                                <div className="modal-product-brand">{quickViewShoe.brand}</div>
                                <h2 className="modal-product-name">{quickViewShoe.name}</h2>
                                <div className="modal-product-price">${quickViewShoe.price.toFixed(2)}</div>
                                <p className="modal-product-description">{quickViewShoe.description}</p>
                                
                                <div className="modal-size-selection">
                                    <h3>Select Size:</h3>
                                    <div className="modal-sizes">
                                        {quickViewShoe.sizes.map(size => (
                                            <span 
                                                key={size} 
                                                className={`modal-size-option ${selectedSize === size ? 'selected' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                US {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-quantity-selection">
                                    <h3>Select Quantity:</h3>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quickViewShoe.quantity || 1}
                                        onChange={(e) => setQuickViewShoe({ ...quickViewShoe, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                
                                <button 
                                    className={`modal-add-to-cart ${!selectedSize ? 'disabled' : ''}`}
                                    onClick={() => selectedSize ? addToCart(quickViewShoe, selectedSize, quickViewShoe.quantity || 1) : null}
                                    disabled={!selectedSize}
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    {selectedSize ? 'Add to Cart' : 'Select a Size'}
                                </button>
                                
                                {!selectedSize && (
                                    <p className="size-warning">Please select a size</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shopping Cart Modal */}
            {showCart && (
                <div className="cart-modal">
                    <div className="cart-modal-content">
                        <button className="close-modal" onClick={() => setShowCart(false)}>×</button>
                        <h2>Your Shopping Cart</h2>
                        
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <i className="fas fa-shopping-cart"></i>
                                <p>Your cart is empty</p>
                                <button 
                                    className="continue-shopping" 
                                    onClick={() => setShowCart(false)}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map((item, index) => (
                                        <div key={index} className="cart-item">
                                            <div className="cart-item-image">
                                                <img src={item.imageUrl || item.image} alt={item.name} />
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>{item.name}</h3>
                                                <p className="cart-item-brand">{item.brand}</p>
                                                <p className="cart-item-size">Size: US {item.selectedSize}</p>
                                                <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                                                <p className="cart-item-price">
                                                    ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                            <button 
                                                className="remove-item" 
                                                onClick={() => removeFromCart(index)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="cart-summary">
                                    <div className="cart-total">
                                        <span>Total:</span>
                                        <span>${calculateTotal()}</span>
                                    </div>
                                    <div className="cart-actions">
                                        <button 
                                            className="continue-shopping" 
                                            onClick={() => setShowCart(false)}
                                        >
                                            Continue Shopping
                                        </button>
                                        <button className="checkout" onClick={handleCheckout}>
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
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

export default Running;