import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
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

    // Orders state variables
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState(null);
    
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
                    //`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
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
                
                // If user is logged in, fetch their cart
                if (token) {
                    fetchCartWithProducts(); // Use the new function
                }
            } catch (err) {
                console.error('Failed to fetch running products:', err);
                setError(`Failed to load running shoes: ${err.message}. Please try again later.`);
                setLoading(false);
            }
        };
        
        fetchRunningShoes();
    }, []);

    // Add this at the top of your component function
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
                //`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/user/${userId}`,
                `http://localhost:8080/api/carts/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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
            
            // Next, fetch ALL products (not just running) to find the ones in the cart
            const productsResponse = await axios.get(
                //`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
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

    // Update the fetchUserOrders function
    const fetchUserOrders = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            return;
        }
        
        setLoadingOrders(true);
        setOrderError(null);
        
        try {
            const response = await axios.get(
                `http://localhost:8080/api/orders/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                // Sort orders by date, newest first
                const sortedOrders = response.data.sort((a, b) => {
                    return new Date(b.orderDate) - new Date(a.orderDate);
                });
                setOrders(sortedOrders);
            } else {
                setOrderError("Failed to fetch orders");
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrderError("An error occurred while fetching your orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    // Add the checkOrderStatus function
    const checkOrderStatus = async (orderId) => {
        const token = localStorage.getItem('token');
        if (!token || !orderId) return null;
        
        try {
            const response = await axios.get(
                `http://localhost:8080/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200 && response.data) {
                return response.data;
            }
        } catch (error) {
            console.error(`Error checking status for order ${orderId}:`, error);
        }
        return null;
    };

    // Add the formatOrderDate function
    const formatOrderDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Add the polling useEffect
    useEffect(() => {
        let intervalId;
        
        // If we have orders and the orders modal is open, set up polling
        if (showOrders && orders.length > 0) {
            // Find orders that are in PENDING payment status
            const pendingOrders = orders.filter(
                order => order.paymentStatus === 'PENDING'
            );
            
            if (pendingOrders.length > 0) {
                // Poll every 10 seconds to check for status changes
                intervalId = setInterval(async () => {
                    let updatesFound = false;
                    
                    for (const order of pendingOrders) {
                        const updatedOrder = await checkOrderStatus(order.id);
                        
                        if (updatedOrder && updatedOrder.paymentStatus !== order.paymentStatus) {
                            updatesFound = true;
                            break;
                        }
                    }
                    
                    if (updatesFound) {
                        // If any order status changed, refresh all orders
                        fetchUserOrders();
                    }
                }, 10000); // Poll every 10 seconds
            }
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [showOrders, orders]);

    // Add function to toggle orders modal
    const toggleOrders = () => {
        // If we're opening the orders, refresh the data first
        if (!showOrders) {
            fetchUserOrders();
        }
        
        setShowOrders(!showOrders);
        // Close other modals
        if (!showOrders) {
            setQuickViewShoe(null);
            setShowCart(false);
        }
    };

    // Cart functions
    const addToCart = async (shoe, size, quantity) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            // Redirect to login page with return URL
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        try {
            // First, update the UI immediately for responsive experience
            const currentCart = JSON.parse(localStorage.getItem('sapatosanCart') || '[]');
            
            // Check if this product+size combination already exists
            const existingItemIndex = currentCart.findIndex(
                item => item.id === shoe.id && item.selectedSize === size
            );
            
            let updatedCart;
            if (existingItemIndex >= 0) {
                // Update existing item
                updatedCart = [...currentCart];
                updatedCart[existingItemIndex].quantity += (quantity || 1);
            } else {
                // Add as new item with size
                updatedCart = [...currentCart, {
                    ...shoe,
                    selectedSize: size,
                    quantity: quantity || 1
                }];
            }
            
            localStorage.setItem('sapatosanCart', JSON.stringify(updatedCart));
            setCart(updatedCart);

            // Then make the API call to sync with backend
            const cartProduct = {
                productId: shoe.id,
                quantity: quantity || 1,
            };

            console.log("Adding to cart:", cartProduct); // Debug

            const response = await axios.post(
                //`https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/${userId}/add-product`,
                `http://localhost:8080/api/carts/${userId}/add-product`,
                cartProduct,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                console.log('Product added to cart successfully');
            } else {
                console.error('Failed to add to cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const removeFromCart = async (productId, selectedSize) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
    
        if (!token || !userId) {
            console.error('Missing authentication data');
            return;
        }
    
        try {
            const response = await axios.delete(
               // `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/carts/${userId}/remove-product/${productId}`,
                `http://localhost:8080/api/carts/${userId}/remove-product/${productId}`,
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

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const toggleCart = () => {
        // If we're opening the cart, refresh the data first
        if (!showCart) {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                console.log("Refreshing cart data before displaying");
                fetchCartWithProducts(); // Use the new function
            }
        }
        
        setShowCart(!showCart);
        // Close other modals
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
        localStorage.removeItem('userId');
        localStorage.removeItem('sapatosanCart');
        setUserInfo({ email: '' });
        setCart([]);
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

    // Update the click outside handler to include orders modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickViewShoe && !event.target.closest('.quick-view-modal-content') && !event.target.closest('.quick-view')) {
                closeQuickView();
            }
            if (showCart && !event.target.closest('.cart-modal-content') && !event.target.closest('.cart-icon')) {
                setShowCart(false);
            }
            if (showOrders && !event.target.closest('.orders-modal-content') && !event.target.closest('.header-order-icon')) {
                setShowOrders(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [quickViewShoe, showCart, showOrders, showDropdown]);

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

    // Update the body scrolling effect to include orders modal
    useEffect(() => {
        if (quickViewShoe || showCart || showOrders) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [quickViewShoe, showCart, showOrders]);

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

    // Add initial fetch for orders
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
            fetchUserOrders();
        }
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
                            <div className="header-order-icon" onClick={toggleOrders}>
                                <i className="fas fa-box"></i>
                                <span className="header-order-count">{orders.length}</span>
                            </div>
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
                                        <div className="product-price">₱{shoe.price.toFixed(2)}</div>
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
                                <div className="modal-product-price">₱{quickViewShoe.price.toFixed(2)}</div>
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
                                    onClick={async () => {
                                        if (selectedSize) {
                                            await addToCart(quickViewShoe, selectedSize, quickViewShoe.quantity || 1);
                                            closeQuickView(); // Close the Quick View modal
                                        }
                                    }}
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
                                                        ₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
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
                                        <span>₱{calculateTotal()}</span>
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

            {/* Orders Modal */}
            {showOrders && (
                <div className="orders-modal">
                    <div className="orders-modal-content">
                        <button className="close-modal" onClick={() => setShowOrders(false)}>×</button>
                        <h2>Your Orders</h2>
                        
                        {loadingOrders && <div className="loading-spinner">Loading orders...</div>}
                        {orderError && <div className="error-message">{orderError}</div>}
                        
                        {!loadingOrders && !orderError && orders.length === 0 && (
                            <div className="empty-orders">
                                <i className="fas fa-box-open"></i>
                                <p>You don't have any orders yet</p>
                                <button 
                                    className="continue-shopping" 
                                    onClick={() => setShowOrders(false)}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                        
                        {!loadingOrders && !orderError && orders.length > 0 && (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-header">
                                            <div className="order-id">
                                                <span className="order-label">Order ID:</span> 
                                                <span className="order-value">{order.id}</span>
                                            </div>
                                            <div className="order-date">
                                                <span className="order-label">Date:</span> 
                                                <span className="order-value">
                                                    {formatOrderDate(order.orderDate)}
                                                </span>
                                            </div>
                                            <div className="order-status">
                                                <span className={`status-badge ${order.status?.toLowerCase() || 'unknown'}`}>
                                                    {order.status || 'UNKNOWN'}
                                                </span>
                                                <span className={`payment-badge ${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                                                    {order.paymentStatus === 'PAID' ? 'PAYMENT COMPLETED' :
                                                     order.paymentStatus === 'PENDING' ? 'AWAITING PAYMENT' :
                                                     'PAYMENT REQUIRED'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-details">
                                            <div className="delivery-address">
                                                <h4>Shipping To:</h4>
                                                <p>{order.firstName} {order.lastName}</p>
                                                <p>{order.address}</p>
                                                <p>{order.postalCode}, {order.country}</p>
                                            </div>
                                            <div className="order-price">
                                                <h4>Total:</h4>
                                                <p className="order-total">₱{order.totalAmount?.toFixed(2) || '0.00'}</p>
                                                
                                                {order.paymentStatus === 'PENDING' && (
                                                    <div className="payment-actions">
                                                        <button 
                                                            className="complete-payment-btn"
                                                            onClick={async () => {
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    const paymentResponse = await axios.get(
                                                                        `http://localhost:8080/api/payments/order/${order.id}`,
                                                                        {
                                                                            headers: {
                                                                                Authorization: `Bearer ${token}`
                                                                            }
                                                                        }
                                                                    );
                                                                    
                                                                    if (paymentResponse.data && paymentResponse.data.link) {
                                                                        window.location.href = paymentResponse.data.link;
                                                                    } else {
                                                                        alert('Payment link not available. Please contact support.');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Error retrieving payment link:', error);
                                                                    alert('Could not retrieve payment information. Please try again.');
                                                                }
                                                            }}
                                                        >
                                                            <i className="fas fa-credit-card"></i> Complete Payment
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="orders-refresh">
                            <button 
                                className="refresh-orders-btn"
                                onClick={fetchUserOrders}
                                disabled={loadingOrders}
                            >
                                <i className={`fas fa-sync-alt ${loadingOrders ? 'fa-spin' : ''}`}></i>
                                {loadingOrders ? 'Refreshing...' : 'Refresh Orders'}
                            </button>
                        </div>
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