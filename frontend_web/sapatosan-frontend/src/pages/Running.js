import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Running.css';
import logo from '../assets/images/logo.png';

// Import running shoe images
import running1 from '../assets/images/running/Nike InfinityRN 4 Mens Road.png';
import running2 from '../assets/images/running/Nike Interact Run SE Mens Road.png';
import running3 from '../assets/images/running/Nike Invincible 3 Mens Road.png';
import running4 from '../assets/images/running/Nike Pegasus 41 Electric Older Kids Road.png';
import running5 from '../assets/images/running/Nike Pegasus 41 Mens Road.png';
import running6 from '../assets/images/running/Nike Pegasus 41 Premium Mens Road.png';
import running7 from '../assets/images/running/Nike Pegasus Easy On Blueprint.png';
import running8 from '../assets/images/running/Nike Revolution 7 EasyOn Womens Easy On Off Road.png';
import running9 from '../assets/images/running/Nike Revolution 7 Mens Road.png';
import running10 from '../assets/images/running/Nike Zoom Air Running Shoes.png';

const Running = () => {
    const [cart, setCart] = useState([]);
    const [quickViewShoe, setQuickViewShoe] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    
    // Running shoe data with your real images
    // Running shoe data with your real images
const runningShoes = [
    {
        id: 1,
        name: "Nike InfinityRN 4 Mens Road",
        price: 160.00,
        image: running1,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The Nike InfinityRN 4 delivers exceptional stability and cushioning for everyday runs. Featuring Nike React foam for responsive support and a cushioned feel with every stride."
    },
    {
        id: 2,
        name: "Nike Interact Run SE Mens Road",
        price: 120.00,
        image: running2,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12],
        description: "The Nike Interact Run SE combines lightweight design with adaptive cushioning. Perfect for casual runners seeking comfort and responsive performance on road surfaces."
    },
    {
        id: 3,
        name: "Nike Invincible 3 Mens Road",
        price: 180.00,
        image: running3,
        brand: "Nike",
        sizes: [8, 9, 10, 11, 12],
        description: "The Nike Invincible 3 offers ultimate cushioning with ZoomX foam for maximum shock absorption. Designed for long training runs with enhanced stability and comfort."
    },
    {
        id: 4,
        name: "Nike Pegasus 41 Electric Older Kids Road",
        price: 110.00,
        image: running4,
        brand: "Nike",
        sizes: [3, 4, 5, 6, 7],
        description: "The Nike Pegasus 41 Electric is designed specifically for growing runners. Features responsive cushioning and durable construction in a vibrant colorway that kids will love."
    },
    {
        id: 5,
        name: "Nike Pegasus 41 Mens Road",
        price: 130.00,
        image: running5,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The Nike Pegasus 41 continues the legacy of the workhorse with versatile performance. Nike React foam and Zoom Air unit provide responsive cushioning for everyday runs."
    },
    {
        id: 6,
        name: "Nike Pegasus 41 Premium Mens Road",
        price: 150.00,
        image: running6,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12],
        description: "The Nike Pegasus 41 Premium elevates the classic design with premium materials and enhanced comfort features. Perfect balance of cushioning and responsiveness for serious runners."
    },
    {
        id: 7,
        name: "Nike Pegasus Easy On Blueprint",
        price: 140.00,
        image: running7,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The Nike Pegasus Easy On Blueprint features a FlyEase entry system for quick, hands-free access. Maintains the Pegasus cushioning and support with added accessibility."
    },
    {
        id: 8,
        name: "Nike Revolution 7 EasyOn Womens Easy On Off Road",
        price: 85.00,
        image: running8,
        brand: "Nike",
        sizes: [5, 6, 7, 8, 9, 10, 11],
        description: "The Nike Revolution 7 EasyOn provides a hands-free entry system designed specifically for women. Lightweight cushioning with a soft, breathable upper for comfortable daily runs."
    },
    {
        id: 9,
        name: "Nike Revolution 7 Mens Road",
        price: 80.00,
        image: running9,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        description: "The Nike Revolution 7 offers lightweight cushioning at an affordable price point. Breathable mesh upper and soft foam midsole provide comfort for everyday running and training."
    },
    {
        id: 10,
        name: "Nike Zoom Air Running Shoes",
        price: 170.00,
        image: running10,
        brand: "Nike",
        sizes: [7, 8, 9, 10, 11, 12],
        description: "The Nike Zoom Air Running Shoes feature responsive Zoom Air cushioning for explosive propulsion. Engineered for speed with a lightweight design and secure fit for race day performance."
    }
];

    const addToCart = (shoe, size = null) => {
        const shoeWithSize = size ? {...shoe, selectedSize: size} : shoe;
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

    const openQuickView = (shoe) => {
        setQuickViewShoe(shoe);
        setSelectedSize(null);
    };

    const closeQuickView = () => {
        setQuickViewShoe(null);
        setSelectedSize(null);
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickViewShoe && !event.target.closest('.quick-view-modal-content') && !event.target.closest('.quick-view')) {
                closeQuickView();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [quickViewShoe]);

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
        if (quickViewShoe) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [quickViewShoe]);

    return (
        <div className="running-page">
            {/* Header - same as Home.js */}
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
                    <Link to="/register" className="auth-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Join Us
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>RUNNING SHOES</h1>
                    <p>Advanced technology and comfort for every runner.</p>
                    <div className="cart-indicator">
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
                            <option value="Brooks">Brooks</option>
                            <option value="Hoka">Hoka</option>
                            <option value="ASICS">ASICS</option>
                            <option value="New Balance">New Balance</option>
                            <option value="Under Armour">Under Armour</option>
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
                            <option value="120-150">$120 - $150</option>
                            <option value="150-180">$150 - $180</option>
                            <option value="180-280">$180 - $280</option>
                        </select>
                    </div>
                    <button className="filter-button">Apply Filters</button>
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-section">
                <div className="products-grid">
                    {runningShoes.map((shoe) => (
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

            {/* Footer - same as Home.js */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Running;