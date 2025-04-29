import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/UserInformation.css';
import logo from '../assets/images/logo.png';

const UserInformation = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userImage, setUserImage] = useState(null); // Will use the initial from user's email
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Initialize user data with empty values
    const [userData, setUserData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch user data from the backend
    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email');
            
            if (!token || !email) {
                navigate('/register');
                return;
            }
            
            const response = await axios.get('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users', {
                headers: { authorization: `Bearer ${token}` }
            });
            
            const currentUser = response.data.find(user => user.email === email);
            
            if (currentUser) {
                setUserData({
                    id: currentUser.id,
                    firstName: currentUser.firstName || '',
                    lastName: currentUser.lastName || '',
                    email: currentUser.email || '',
                    password: '********', // Masked for security
                    confirmPassword: '********' // Masked for security
                });
            } else {
                setError('User not found');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to load user information');
            
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('email');
                navigate('/register');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user data when component mounts
    useEffect(() => {
        fetchUserData();
    }, [navigate]);

    // Add effect for clicking outside dropdown
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Save changes
            handleSaveChanges();
        } else {
            // Enter edit mode
            setIsEditing(true);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Create a simpler version of the update data
            const userDataToUpdate = {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            };
            
            // Handle password separately
            if (userData.password !== '********') {
                if (userData.password !== userData.confirmPassword) {
                    alert("Passwords don't match!");
                    return;
                }
                userDataToUpdate.password = userData.password;
            }
            
            // Store the current email BEFORE updating
            const oldEmail = localStorage.getItem('email');
            const emailChanged = oldEmail !== userData.email;
            
            // Call API to update user
            const response = await axios.put(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users/${userData.id}`,
                userDataToUpdate,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            
            // Exit edit mode
            setIsEditing(false);
            
            // Show success message
            alert('Profile updated successfully!');
            
            // Handle email or password changes
            if (emailChanged || userData.password !== '********') {
                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('email');
                
                // Inform user they need to log in again
                alert('Your credentials have been updated. Please log in again with your new information.');
                
                // Redirect to login page
                navigate('/login');
            } else {
                // Just update email in localStorage if nothing critical changed
                localStorage.setItem('email', userData.email);
            }
            
        } catch (error) {
            console.error('Error updating user:', error);
            
            let errorMessage = 'Failed to update profile. ';
            
            if (error.response) {
                errorMessage += error.response.data?.message || 
                               `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage += 'No response from server. Check your internet connection.';
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Don't allow image changes - we'll use the first letter of email as avatar
    const getUserInitial = () => {
        return (userData.email || localStorage.getItem('email') || 'U').charAt(0).toUpperCase();
    };

    return (
        <div className="user-information-page">
            {/* Header with consistent styling */}
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
                    <Link to="/running" className="nav-link">Running</Link>
                </nav>
                <div className="auth-buttons">
                    {localStorage.getItem('token') ? (
                        <>
                            <Link to="/basketball" className="header-cart-icon">
                                <i className="fas fa-shopping-cart"></i>
                                <span className="header-cart-count">0</span>
                            </Link>
                            
                            <div className="user-dropdown" ref={dropdownRef}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="user-avatar-button"
                                >
                                    <div className="user-avatar">
                                        {getUserInitial()}
                                    </div>
                                </button>
                                
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-header-title">Signed in as</div>
                                            <div className="dropdown-header-email">
                                                {userData.email || localStorage.getItem('email')}
                                            </div>
                                        </div>
                                        
                                        <Link 
                                            to="/userinformation" 
                                            className="dropdown-item active"
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

            <main className="user-content">
                {isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="profile-container">
                        <div className="user-avatar-container">
                            <div className="user-avatar profile-avatar">
                                {getUserInitial()}
                            </div>
                            <p className="avatar-info">Profile photo is based on your email initial</p>
                        </div>

                        <div className="profile-form">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    value={userData.firstName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    value={userData.lastName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing} 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing} 
                                />
                            </div>
                            {isEditing && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="password">New Password (leave as ******** to keep current)</label>
                                        <input 
                                            type="password" 
                                            id="password" 
                                            name="password" 
                                            value={userData.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            id="confirmPassword" 
                                            name="confirmPassword" 
                                            value={userData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button 
                                        className="cancel-button"
                                        onClick={() => {
                                            // Reset form to original values from the database
                                            fetchUserData();
                                            setIsEditing(false);
                                        }}
                                    >
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        Cancel Changes
                                    </button>
                                </>
                            )}

                            <button 
                                className={`edit-button ${isEditing ? 'save-button' : ''}`}
                                onClick={toggleEdit}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default UserInformation;