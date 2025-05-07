import axios from 'axios'; // Add this import for axios
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Home.css'; // Import the CSS file for styling
import adidas from '../assets/images/adidas.png'; // Import the Adidas logo
import anthony from '../assets/images/anthony.jpg'; // Import the image for Anthony Edwards
import antonio from '../assets/images/antonio.png'; // Import the image for Antonio Abangan Kho
import ja from '../assets/images/ja.jpg'; // Import the image for Ja Morant
import lebron from '../assets/images/lebron.jpg'; // Import the image for LeBron James
import logo from '../assets/images/logo.png'; // Import the logo
import mel from '../assets/images/mel.png'; // Import the image for Rommel John Pobadora
import nike from '../assets/images/nike.png'; // Import the Nike logo
import pullsnBear from '../assets/images/pullsnbear.png'; // Import the Pull&Bear logo
import puma from '../assets/images/puma.png'; // Import the Puma logo
import raymund from '../assets/images/raymund.png'; // Import the image for Raymund Laude
import teaser from '../assets/images/teaser.mp4';

const Home = () => {
    const [userInfo, setUserInfo] = useState({ email: '', name: '' });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    // Update cart state to match other pages
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('sapatosanCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [showCart, setShowCart] = useState(false);
    // Remove cartCount state as we'll use cart.length directly

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });

        const sections = document.querySelectorAll('.about-section, .featured-brands, .profile-section, .testimonials-section');
        sections.forEach(section => {
            observer.observe(section);
        });

        return () => {
            sections.forEach(section => {
                observer.unobserve(section);
            });
        };
    }, []);

    // Update the useEffect that fetches user data to also fetch cart data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedEmail = localStorage.getItem('email');
                
                if (token) {
                    console.log("Token found, attempting to fetch user data");
                    
                    // First, check if we already have the email stored from login
                    if (storedEmail) {
                        console.log("Email found in localStorage:", storedEmail);
                        setUserInfo({
                            email: storedEmail,
                            name: ''
                        });
                    }
                    
                    // Now fetch users to get additional data or verify the email
                    const response = await axios.get(
                        `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users`,
                       // `http://localhost:8080/api/users`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    console.log("API response:", response.data);
                    
                    // Find the current user by the email we stored during login
                    let userData = null;
                    if (Array.isArray(response.data) && storedEmail) {
                        userData = response.data.find(user => user.email === storedEmail);
                        console.log("User found by email?", !!userData);
                    }
                    
                    // If we couldn't find by stored email, we need to extract from token
                    if (!userData && Array.isArray(response.data)) {
                        // Try to decode the token - not ideal but better than using first user
                        try {
                            const tokenPayload = token.split('.')[1];
                            const decodedPayload = JSON.parse(atob(tokenPayload));
                            // Your JWT should contain the email according to LoginResponse.java and JwtUtil
                            const emailFromToken = decodedPayload.sub || decodedPayload.email;
                            console.log("Email from token:", emailFromToken);
                            
                            if (emailFromToken) {
                                userData = response.data.find(user => user.email === emailFromToken);
                                console.log("User found by token email?", !!userData);
                            }
                        } catch (e) {
                            console.error("Could not decode token:", e);
                        }
                    }
                    
                    // If we still don't have a user, use the one we currently have in localStorage
                    // Only fall back to first user as absolute last resort
                    if (!userData) {
                        if (Array.isArray(response.data) && response.data.length > 0) {
                            console.warn("Could not identify specific user, using first user in array");
                            userData = response.data[0];
                        } else if (!Array.isArray(response.data)) {
                            console.log("Response is a single user object");
                            userData = response.data;
                        }
                    }
                    
                    if (userData) {
                        setUserInfo({
                            email: userData.email,
                            name: userData.firstName ? `${userData.firstName} ${userData.lastName}` : ''
                        });
                        
                        // Update localStorage with the confirmed email
                        localStorage.setItem('email', userData.email);
                        console.log("User email set in state and localStorage:", userData.email);
                    }
                    
                    // After user data is fetched, fetch the cart data
                    fetchCartWithProducts();
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('email');
                    localStorage.removeItem('userId');
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Add this fetchCartWithProducts function to the Home component
const fetchCartWithProducts = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        console.log("No token or userId available");
        return;
    }

    try {
        // First, get the cart data
        const cartResponse = await axios.get(
            `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/user/${userId}`,
           // `http://localhost:8080/api/carts/user/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (cartResponse.status !== 200 || !cartResponse.data) {
            console.log('No cart found or empty cart');
            setCart([]);
            localStorage.setItem('sapatosanCart', JSON.stringify([]));
            return;
        }

        const cartData = cartResponse.data;
        const cartProductIds = Object.keys(cartData.cartProductIds || {});
        
        if (cartProductIds.length === 0) {
            console.log('Cart is empty');
            setCart([]);
            localStorage.setItem('sapatosanCart', JSON.stringify([]));
            return;
        }
        
        console.log("Cart product IDs:", cartProductIds);
        
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
        
        console.log("Products map created:", Object.keys(productsMap).length, "products");
        
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
        
        console.log("Final cart items:", cartItems);
        setCart(cartItems);
        localStorage.setItem('sapatosanCart', JSON.stringify(cartItems));
    } catch (error) {
        console.error('Error fetching cart with products:', error);
        setCart([]);
        localStorage.setItem('sapatosanCart', JSON.stringify([]));
    }
};

    // Update the toggleCart function to ensure fresh data is displayed
    const toggleCart = () => {
        // If we're opening the cart, refresh the data first
        if (!showCart) {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                console.log("Refreshing cart data before displaying");
                fetchCartWithProducts();
            }
        }
        
        setShowCart(!showCart);
    };

    // Add a removeFromCart function that works with the backend
    const removeFromCart = async (productId, selectedSize) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
    
        if (!token || !userId) {
            console.error('Missing authentication data');
            return;
        }
    
        try {
            const response = await axios.delete(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/${userId}/remove-product/${productId}`,
               // `http://localhost:8080/api/carts/${userId}/remove-product/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            if (response.status === 200) {
                console.log('Product removed from cart successfully');
                
                // Also update local storage to remove the item with specific size
                const currentCart = JSON.parse(localStorage.getItem('sapatosanCart') || '[]');
                const updatedCart = currentCart.filter(
                    item => !(item.id === productId && item.selectedSize === selectedSize)
                );
                
                localStorage.setItem('sapatosanCart', JSON.stringify(updatedCart));
                setCart(updatedCart);
                
                fetchCartWithProducts(); // Refresh the cart after removing
            } else {
                console.error('Failed to remove from cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    // Update the handleLogout function to also clear cart data
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post(
                    `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout`,
                   // `http://localhost:8080/api/auth/logout`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                localStorage.removeItem('userId');
                localStorage.removeItem('sapatosanCart');
                setCart([]);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Update the cart methods to match other pages
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

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

    // Add this useEffect to handle storage events (when cart changes in other tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'sapatosanCart') {
                const updatedCart = e.newValue ? JSON.parse(e.newValue) : [];
                setCart(updatedCart);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Update this effect for clicking outside all modals
    useEffect(() => {
        function handleClickOutside(event) {
            if (showCart && !event.target.closest('.cart-modal-content') && 
                !event.target.closest('.header-cart-icon')) {
                setShowCart(false);
            }
            
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCart, dropdownRef]);

    // Prevent body scrolling when cart is open
    useEffect(() => {
        if (showCart) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showCart]);

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const token = localStorage.getItem('token');
                const savedCart = localStorage.getItem('sapatosanCart');
                const cartItems = savedCart ? JSON.parse(savedCart) : [];

                if (token && cartItems.length > 0) {
                    // Fetch all products from the backend
                    const response = await axios.get('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products', {
                    // const response = await axios.get('http://localhost:8080/api/products', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.data && Array.isArray(response.data)) {
                        // Map cart items to include product details
                        const updatedCart = cartItems.map((cartItem) => {
                            const product = response.data.find((p) => p.id === cartItem.id);
                            return product
                                ? {
                                      ...cartItem,
                                      name: product.name,
                                      brand: product.brand,
                                      image: product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
                                      price: product.price / 100,
                                  }
                                : cartItem; // Keep the original cart item if no match is found
                        });

                        setCart(updatedCart);
                    }
                }
            } catch (error) {
                console.error('Error fetching cart data:', error);
            }
        };

        fetchCartData();
    }, []);

    return (
        <div>
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/#home" className="nav-link">Home</Link>
                    <Link to="/basketball" className="nav-link">Basketball</Link>
                    <Link to="/casual" className="nav-link">Casual</Link>
                    <Link to="/running" className="nav-link">Running</Link>
                </nav>
                <div className="auth-buttons">
                    {localStorage.getItem('token') ? (
                        <>
                            {/* Update the cart icon to be consistent */}
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

            {/* Replace the cart modal with the style from other pages */}
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
                                    {cart.length > 0 ? (
                                        cart.map((item, index) => (
                                            <div key={`${item.id}_${item.selectedSize}_${index}`} className="cart-item">
                                                <div className="cart-item-image">
                                                    <img src={item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.name || 'Product'} />
                                                </div>
                                                <div className="cart-item-details">
                                                    <h3>{item.name || 'Unknown Product'}</h3>
                                                    <p className="cart-item-brand">{item.brand || 'Unknown Brand'}</p>
                                                    <p className="cart-item-size">Size: US {item.selectedSize || '?'}</p>
                                                    <p className="cart-item-quantity">Quantity: {item.quantity || 0}</p>
                                                    <p className="cart-item-price">
                                                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button 
                                                    className="remove-item" 
                                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No items in cart</p>
                                    )}
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

            <section>
                <div className="video-container1">
                    <video className="video-teaser" autoPlay loop muted>
                        <source src={teaser} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </section>
            <section className="featured-brands">
                <h1>FEATURED BRANDS</h1>
                <div className="brands-logos">
                    <img src={adidas} alt="Adidas" className="brand-logo" />
                    <img src={nike} alt="Nike" className="brand-logo" />
                    <img src={puma} alt="Puma" className="brand-logo" />
                    <img src={pullsnBear} alt="Pull&Bear" className="brand-logo" />
                </div>
            </section>
            <section className="profile-section">
                <h1>OUR LEADERSHIP TEAM</h1>
                <div className="profile-cards">
                    <div className="card">
                        <div className="card-media">
                            <img src={mel} alt="Rommel John Pobadora" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>Rommel John Pobadora</h5>
                            <p>Frontend Developer</p>
                            <div className="social-links">
                                <a href="https://www.facebook.com/rommelmars123/" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://github.com/rommelmars" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-github"></i>
                                </a>
                                <a href="https://www.instagram.com/rommelmars/?hl=en" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-media">
                            <img src={raymund} alt="Raymund Laude" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>Raymund Laude</h5>
                            <p>Mobile Developer</p>
                            <div className="social-links">
                                <a href="https://www.facebook.com/laude.raymund" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://github.com/DMunKite-bit" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-github"></i>
                                </a>
                                <a href="https://www.instagram.com/raylaudee/?hl=en" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-media">
                            <img src={antonio} alt="Antonio Abangan Kho" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>Antonio Abangan Kho</h5>
                            <p>Backend Developer</p>
                            <div className="social-links">
                                <a href="https://www.facebook.com/antonio.a.kho/" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://github.com/antoniokho13?fbclid=IwZXh0bgNhZW0CMTEAAR38N6RvNDwfDWdZQg4dkPRWPSQ6yWCu2tmxKHqCLdawL7oKuq9-13empJk_aem_QHNpZKorW7bUXNlchqjMRg" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-github"></i>
                                </a>
                                <a href="https://www.instagram.com/" className="MuiIconButton-root" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="about-section">
                <h1>ABOUT US</h1>
                <p>
                    "Sapatosan" faces several challenges when managing diverse shoe lines, including basketball, running, casual, and soccer shoes. 
                    Balancing overstock and shortages across categories can be difficult. Returns and exchanges pose logistical challenges, as each 
                    type of shoe has different sizes and customer expectations. Marketing strategies must be tailored to gender and preferences, 
                    requiring a nuanced approach. At Sapatosan, we strive to balance customer demands with operational efficiency to provide a 
                    seamless shopping experience.
                </p>
            </section>
            <section className="testimonials-section">
                <h1>TESTIMONIES & REVIEWS</h1>
                <div className="profile-cards">
                    <div className="card">
                        <div className="card-media">
                            <img src={lebron} alt="LeBron James" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>LeBron James</h5>
                            <div className="star-rating">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                            <p>
                                "Sapatosan shoes provide the perfect blend of comfort and performance. Whether I'm on the court or off, they never let me down."
                            </p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-media">
                            <img src={anthony} alt="Anthony Edwards" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>Anthony Edwards</h5>
                            <div className="star-rating">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                            <p>
                                "The quality and style of Sapatosan shoes are unmatched. They give me the confidence to perform at my best every game."
                            </p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-media">
                            <img src={ja} alt="Ja Morant" className="card-img" />
                        </div>
                        <div className="card-content">
                            <h5>Ja Morant</h5>
                            <div className="star-rating">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                            </div>
                            <p>
                                "Sapatosan shoes are my go-to choice for both training and games. Their durability and comfort are top-notch."
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;