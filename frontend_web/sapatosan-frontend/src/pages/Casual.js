import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Casual.css';
import logo from '../assets/images/logo.png';

// Import casual shoe images
import casual1 from '../assets/images/casual/Air Jordan 1 Chicago.png';
import casual2 from '../assets/images/casual/Air Jordan 1 Retro High OG x Travis Scott Mocha.png';
import casual3 from '../assets/images/casual/Jordan 4 Manila.png';
import casual4 from '../assets/images/casual/MEXICO 66 MEN BLACKYELLOW.png';
import casual5 from '../assets/images/casual/Nike  DUNK LOW NN SUMMIT WHITEBLACK RASPBERRY.png';
import casual6 from '../assets/images/casual/Nike SB Dunk Low AE86 White Black.png';
import casual7 from '../assets/images/casual/ONITSUKA MEXICO 66  MEN  WHITEBLUE.png';
import { default as casual8, default as casual9 } from '../assets/images/casual/PULL_BEAR OCTANE 3000.png';
import casual10 from '../assets/images/casual/Supreme Nike SB Dunk Low Rammellzee.png';

const Casual = () => {
    const [cart, setCart] = useState([]);
    const [quickViewShoe, setQuickViewShoe] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showCart, setShowCart] = useState(false); // State to control cart modal visibility
    
    // Add user authentication states
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [userInfo, setUserInfo] = useState({ email: localStorage.getItem('email') || '' });
    
    // Casual shoe data with your real images
    const casualShoes = [
        {
            id: 1,
            name: "Air Jordan 1 Chicago",
            price: 180.00,
            image: casual1,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12],
            description: "The iconic Air Jordan 1 Chicago colorway, featuring the classic red, white, and black color scheme that started it all. A timeless silhouette that never goes out of style."
        },
        {
            id: 2,
            name: "Air Jordan 1 Retro High OG x Travis Scott",
            price: 250.00,
            image: casual2,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12],
            description: "The Travis Scott collaboration brings a unique backwards swoosh and earthy Mocha tones to the classic Air Jordan 1 silhouette. One of the most sought-after sneakers in recent years."
        },
        {
            id: 3,
            name: "Jordan 4 Manila",
            price: 225.00,
            image: casual3,
            brand: "Nike",
            sizes: [8, 9, 10, 11, 12],
            description: "The Jordan 4 Manila is an exclusive release celebrating Filipino culture. Features premium materials and a distinctive color palette that represents Manila's vibrant energy."
        },
        {
            id: 4,
            name: "Onitsuka Tiger Mexico 66 Black/Yellow",
            price: 120.00,
            image: casual4,
            brand: "Onitsuka Tiger",
            sizes: [6, 7, 8, 9, 10, 11],
            description: "The classic Onitsuka Tiger Mexico 66 in the iconic black and yellow Kill Bill colorway. Featuring the signature stripe design and vintage look with modern comfort."
        },
        {
            id: 5,
            name: "Nike Dunk Low NN Summit White/Black Raspberry",
            price: 110.00,
            image: casual5,
            brand: "Nike",
            sizes: [6, 7, 8, 9, 10, 11, 12],
            description: "The Nike Dunk Low in a fresh Summit White with Black and Raspberry accents. Clean lines and color-blocking make this a versatile addition to any sneaker collection."
        },
        {
            id: 6,
            name: "Nike SB Dunk Low AE86 White/Black",
            price: 130.00,
            image: casual6,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11],
            description: "Inspired by the legendary Toyota AE86 from Initial D, these Nike SB Dunks feature a clean white and black colorway that pays homage to the iconic drift machine."
        },
        {
            id: 7,
            name: "Onitsuka Tiger Mexico 66 White/Blue",
            price: 120.00,
            image: casual7,
            brand: "Onitsuka Tiger",
            sizes: [6, 7, 8, 9, 10, 11],
            description: "A classic silhouette in a crisp white and blue colorway, the Mexico 66 offers vintage style with modern comfort. Features the iconic Onitsuka Tiger stripes."
        },
        {
            id: 8,
            name: "Pull&Bear Octane 3000",
            price: 75.00,
            image: casual8,
            brand: "Pull&Bear",
            sizes: [6, 7, 8, 9, 10, 11, 12],
            description: "The Pull&Bear Octane 3000 offers contemporary street style at an accessible price point. Features a chunky sole and mixed material upper for a trendy look."
        },
        {
            id: 9,
            name: "Pull&Bear Octane 3000 Alt",
            price: 75.00,
            image: casual9,
            brand: "Pull&Bear",
            sizes: [6, 7, 8, 9, 10, 11],
            description: "An alternative colorway of the popular Octane 3000 model, featuring Pull&Bear's signature casual style with modern design elements and all-day comfort."
        },
        {
            id: 10,
            name: "Supreme x Nike SB Dunk Low Rammellzee",
            price: 200.00,
            image: casual10,
            brand: "Nike",
            sizes: [7, 8, 9, 10, 11, 12],
            description: "The Supreme x Nike SB collaboration honoring artist Rammellzee features unique graphics and premium materials. A collector's item that blends streetwear and skateboarding cultures."
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
        <div className="casual-page">
            {/* Updated Header */}
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

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>CASUAL SHOES</h1>
                    <p>Trendy styles for everyday comfort and streetwear fashion.</p>
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

            {/* Products Grid */}
            <section className="products-section">
                <div className="products-grid">
                    {casualShoes.map((shoe) => (
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

export default Casual;