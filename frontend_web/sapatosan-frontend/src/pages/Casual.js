import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Casual.css';
import logo from '../assets/images/logo.png';

const Casual = () => {
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
    const [casualShoes, setCasualShoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch products from backend
    useEffect(() => {
        const fetchCasualShoes = async () => {
            try {
                setLoading(true);
                
                const token = localStorage.getItem('token');
                console.log("Fetching products with token:", token ? "Token exists" : "No token");
                
                const casualCategoryId = "-ONPHLQWxGQo4o1_A17h";
                
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
                
                const casualProducts = response.data.filter(product => 
                    product.categoryId === casualCategoryId
                );
                
                if (casualProducts.length === 0) {
                    setError("No casual shoes found");
                    setLoading(false);
                    return;
                }
                
                const processedShoes = casualProducts.map(shoe => ({
                    ...shoe,
                    price: shoe.price / 100,
                    sizes: [7, 8, 9, 10, 11, 12],
                    description: shoe.description || `Premium ${shoe.brand} casual shoes designed for everyday style.`,
                    imageUrl: shoe.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'
                }));
                
                console.log("Processed casual shoes:", processedShoes);
                setCasualShoes(processedShoes);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch casual products:', err);
                setError(`Failed to load casual shoes: ${err.message}. Please try again later.`);
                setLoading(false);
            }
        };
        
        fetchCasualShoes();
    }, []);

    // The rest of your component remains the same

    // Cart functions
    const addToCart = (shoe, size = null) => {
        const shoeWithSize = size ? {...shoe, selectedSize: size} : {...shoe, selectedSize: shoe.sizes[0]};
        const newCart = [...cart, shoeWithSize];
        setCart(newCart);
        localStorage.setItem('sapatosanCart', JSON.stringify(newCart));
        
        // Show a temporary "Added to cart" message
        const shoeCard = document.getElementById(`shoe-${shoe.id}`);
        if (shoeCard) {
            shoeCard.classList.add('added-to-cart');
            setTimeout(() => {
                shoeCard.classList.remove('added-to-cart');
            }, 1000);
        }
        // Close modal if open
        if (quickViewShoe) {
            setQuickViewShoe(null);
            setSelectedSize(null);
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('sapatosanCart', JSON.stringify(newCart));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
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
        setSelectedSize(null);
        // Close cart if open
        setShowCart(false);
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

    // Close modals when clicking outside - update to include dropdown
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

    // Add this to your existing useEffect or create a new one
useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (e) => {
        if (e.key === 'sapatosanCart') {
            const updatedCart = e.newValue ? JSON.parse(e.newValue) : [];
            setCart(updatedCart);
        }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, []);

// Add similar code to Basketball.js and Running.js

    // Add this function near the other handler functions in Casual.js
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

    return (
        <div className="casual-page">
            {/* Header remains the same */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/basketball" className="nav-link">Basketball</Link>
                    <Link to="/casual" className="nav-link active">Casual</Link>
                    <Link to="/running" className="nav-link">Running</Link>
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

            {/* Hero Section remains the same */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>CASUAL SHOES</h1>
                    <p>Trendy styles for everyday comfort and streetwear fashion.</p>
                </div>
            </section>

            {/* Filter Bar remains the same */}
            <section className="filter-bar">
                <div className="filter-container">
                    <div className="filter-group">
                        <label>Brand:</label>
                        <select>
                            <option value="">All Brands</option>
                            <option value="Nike">Nike</option>
                            <option value="Onitsuka Tiger">Onitsuka Tiger</option>
                            <option value="Pull&Bear">Pull&Bear</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Size:</label>
                        <select>
                            <option value="">All Sizes</option>
                            <option value="6">US 6</option>
                            <option value="7">US 7</option>
                            <option value="8">US 8</option>
                            <option value="9">US 9</option>
                            <option value="10">US 10</option>
                            <option value="11">US 11</option>
                            <option value="12">US 12</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Price:</label>
                        <select>
                            <option value="">All Prices</option>
                            <option value="70-120">$70 - $120</option>
                            <option value="120-180">$120 - $180</option>
                            <option value="180-250">$180 - $250</option>
                        </select>
                    </div>
                    <button className="filter-button">Apply Filters</button>
                </div>
            </section>

            {/* Products Grid - Updated to use fetched data */}
            <section className="products-section">
                <div className="products-grid">
                    {loading && <div className="loading-spinner">Loading products...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && casualShoes.length === 0 && (
                        <div className="no-products-message">No casual shoes available.</div>
                    )}

                    {!loading && !error && casualShoes.length > 0 && (
                        <>
                            {casualShoes.map((shoe) => (
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
                                            onClick={() => addToCart(shoe)}
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

            {/* Quick View Modal - Updated to use imageUrl instead of image */}
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
                                
                                <button 
                                    className={`modal-add-to-cart ${!selectedSize ? 'disabled' : ''}`}
                                    onClick={() => selectedSize ? addToCart(quickViewShoe, selectedSize) : null}
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

            {/* Shopping Cart Modal - Updated to use imageUrl instead of image */}
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
                                                <img src={item.imageUrl} alt={item.name} />
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>{item.name}</h3>
                                                <p className="cart-item-brand">{item.brand}</p>
                                                <p className="cart-item-size">
                                                    Size: US {item.selectedSize}
                                                </p>
                                                <p className="cart-item-price">${item.price.toFixed(2)}</p>
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

            {/* Footer remains the same */}
        </div>
    );
};

export default Casual;