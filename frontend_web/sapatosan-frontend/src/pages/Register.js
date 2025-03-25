import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Register.css';
import { authService } from '../assets/services/authService';
import logo from '../assets/images/logo.png'; // Import the logo

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Remove confirmPassword before sending to backend
            const { confirmPassword, ...userData } = formData;
            
            await authService.register(userData);
            
            // Redirect to login page after successful registration
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
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

            <section className="register-section">
                <div className="register-container">
                    <h1>Create an Account</h1>
                    
                    {error && <div className="error-message">{error}</div>}

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
                            <input 
                                type="text" 
                                id="firstName" 
                                name="firstName" 
                                value={formData.firstName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                name="lastName" 
                                value={formData.lastName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
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
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required 
                            />
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

            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Register;