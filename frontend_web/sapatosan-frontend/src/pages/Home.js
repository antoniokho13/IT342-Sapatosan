import axios from 'axios';
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
import raymund from '../assets/images/raymund.jpg'; // Import the image for Raymund Laude
import teaser from '../assets/images/teaser.mp4';

const Home = () => {
    const [userInfo, setUserInfo] = useState({ email: '', name: '' });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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
                            name: ''  // We'll update this later if needed
                        });
                    }
                    
                    // Now fetch users to get additional data or verify the email
                    const response = await axios.get('http://localhost:8080/api/users', {
                        headers: {
                            authorization: `Bearer ${token}`
                        }
                    });
                    
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
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('email');
                }
            }
        };

        fetchUserData();
    }, []);

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

    const handleLogin = async (credentials) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
            
            // Store both token and email from the login response
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('email', response.data.email);
            
            console.log("Login successful, saved email:", response.data.email);
            
            // Redirect or update state as needed
            window.location.href = '/';
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login error
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('http://localhost:8080/api/auth/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

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
                    <Link to="/basketball" className="header-cart-icon">
                        <i className="fas fa-shopping-cart"></i>
                        <span className="header-cart-count">0</span>
                    </Link>
                    
                    {localStorage.getItem('token') ? (
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
                                        to="/userinformation" 
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