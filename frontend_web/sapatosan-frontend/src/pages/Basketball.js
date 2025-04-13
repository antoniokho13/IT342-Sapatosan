import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Basketball.css';
import logo from '../assets/images/logo.png';

// Import basketball shoe images
import basketshoe1 from '../assets/images/basketball/Anthony Edwards 1.png';
import basketshoe2 from '../assets/images/basketball/Harden Volume 8 Unisex.png';
import basketshoe3 from '../assets/images/basketball/Kobe A.D. Igloo.png';
import basketshoe4 from '../assets/images/basketball/Nike KD16 Ember Glow.png';
import basketshoe5 from '../assets/images/basketball/Nike KD17 Flight To Paris Deep Royal Blue.png';
import basketshoe6 from '../assets/images/basketball/Nike LeBron 21 World Is Your Oyster.png';
import basketshoe7 from '../assets/images/basketball/Nike Mens G.T. Cut Academy.png';
import basketshoe8 from '../assets/images/basketball/NIKE PRECISION 7 MENS.png';
import basketshoe9 from '../assets/images/basketball/Nike Womens Sabrina 2 EP.png';
import basketshoe10 from '../assets/images/basketball/Nike Zoom Freak 1 All Star Employee Of The Month.png';

const Basketball = () => {
    const [cart, setCart] = useState([]);
    const [quickViewShoe, setQuickViewShoe] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showCart, setShowCart] = useState(false); // State to control cart modal visibility
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [userInfo, setUserInfo] = useState({ email: localStorage.getItem('email') || '' });

    // Basketball shoe data with your real images (ratings removed)
    const basketballShoes = [
        {
            id: 1,
            name: "Nike Anthony Edwards 1",
            price: 120.00,
            image: basketshoe1,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12, 13],
            description: "The Nike Anthony Edwards 1 is the first signature shoe for the rising NBA star. Featuring responsive cushioning and excellent court feel."
        },
        {
            id: 2,
            name: "Harden Volume 8 Unisex",
            price: 140.00,
            image: basketshoe2,
            brand: "Adidas",
            sizes: [7, 8, 9, 10, 11, 12],
            description: "The Harden Volume 8 is designed for James Harden's deceptive, change-of-pace game. Enhanced traction pattern for explosive moves."
        },
        {
            id: 3,
            name: "Kobe A.D. 'Igloo'",
            price: 160.00,
            image: basketshoe3,
            brand: "Nike",
            sizes: [8, 9, 10, 11, 12],
            description: "The Kobe A.D. 'Igloo' offers a lightweight, responsive design with Zoom Air cushioning. Perfect for players seeking agility and speed."
        },
        {
            id: 4,
            name: "Nike KD16 Ember Glow",
            price: 150.00,
            image: basketshoe4,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12, 13],
            description: "The KD16 Ember Glow features a full-length Zoom Air Strobel unit directly stitched to the upper for maximum responsiveness."
        },
        {
            id: 5,
            name: "Nike KD17 Flight To Paris",
            price: 180.00,
            image: basketshoe5,
            brand: "Nike",
            sizes: [8, 9, 10, 11, 12],
            description: "The KD17 Flight To Paris edition celebrates the 2024 Olympics with a special colorway and enhanced cushioning system."
        },
        {
            id: 6,
            name: "Nike LeBron 21 World Is Your Oyster",
            price: 200.00,
            image: basketshoe6,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11],
            description: "The LeBron 21 features a dual-chambered Air unit and a Zoom Air unit in the forefoot for ultimate impact protection and responsiveness."
        },
        {
            id: 7,
            name: "Nike Men's G.T. Cut Academy",
            price: 160.00,
            image: basketshoe7,
            brand: "Nike",
            sizes: [8, 9, 10, 11, 12, 13],
            description: "The G.T. Cut Academy is designed for cutting and changing direction with multidirectional traction and low-to-the-ground feel."
        },
        {
            id: 8,
            name: "NIKE PRECISION 7 MEN'S",
            price: 90.00,
            image: basketshoe8,
            brand: "Nike",
            sizes: [7.5, 8, 9, 10, 11, 12],
            description: "The Precision 7 offers reliable traction and cushioning at an affordable price point. Perfect for indoor and outdoor courts."
        },
        {
            id: 9,
            name: "Nike Women's Sabrina 2 EP",
            price: 130.00,
            image: basketshoe9,
            brand: "Nike",
            sizes: [5, 6, 7, 8, 9, 10],
            description: "Sabrina Ionescu's signature shoe built for quick cuts and explosive first steps. Features React foam for all-day comfort."
        },
        {
            id: 10,
            name: "Nike Zoom Freak 1 All Star",
            price: 170.00,
            image: basketshoe10,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12, 13],
            description: "Giannis Antetokounmpo's first signature shoe with double-stacked Zoom Air units in the heel for explosive power and stability."
        }
    ];

    const addToCart = (shoe, size = null) => {
        const shoeWithSize = size ? {...shoe, selectedSize: size} : {...shoe, selectedSize: shoe.sizes[0]};
        setCart([...cart, shoeWithSize]);
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setUserInfo({ email: '' });
    };

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickViewShoe && !event.target.closest('.quick-view-modal-content') && !event.target.closest('.quick-view')) {
                closeQuickView();
            }
            if (showCart && !event.target.closest('.cart-modal-content') && !event.target.closest('.cart-indicator')) {
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

    return (
        <div className="basketball-page">
            {/* Header - same as Home.js */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/basketball" className="nav-link active">Basketball</Link>
                    <Link to="/casual" className="nav-link">Casual</Link>
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

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>BASKETBALL SHOES</h1>
                    <p>Elevate your game with our premium selection of basketball shoes.</p>
                    <div className="cart-indicator" onClick={toggleCart}>
                        <span className="cart-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </span>
                        <span className="cart-count">{cart.length}</span>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="filter-bar">
                <div className="filter-container">
                    <div className="filter-group">
                        <label>Brand:</label>
                        <select>
                            <option value="">All Brands</option>
                            <option value="Nike">Nike</option>
                            <option value="Adidas">Adidas</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Size:</label>
                        <select>
                            <option value="">All Sizes</option>
                            <option value="5">US 5</option>
                            <option value="6">US 6</option>
                            <option value="7">US 7</option>
                            <option value="8">US 8</option>
                            <option value="9">US 9</option>
                            <option value="10">US 10</option>
                            <option value="11">US 11</option>
                            <option value="12">US 12</option>
                            <option value="13">US 13</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Price:</label>
                        <select>
                            <option value="">All Prices</option>
                            <option value="90-130">$90 - $130</option>
                            <option value="130-160">$130 - $160</option>
                            <option value="160-200">$160 - $200</option>
                        </select>
                    </div>
                    <button className="filter-button">Apply Filters</button>
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-section">
                <div className="products-grid">
                    {basketballShoes.map((shoe) => (
                        <div className="product-card" id={`shoe-${shoe.id}`} key={shoe.id}>
                            <div className="product-image">
                                <img src={shoe.image} alt={shoe.name} />
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
                </div>
            </section>

            {/* Quick View Modal */}
            {quickViewShoe && (
                <div className="quick-view-modal">
                    <div className="quick-view-modal-content">
                        <button className="close-modal" onClick={closeQuickView}>×</button>
                        <div className="modal-product-details">
                            <div className="modal-product-image">
                                <img src={quickViewShoe.image} alt={quickViewShoe.name} />
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
                                                <img src={item.image} alt={item.name} />
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
                                        <button className="checkout">
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer - same as Home.js */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Basketball;