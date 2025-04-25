import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Login.css';
import logo from '../assets/images/logo.png'; // Import the logo
import { authService } from '../assets/services/authService';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authService.login(formData);
            
            // Store the token and user info in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('email', formData.email); // Store email for profile access
            
            // Redirect based on role
            if (response.role === 'ADMIN') {
                navigate('/admin/users');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        }
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

            <section className="login-section">
                <div className="login-container">
                    <h1>Login to Your Account</h1>
                    
                    {error && <div className="error-message">{error}</div>}

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
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                required 
                            />
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

            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Login;