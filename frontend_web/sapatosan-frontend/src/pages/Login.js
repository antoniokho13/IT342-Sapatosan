import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Login.css';
import logo from '../assets/images/logo.png'; // Import the logo

const Login = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login form submission logic here
    };

    return (
        <div>
            {/* Header - duplicated from Register.js */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/#basketball" className="nav-link">Basketball</Link>
                    <Link to="/#casual" className="nav-link">Casual</Link>
                    <Link to="/#running" className="nav-link">Running</Link>
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

            {/* Login Form */}
            <section className="login-section">
                <div className="login-container">
                    <h1>Login to Your Account</h1>
                    
                    {/* Social Login Options */}
                    <div className="social-login">
                        <p className="social-text">Sign in with</p>
                        <div className="social-buttons">
                            <button className="social-button google">
                                <i className="fab fa-google"></i>
                                <span>Google</span>
                            </button>
                            <button className="social-button facebook">
                                <i className="fab fa-facebook-f"></i>
                                <span>Facebook</span>
                            </button>
                        </div>
                        <div className="divider">
                            <span>or</span>
                        </div>
                    </div>
                    
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                        <div className="form-button-container">
                            <button type="submit" className="auth-button login-form-button">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Login
                            </button>
                        </div>
                        <div className="register-link">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer - duplicated from Register.js */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Login;