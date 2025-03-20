import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Register.css';
import logo from '../assets/images/logo.png'; // Import the logo

const Register = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your form submission logic here
    };

    return (
        <div>
            {/* Header - duplicated from Home.js */}
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
                        Join Us
                    </Link>
                </div>
            </header>

            {/* Registration Form */}
            <section className="register-section">
                <div className="register-container">
                    <h1>Create an Account</h1>
                    
                    {/* Social Login Options */}
                    <div className="social-login">
                        <p className="social-text">Sign up with</p>
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
                    
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required />
                        </div>
                        <div className="form-button-container">
                            <button type="submit" className="auth-button register-form-button">
                                Register
                            </button>
                        </div>
                        <div className="login-link">
                            Already have an account? <Link to="/login">Login here</Link>
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer - duplicated from Home.js */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Register;